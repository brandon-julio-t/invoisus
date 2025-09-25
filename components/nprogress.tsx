"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { Loader2Icon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { usePathname, useRouter } from "next/navigation";
import React from "react";
import { linkStatusAtom } from "./link";

/**
 * Made by LLM (grok-code-fast-1)
 */
export function NProgress() {
  const { pending } = useAtomValue(linkStatusAtom);

  return (
    <>
      <HijackRouterNavigation />

      <aside className="pointer-events-none fixed top-0 right-0 left-0 z-999">
        {pending && (
          <Loader2Icon className="fixed top-1 right-1 size-(--text-sm) animate-spin" />
        )}

        <AnimatePresence>
          {pending && (
            <motion.div
              key={`nprogress-${pending}`}
              className="bg-info/70 h-1"
              initial={{ width: "0%" }}
              animate={{
                width: ["0%", "20%", "40%", "55%", "70%", "82%", "85%"],
              }}
              exit={{
                width: "100%",
                opacity: 0,
                transition: {
                  width: { duration: 0.075, ease: [0.8, 0, 1, 1] },
                  opacity: { duration: 0.2, delay: 0.2 },
                },
              }}
              transition={{
                duration: 3.2,
                times: [0, 0.1, 0.25, 0.45, 0.7, 0.9, 1],
                ease: [
                  "easeOut",
                  "linear",
                  "easeInOut",
                  "linear",
                  "easeIn",
                  "linear",
                  "easeInOut",
                ],
              }}
            />
          )}
        </AnimatePresence>
      </aside>
    </>
  );
}

let isHijacked = false;

function HijackRouterNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const setLinkStatus = useSetAtom(linkStatusAtom);

  if (typeof window !== "undefined") {
    if (!isHijacked) {
      const originalPush = router.push;

      router.push = function (...args) {
        setLinkStatus({ pending: true });
        return originalPush(...args);
      };

      isHijacked = true;

      console.debug("router.push hijacked");
    } else {
      console.debug("router.push already hijacked");
    }
  }

  React.useEffect(() => {
    setLinkStatus({ pending: false });

    console.debug(
      "navigation event detected, should set link status `pending` to `false`",
    );
  }, [pathname, setLinkStatus]);

  return null;
}
