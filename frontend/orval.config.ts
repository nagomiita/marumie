import { defineConfig } from "orval";

export default defineConfig({
  backend: {
    input: {
      target: "http://localhost:8000/openapi.json",
    },
    output: {
      mode: "tags-split",
      target: "./src/client/api/generated",
      schemas: "./src/client/api/generated/model",
      client: "react-query",
      httpClient: "fetch",
      override: {
        mutator: {
          path: "./src/client/api/custom-fetch.ts",
          name: "customFetch",
        },
        operationName: (operation: any, route: string, verb: string) => {
          // operationIdがあればそれを使用（FastAPIが自動生成）
          const operationId = operation.operationId;

          // operationIdから最後の部分のみ取得（例: "list_personal_transactions"）
          // そのままキャメルケースに変換
          return operationId
            .split("_")
            .map((word: string, index: number) =>
              index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1),
            )
            .join("");
        },
      },
    },
    hooks: {
      afterAllFilesWrite: "pnpm biome check --write ./src/client/api/generated",
    },
  },
});
