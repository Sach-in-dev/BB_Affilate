import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import "./index.css";
import { AuthProvider } from "@/contexts/AuthContext";

import LandingPage from "@/pages/LandingPage";
import LoginPage from "@/pages/LoginPage";
import SignupPage from "@/pages/SignupPage";
import ResolveLinkPage from "@/pages/public/ResolveLinkPage";

import CreatorLayout from "@/components/layout/CreatorLayout";
import CreatorHomePage from "@/pages/creator/CreatorHomePage";
import CreatorProductsPage from "@/pages/creator/CreatorProductsPage";
import CreatorLinksPage from "@/pages/creator/CreatorLinksPage";
import CreatorAnalyticsPage from "@/pages/creator/CreatorAnalyticsPage";
import CreatorProfilePage from "@/pages/creator/CreatorProfilePage";

import AdminLayout from "@/components/layout/AdminLayout";
import AdminDashboardPage from "@/pages/admin/AdminDashboardPage";
import RolesPermissionsPage from "@/pages/admin/RolesPermissionsPage";
import ComingSoonPage from "@/pages/admin/ComingSoonPage";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          {/* Shared affiliate link — customer entry point */}
          <Route path="/r/:code" element={<ResolveLinkPage />} />

          {/* Creator studio */}
          <Route path="/dashboard" element={<CreatorLayout />}>
            <Route index element={<CreatorHomePage />} />
            <Route path="products" element={<CreatorProductsPage />} />
            <Route path="links" element={<CreatorLinksPage />} />
            <Route path="analytics" element={<CreatorAnalyticsPage />} />
            <Route path="profile" element={<CreatorProfilePage />} />
          </Route>

          {/* Admin portal */}
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route path="users" element={<RolesPermissionsPage />} />
            <Route path="commissions" element={<ComingSoonPage title="Commissions" />} />
            <Route path="campaigns" element={<ComingSoonPage title="Campaigns" />} />
            <Route path="products" element={<ComingSoonPage title="Products" />} />
            <Route path="creators" element={<ComingSoonPage title="Creators" />} />
            <Route path="banners" element={<ComingSoonPage title="Banners" />} />
            <Route path="links" element={<ComingSoonPage title="Links" />} />
            <Route path="analytics" element={<ComingSoonPage title="Analytics" />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>
);
