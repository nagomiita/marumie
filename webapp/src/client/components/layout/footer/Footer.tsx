"use client";
import "client-only";
import Link from "next/link";
import { usePathname } from "next/navigation";

// テキストリンク集
const getTextLinks = (_currentSlug: string) => [
  {
    label: "利用規約",
    href: "/terms",
  },
  {
    label: "プライバシーポリシー",
    href: "/privacy",
  },
];

export default function Footer() {
  const pathname = usePathname();

  // 現在のslugを取得（/o/[slug]/... の形式の場合、なければdefaultを使用）
  const currentSlug = pathname.startsWith("/o/")
    ? pathname.split("/")[2]
    : "team-mirai";

  const textLinks = getTextLinks(currentSlug);

  const renderTextLink = (link: (typeof textLinks)[0]) => {
    const isExternal = link.href.startsWith("http");
    return (
      <Link
        key={link.href}
        href={link.href}
        className="text-gray-800 text-sm font-bold leading-[1.36em] hover:opacity-80 transition-opacity"
        {...(isExternal && { target: "_blank", rel: "noopener" })}
      >
        {link.label}
      </Link>
    );
  };

  return (
    <footer className="w-full bg-gradient-to-tl from-[#BCECD3] to-[#64D8C6] px-8 lg:px-[117px] py-12 lg:pt-12 lg:pb-9">
      <div className="max-w-[1278px] mx-auto flex flex-col items-center gap-6">
        {/* Text Links */}
        <div className="flex flex-row gap-8 items-center">
          {textLinks.map(renderTextLink)}
        </div>

        {/* Copyright */}
        <div className="w-full text-center">
          <p className="text-gray-600 text-sm leading-[1.25em]">
            © 2025 まる見え家計簿 All rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
