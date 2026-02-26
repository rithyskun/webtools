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
    <main style={{ padding: 32 }}>
      <h1>Sign in</h1>
      {providers ? (
        Object.values(providers).map((provider) => (
          <div key={provider.id} style={{ margin: "8px 0" }}>
            <button onClick={() => signIn(provider.id)}>
              Sign in with {provider.name}
            </button>
          </div>
        ))
      ) : (
        <p>Loading providers…</p>
      )}
    </main>
  );
}
