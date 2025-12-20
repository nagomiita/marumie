import type { PropsWithChildren } from "react";
import Footer from "./Footer";
import Header from "./Header";

export default function Layout({ children }: PropsWithChildren) {
  return (
    <div className="min-h-screen flex flex-col bg-[linear-gradient(135deg,rgba(226,246,243,1)_0%,rgba(238,246,226,1)_100%)]">
      <Header />
      <main className="flex-1 pt-20 md:pt-24 px-3 md:px-4 pb-8 md:pb-12 max-w-6xl w-full mx-auto">
        {children}
      </main>
      <Footer />
    </div>
  );
}
