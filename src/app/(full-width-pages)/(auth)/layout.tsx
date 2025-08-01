"use client";

import GridShape from "@/components/common/GridShape";
import ThemeTogglerTwo from "@/components/common/ThemeTogglerTwo";
import { AuthGuard } from "@/components/auth/AuthGuard";

import { ThemeProvider } from "@/context/ThemeContext";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AuthGuard requireAuth={false}>
      <div className="relative p-6 bg-white z-1 dark:bg-gray-900 sm:p-0">
        <ThemeProvider>
          <div className="relative flex lg:flex-row w-full h-screen justify-center flex-col  dark:bg-gray-900 sm:p-0">
            {children}
            <div className="lg:w-1/2 w-full h-full bg-brand-950 dark:bg-white/5 lg:grid items-center hidden">
              <div className="relative items-center justify-center  flex z-1">
                {/* <!-- ===== Common Grid Shape Start ===== --> */}
                <GridShape />
                <div className="flex flex-col items-center max-w-xs">
                  <Link href="/" className="block mb-4">
                    <Image
                      width={227}
                      height={101}
                      src="./images/logo/miniseller-logo-bg-removed-908x404.png"
                      alt="Logo"
                    />
                  </Link>
                  <p className="text-center text-gray-400 dark:text-white/60">
                    Comprehensive Thai E-commerce Analytics Platform
                  </p>
                  <p className="text-center text-gray-500 dark:text-white/40 text-sm mt-2">
                    Process order data, calculate revenue, and generate business insights
                  </p>
                </div>
              </div>
            </div>
            <div className="fixed bottom-6 right-6 z-50 hidden sm:block">
              <ThemeTogglerTwo />
            </div>
          </div>
        </ThemeProvider>
      </div>
    </AuthGuard>
  );
}
