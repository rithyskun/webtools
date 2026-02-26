"use client";
import { useState, useEffect, FormEvent } from "react";
import { useSession, signIn } from "next-auth/react";

interface Client {
  id: string;
  name: string;
  redirectUris: string[];
  allowedScopes: string[];
  createdAt: string;
  updatedAt: string;
}

export default function ClientsPage() {
  const { data: session, status } = useSession();
  const [clients, setClients] = useState<Client[]>([]);
  const [name, setName] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/clients");
      const data = await res.json();
      setClients(data.clients || []);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    // redirect to signin if unauthenticated
    if (session.status === "unauthenticated") {
      signIn();
      return;
    }
    if (session.status === "authenticated") {
      load();
    }
  }, [session]);

  const createClient = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch("/api/clients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, redirectUris: [redirectUri] }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to create");
      setName("");
      setRedirectUri("");
      load();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteClient = async (id: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return;
    await fetch(`/api/clients/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">OAuth Clients</h1>
      {error && <p className="text-red-600">{error}</p>}

      <form onSubmit={createClient} className="mb-6 space-y-4">
        <div>
          <label className="block font-medium">Name</label>
          <input
            className="border rounded px-2 py-1 w-full"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div>
          <label className="block font-medium">Redirect URI</label>
          <input
            className="border rounded px-2 py-1 w-full"
            value={redirectUri}
            onChange={(e) => setRedirectUri(e.target.value)}
            required
          />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Create Client
        </button>
      </form>

      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border px-2 py-1">ID</th>
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">Redirect URIs</th>
            <th className="border px-2 py-1">Actions</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((c) => (
            <tr key={c.id} className="hover:bg-gray-100">
              <td className="border px-2 py-1 break-all">
                {c.id}
              </td>
              <td className="border px-2 py-1">{c.name}</td>
              <td className="border px-2 py-1">
                {c.redirectUris.join(", ")}
              </td>
              <td className="border px-2 py-1 space-x-2">
                <a
                  href={`/admin/clients/${c.id}`}
                  className="text-blue-600 hover:underline"
                >
                  Edit
                </a>
                <button
                  onClick={() => deleteClient(c.id)}
                  className="text-red-600 hover:underline"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
