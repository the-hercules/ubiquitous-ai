"use client";

import { Suspense } from "react";
import { useUser, UserButton, SignInButton } from "@clerk/nextjs";
import { useAcceptInvitation } from "@/hooks/use-invitation";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Mail, Loader2, CheckCircle2, XCircle, UserPlus } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function InviteContent() {
  const { user, isLoaded: isUserLoaded, isSignedIn } = useUser();
  const acceptInvitation = useAcceptInvitation();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [token, setToken] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "accepting" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  // Extract token from URL on mount
  useEffect(() => {
    const tokenParam = searchParams.get("token");
    if (tokenParam) {
      setToken(tokenParam);
    }
  }, [searchParams]);

  const handleAcceptInvite = async () => {
    if (!token) {
      setErrorMessage("No invitation token found");
      setStatus("error");
      return;
    }

    setStatus("accepting");
    setErrorMessage("");

    try {
      await acceptInvitation.mutateAsync({ token });
      setStatus("success");
      // Redirect to dashboard after success
      setTimeout(() => {
        router.push("/dashboard");
      }, 2000);
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Failed to accept invitation");
    }
  };

  // Loading state
  if (!isUserLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  // No token provided
  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-8 h-8 text-amber-600" />
            </div>
            <CardTitle>Invalid Invitation Link</CardTitle>
            <CardDescription>
              This invitation link appears to be invalid or incomplete. 
              Please check your email for the correct link.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/">
              <Button variant="outline">Go Home</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

  // Not signed in - show sign in prompt
  if (!isSignedIn) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
        {/* Header */}
        <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">U</span>
                </div>
                <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                  Ubiquitous AI
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="flex items-center justify-center px-4 py-16">
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserPlus className="w-8 h-8 text-indigo-600" />
              </div>
              <CardTitle>You've Been Invited!</CardTitle>
              <CardDescription>
                Sign in or create an account to accept this invitation and join the team.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  After signing in, you'll be able to accept this invitation and access the agency dashboard.
                </p>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-3">
              <SignInButton 
                mode="modal"
                fallbackRedirectUrl={`/invite?token=${token}`}
              >
                <Button variant="primary" className="w-full">
                  Sign In to Accept
                </Button>
              </SignInButton>
              <Link href="/" className="w-full">
                <Button variant="outline" className="w-full">
                  Go Home
                </Button>
              </Link>
            </CardFooter>
          </Card>
        </main>
      </div>
    );
  }

  // Signed in - show accept invitation UI
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">U</span>
              </div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                Ubiquitous AI
              </span>
            </div>
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </header>

      <main className="flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md">
          {status === "success" ? (
            /* Success State */
            <>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <CardTitle>Welcome to the Team!</CardTitle>
                <CardDescription>
                  You've successfully joined the agency. Redirecting to dashboard...
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                </div>
              </CardContent>
            </>
          ) : status === "error" ? (
            /* Error State */
            <>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <XCircle className="w-8 h-8 text-red-600" />
                </div>
                <CardTitle>Unable to Accept Invitation</CardTitle>
                <CardDescription>
                  {errorMessage || "Something went wrong. Please try again."}
                </CardDescription>
              </CardHeader>
              <CardFooter className="flex flex-col gap-3">
                <Button variant="primary" className="w-full" onClick={handleAcceptInvite}>
                  Try Again
                </Button>
                <Link href="/" className="w-full">
                  <Button variant="outline" className="w-full">
                    Go Home
                  </Button>
                </Link>
              </CardFooter>
            </>
          ) : (
            /* Default State - Ready to Accept */
            <>
              <CardHeader className="text-center">
                <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-indigo-600" />
                </div>
                <CardTitle>Accept Invitation</CardTitle>
                <CardDescription>
                  You've been invited to join an agency on Ubiquitous AI.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg">
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">
                    Accepting as: <span className="font-medium text-zinc-900 dark:text-zinc-100">{user?.emailAddresses[0]?.emailAddress}</span>
                  </p>
                </div>
                <p className="text-xs text-zinc-500 text-center">
                  Make sure the email above matches the invitation. If not, sign out and use the correct account.
                </p>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="primary" 
                  className="w-full" 
                  onClick={handleAcceptInvite}
                  isLoading={status === "accepting"}
                >
                  {status === "accepting" ? "Accepting..." : "Accept Invitation"}
                </Button>
              </CardFooter>
            </>
          )}
        </Card>
      </main>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
        <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
      </div>
    </div>
  );
}

export default function InvitePage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <InviteContent />
    </Suspense>
  );
}
