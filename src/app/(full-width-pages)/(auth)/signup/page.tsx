import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up - MiniSeller",
  description: "Create your MiniSeller account to start managing your e-commerce business.",
  // other metadata
};

export default function SignUp() {
  return <SignUpForm />;
}
