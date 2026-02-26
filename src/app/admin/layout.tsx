import { ReactNode } from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await getServerSession(authOptions as any);
  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div>
      <nav className="bg-gray-800 text-white p-4">
        <a href="/admin" className="mr-4 hover:underline">
          Dashboard
        </a>
        <a href="/admin/clients" className="hover:underline">
          Clients
        </a>
      </nav>
      <main>{children}</main>
    </div>
  );
}
