/// <reference types="vitest/config" />
import { getViteConfig } from "astro/config";

// Unit tests only. The browser tests in tests/e2e run with Playwright (npm run test:e2e).
export default getViteConfig({
  test: {
    include: ["src/**/*.test.ts", "tests/unit/**/*.test.ts"],
    passWithNoTests: true,
  },
});
