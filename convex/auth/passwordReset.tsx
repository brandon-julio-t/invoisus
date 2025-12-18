import {
  Container,
  Head,
  Heading,
  Html,
  Link,
  Section,
  Tailwind,
  Text,
} from "@react-email/components";

export function PasswordResetEmail({
  code,
  url,
}: {
  code: string;
  url: string;
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
            <Link href={url}>Reset password</Link>
          </Section>
        </Container>
      </Tailwind>
    </Html>
  );
}
