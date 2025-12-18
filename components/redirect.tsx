"use client";

import { useRouter } from "@bprogress/next";
import type Link from "next/link";
import type React from "react";
import { useEffect } from "react";

export function Redirect({
  href,
}: {
  href: React.ComponentProps<typeof Link>["href"];
}) {
  const router = useRouter();

  useEffect(() => {
    router.push(href.toString());
  }, [href, router]);

  return null;
}
