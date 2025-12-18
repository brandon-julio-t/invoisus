"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Field, FieldGroup, FieldSet } from "@/components/ui/field";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { useRouter } from "@bprogress/next";
import { zodResolver } from "@hookform/resolvers/zod";
import { LockIcon, MailIcon } from "lucide-react";
import Link from "next/link";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

const formSchema = z.discriminatedUnion("step", [
  z.object({
    step: z.literal("send"),
    email: z.email(),
    code: z.string(),
    newPassword: z.string(),
  }),
  z.object({
    step: z.literal("verify"),
    email: z.email(),
    code: z.string().min(6),
    newPassword: z.string().min(8),
  }),
]);

type FormValues = z.infer<typeof formSchema>;

export default function PasswordReset() {
  const router = useRouter();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      step: "send",
      email: "",
      code: "",
      newPassword: "",
    },
  });

  const onSubmit = form.handleSubmit(
    async (data: FormValues) => {
      if (data.step === "send") {
        await toast
          .promise(
            authClient
              .requestPasswordReset({
                email: data.email,
              })
              .then((response) => {
                if (response.error) {
                  console.error(response.error);
                  throw new Error(response.error.message, {
                    cause: response.error,
                  });
                }
              }),
            {
              loading: "Sending reset code...",
              success: "Reset code sent successfully",
              error: {
                message: "Failed to send reset code",
                description: "Please check your email address and try again",
              },
            },
          )
          .unwrap();

        form.setValue("step", "verify");
      }

      if (data.step === "verify") {
        await toast
          .promise(
            authClient
              .resetPassword({
                newPassword: data.newPassword,
                token: data.code,
              })
              .then((response) => {
                if (response.error) {
                  console.error(response.error);
                  throw new Error(response.error.message, {
                    cause: response.error,
                  });
                }
              }),
            {
              loading: "Resetting password...",
              success: "Password reset successfully",
              error: {
                message: "Failed to reset password",
                description: "Please check your code and try again",
              },
            },
          )
          .unwrap();

        router.push("/login");
      }
    },
    (error) => {
      console.error(error);
      toast.error("Failed to reset password");
    },
  );

  const step = useWatch({
    control: form.control,
    name: "step",
  });

  const email = useWatch({
    control: form.control,
    name: "email",
  });

  return (
    <div className="flex flex-col gap-4 p-6 md:p-10">
      <div className="flex flex-1 items-center justify-center">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">
                {step === "send" ? "Forgot Password?" : "Reset Your Password"}
              </CardTitle>
              <CardDescription>
                {step === "send"
                  ? "Enter your email address and we'll send you a verification code"
                  : `We've sent a code to ${email}. Enter it below to reset your password.`}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <Form {...form}>
                <form onSubmit={onSubmit}>
                  <FieldSet>
                    <FieldGroup className={cn(step !== "send" && "hidden")}>
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email Address</FormLabel>
                            <FormControl>
                              <InputGroup>
                                <InputGroupAddon>
                                  <MailIcon />
                                </InputGroupAddon>
                                <InputGroupInput
                                  type="email"
                                  placeholder="Enter your email"
                                  {...field}
                                />
                              </InputGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Field>
                        <Button
                          type="submit"
                          className="flex-1"
                          disabled={form.formState.isSubmitting}
                        >
                          {form.formState.isSubmitting && <Spinner />}
                          {form.formState.isSubmitting
                            ? "Sending..."
                            : "Send Reset Code"}
                        </Button>
                      </Field>

                      <Field className="text-center">
                        <Link
                          href="/login"
                          className="text-muted-foreground text-sm underline-offset-4 hover:underline"
                        >
                          Back to Login
                        </Link>
                      </Field>
                    </FieldGroup>

                    <FieldGroup className={cn(step !== "verify" && "hidden")}>
                      <FormField
                        control={form.control}
                        name="code"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Verification Code</FormLabel>
                            <FormControl>
                              <Input
                                {...field}
                                placeholder="Enter your verification code"
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="newPassword"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>New Password</FormLabel>
                            <FormControl>
                              <InputGroup>
                                <InputGroupAddon>
                                  <LockIcon />
                                </InputGroupAddon>
                                <InputGroupInput
                                  type="password"
                                  placeholder="Enter your new password"
                                  {...field}
                                />
                              </InputGroup>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Field orientation="horizontal">
                        <Button
                          type="button"
                          variant="outline"
                          className="flex-1"
                          onClick={() => form.setValue("step", "send")}
                        >
                          Cancel
                        </Button>

                        <Button
                          type="submit"
                          className="flex-1"
                          disabled={form.formState.isSubmitting}
                        >
                          {form.formState.isSubmitting && <Spinner />}
                          {form.formState.isSubmitting
                            ? "Resetting..."
                            : "Reset Password"}
                        </Button>
                      </Field>

                      <Field className="text-center">
                        <Link
                          href="/login"
                          className="text-muted-foreground text-sm underline-offset-4 hover:underline"
                        >
                          Back to Login
                        </Link>
                      </Field>
                    </FieldGroup>
                  </FieldSet>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
