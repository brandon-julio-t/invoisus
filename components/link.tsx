"use client";

import NextLink, { useLinkStatus } from "next/link";

import { useRouter as useNextRouter, usePathname } from "next/navigation";
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

export function useRouter() {
  const router = useNextRouter();

  const pushWithNProgress: typeof router.push = (...args) => {
    NProgress.start();
    return router.push(...args);
  };

  return {
    ...router,

    push: pushWithNProgress,
  };
}

export function HijackRouterNavigationForNProgress() {
  const pathname = usePathname();

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
