"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useUserStatus, useCreateAgency } from "@/hooks/use-agency";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Building2, Mail, Loader2, ArrowRight, CheckCircle2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OnboardingPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { data: userStatus, isLoading: isStatusLoading, error: statusError } = useUserStatus();
  const createAgency = useCreateAgency();
  const router = useRouter();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [agencyName, setAgencyName] = useState("");
  const [agencySlug, setAgencySlug] = useState("");
  const [formError, setFormError] = useState("");

  // Auto-generate slug from name
  useEffect(() => {
    const slug = agencyName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
    setAgencySlug(slug);
  }, [agencyName]);

  // Redirect to dashboard if user already has a tenant
  useEffect(() => {
    if (userStatus?.user?.tenant_id) {
      router.push("/dashboard");
    }
  }, [userStatus, router]);

  const handleCreateAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!agencyName.trim()) {
      setFormError("Agency name is required");
      return;
    }
    if (!agencySlug.trim()) {
      setFormError("Agency slug is required");
      return;
    }

    try {
      await createAgency.mutateAsync({
        name: agencyName.trim(),
        slug: agencySlug.trim(),
      });
      router.push("/dashboard");
    } catch (error) {
      setFormError(error instanceof Error ? error.message : "Failed to create agency");
    }
  };

  // Loading state
  if (!isUserLoaded || isStatusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-zinc-600 dark:text-zinc-400">Loading...</p>
        </div>
      </div>
    );
  }

  // Not signed in
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Sign in required</CardTitle>
            <CardDescription>Please sign in to continue</CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Link href="/sign-in">
              <Button>Sign In</Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    );
  }

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

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        {/* Welcome Message */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
            Welcome, {user.firstName || user.emailAddresses[0]?.emailAddress}!
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            {statusError 
              ? "Unable to connect to server. Please try again later."
              : "Let's get you set up with your agency."}
          </p>
        </div>

        {/* Error Banner */}
        {statusError && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-900/20 dark:border-amber-800">
            <p className="text-sm text-amber-800 dark:text-amber-200">
              ⚠️ Backend connection failed. Make sure the API server is running on port 3001.
            </p>
          </div>
        )}

        {/* Options */}
        {!showCreateForm ? (
          <div className="grid md:grid-cols-2 gap-6">
            {/* Create Agency Card */}
            <Card className="cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all" onClick={() => setShowCreateForm(true)}>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-indigo-100 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-4">
                    <Building2 className="w-8 h-8 text-indigo-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                    Create an Agency
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                    Start your own agency and invite team members to join.
                  </p>
                  <Button variant="primary" className="w-full">
                    Create Agency <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Wait for Invite Card */}
            <Card className="relative">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                    <Mail className="w-8 h-8 text-zinc-500" />
                  </div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 mb-2">
                    Join via Invitation
                  </h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                    Waiting for an invite? Check your email for an invitation link.
                  </p>
                  <div className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg text-sm text-zinc-600 dark:text-zinc-400">
                    <span className="font-medium">{user.emailAddresses[0]?.emailAddress}</span>
                    <p className="text-xs mt-1">We'll notify you when you receive an invite</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Create Agency Form */
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                Create Your Agency
              </CardTitle>
              <CardDescription>
                Set up your agency to start managing clients and campaigns.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleCreateAgency}>
              <CardContent className="space-y-4">
                <Input
                  id="agencyName"
                  label="Agency Name"
                  placeholder="e.g., Acme Social Media"
                  value={agencyName}
                  onChange={(e) => setAgencyName(e.target.value)}
                  disabled={createAgency.isPending}
                />
                <Input
                  id="agencySlug"
                  label="Agency Slug"
                  placeholder="e.g., acme-social"
                  value={agencySlug}
                  onChange={(e) => setAgencySlug(e.target.value)}
                  disabled={createAgency.isPending}
                />
                <p className="text-xs text-zinc-500">
                  Your agency URL will be: <span className="font-mono">app.ubiquitous.ai/{agencySlug || "your-slug"}</span>
                </p>
                {formError && (
                  <p className="text-sm text-red-500">{formError}</p>
                )}
              </CardContent>
              <CardFooter className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowCreateForm(false)}
                  disabled={createAgency.isPending}
                >
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="flex-1"
                  isLoading={createAgency.isPending}
                >
                  {createAgency.isPending ? "Creating..." : "Create Agency"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        )}

        {/* Success Message (after agency creation) */}
        {createAgency.isSuccess && (
          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg dark:bg-green-900/20 dark:border-green-800 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600" />
            <p className="text-sm text-green-800 dark:text-green-200">
              Agency created successfully! Redirecting to dashboard...
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
