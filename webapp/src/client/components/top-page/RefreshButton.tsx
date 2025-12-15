"use client";
import "client-only";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

export default function RefreshButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  const handleClick = () => {
    startTransition(() => {
      router.refresh();
    });
  };

  return (
    <div className="flex justify-end mb-4">
      <button
        type="button"
        onClick={handleClick}
        className="inline-flex items-center gap-2 rounded-md bg-teal-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:ring-offset-2"
        aria-label="データを再取得"
      >
        {isPending ? "更新中..." : "データを更新"}
      </button>
    </div>
  );
}
