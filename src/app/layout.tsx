import "../styles/globals.css";

export const metadata = {
  title: "Webtools",
  description: "API tools powered by Next.js",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
