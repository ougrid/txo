import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign In - MiniSeller",
  description: "Sign in to your MiniSeller account to manage your e-commerce business.",
};

export default function SignIn() {
  return <SignInForm />;
}
