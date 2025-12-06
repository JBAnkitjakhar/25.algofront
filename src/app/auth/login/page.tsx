// src/app/auth/login/page.tsx - Complete Updated Version

"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import { useAuth } from "@/hooks/useAuth";
import { ROUTES } from "@/constants";
import toast from "react-hot-toast";

// Separate component for handling search params
function LoginContent() {
  const {
    loginWithGoogle,
    loginWithGithub,
    isAuthenticated,
    isLoading,
    error,
  } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated) {
      router.push(ROUTES.ME);
      return;
    }

    // Handle OAuth errors from URL params
    const urlError = searchParams.get("error");
    const urlMessage = searchParams.get("message");

    if (urlError) {
      toast.error(urlMessage || urlError);
    }
  }, [isAuthenticated, router, searchParams]);

  useEffect(() => {
    // Handle auth errors
    if (error) {
      toast.error(error);
    }
  }, [error]);

  if (isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-gray-200 to-gray-500 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          {/* Updated Logo with 3D Rotation */}
          <div
            className="mx-auto h-16 w-16 flex items-center justify-center"
            style={{ perspective: "1000px" }}
          >
            <div className="logo-3d-rotate">
              <Image
                src="/logo.jpg"
                alt="AlgoArena Logo"
                width={64}
                height={64}
                className="rounded-xl object-cover"
                priority
              />
            </div>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-700">
            Welcome to AlgoArena
          </h2>
          <p className="mt-2 text-center text-sm text-gray-800">
            Upskilling Yourself in
          </p>
          <p className="mt-2 text-center text-sm text-gray-900">
            Data Structures & Algorithms
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <div>
            <button
              onClick={loginWithGoogle}
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center py-3 px-4 border-2 border-gray-600 text-sm font-medium rounded-lg text-blue-800 bg-gray-300 hover:border-blue-500 text-blue-700focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors overflow-hidden"
              style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
            >
              {/* Sliding background effect */}
              <span className="absolute inset-0 w-0 bg-gradient-to-r from-blue-300 to-gray-500 transition-all duration-300 ease-out group-hover:w-full" />

              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700 relative z-10"></div>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2 relative z-10"
                    viewBox="0 0 24 24"
                  >
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                  </svg>
                  <span className="relative z-10">Continue with Google</span>
                </>
              )}
            </button>
          </div>

          <div>
            <button
              onClick={loginWithGithub}
              disabled={isLoading}
              className="group relative w-full flex justify-center items-center py-3 px-4 border-2 border-gray-600 text-sm font-medium rounded-lg text-blue-900 bg-gray-300 hover:bg-gray-400 hover:border-blue-500  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors overflow-hidden"
              style={{ cursor: isLoading ? "not-allowed" : "pointer" }}
            >
              {/* Sliding background effect */}
              <span className="absolute inset-0 w-0 bg-gradient-to-r from-blue-300 to-gray-500 transition-all duration-300 ease-out group-hover:w-full" />

              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-800 relative z-10"></div>
              ) : (
                <>
                  <svg
                    className="w-5 h-5 mr-2 relative z-10"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                  </svg>
                  <span className="relative z-10">Continue with GitHub</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-300 text-gray-500">
                Secure authentication via OAuth2
              </span>
            </div>
          </div>
        </div>

        <div className="text-center text-xs text-gray-700 space-y-2">
          <p>
            By signing in, you agree to our{" "}
            <a href="/terms" className="text-blue-600 hover:text-blue-500">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="/privacypolicy" className="text-blue-600 hover:text-blue-500">
              Privacy Policy
            </a>
          </p>
          <p className="flex items-center justify-center space-x-1">
            <svg
              className="h-3 w-3 text-green-500"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
            <span>Your data is secure and never shared</span>
          </p>
        </div>
      </div>
      {/* Custom 3D Rotation CSS */}
      <style jsx>{`
        @keyframes rotate3d {
          0% {
            transform: rotateY(0deg);
          }
          100% {
            transform: rotateY(360deg);
          }
        }

        .logo-3d-rotate {
          animation: rotate3d 4s linear infinite;
          transform-style: preserve-3d;
          display: inline-block;
        }
      `}</style>
    </div>
  );
}

// Loading fallback component
function LoginLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

// Main page component with Suspense wrapper
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginLoading />}>
      <LoginContent />
    </Suspense>
  );
}
