"use client";
import "client-only";

import { useEffect, useState, useRef } from "react";
import type { PreviewPersonalCsvResult } from "@/server/usecases/preview-personal-csv-usecase";
import type { PersonalTransactionPreview } from "@/shared/models/personal-transaction";

interface PersonalCsvPreviewProps {
  file: File | null;
  organizationId?: string;
  onPreviewComplete: (result: PreviewPersonalCsvResult) => void;
}

export default function PersonalCsvPreview({
  file,
  organizationId,
  onPreviewComplete,
}: PersonalCsvPreviewProps) {
  const [previewResult, setPreviewResult] =
    useState<PreviewPersonalCsvResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFileInfo, setLastFileInfo] = useState<{
    file: File | null;
    organizationId?: string;
  }>({ file: null, organizationId: undefined });
  const onPreviewCompleteRef = useRef(onPreviewComplete);

  // Always update the refs to the latest values
  onPreviewCompleteRef.current = onPreviewComplete;

  useEffect(() => {
    // Check if file or organizationId actually changed
    if (
      file === lastFileInfo.file &&
      organizationId === lastFileInfo.organizationId
    ) {
      return;
    }

    setLastFileInfo({ file, organizationId });

    if (!file) {
      setPreviewResult(null);
      setError(null);
      return;
    }

    const loadPreview = async () => {
      setLoading(true);
      setError(null);

      try {
        const formData = new FormData();
        formData.append("file", file);
        if (organizationId) {
          formData.append("organizationId", organizationId);
        }

        const response = await fetch("/api/preview-csv", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "プレビュー生成に失敗しました");
        }

        const result = (await response.json()) as PreviewPersonalCsvResult;
        setPreviewResult(result);
        onPreviewCompleteRef.current?.(result);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(errorMessage);
        setPreviewResult(null);
        onPreviewCompleteRef.current?.({
          transactions: [],
          summary: {
            totalCount: 0,
            insertCount: 0,
            updateCount: 0,
            duplicateCount: 0,
            errorCount: 0,
          },
          errors: [errorMessage],
        });
      } finally {
        setLoading(false);
      }
    };

    loadPreview();
  }, [file, organizationId, lastFileInfo]);

  if (!file) {
    return (
      <div className="text-gray-400 text-sm p-4 bg-gray-800 rounded border border-gray-700">
        CSVファイルを選択してください
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-blue-400 text-sm p-4 bg-gray-800 rounded border border-gray-700">
        CSVファイルを解析中...
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-sm p-4 bg-red-900/20 rounded border border-red-700">
        <div className="font-semibold mb-2">プレビューエラー:</div>
        <div>{error}</div>
      </div>
    );
  }

  if (!previewResult) {
    return null;
  }

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="bg-gray-800 rounded border border-gray-700 p-4">
        <h3 className="text-white font-semibold mb-3">プレビュー結果</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <div className="text-gray-400">総件数</div>
            <div className="text-white font-mono">
              {previewResult.summary.totalCount}
            </div>
          </div>
          <div>
            <div className="text-gray-400">新規</div>
            <div className="text-green-400 font-mono">
              {previewResult.summary.insertCount}
            </div>
          </div>
          <div>
            <div className="text-gray-400">更新</div>
            <div className="text-blue-400 font-mono">
              {previewResult.summary.updateCount}
            </div>
          </div>
          <div>
            <div className="text-gray-400">重複</div>
            <div className="text-yellow-400 font-mono">
              {previewResult.summary.duplicateCount}
            </div>
          </div>
          <div>
            <div className="text-gray-400">エラー</div>
            <div className="text-red-400 font-mono">
              {previewResult.summary.errorCount}
            </div>
          </div>
        </div>
      </div>

      {/* Errors */}
      {previewResult.errors.length > 0 && (
        <div className="bg-red-900/20 rounded border border-red-700 p-4">
          <h4 className="text-red-400 font-semibold mb-2">エラー一覧:</h4>
          <div className="space-y-1 text-sm">
            {previewResult.errors.map((error) => (
              <div key={error} className="text-red-300 font-mono">
                {error}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Transaction Preview */}
      {previewResult.transactions.length > 0 && (
        <div className="bg-gray-800 rounded border border-gray-700">
          <div className="p-4 border-b border-gray-700">
            <h4 className="text-white font-semibold">
              取引データプレビュー (最初の10件)
            </h4>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-700">
                <tr>
                  <th className="px-3 py-2 text-left text-gray-300">
                    ステータス
                  </th>
                  <th className="px-3 py-2 text-left text-gray-300">日付</th>
                  <th className="px-3 py-2 text-left text-gray-300">
                    カテゴリ
                  </th>
                  <th className="px-3 py-2 text-left text-gray-300">金額</th>
                  <th className="px-3 py-2 text-left text-gray-300">区分</th>
                  <th className="px-3 py-2 text-left text-gray-300">
                    支払方法
                  </th>
                  <th className="px-3 py-2 text-left text-gray-300">摘要</th>
                </tr>
              </thead>
              <tbody>
                {previewResult.transactions
                  .slice(0, 10)
                  .map((transaction, index) => (
                    <PersonalTransactionRow
                      key={transaction.id}
                      transaction={transaction}
                    />
                  ))}
              </tbody>
            </table>
          </div>
          {previewResult.transactions.length > 10 && (
            <div className="p-3 text-center text-gray-400 text-sm border-t border-gray-700">
              ...他 {previewResult.transactions.length - 10} 件
            </div>
          )}
        </div>
      )}
    </div>
  );
}

interface PersonalTransactionRowProps {
  transaction: PersonalTransactionPreview;
}

function PersonalTransactionRow({ transaction }: PersonalTransactionRowProps) {
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "insert":
        return "text-green-400";
      case "update":
        return "text-blue-400";
      case "duplicate":
        return "text-yellow-400";
      case "error":
        return "text-red-400";
      default:
        return "text-gray-400";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "insert":
        return "新規";
      case "update":
        return "更新";
      case "duplicate":
        return "重複";
      case "error":
        return "エラー";
      default:
        return status;
    }
  };

  const formatAmount = (amount: number) => {
    return amount.toLocaleString("ja-JP");
  };

  const getTypeLabel = (type: string) => {
    return type === "income" ? "収入" : "支出";
  };

  return (
    <tr className="border-b border-gray-700 hover:bg-gray-750">
      <td className="px-3 py-2">
        <span className={`font-mono ${getStatusStyle(transaction.status)}`}>
          {getStatusLabel(transaction.status)}
        </span>
        {transaction.errors && transaction.errors.length > 0 && (
          <div className="text-xs text-red-300 mt-1">
            {transaction.errors[0]}
          </div>
        )}
      </td>
      <td className="px-3 py-2 text-gray-300">{transaction.date || "-"}</td>
      <td className="px-3 py-2 text-gray-300">
        {transaction.category}
        {transaction.subcategory && (
          <div className="text-xs text-gray-400">{transaction.subcategory}</div>
        )}
      </td>
      <td className="px-3 py-2 text-gray-300 text-right font-mono">
        ¥{formatAmount(transaction.amount)}
      </td>
      <td className="px-3 py-2 text-gray-300">
        {getTypeLabel(transaction.type)}
      </td>
      <td className="px-3 py-2 text-gray-300">{transaction.paymentMethod}</td>
      <td
        className="px-3 py-2 text-gray-300 max-w-xs truncate"
        title={transaction.description}
      >
        {transaction.description}
      </td>
    </tr>
  );
}
