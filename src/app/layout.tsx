import { Outfit } from 'next/font/google';
import './globals.css';

import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { NotificationProvider } from '@/context/NotificationContext';
import Providers from '@/components/auth/SessionProvider';

const outfit = Outfit({
  subsets: ["latin"],
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {  return (
      <html lang="en">
        <body className={`${outfit.className} dark:bg-gray-900`}>
          <Providers>
            <NotificationProvider>
              <ThemeProvider>
                <SidebarProvider>{children}</SidebarProvider>
              </ThemeProvider>
            </NotificationProvider>
          </Providers>
        </body>
      </html>
  );
}
