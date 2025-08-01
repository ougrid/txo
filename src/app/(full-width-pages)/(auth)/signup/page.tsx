import SignUpForm from "@/components/auth/SignUpForm";
import { Metadata } from "next";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Sign Up - MiniSeller",
  description: "Create your MiniSeller account to start managing your e-commerce business.",
  // other metadata
};

function SignUpFormWrapper() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-brand-500"></div>
      </div>
    }>
      <SignUpForm />
    </Suspense>
  );
}

export default function SignUp() {
  return <SignUpFormWrapper />;
}
