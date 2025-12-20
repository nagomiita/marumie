export default function Footer() {
  return (
    <footer className="w-full bg-gradient-to-tl from-[#BCECD3] to-[#64D8C6] px-8 lg:px-[117px] py-12 lg:pt-12 lg:pb-9">
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-4">
        <div className="flex gap-6 text-sm font-bold text-gray-800">
          <a href="/terms" className="hover:opacity-80">
            利用規約
          </a>
          <a href="/privacy" className="hover:opacity-80">
            プライバシーポリシー
          </a>
        </div>
        <p className="text-gray-600 text-sm">
          © 2025 まる見え家計簿 All rights Reserved
        </p>
      </div>
    </footer>
  );
}
