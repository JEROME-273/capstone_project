import { getAuth, onAuthStateChanged } from "firebase/auth";
import { getFirestore, doc, getDoc } from "firebase/firestore";

// Authentication middleware
export const authMiddleware = (to, from, next) => {
  const auth = getAuth();
  const db = getFirestore();

  // Allow access to loading page without authentication
  if (to.path === "/") {
    next();
    return;
  }

  // Return a promise that resolves when auth state is determined
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      // Check if the route is 'register' and user is authenticated
      if (to.name === "register" && user) {
        // Redirect authenticated users away from register page to home
        next({ path: "/" });
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

        // Check if email is verified
        if (!user.emailVerified) {
          // Email is not verified, redirect to verification page
          next({ path: "/verify-email" });
          resolve();
          return;
        }

        // Check if route requires specific role
        if (to.matched.some((record) => record.meta.roles)) {
          try {
            // Get user data from Firestore to check role
            const userDoc = await getDoc(doc(db, "users", user.uid));

            if (userDoc.exists()) {
              const userData = userDoc.data();

              // If trying to access admin dashboard and user is not admin
              if (to.path === "/admin-dashboard" && userData.role !== "admin") {
                // Redirect regular users to home page
                next({ path: "/" });
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
            } else {
              // User document doesn't exist, redirect to register
              next({ path: "/register" });
              resolve();
              return;
            }
          } catch (error) {
            console.error("Error checking user role:", error);
            next({ path: "/register" });
            resolve();
            return;
          }
        }

        // User is authenticated and has required role, proceed
        next();
        resolve();
      } else {
        // Route doesn't require authentication, proceed
        next();
        resolve();
      }
    });
  });
};
