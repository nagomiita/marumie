import "server-only";

import { uploadPersonalCsv } from "@/server/actions/upload-personal-csv";
import { previewPersonalCsv } from "@/server/actions/preview-personal-csv";
import { loadOrganizations } from "@/server/loaders/load-organizations";
import CsvUploadClient from "@/client/components/csv-upload/CsvUploadClient";

export default async function UploadCsvPage() {
  const organizations = await loadOrganizations();

  return (
    <div className="bg-primary-panel rounded-xl p-4">
      <h1 className="text-2xl font-bold text-white mb-6">
        家計簿CSVアップロード
      </h1>
      <CsvUploadClient
        uploadPersonalAction={uploadPersonalCsv}
        previewPersonalAction={previewPersonalCsv}
        organizations={organizations}
      />
    </div>
  );
}
