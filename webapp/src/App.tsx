import { Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import OrganizationPage from "./pages/OrganizationPage";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminLoginPage from "./pages/admin/AdminLoginPage";
import AdminDashboardPage from "./pages/admin/AdminDashboardPage";
import OrganizationsPage from "./pages/admin/OrganizationsPage";
import UsersPage from "./pages/admin/UsersPage";
import CSVUploadPage from "./pages/admin/CSVUploadPage";
import TransactionsPage from "./pages/admin/TransactionsPage";
import { AuthProvider } from "./contexts/AuthContext";

const queryClient = new QueryClient();

const SimplePage = ({ title }: { title: string }) => (
  <Layout>
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">{title}</h2>
      <p className="text-gray-700">準備中です。</p>
    </div>
  </Layout>
);

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/o/:slug" element={<OrganizationPage />} />
          <Route
            path="/privacy"
            element={<SimplePage title="プライバシーポリシー" />}
          />
          <Route path="/terms" element={<SimplePage title="利用規約" />} />

          {/* Admin routes */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboardPage />} />
            <Route
              path="/admin/organizations"
              element={<OrganizationsPage />}
            />
            <Route path="/admin/users" element={<UsersPage />} />
            <Route path="/admin/transactions" element={<TransactionsPage />} />
            <Route path="/admin/csv-upload" element={<CSVUploadPage />} />
          </Route>
        </Routes>
      </AuthProvider>
    </QueryClientProvider>
  );
}
