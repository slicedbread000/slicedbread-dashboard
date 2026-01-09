"use client";

import { useState } from "react";

export default function LoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      window.location.href = "/";
    } else {
      setError("Incorrect password");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-neutral-950 text-white">
      <form
        onSubmit={submit}
        className="w-full max-w-sm space-y-4 rounded-2xl bg-neutral-900 p-6 shadow-xl"
      >
        <h1 className="text-xl font-semibold">Dashboard Login</h1>

        <input
          type="password"
          placeholder="Password"
          className="w-full rounded-lg bg-neutral-800 p-2 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <div className="text-sm text-red-400">{error}</div>}

        <button
          type="submit"
          className="w-full rounded-lg bg-white py-2 font-medium text-black hover:opacity-90"
        >
          Enter
        </button>
      </form>
    </div>
  );
}
