import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // 앱 코드가 아니라 Node로 직접 돌리는 빌드 스크립트다.
    // CommonJS(require)가 정상이고 Next 규칙을 적용할 이유가 없다.
    "docs/ir/**",
    "scripts/**",
  ]),
]);

export default eslintConfig;
