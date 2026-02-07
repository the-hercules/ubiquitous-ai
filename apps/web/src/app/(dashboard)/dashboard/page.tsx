"use client";

import { useUser, UserButton } from "@clerk/nextjs";
import { useUserStatus } from "@/hooks/use-agency";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { 
  Building2, 
  Users, 
  FolderKanban, 
  Sparkles, 
  Plus, 
  Loader2,
  Settings,
  LogOut,
  ChevronRight,
  UserPlus
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function DashboardPage() {
  const { user, isLoaded: isUserLoaded } = useUser();
  const { data: userStatus, isLoading: isStatusLoading, error: statusError } = useUserStatus();
  const router = useRouter();
  const [showInviteModal, setShowInviteModal] = useState(false);

  // Redirect to onboarding if user doesn't have a tenant
  useEffect(() => {
    if (!isStatusLoading && userStatus && !userStatus.user?.tenant_id) {
      router.push("/onboarding");
    }
  }, [userStatus, isStatusLoading, router]);

  // Loading state
  if (!isUserLoaded || isStatusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <p className="text-zinc-600 dark:text-zinc-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  const userRole = userStatus?.user?.role || "TEAM";
  const isOwnerOrAdmin = userRole === "OWNER" || userRole === "ADMIN";

  // Mock client data (replace with real API call later)
  const mockClients = [
    { id: "1", name: "Acme Restaurant", industry: "Food & Beverage", color: "bg-orange-500" },
    { id: "2", name: "TechStart Inc", industry: "Technology", color: "bg-blue-500" },
    { id: "3", name: "Green Gardens", industry: "Landscaping", color: "bg-green-500" },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center px-4 border-b border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">U</span>
            </div>
            <span className="font-semibold text-zinc-900 dark:text-zinc-100">
              Ubiquitous AI
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          <a href="/dashboard" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg bg-indigo-50 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-400">
            <FolderKanban className="w-5 h-5" />
            Clients
          </a>
          <a href="/dashboard/campaigns" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
            <Sparkles className="w-5 h-5" />
            Campaigns
          </a>
          {isOwnerOrAdmin && (
            <a href="/dashboard/team" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
              <Users className="w-5 h-5" />
              Team
            </a>
          )}
          <a href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg text-zinc-600 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:bg-zinc-800">
            <Settings className="w-5 h-5" />
            Settings
          </a>
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <UserButton afterSignOutUrl="/" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                {user?.firstName || user?.emailAddresses[0]?.emailAddress}
              </p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {userRole}
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 min-h-screen">
        {/* Header */}
        <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-6">
          <div>
            <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-100">
              Clients
            </h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Manage your agency's clients and their brands
            </p>
          </div>
          <div className="flex items-center gap-3">
            {isOwnerOrAdmin && (
              <Button variant="outline" size="sm" onClick={() => setShowInviteModal(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Invite Member
              </Button>
            )}
            <Button variant="primary" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Client
            </Button>
          </div>
        </header>

        {/* Content */}
        <div className="p-6">
          {/* Error Banner */}
          {statusError && (
            <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-lg dark:bg-amber-900/20 dark:border-amber-800">
              <p className="text-sm text-amber-800 dark:text-amber-200">
                ⚠️ Unable to connect to the backend. Some features may not work correctly.
              </p>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Total Clients</p>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{mockClients.length}</p>
                  </div>
                  <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg flex items-center justify-center">
                    <Building2 className="w-6 h-6 text-indigo-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Active Campaigns</p>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">5</p>
                  </div>
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center">
                    <FolderKanban className="w-6 h-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Ideas Generated</p>
                    <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">127</p>
                  </div>
                  <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-6 h-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Client Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {mockClients.map((client) => (
              <Card key={client.id} className="group cursor-pointer hover:shadow-md hover:border-indigo-200 dark:hover:border-indigo-800 transition-all">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${client.color} rounded-lg flex items-center justify-center text-white font-bold text-lg`}>
                      {client.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-zinc-900 dark:text-zinc-100 group-hover:text-indigo-600 transition-colors">
                        {client.name}
                      </h3>
                      <p className="text-sm text-zinc-500 dark:text-zinc-400">
                        {client.industry}
                      </p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-zinc-400 group-hover:text-indigo-600 transition-colors" />
                  </div>
                  <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800 flex justify-between text-sm">
                    <span className="text-zinc-500 dark:text-zinc-400">2 active campaigns</span>
                    <span className="text-indigo-600 font-medium">View →</span>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Add New Client Card */}
            <Card className="border-dashed border-2 cursor-pointer hover:border-indigo-300 dark:hover:border-indigo-700 transition-colors">
              <CardContent className="pt-6 flex flex-col items-center justify-center text-center h-full min-h-[160px]">
                <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-lg flex items-center justify-center mb-3">
                  <Plus className="w-6 h-6 text-zinc-400" />
                </div>
                <p className="font-medium text-zinc-600 dark:text-zinc-400">Add New Client</p>
                <p className="text-sm text-zinc-400 dark:text-zinc-500">Create a new brand profile</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* Invite Modal (Simple overlay) */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowInviteModal(false)}>
          <Card className="w-full max-w-md mx-4" onClick={(e) => e.stopPropagation()}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                Invite Team Member
              </CardTitle>
              <CardDescription>
                Send an invitation to add someone to your agency.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="colleague@example.com"
                  className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 placeholder:text-zinc-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Role
                </label>
                <select className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-2 text-zinc-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
                  <option value="TEAM">Team Member</option>
                  {userRole === "OWNER" && <option value="ADMIN">Admin</option>}
                </select>
              </div>
              <p className="text-xs text-zinc-500">
                They'll receive an email with a link to join your agency.
              </p>
            </CardContent>
            <div className="px-6 pb-6 flex gap-2">
              <Button variant="outline" className="flex-1" onClick={() => setShowInviteModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" className="flex-1">
                Send Invite
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
