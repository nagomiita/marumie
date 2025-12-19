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
      },
    },
    hooks: {
      afterAllFilesWrite: "pnpm biome check --write ./src/client/api/generated",
    },
  },
});
