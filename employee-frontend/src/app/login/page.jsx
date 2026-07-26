"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../context/AuthContext";

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const { user, isLoading, signIn } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const redirectTo = searchParams.get("from") || "/dashboard";

  // Already logged in (e.g. cookie session restored) -> skip the login form.
  useEffect(() => {
    if (!isLoading && user) {
      router.replace(redirectTo);
    }
  }, [isLoading, user, router, redirectTo]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signIn(email, password);
      router.replace(redirectTo);
    } catch (err) {
      setError(err.message || "Invalid email or password");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center tonal-layering-bg px-margin-mobile md:px-0">
      <main className="w-full max-w-[440px]">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-fixed rounded-xl mb-4">
            <span
              className="material-symbols-outlined text-primary text-3xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              work
            </span>
          </div>
          <h1 className="font-headline-md text-headline-md text-primary mb-2">WorkforceConnect</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Welcome back. Please enter your details.
          </p>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-8 md:p-10 card-shadow">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-error-container text-on-error-container rounded-lg px-4 py-3 text-label-md">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="block font-label-md text-label-md text-on-surface-variant" htmlFor="email">
                Email Address
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors text-[20px]">
                    mail
                  </span>
                </div>
                <input
                  className="block w-full pl-10 pr-4 py-3 bg-white border border-outline-variant rounded-lg text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:border-primary transition-all font-body-md text-body-md"
                  id="email"
                  name="email"
                  placeholder="name@company.com"
                  required
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block font-label-md text-label-md text-on-surface-variant" htmlFor="password">
                  Password
                </label>
                <a className="font-label-sm text-label-sm text-primary hover:underline" href="#">
                  Forgot password?
                </a>
              </div>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="material-symbols-outlined text-outline group-focus-within:text-primary transition-colors text-[20px]">
                    lock
                  </span>
                </div>
                <input
                  className="block w-full pl-10 pr-12 py-3 bg-white border border-outline-variant rounded-lg text-on-surface placeholder:text-outline/50 focus:outline-none focus:ring-2 focus:ring-primary-fixed-dim focus:border-primary transition-all font-body-md text-body-md"
                  id="password"
                  name="password"
                  placeholder="••••••••"
                  required
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="current-password"
                />
                <button
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-outline hover:text-on-surface transition-colors"
                  onClick={() => setShowPassword((v) => !v)}
                  type="button"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            <button
              className="w-full flex justify-center items-center gap-2 py-3.5 px-4 border border-transparent rounded-lg shadow-sm font-label-md text-label-md font-semibold text-white bg-primary hover:bg-primary-container active:scale-[0.98] transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-60 disabled:cursor-not-allowed"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-1 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Authenticating...
                </>
              ) : (
                "Login to Workspace"
              )}
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div aria-hidden="true" className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-outline-variant"></div>
              </div>
              <div className="relative flex justify-center text-label-sm uppercase tracking-wider">
                <span className="bg-surface-container-lowest px-4 text-outline">Secure Environment</span>
              </div>
            </div>
            <div className="mt-6 flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 text-on-secondary-container">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
                <p className="font-label-sm text-label-sm text-center">JWT-based secure session management active</p>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 text-center space-y-4">
          <p className="font-label-md text-label-md text-on-surface-variant">
            Need help accessing your account?
            <a className="text-primary font-bold hover:underline ml-1" href="#">
              Contact IT Support
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
