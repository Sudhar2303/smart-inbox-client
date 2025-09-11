import React, { useState } from "react";
import type { SignupPayload, LoginPayload } from "../../types/auth";

type Props<T extends "login" | "signup"> = {
  mode: T;
  onSubmit: T extends "signup"
    ? (values: SignupPayload) => void
    : (values: LoginPayload) => void;
};

export default function AuthFormComponent<T extends "login" | "signup">({
  mode,
  onSubmit,
}: Props<T>) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === "signup") {
      onSubmit({ name, email, password } as any);
    } else {
      onSubmit({ email, password } as any);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-4">
      {mode === "signup" && (
        <input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          required
        />
      )}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
        required
      />
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-sm transition transform hover:scale-105"
      >
        {mode === "login" ? "Login" : "Sign Up"}
      </button>
    </form>
  );
}
