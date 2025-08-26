import { db } from "@/firebase/config";
import {
  doc,
  getDoc,
  setDoc,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
} from "firebase/firestore";

const SEEN_COLLECTION = "userLearningSeen";
const CONTENT_COLLECTION = "learningContent";

// Short-circuit flag to avoid spamming queries when rules deny access
let TIPS_PERMISSION_BLOCKED = false;
export function isTipsPermissionBlocked() {
  return TIPS_PERMISSION_BLOCKED;
}

// Local storage helpers (for unauthenticated users)
const LOCAL_SEEN_KEY = "ltips_seen_v1";
function getLocalSeen() {
  try {
    const raw = localStorage.getItem(LOCAL_SEEN_KEY);
    return Array.isArray(JSON.parse(raw)) ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}
function mergeLocalSeen(ids) {
  try {
    const existing = new Set(getLocalSeen());
    (ids || []).forEach((id) => existing.add(id));
    localStorage.setItem(LOCAL_SEEN_KEY, JSON.stringify(Array.from(existing)));
  } catch {
    // ignore storage failures
  }
}

export async function getNewTipsForUser(userId, maxItems = 3) {
  // We allow fetching tips even without userId (unauthenticated mode),
  // but we will track seen locally in that case.
  if (TIPS_PERMISSION_BLOCKED) return [];

  try {
    // Read seen tips (from Firestore if authed; otherwise from localStorage)
    let seenTipIds = new Set();
    if (userId) {
      const seenRef = doc(db, SEEN_COLLECTION, userId);
      const seenSnap = await getDoc(seenRef).catch((err) => {
        if (
          err?.code === "permission-denied" ||
          err?.code === "unauthenticated"
        ) {
          TIPS_PERMISSION_BLOCKED = true;
          console.warn("Tips access blocked (seen doc)");
          return null;
        }
        throw err;
      });
      if (TIPS_PERMISSION_BLOCKED) return [];
      const seenData = seenSnap?.exists()
        ? seenSnap.data()
        : { seenTipIds: [] };
      seenTipIds = new Set(seenData.seenTipIds || []);
    } else {
      seenTipIds = new Set(getLocalSeen());
    }

    // Get recent active tips (limit to a handful to reduce reads)
    let snap;
    try {
      const q = query(
        collection(db, CONTENT_COLLECTION),
        where("isActive", "==", true),
        orderBy("createdAt", "desc"),
        limit(10)
      );
      snap = await getDocs(q);
    } catch (err) {
      // Permissions block
      if (
        err?.code === "permission-denied" ||
        err?.code === "unauthenticated"
      ) {
        TIPS_PERMISSION_BLOCKED = true;
        console.warn("Tips access blocked (learningContent)");
        return [];
      }
      // Fallback if index missing: drop orderBy and sort client-side
      if (err?.code === "failed-precondition") {
        console.warn(
          "No composite index for learningContent query; using fallback without orderBy."
        );
        const q2 = query(
          collection(db, CONTENT_COLLECTION),
          where("isActive", "==", true),
          limit(10)
        );
        snap = await getDocs(q2).catch((e2) => {
          if (
            e2?.code === "permission-denied" ||
            e2?.code === "unauthenticated"
          ) {
            TIPS_PERMISSION_BLOCKED = true;
            console.warn("Tips access blocked (learningContent fallback)");
            return null;
          }
          throw e2;
        });
        if (TIPS_PERMISSION_BLOCKED || !snap) return [];
      } else {
        throw err;
      }
    }

    const tips = [];
    snap.forEach((d) => {
      if (!seenTipIds.has(d.id)) {
        tips.push({ id: d.id, ...d.data() });
      }
    });

    // Sort client-side if needed
    tips.sort((a, b) => {
      const ta = a.createdAt?.toMillis?.() || a.createdAt?.seconds || 0;
      const tb = b.createdAt?.toMillis?.() || b.createdAt?.seconds || 0;
      return tb - ta;
    });

    return tips.slice(0, maxItems);
  } catch (err) {
    if (err?.code === "permission-denied" || err?.code === "unauthenticated") {
      TIPS_PERMISSION_BLOCKED = true;
      console.warn("Tips access blocked (catch)");
      return [];
    }
    console.error("Error fetching new tips:", err);
    return [];
  }
}

export async function markTipsAsSeen(userId, tipIds) {
  if (!userId || !tipIds || tipIds.length === 0) return;
  if (TIPS_PERMISSION_BLOCKED) return;

  try {
    const seenRef = doc(db, SEEN_COLLECTION, userId);
    const seenSnap = await getDoc(seenRef);
    const existing = seenSnap.exists() ? seenSnap.data() : { seenTipIds: [] };

    const merged = Array.from(
      new Set([...(existing.seenTipIds || []), ...tipIds])
    );

    await setDoc(
      seenRef,
      {
        userId,
        seenTipIds: merged,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  } catch (err) {
    if (err?.code === "permission-denied" || err?.code === "unauthenticated") {
      TIPS_PERMISSION_BLOCKED = true;
      console.warn("Tips access blocked (markTipsAsSeen)");
      return;
    }
    console.error("Error marking tips as seen:", err);
  }
}

// For unauthenticated users: public API to mark locally
export function markTipsAsSeenLocal(tipIds) {
  mergeLocalSeen(tipIds || []);
}

// DEV helper: fetch latest active tips regardless of seen state.
// Not used in production flow; can be called when you want to ensure the modal shows something.
export async function getLatestActiveTips(maxItems = 1) {
  try {
    let snap;
    try {
      const q = query(
        collection(db, CONTENT_COLLECTION),
        where("isActive", "==", true),
        orderBy("createdAt", "desc"),
        limit(maxItems)
      );
      snap = await getDocs(q);
    } catch (err) {
      const q2 = query(
        collection(db, CONTENT_COLLECTION),
        where("isActive", "==", true),
        limit(maxItems)
      );
      snap = await getDocs(q2);
    }
    const out = [];
    snap.forEach((d) => out.push({ id: d.id, ...d.data() }));
    return out;
  } catch (e) {
    console.error("getLatestActiveTips failed", e);
    return [];
  }
}
