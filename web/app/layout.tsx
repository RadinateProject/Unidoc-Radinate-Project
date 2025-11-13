// app/layout.tsx
import { ThemeProvider } from '@/context/ThemeContext';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'Radinate Frontend',
  description: 'Radinate dashboard with auth and RBAC',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
