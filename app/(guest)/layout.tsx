import { isAuthenticated } from "@/lib/auth-server";
import { MeshGradient } from "@paper-design/shaders-react";
import { redirect } from "next/navigation";
import React from "react";

export default async function GuestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (await isAuthenticated()) {
    redirect("/");
  }

  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      {/* Left side with gradient background */}
      <div className="bg-muted relative hidden lg:block">
        <MeshGradient
          className="h-full"
          distortion={1}
          swirl={0}
          offsetX={0}
          offsetY={0}
          scale={1}
          rotation={0}
          speed={0.2}
          colors={[
            "#fafafa",
            "#f5f5f5",
            "#e6e6e6",
            "#d4d4d4",
            "#a3a3a3",
            "#737373",
            "#525252",
            "#404040",
            "#262626",
            "#171717",
          ]}
        />
      </div>

      {/* Right side with content */}
      {children}
    </div>
  );
}
