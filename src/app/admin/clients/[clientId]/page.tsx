"use client";
import { useState, useEffect, FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

interface Client {
  id: string;
  name: string;
  redirectUris: string[];
  allowedScopes: string[];
  createdAt: string;
  updatedAt: string;
}

interface Props {
  params: { clientId: string };
}

export default function ClientDetail({ params }: Props) {
  const { clientId } = params;
  const router = useRouter();
  const { data: session, status } = useSession();

  const [client, setClient] = useState<Client | null>(null);
  const [name, setName] = useState("");
  const [redirectUri, setRedirectUri] = useState("");
  const [error, setError] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch(`/api/clients/${clientId}`);
    const data: any = await res.json();
    if (data.success) {
      setClient(data.client);
      setName(data.client.name);
      setRedirectUri(data.client.redirectUris[0] || "");
    } else {
      setError(data.error || "Failed to load client");
    }
  };

  useEffect(() => {
    if (session.status === "unauthenticated") {
      signIn();
      return;
    }
    if (session.status === "authenticated") {
      load();
    }
  }, [clientId, session]);

  const update = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await fetch(`/api/clients/${clientId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, redirectUris: [redirectUri] }),
      });
      const data: any = await res.json();
      if (!data.success) throw new Error(data.error || "Failed to update");
      router.push("/admin/clients");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const remove = async () => {
    if (!confirm("Are you sure?")) return;
    await fetch(`/api/clients/${clientId}`, { method: "DELETE" });
    router.push("/admin/clients");
  };

  if (error) {
    return <p className="p-8 text-red-600">{error}</p>;
  }

  if (!client) {
    return <p className="p-8">Loading…</p>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Edit Client</h1>
      <form onSubmit={update} className="space-y-4">
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
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          Save
        </button>
        <button
          type="button"
          onClick={remove}
          className="ml-4 text-red-600 hover:underline"
        >
          Delete
        </button>
      </form>
    </div>
  );
}
