"use client";

/**
 * @see https://github.com/vercel/next.js/pull/82814
 */
// @ts-expect-error - useLinkStatus is there, but somehow not in next/link's type definitions
// eslint-disable-next-line no-restricted-imports
import NextLink, { useLinkStatus } from "next/link";

import { atom, useSetAtom } from "jotai";
import React from "react";

export const linkStatusAtom = atom({ pending: false });

const Link: typeof NextLink = ({ children, ...props }) => {
  return (
    <NextLink {...props}>
      {children}
      <LinkStatus />
    </NextLink>
  );
};

function LinkStatus() {
  const { pending } = useLinkStatus();

  const setLinkStatus = useSetAtom(linkStatusAtom);

  React.useEffect(() => {
    setLinkStatus({ pending });
  }, [pending, setLinkStatus]);

  return null;
}

export default Link;
