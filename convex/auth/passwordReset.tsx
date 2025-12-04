import { Email } from "@convex-dev/auth/providers/Email";
import type { RandomReader } from "@oslojs/crypto/random";
import { generateRandomString } from "@oslojs/crypto/random";
import {
  Container,
  Head,
  Heading,
  Html,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";
import { formatDistanceToNow } from "date-fns";
import { Resend as ResendAPI } from "resend";

export const ResendOTPPasswordReset = Email({
  id: "resend-otp-password-reset",

  apiKey: process.env.RESEND_API_KEY,

  async generateVerificationToken() {
    const random: RandomReader = {
      read(bytes) {
        crypto.getRandomValues(bytes);
      },
    };

    const alphabet = "0123456789";
    const length = 6;
    return generateRandomString(random, alphabet, length);
  },

  async sendVerificationRequest({
    identifier: email,
    provider,
    token,
    expires,
  }) {
    const resend = new ResendAPI(provider.apiKey);

    const { data, error } = await resend.emails.send({
      from: "Invoisus <notify@noreply.farmio.io>",
      to: [email],
      subject: `Reset password in Invoisus`,
      react: PasswordResetEmail({ code: token, expires }),
    });

    if (error) {
      console.error(error);
      throw new Error(JSON.stringify(error));
    }

    console.log(data);
  },
});

function PasswordResetEmail({
  code,
  expires,
}: {
  code: string;
  expires: Date;
}) {
  return (
    <Html>
      <Tailwind>
        <Head />
        <Container className="container px-20 font-sans">
          <Heading className="mb-4 text-xl font-bold">
            Reset your password in Invoisus
          </Heading>
          <Text className="text-sm">
            Please enter the following code on the password reset page.
          </Text>
          <Section className="text-center">
            <Text className="font-semibold">Verification code</Text>
            <Text className="text-4xl font-bold">{code}</Text>
            <Text>
              (This code will expire in {formatDistanceToNow(expires)})
            </Text>
          </Section>
        </Container>
      </Tailwind>
    </Html>
  );
}
