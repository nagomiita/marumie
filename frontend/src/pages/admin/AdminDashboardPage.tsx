import { useAuth } from "@/contexts/AuthContext";
import Card from "@/components/common/Card";
import { adminMenuItems } from "@/config/adminMenu";

export default function AdminDashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">ダッシュボード</h1>
      <Card>
        <p className="text-gray-700 mb-6">ようこそ、{user?.email}さん</p>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {adminMenuItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={`block p-4 bg-${item.color}-50 rounded-lg hover:bg-${item.color}-100 transition`}
            >
              <h3 className={`text-lg font-medium text-${item.color}-900`}>
                {item.title}
              </h3>
              <p className={`mt-2 text-sm text-${item.color}-700`}>
                {item.description}
              </p>
            </a>
          ))}
        </div>
      </Card>
    </div>
  );
}
