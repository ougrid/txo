import { Outfit } from 'next/font/google';
import './globals.css';
import type { Metadata } from 'next';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { DashboardProvider } from '@/context/DashboardContext';
import { AuthProvider } from '@/context/AuthContext';
import ClientOnly from '@/components/ClientOnly';

const outfit = Outfit({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'MiniSeller - Thai E-commerce Analytics Platform',
  description: 'Comprehensive analytics platform for Thai e-commerce businesses. Process order data, calculate revenue, and generate detailed business insights with support for multiple platforms.',
  keywords: ['thai ecommerce', 'analytics', 'revenue calculation', 'order processing', 'business insights', 'shopee', 'lazada'],
  authors: [{ name: 'MiniSeller Team' }],
  openGraph: {
    title: 'MiniSeller - Thai E-commerce Analytics Platform',
    description: 'Process order data, calculate revenue, and generate business insights for Thai e-commerce',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body 
        className={`${outfit.className} dark:bg-gray-900`}
        suppressHydrationWarning={true}
      >
        <ClientOnly>
          <ThemeProvider>
            <AuthProvider>
              <DashboardProvider>
                <SidebarProvider>{children}</SidebarProvider>
              </DashboardProvider>
            </AuthProvider>
          </ThemeProvider>
        </ClientOnly>
      </body>
    </html>
  );
}
