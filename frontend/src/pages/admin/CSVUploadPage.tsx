import { useState, useEffect } from "react";
import { useListOrganizations } from "@/client/api/generated/organizations/organizations";
import { useUploadTransactionsCsv } from "@/client/api/generated/csv/csv";
import AdminPageLayout from "@/components/admin/AdminPageLayout";
import CSVFormatGuide from "@/components/admin/CSVFormatGuide";
import CSVUploadForm from "@/components/admin/CSVUploadForm";

export default function CSVUploadPage() {
  const { data: organizationsData } = useListOrganizations();
  const uploadMutation = useUploadTransactionsCsv();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedOrgId, setSelectedOrgId] = useState<string>("");
  const [result, setResult] = useState<{
    success: boolean;
    message: string;
    details?: unknown;
  } | null>(null);

  const organizations = Array.isArray(organizationsData?.data)
    ? organizationsData.data
    : [];

  // 最初の組織を自動選択
  useEffect(() => {
    if (organizations.length > 0 && !selectedOrgId) {
      setSelectedOrgId(organizations[0].id);
    }
  }, [organizations, selectedOrgId]);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    if (!selectedOrgId) {
      setResult({
        success: false,
        message: "組織を選択してください",
      });
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const response = await uploadMutation.mutateAsync({
        data: { file },
        params: { organization_id: selectedOrgId },
      });

      setResult({
        success: true,
        message:
          (response.data &&
          "message" in response.data &&
          typeof response.data.message === "string"
            ? response.data.message
            : undefined) || "アップロード成功",
        details: response.data,
      });
      setFile(null);

      // ファイル入力をリセット
      const fileInput = document.querySelector(
        'input[type="file"]',
      ) as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (error: unknown) {
      console.error("Error uploading CSV:", error);

      // エラーの詳細を取得
      let errorMessage = "CSVのアップロードに失敗しました";
      let errorDetails: string | undefined;

      if (error && typeof error === "object" && "response" in error) {
        const response = (error as { response: Response }).response;
        try {
          const errorData = await response.json();
          errorMessage = errorData.detail || errorMessage;
        } catch {
          errorMessage = `HTTP ${response.status}: ${response.statusText}`;
        }
        errorDetails = await response.clone().text();
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      setResult({
        success: false,
        message: errorMessage,
        details: errorDetails,
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <AdminPageLayout title="CSVアップロード">
      <CSVUploadForm
        organizations={organizations}
        selectedOrgId={selectedOrgId}
        onOrgChange={setSelectedOrgId}
        onFileChange={(newFile) => {
          setFile(newFile);
          setResult(null);
        }}
        onSubmit={handleUpload}
        uploading={uploading}
        file={file}
        result={result}
      />
      <CSVFormatGuide />
    </AdminPageLayout>
  );
}
