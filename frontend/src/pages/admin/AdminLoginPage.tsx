import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import LoginCard from "@/components/common/LoginCard";

export default function AdminLoginPage() {
  const { user, loading, signIn } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>読込中...</p>
      </div>
    );
  }

  if (user) {
    return <Navigate to="/admin" replace />;
  }

  return <LoginCard title="管理画面ログイン" onSubmit={signIn} />;
}
