"use client";
import "client-only";

import { useState } from "react";
import { Button } from "@/client/components/ui";

interface DeleteOrganizationButtonProps {
  organizationId: string;
  organizationName: string;
  onDelete: (id: string) => Promise<void>;
}

export default function DeleteOrganizationButton({
  organizationId,
  organizationName,
  onDelete,
}: DeleteOrganizationButtonProps) {
  const [deleting, setDeleting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [message, setMessage] = useState("");
  const [hasError, setHasError] = useState(false);

  const handleDelete = async () => {
    setDeleting(true);
    setMessage("");
    setHasError(false);

    try {
      await onDelete(organizationId);
      setMessage("組織が削除されました");
      setShowConfirm(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "削除に失敗しました");
      setHasError(true);
    } finally {
      setDeleting(false);
    }
  };

  if (showConfirm) {
    return (
      <div className="bg-red-900/20 border border-red-900/30 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-red-400 mb-2">組織の削除</h3>
        <p className="text-gray-300 mb-4">
          「{organizationName}」を削除しますか？
          <br />
          この操作は取り消せません。
        </p>
        <div className="flex gap-2">
          <Button
            onClick={handleDelete}
            disabled={deleting}
            className="bg-red-600 hover:bg-red-700"
          >
            {deleting ? "削除中..." : "削除する"}
          </Button>
          <Button
            onClick={() => setShowConfirm(false)}
            disabled={deleting}
            variant="secondary"
          >
            キャンセル
          </Button>
        </div>
        {message && (
          <div
            className={`mt-3 p-2 rounded text-sm ${
              hasError ? "text-red-400" : "text-green-400"
            }`}
          >
            {message}
          </div>
        )}
      </div>
    );
  }

  return (
    <Button
      onClick={() => setShowConfirm(true)}
      className="bg-red-600 hover:bg-red-700"
    >
      組織を削除
    </Button>
  );
}
