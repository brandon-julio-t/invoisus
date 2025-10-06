import { MeshGradient } from "@paper-design/shaders-react";

import { RegisterForm } from "@/components/register-form";

export default function LoginPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
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

      <div className="flex flex-col gap-4 p-6 md:p-10">
        {/* <div className="flex justify-center gap-2 md:justify-start">
          <a href="#" className="flex items-center gap-2 font-medium">
            <div className="bg-primary text-primary-foreground flex size-6 items-center justify-center rounded-md">
              <GalleryVerticalEnd className="size-4" />
            </div>
            Acme Inc.
          </a>
        </div> */}

        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-sm">
            <RegisterForm />
          </div>
        </div>
      </div>
    </div>
  );
}
