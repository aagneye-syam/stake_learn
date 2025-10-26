"use client";

import { useState } from "react";

interface SignUpFormProps {
  onSubmit: (email: string, password: string) => Promise<void>;
  isLoading?: boolean;
  error?: string;
}

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export default function SignUpForm({ onSubmit, isLoading, error }: SignUpFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [formError, setFormError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    // Basic validation
    if (!email || !password || !confirmPassword) {
      setFormError("All fields are required");
      return;
    }

    if (!validateEmail(email)) {
      setFormError("Please enter a valid email address");
      return;
    }

    if (password !== confirmPassword) {
      setFormError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return;
    }

    try {
      await onSubmit(email, password);
    } catch (err) {
      // Error will be handled by parent component
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label htmlFor="email" className="block text-sm font-medium text-black mb-2">
          Email Address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-black bg-white"
          placeholder="Enter your email"
          disabled={isLoading}
          required
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-black mb-2">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-black bg-white"
          placeholder="Enter your password"
          disabled={isLoading}
          required
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-black mb-2">
          Confirm Password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none transition-all text-black bg-white"
          placeholder="Re-enter your password"
          disabled={isLoading}
          required
        />
      </div>

      {(formError || error) && (
        <div className="p-4 rounded-xl bg-red-50 border-2 border-red-200">
          <p className="text-sm font-medium text-red-800">{formError || error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-medium hover:from-purple-700 hover:to-blue-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? "Creating Account..." : "Sign Up"}
      </button>
    </form>
  );
}
