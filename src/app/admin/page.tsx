import { getServerSession } from "next-auth";
import { authOptions } from "../api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function AdminPage() {
  const session = await getServerSession(authOptions as any);
  if (!session) {
    redirect("/auth/signin");
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
      <p>Welcome, {session.user?.name || session.user?.email}</p>
      <ul className="mt-6 list-disc list-inside space-y-2">
        <li>
          <a href="/admin/clients" className="text-blue-600 hover:underline">
            Manage OAuth Clients
          </a>
        </li>
      </ul>
    </div>
  );
}
