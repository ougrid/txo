import SignInForm from "@/components/auth/SignInForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign In - MiniSeller",
  description: "Sign in to your MiniSeller account to manage your e-commerce business.",
};

function SignInFormWrapper() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    }>
      <SignInForm />
    </Suspense>
  );
}

export default function SignIn() {
  return <SignInFormWrapper />;
}
