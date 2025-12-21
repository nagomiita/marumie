import { Link, useLocation } from "react-router-dom";

interface HeaderProps {
  title?: string;
}

export default function Header({ title }: HeaderProps) {
  const location = useLocation();
  const isHome = location.pathname === "/";

  return (
    <header className="fixed top-0 inset-x-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="bg-white/90 backdrop-blur rounded-2xl px-4 py-3 shadow-sm flex items-center justify-between">
          <Link to="/" className="text-lg font-bold text-gray-900">
            {title}
          </Link>
          <nav className="flex gap-4 text-sm font-semibold text-gray-700">
            <Link
              to="/"
              className={!isHome ? "hover:text-teal-700" : "text-teal-700"}
            >
              ホーム
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}
