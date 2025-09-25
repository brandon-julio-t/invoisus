"use client";

/**
 * @see https://github.com/vercel/next.js/pull/82814
 */
// @ts-expect-error - useLinkStatus is there, but somehow not in next/link's type definitions
// eslint-disable-next-line no-restricted-imports
import NextLink, { useLinkStatus } from "next/link";

import { usePathname, useRouter } from "next/navigation";
import NProgress from "nprogress";
import React from "react";

const Link: typeof NextLink = ({ children, ...props }) => {
  return (
    <NextLink {...props}>
      {children}
      <LinkStatusHijacker />
    </NextLink>
  );
};

function LinkStatusHijacker() {
  const { pending } = useLinkStatus();

  React.useEffect(() => {
    if (pending) {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [pending]);

  return null;
}

export function HijackRouterNavigationForNProgress() {
  const router = useRouter();
  const pathname = usePathname();

  const [isHijacked, setIsHijacked] = React.useState(false);

  React.useEffect(
    function hijackRouterPush() {
      if (isHijacked) {
        console.debug("router.push already hijacked");
        return;
      }

      const originalPush = router.push;

      router.push = function (...args) {
        NProgress.start();
        return originalPush(...args);
      };

      setIsHijacked(true);

      console.debug("router.push hijacked");
    },
    [isHijacked, router],
  );

  React.useEffect(
    function resetNProgressOnNavigation() {
      NProgress.done();

      console.debug(
        "navigation event detected, should set link status `pending` to `false`",
      );
    },
    [pathname],
  );

  return null;
}

export default Link;
