import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { DashboardProvider } from '@/context/DashboardContext';
import { AuthProvider } from '@/context/AuthContext';
import ClientOnly from '@/components/ClientOnly';

const outfit = Outfit({
  subsets: ["latin"],
});

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
