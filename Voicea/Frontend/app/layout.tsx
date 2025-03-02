import type { Metadata } from 'next';
import './globals.css';
import { ChatbotProvider } from '../context/ChatbotContext'; // Correct import

export const metadata: Metadata = {
  title: 'Innovera',
  description: 'Your description here', // Add a meaningful description
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <ChatbotProvider>
          {children}
        </ChatbotProvider>
      </body>
    </html>
  );
}