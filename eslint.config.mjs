import convexPlugin from "@convex-dev/eslint-plugin";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";
import { globalIgnores } from "eslint/config";

const eslintConfig = [
  ...nextCoreWebVitals,
  ...nextTypescript,
  ...convexPlugin.configs.recommended,

  globalIgnores([
    "node_modules/**",
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "./convex/_generated/**",
  ]),

  {
    rules: {
      "@typescript-eslint/consistent-type-imports": "error",

      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "convex/react",
              importNames: ["useQuery"],
              message:
                "Prefer importing useQuery from 'convex-helpers/react/cache/hooks' instead of 'convex/react'",
            },
            {
              name: "convex/react",
              importNames: ["usePaginatedQuery"],
              message:
                "Prefer importing usePaginatedQuery from 'convex-helpers/react/cache/hooks' instead of 'convex/react'",
            },

            {
              name: "next/navigation",
              importNames: ["useRouter"],
              message:
                'Please import useRouter from "@bprogress/next" instead of "next/navigation".',
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
