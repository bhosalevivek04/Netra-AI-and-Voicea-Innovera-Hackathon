export const metadata = {
  title: "Discussion Forum | Accessible Learning",
  description: "An inclusive discussion forum designed for blind students with voice assistant support.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="theme-color" content="#1a1f2c" />
      </head>
      <body className="bg-[#1a1f2c] text-white">{children}</body>
    </html>
  );
}