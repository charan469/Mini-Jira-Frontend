import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";

export const metadata = {
  title: "Task Tracker",
  description: "Task management system",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <ClerkProvider
          signInFallbackRedirectUrl="/sso-callback"
          signUpFallbackRedirectUrl="/sso-callback"
        >
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}