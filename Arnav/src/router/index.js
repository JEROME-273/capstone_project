import { createRouter, createWebHistory } from "vue-router";
import { authMiddleware } from "../middleware/auth-middleware";
import HomeView from "../views/HomeView.vue";
import register from "@/views/register.vue";
import LoadingPage from "@/views/LoadingPage.vue";
import AdminDashboard from "@/views/Admin/AdminDashboard.vue";
import VerifyEmail from "@/views/VerifyEmail.vue";
import Unauthorized from "@/views/Unauthorized.vue";
import AdminUserManagement from "@/views/Admin/AdminUserManagement.vue";
import HelpCenter from "@/views/user/HelpCenter.vue";
import AdminCustomerSupport from "@/views/Admin/AdminCustomerSupport.vue";
import AdminFeedback from "@/views/Admin/AdminFeedback.vue";
import UserInfo from "@/views/user/userinfo.vue";
import Homepage from "@/views/homepage.vue";
import AdminMapManage from "@/views/Admin/AdminMapManage.vue";
const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes: [
    {
      path: "/",
      redirect: "/homepage",
    },
    {
      path: "/loading",
      name: "loading",
      component: LoadingPage,
    },
    {
      path: "/home",
      name: "home",
      component: HomeView,
      meta: {
        requiresAuth: true,
        roles: ["user", "admin"],
      },
    },
    {
      path: "/register",
      name: "register",
      component: register,
    },
    {
      path: "/admin-dashboard",
      name: "AdminDashboard",
      component: AdminDashboard,
      meta: {
        requiresAuth: true, // Requires authentication
        roles: ["admin"], // Requires admin role
      },
    },
    {
      path: "/verify-email",
      name: "VerifyEmail",
      component: VerifyEmail,
    },
    {
      path: "/unauthorized",
      name: "Unauthorized",
      component: Unauthorized,
    },
    {
      path: "/admin-user-management",
      name: "AdminUserManagement",
      component: AdminUserManagement,
      meta: {
        requiresAuth: true,
        roles: ["admin"],
      },
    },
    {
      path: "/adminmap-manage",
      name: "AdminMapManage",
      component: AdminMapManage,
      meta: {
        requiresAuth: true,
        roles: ["admin"],
      },
    },
    {
      path: "/help-center",
      name: "HelpCenter",
      component: HelpCenter,
      meta: {
        requiresAuth: true,
        roles: ["user", "admin"],
      },
    },
    {
      path: "/admin-customer-support",
      name: "AdminCustomerSupport",
      component: AdminCustomerSupport,
      meta: {
        requiresAuth: true,
        roles: ["admin"],
      },
    },
    {
      path: "/admin-feedback",
      name: "AdminFeedback",
      component: AdminFeedback,
      meta: {
        requiresAuth: true,
        roles: ["admin"],
      },
    },
    {
      path: "/userinfo",
      name: "UserInfo",
      component: UserInfo,
    },
    {
      path: "/homepage",
      name: "Homepage",
      component: Homepage,
      meta: {
        requiresAuth: true,
        roles: ["user", "admin"],
      },
    },
  ],
});

// Use the authentication middleware
router.beforeEach(authMiddleware);

export default router;
