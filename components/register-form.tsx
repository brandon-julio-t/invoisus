"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "@bprogress/next";
import { useAuthActions } from "@convex-dev/auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Field, FieldDescription, FieldGroup } from "./ui/field";

const registerSchema = z.object({
  email: z.email().nonempty(),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .nonempty(),
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export function RegisterForm() {
  const { signIn } = useAuthActions();

  const router = useRouter();

  const form = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: RegisterFormValues) => {
    const formData = new FormData();
    formData.append("email", values.email);
    formData.append("password", values.password);
    formData.append("flow", "signUp");

    await toast
      .promise(signIn("password", formData), {
        loading: "Signing up...",
        success: "Signed up successfully",
        error: (error) => {
          console.error(error);

          const isPasswordTooWeak =
            error instanceof Error &&
            error.message.includes("Invalid password") &&
            error.message.includes("validateDefaultPasswordRequirements");

          console.log({ "error.message": error.message, isPasswordTooWeak });

          return {
            message: isPasswordTooWeak
              ? "Password is too weak"
              : "Failed to sign up",
            description: isPasswordTooWeak
              ? "Please use a stronger password or contact support if the problem persists"
              : "Please check your email and password or contact support if the problem persists",
          };
        },
      })
      .unwrap();

    router.push("/");
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-6"
      >
        <FieldGroup>
          <div className="flex flex-col items-center gap-1 text-center">
            <h1 className="text-2xl font-bold">Create an account</h1>
            <p className="text-muted-foreground text-sm text-balance">
              Enter your email below to create an account
            </p>
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input type="email" placeholder="m@example.com" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center">
                  <FormLabel>Password</FormLabel>
                  <Link
                    href="/reset-password"
                    className="ml-auto text-sm underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
                <FormControl>
                  <Input type="password" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Field>
            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting}
            >
              Sign up
            </Button>

            <FieldDescription className="text-center">
              Already have an account?{" "}
              <Link href="/login" className="underline underline-offset-4">
                Sign in
              </Link>
            </FieldDescription>
          </Field>
        </FieldGroup>
      </form>
    </Form>
  );
}
