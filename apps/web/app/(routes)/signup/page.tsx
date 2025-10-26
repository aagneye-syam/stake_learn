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
  const [success, setSuccess] = useState(false);

  const handleSignUp = async (email: string, password: string) => {
    setIsLoading(true);
    setError("");
    setSuccess(false);

    try {
      // Create user with Firebase Auth
      const authUser = await signUpWithEmail(email, password);
      
      // Create user document in Firestore
      await createUserDocument(authUser.uid, email);
      
      // Show success message
      setSuccess(true);
      
      // Navigate to home page after brief delay
      setTimeout(() => {
        router.push("/");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-black mb-2">Create Account</h1>
          <p className="text-sm sm:text-base text-gray-600">Join us and start your learning journey</p>
        </div>

        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200">
          {success ? (
            <div className="p-6 text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-black mb-2">Account Created Successfully!</h3>
              <p className="text-gray-600">Redirecting you to the home page...</p>
            </div>
          ) : (
            <SignUpForm onSubmit={handleSignUp} isLoading={isLoading} error={error} />
          )}

          {!success && (
            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/signin" className="text-purple-600 hover:text-purple-700 font-medium">
                  Sign In
                </Link>
              </p>
            </div>
          )}
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
