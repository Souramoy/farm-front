"use client";
import React, { useState, useEffect } from "react";
import {
  Users,
  Activity,
  FileText,
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  BarChart3,
} from "lucide-react";

import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

interface AdminStats {
  totalUsers: number;
  totalScans: number;
  pendingCompliance: number;
  systemHealth: "good" | "warning" | "error";
}

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "overview" | "users" | "scans" | "compliance"
  >("overview");

  useEffect(() => {
    if (user?.role !== "admin") {
      return;
    }
    loadAdminStats();
  }, [user]);

  const loadAdminStats = async () => {
    try {
      // In a real app, we'd have admin-specific endpoints
      const [scansRes, complianceRes] = await Promise.all([
        axios.get("http://localhost:4000/api/scans"),
        axios.get("http://localhost:4000/api/compliance"),
      ]);

      setStats({
        totalUsers: 5, // Mock data
        totalScans: scansRes.data.length,
        pendingCompliance: complianceRes.data.filter(
          (item: { status: string }) => item.status === "pending"
        ).length,
        systemHealth: "good",
      });
    } catch (error) {
      console.error("Failed to load admin stats:", error);
      setStats({
        totalUsers: 0,
        totalScans: 0,
        pendingCompliance: 0,
        systemHealth: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (user?.role !== "admin") {
    return (
      <div className="min-h-screen p-4 flex items-center justify-center">
        <div className="glass-strong rounded-2xl p-8 text-center">
          <AlertTriangle className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-gray-300">
            You need administrator privileges to access this page.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass rounded-xl p-6">
                <div className="loading-shimmer h-8 w-3/4 rounded mb-2"></div>
                <div className="loading-shimmer h-12 w-1/2 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const getSystemHealthIcon = (health: string) => {
    switch (health) {
      case "good":
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-400" />;
      case "error":
        return <AlertTriangle className="w-5 h-5 text-red-400" />;
      default:
        return <Activity className="w-5 h-5 text-gray-400" />;
    }
  };

  const tabs = [
    { key: "overview", label: "Overview", icon: BarChart3 },
    { key: "users", label: "Users", icon: Users },
    { key: "scans", label: "Scans", icon: Activity },
    { key: "compliance", label: "Compliance", icon: FileText },
  ];

  return (
    <div className="min-h-screen p-4 pb-20 bg-slate-950">
      <div className="max-w-6xl mx-auto mt-20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-indigo-400 to-purple-500 rounded-2xl mb-4">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Admin <span className="gradient-text">Panel</span>
          </h1>
          <p className="text-gray-300">
            System administration and management dashboard
          </p>
        </div>

        {/* Tabs */}
        <div className="glass-strong rounded-xl p-2 mb-8">
          <div className="flex space-x-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as typeof activeTab)}
                className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-lg transition-all ${
                  activeTab === tab.key
                    ? "bg-indigo-500/20 text-indigo-300 border border-indigo-400/50"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                <span className="hidden md:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === "overview" && (
          <>
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <div className="glass-strong rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Users className="w-6 h-6 text-blue-400" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {stats?.totalUsers || 0}
                </p>
                <p className="text-sm text-gray-300">Total Users</p>
              </div>

              <div className="glass-strong rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Activity className="w-6 h-6 text-green-400" />
                  </div>
                  <TrendingUp className="w-4 h-4 text-green-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {stats?.totalScans || 0}
                </p>
                <p className="text-sm text-gray-300">Total Scans</p>
              </div>

              <div className="glass-strong rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-yellow-500/20 rounded-lg">
                    <FileText className="w-6 h-6 text-yellow-400" />
                  </div>
                  <AlertTriangle className="w-4 h-4 text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-white">
                  {stats?.pendingCompliance || 0}
                </p>
                <p className="text-sm text-gray-300">Pending Reviews</p>
              </div>

              <div className="glass-strong rounded-xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Settings className="w-6 h-6 text-purple-400" />
                  </div>
                  {getSystemHealthIcon(stats?.systemHealth || "good")}
                </div>
                <p className="text-2xl font-bold text-white capitalize">
                  {stats?.systemHealth || "Unknown"}
                </p>
                <p className="text-sm text-gray-300">System Health</p>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="glass-strong rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-4">
                System Activity
              </h3>
              <div className="space-y-4">
                {[
                  {
                    type: "scan",
                    message: "New health scan completed by farmer_01",
                    time: "2 minutes ago",
                  },
                  {
                    type: "user",
                    message: "New user registered: john_doe",
                    time: "15 minutes ago",
                  },
                  {
                    type: "compliance",
                    message: "Compliance document approved",
                    time: "1 hour ago",
                  },
                  {
                    type: "system",
                    message: "AI model updated successfully",
                    time: "2 hours ago",
                  },
                ].map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-center space-x-3 p-3 glass rounded-lg"
                  >
                    <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-white text-sm">{activity.message}</p>
                      <p className="text-gray-400 text-xs">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* Other tabs would be implemented here */}
        {activeTab !== "overview" && (
          <div className="glass-strong rounded-xl p-12 text-center">
            <div className="p-4 bg-blue-500/20 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              {tabs.find((t) => t.key === activeTab)?.icon && (
                <>
                  {React.createElement(
                    tabs.find((t) => t.key === activeTab)!.icon,
                    { className: "w-8 h-8 text-blue-400" }
                  )}
                </>
              )}
            </div>
            <h3 className="text-xl font-semibold text-white mb-2 capitalize">
              {activeTab} Management
            </h3>
            <p className="text-gray-300">This section is under development.</p>
            <p className="text-sm text-gray-400 mt-2">
              Check back soon for {activeTab} management features.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
