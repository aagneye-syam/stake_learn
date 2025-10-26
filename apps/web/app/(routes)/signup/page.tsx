"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import SignUpForm from "@/_components/SignUpForm";
import Link from "next/link";
import { signUpWithEmail } from "@/services/auth.service";
import { createUserDocument } from "@/services/user.service";

export default function SignUpPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSignUp = async (email: string, password: string) => {
    setIsLoading(true);
    setError("");

    try {
      // Create user with Firebase Auth
      const authUser = await signUpWithEmail(email, password);
      
      // Create user document in Firestore
      await createUserDocument(authUser.uid, email);
      
      // Navigate to home page after successful signup
      router.push("/");
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-black mb-2">Create Account</h1>
          <p className="text-gray-600">Join us and start your learning journey</p>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
          <SignUpForm onSubmit={handleSignUp} isLoading={isLoading} error={error} />

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/signin" className="text-purple-600 hover:text-purple-700 font-medium">
                Sign In
              </Link>
            </p>
          </div>
        </div>

        <div className="mt-6 text-center">
          <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
