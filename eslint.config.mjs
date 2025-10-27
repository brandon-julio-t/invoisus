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
    ignores: ["components/link.tsx"],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "next/link",
              message:
                'Please import Link from "@/components/link" instead of "next/link" to use the custom Link component with NProgress.',
            },
            {
              name: "next/navigation",
              importNames: ["useRouter"],
              message:
                'Please import useRouter from "@/components/link" instead of "next/navigation" to use the custom router with NProgress.',
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
