import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// Authentication middleware
export const authMiddleware = (to, from, next) => {
  const auth = getAuth();
  const db = getFirestore();

  let called = false;

  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (called) return;
      called = true;
      unsubscribe();

      // Allow access to loading page without authentication
      if (to.path === "/" || to.path === "/loading") {
        next();
        resolve();
        return;
      }

      // Check if the route is 'register' and user is authenticated
      if (to.name === "register" && user) {
        // Get user data to redirect based on role
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            if (userData.role === "admin") {
              next({ path: "/admin-dashboard" });
            } else {
              next({ path: "/homepage" });
            }
          } else {
            next({ path: "/homepage" });
          }
        } catch (error) {
          console.error("Error getting user data:", error);
          next({ path: "/homepage" });
        }
        resolve();
        return;
      }

      // Check if route requires authentication
      if (to.matched.some((record) => record.meta.requiresAuth)) {
        if (!user) {
          // User is not logged in, redirect to register page
          next({ path: "/register" });
          resolve();
          return;
        }

        try {
          // Get user data from Firestore
          const userDoc = await getDoc(doc(db, "users", user.uid));

          if (!userDoc.exists()) {
            // User document doesn't exist, sign out and redirect to register
            try {
              await signOut(auth);
              console.log("User signed out due to missing Firestore document");
            } catch (signOutError) {
              console.error(
                "Error signing out user in middleware:",
                signOutError
              );
            }
            next({ path: "/register" });
            resolve();
            return;
          }

          const userData = userDoc.data();

          // Check verification status - either Firebase Auth OR Firestore
          const isAuthVerified = user.emailVerified;
          const isFirestoreVerified = userData.emailVerified === true;
          const isVerified = isAuthVerified || isFirestoreVerified;

          console.log("Auth middleware verification check:", {
            isAuthVerified,
            isFirestoreVerified,
            isVerified,
            userRole: userData.role,
            path: to.path,
          });

          // Check if email is verified by either method
          if (!isVerified) {
            // Email is not verified, redirect to verification page
            next({ path: "/verify-email" });
            resolve();
            return;
          }

          // Check if route requires specific role
          if (to.matched.some((record) => record.meta.roles)) {
            // If trying to access admin dashboard and user is not admin
            if (to.path === "/admin-dashboard" && userData.role !== "admin") {
              // Redirect regular users to home page
              next({ path: "/homepage" });
              resolve();
              return;
            }

            // Check if user has required role for any other protected route
            if (to.meta.roles && !to.meta.roles.includes(userData.role)) {
              // User doesn't have required role, redirect to unauthorized page
              next({ path: "/unauthorized" });
              resolve();
              return;
            }
          }

          // User is authenticated and has required role, proceed
          next();
          resolve();
        } catch (error) {
          console.error("Error checking user role:", error);
          next({ path: "/register" });
          resolve();
          return;
        }
      } else {
        // Route doesn't require authentication, proceed
        next();
        resolve();
      }
    });
  });
};
