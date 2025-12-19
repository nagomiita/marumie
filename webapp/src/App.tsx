import { Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import HomePage from "./pages/HomePage";
import OrganizationPage from "./pages/OrganizationPage";

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
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/o/:slug" element={<OrganizationPage />} />
      <Route
        path="/privacy"
        element={<SimplePage title="プライバシーポリシー" />}
      />
      <Route path="/terms" element={<SimplePage title="利用規約" />} />
    </Routes>
  );
}
