import nextVitals from "eslint-config-next/core-web-vitals";
import { globalIgnores } from "eslint/config";

const eslintConfig = [
  ...nextVitals,

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
          ],
        },
      ],
    },
  },

  {
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
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
