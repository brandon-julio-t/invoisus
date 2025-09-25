import { FlatCompat } from "@eslint/eslintrc";
import { dirname } from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "./convex/_generated/**",
    ],
  },

  ...compat.extends("next/core-web-vitals", "next/typescript"),

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

            {
              name: "next/link",
              message:
                'Please import Link from "@/components/link" instead of "next/link" to use the custom Link component with navigation status tracking.',
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
