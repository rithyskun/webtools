"use client";

import { signIn } from "next-auth/react";
import { useEffect, useState } from "react";

interface Provider {
  id: string;
  name: string;
}

export default function SignInPage() {
  const [providers, setProviders] = useState<Record<string, Provider> | null>(null);

  useEffect(() => {
    import("next-auth/react").then(({ getProviders }) => {
      getProviders().then((p: any) => setProviders(p));
    });
  }, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-8">
        <h1 className="text-3xl font-extrabold text-center mb-6">Sign in</h1>
        {providers ? (
          Object.values(providers).map((provider) => (
            <button
              key={provider.id}
              className="w-full mb-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              onClick={() => signIn(provider.id)}
            >
              Sign in with {provider.name}
            </button>
          ))
        ) : (
          <p className="text-center">Loading providers…</p>
        )}
      </div>
    </main>
  );
}
