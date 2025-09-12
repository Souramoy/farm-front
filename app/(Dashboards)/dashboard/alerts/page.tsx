"use client";
import React, { useState, useEffect } from "react";
import {
  Bell,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  Filter,
  MoreVertical,
  Clock,
} from "lucide-react";
import { useNotification } from "@/contexts/NotificationContext";
import axios from "axios";

interface Alert {
  id: number;
  type: "health_alert" | "compliance" | "system" | "reminder";
  title: string;
  message: string;
  priority: "low" | "medium" | "high";
  timestamp: string;
  read: boolean;
}

const Alerts: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "unread" | "high">("all");
  const { addNotification } = useNotification();

  useEffect(() => {
    loadAlerts();
  }, []);

  const loadAlerts = async () => {
    try {
  const response = await axios.get("https://farm-back-production.up.railway.app/api/alerts");
      setAlerts(response.data);
    } catch (error) {
      console.error("Failed to load alerts:", error);
      addNotification({
        type: "error",
        title: "Load failed",
        message: "Could not load alerts",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const markAsRead = async (alertId: number) => {
    try {
  await axios.patch(`https://farm-back-production.up.railway.app/api/alerts/${alertId}/read`);
      setAlerts(
        alerts.map((alert) =>
          alert.id === alertId ? { ...alert, read: true } : alert
        )
      );

      addNotification({
        type: "success",
        title: "Alert marked as read",
        message: "Alert has been marked as read",
      });
    } catch (error) {
      console.error("Failed to mark alert as read:", error);
      addNotification({
        type: "error",
        title: "Update failed",
        message: "Could not update alert status",
      });
    }
  };

  const getAlertIcon = (type: string, priority: string) => {
    const iconClass = priority === "high" ? "w-5 h-5" : "w-4 h-4";

    switch (type) {
      case "health_alert":
        return priority === "high" ? (
          <AlertTriangle className={`${iconClass} text-red-400`} />
        ) : (
          <AlertTriangle className={`${iconClass} text-yellow-400`} />
        );
      case "compliance":
        return <CheckCircle className={`${iconClass} text-blue-400`} />;
      case "system":
        return <Info className={`${iconClass} text-purple-400`} />;
      case "reminder":
        return <Clock className={`${iconClass} text-green-400`} />;
      default:
        return <Bell className={`${iconClass} text-gray-400`} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "border-red-400/50 bg-red-500/10";
      case "medium":
        return "border-yellow-400/50 bg-yellow-500/10";
      case "low":
        return "border-blue-400/50 bg-blue-500/10";
      default:
        return "border-gray-400/50 bg-gray-500/10";
    }
  };

  const getFilteredAlerts = () => {
    switch (filter) {
      case "unread":
        return alerts.filter((alert) => !alert.read);
      case "high":
        return alerts.filter((alert) => alert.priority === "high");
      default:
        return alerts;
    }
  };

  const filteredAlerts = getFilteredAlerts();
  const unreadCount = alerts.filter((alert) => !alert.read).length;
  const highPriorityCount = alerts.filter(
    (alert) => alert.priority === "high"
  ).length;

  if (isLoading) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass rounded-xl p-6">
                <div className="flex items-start space-x-4">
                  <div className="loading-shimmer w-10 h-10 rounded-full"></div>
                  <div className="flex-1">
                    <div className="loading-shimmer h-6 w-3/4 rounded mb-2"></div>
                    <div className="loading-shimmer h-4 w-1/2 rounded"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 pt-25 bg-slate-950 pb-20">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-red-400 to-orange-500 rounded-2xl mb-4">
            <Bell className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Alert <span className="gradient-text">Center</span>
          </h1>
          <p className="text-gray-300">
            Stay informed about important farm events and notifications
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <div className="glass-strong rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-white">{alerts.length}</p>
            <p className="text-sm text-gray-300">Total Alerts</p>
          </div>
          <div className="glass-strong rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-yellow-400">{unreadCount}</p>
            <p className="text-sm text-gray-300">Unread</p>
          </div>
          <div className="glass-strong rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-400">
              {highPriorityCount}
            </p>
            <p className="text-sm text-gray-300">High Priority</p>
          </div>
        </div>

        {/* Filters */}
        <div className="glass-strong rounded-xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Filter className="w-5 h-5 text-gray-400" />
              <span className="text-white font-medium">Filter:</span>
            </div>
            <div className="flex space-x-2">
              {[
                { key: "all", label: "All", count: alerts.length },
                { key: "unread", label: "Unread", count: unreadCount },
                {
                  key: "high",
                  label: "High Priority",
                  count: highPriorityCount,
                },
              ].map((filterOption) => (
                <button
                  key={filterOption.key}
                  onClick={() =>
                    setFilter(filterOption.key as "all" | "unread" | "high")
                  }
                  className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                    filter === filterOption.key
                      ? "bg-blue-500/20 text-blue-300 border border-blue-400/50"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {filterOption.label} ({filterOption.count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Alerts List */}
        <div className="space-y-4">
          {filteredAlerts.length > 0 ? (
            filteredAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`glass-strong rounded-xl p-6 border transition-all hover:bg-white/5 ${
                  alert.read ? "opacity-70" : ""
                } ${getPriorityColor(alert.priority)}`}
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0 mt-1">
                    {getAlertIcon(alert.type, alert.priority)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <h3
                        className={`font-semibold ${
                          alert.read ? "text-gray-300" : "text-white"
                        }`}
                      >
                        {alert.title}
                      </h3>
                      <div className="flex items-center space-x-2">
                        {alert.priority === "high" && (
                          <span className="px-2 py-1 bg-red-500/20 text-red-300 border border-red-400/50 rounded text-xs">
                            HIGH
                          </span>
                        )}
                        <button className="text-gray-400 hover:text-white transition-colors">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    <p
                      className={`text-sm mb-3 ${
                        alert.read ? "text-gray-400" : "text-gray-300"
                      }`}
                    >
                      {alert.message}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-xs text-gray-400">
                        <span className="capitalize">
                          {alert.type.replace("_", " ")}
                        </span>
                        <span>•</span>
                        <span>
                          {new Date(alert.timestamp).toLocaleString()}
                        </span>
                      </div>

                      {!alert.read && (
                        <button
                          onClick={() => markAsRead(alert.id)}
                          className="text-blue-400 hover:text-blue-300 text-sm transition-colors"
                        >
                          Mark as read
                        </button>
                      )}
                    </div>
                  </div>

                  {!alert.read && (
                    <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <Bell className="w-16 h-16 text-gray-500 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                {filter === "unread"
                  ? "No unread alerts"
                  : filter === "high"
                  ? "No high priority alerts"
                  : "No alerts"}
              </h3>
              <p className="text-gray-400">
                {filter === "all"
                  ? "You're all caught up! New alerts will appear here."
                  : "Try changing the filter to see other alerts."}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Alerts;
