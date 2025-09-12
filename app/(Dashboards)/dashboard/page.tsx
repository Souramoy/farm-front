"use client";
import React, { useState, useEffect } from "react";
import {
  Activity,
  Scan,
  FileText,
  AlertTriangle,
  TrendingUp,
  Calendar,
  Users,
  Zap,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useNotification } from "@/contexts/NotificationContext";
import axios from "axios";
import Navbar from "@/app/_components/Navbar";
import { useRouter } from "next/navigation";

interface DashboardStats {
  totalScans: number;
  healthyScans: number;
  alertsCount: number;
  pendingCompliance: number;
  recentScans: Array<{
    id?: string | number;
    result: "healthy" | "treatable" | "critical" | string;
    timestamp: string | number | Date;
    confidence?: number;
  }>;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotification();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    if (user?.role === "admin") {
      router.push("/adminDashboard");
    }
  }, [user, router]);
  useEffect(() => {
    loadDashboardStats();
  }, []);

  const loadDashboardStats = async () => {
    try {
      const response = await axios.get(
        "https://farm-back-production.up.railway.app/api/dashboard/stats"
      );
      setStats(response.data);
    } catch (error) {
      console.error("Failed to load dashboard stats:", error);
      addNotification({
        type: "warning",
        title: "Stats unavailable",
        message: "Using cached data",
      });
      // Use fallback data
      setStats({
        totalScans: 0,
        healthyScans: 0,
        alertsCount: 0,
        pendingCompliance: 0,
        recentScans: [],
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4 bg-slate-950 pt-20">
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

  const healthPercentage =
    stats && stats.totalScans > 0
      ? Math.round((stats.healthyScans / stats.totalScans) * 100)
      : 0;

  return (
    <>
      <div className="min-h-screen p-4 pb-20 bg-slate-950 pt-20">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">
                  Welcome back, {user?.username}!
                </h1>
                <p className="text-gray-300">
                  {user?.farmName || "Farm"} • {new Date().toLocaleDateString()}
                </p>
              </div>
              <div className="glass-strong rounded-xl p-3">
                <Activity className="w-6 h-6 text-green-400" />
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="glass-strong border border-gray-500 rounded-xl p-6 hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Scan className="w-6 h-6 text-blue-400" />
                </div>
                <TrendingUp className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {stats?.totalScans || 0}
                </p>
                <p className="text-sm text-gray-300">Total Scans</p>
              </div>
            </div>

            <div className="glass-strong border border-gray-500 rounded-xl p-6 hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Activity className="w-6 h-6 text-green-400" />
                </div>
                <span className="text-xs text-green-400">
                  {healthPercentage}%
                </span>
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {stats?.healthyScans || 0}
                </p>
                <p className="text-sm text-gray-300">Healthy Animals</p>
              </div>
            </div>

            <div className="glass-strong border border-gray-500 rounded-xl p-6 hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-red-500/20 rounded-lg">
                  <AlertTriangle className="w-6 h-6 text-red-400" />
                </div>
                {(stats?.alertsCount || 0) > 0 && (
                  <Zap className="w-4 h-4 text-red-400" />
                )}
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {stats?.alertsCount || 0}
                </p>
                <p className="text-sm text-gray-300">Active Alerts</p>
              </div>
            </div>

            <div className="glass-strong border border-gray-500 rounded-xl p-6 hover:scale-105 transition-transform">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-yellow-500/20 rounded-lg">
                  <FileText className="w-6 h-6 text-yellow-400" />
                </div>
                <Calendar className="w-4 h-4 text-yellow-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-white">
                  {stats?.pendingCompliance || 0}
                </p>
                <p className="text-sm text-gray-300">Pending Compliance</p>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Scans */}
            <div className="glass-strong rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Recent Scans
                </h3>
                <Scan className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                {stats && stats.recentScans && stats.recentScans.length > 0 ? (
                  stats.recentScans.map((scan, index) => (
                    <div
                      key={scan.id || index}
                      className="flex items-center justify-between p-3 glass rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            scan.result === "healthy"
                              ? "bg-green-400"
                              : scan.result === "treatable"
                              ? "bg-yellow-400"
                              : "bg-red-400"
                          }`}
                        ></div>
                        <div>
                          <p className="text-sm text-white capitalize">
                            {scan.result}
                          </p>
                          <p className="text-xs text-gray-400">
                            {new Date(scan.timestamp).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-400">
                          {scan.confidence
                            ? `${Math.round(scan.confidence * 100)}%`
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Scan className="w-12 h-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">No scans yet</p>
                    <p className="text-sm text-gray-500">
                      Start by scanning your first animal
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="glass-strong rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white">
                  Quick Actions
                </h3>
                <Zap className="w-5 h-5 text-gray-400" />
              </div>
              <div className="space-y-3">
                <button className="w-full p-4 glass rounded-lg hover:bg-white/10 transition-colors text-left">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Scan className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">New Scan</p>
                      <p className="text-sm text-gray-400">
                        Analyze animal health
                      </p>
                    </div>
                  </div>
                </button>

                <button className="w-full p-4 glass rounded-lg hover:bg-white/10 transition-colors text-left">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-500/20 rounded-lg">
                      <FileText className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Upload Document</p>
                      <p className="text-sm text-gray-400">
                        Add compliance records
                      </p>
                    </div>
                  </div>
                </button>

                <button className="w-full p-4 glass rounded-lg hover:bg-white/10 transition-colors text-left">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-purple-500/20 rounded-lg">
                      <Users className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                      <p className="text-white font-medium">Training Hub</p>
                      <p className="text-sm text-gray-400">
                        Learn best practices
                      </p>
                    </div>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Health Overview Chart Placeholder */}
          <div className="mt-8 glass-strong rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Health Overview
            </h3>
            <div className="h-32 flex items-end justify-center space-x-2">
              {[65, 45, 80, 35, 90, 55, 75].map((height, index) => (
                <div
                  key={index}
                  className="bg-gradient-to-t from-green-500/30 to-green-400/60 rounded-t"
                  style={{ width: "40px", height: `${height}%` }}
                ></div>
              ))}
            </div>
            <div className="flex justify-center space-x-4 mt-4 text-xs text-gray-400">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
              <span>Sun</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Dashboard;
