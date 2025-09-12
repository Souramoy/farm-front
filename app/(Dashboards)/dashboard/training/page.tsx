"use client";
import React, { useState, useEffect } from "react";
import {
  GraduationCap,
  Play,
  FileText,
  Clock,
  BookOpen,
  ExternalLink,
  CheckCircle,
} from "lucide-react";
import { useNotification } from "@/contexts/NotificationContext";
import axios from "axios";

interface TrainingContent {
  id: number;
  title: string;
  type: "video" | "article" | "guide";
  description: string;
  content: string;
  thumbnail: string;
  duration?: string;
  completed?: boolean;
}

const Training: React.FC = () => {
  const [content, setContent] = useState<TrainingContent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedContent, setSelectedContent] =
    useState<TrainingContent | null>(null);
  const [completedItems, setCompletedItems] = useState<Set<number>>(new Set());
  const { addNotification } = useNotification();

  useEffect(() => {
    loadTrainingContent();
    loadCompletedItems();
  }, []);

  const loadTrainingContent = async () => {
    try {
  const response = await axios.get("https://farm-back-production.up.railway.app/api/training");
      setContent(response.data);
    } catch (error) {
      console.error("Failed to load training content:", error);
      // Use fallback content
      setContent([
        {
          id: 1,
          title: "Animal Health Monitoring Basics",
          type: "video",
          description:
            "Learn the fundamentals of monitoring animal health and identifying early warning signs",
          content:
            "This comprehensive guide covers the essential aspects of animal health monitoring, including visual inspections, behavioral assessments, and key indicators to watch for in livestock.",
          thumbnail:
            "https://images.pexels.com/photos/422218/pexels-photo-422218.jpeg",
          duration: "15 min",
        },
        {
          id: 2,
          title: "Disease Prevention Best Practices",
          type: "article",
          description:
            "Essential preventive care practices to maintain healthy livestock",
          content:
            "Discover proven strategies for preventing disease outbreaks in your farm, including vaccination schedules, biosecurity measures, and environmental management.",
          thumbnail:
            "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg",
          duration: "10 min",
        },
        {
          id: 3,
          title: "Emergency Response Guide",
          type: "guide",
          description:
            "Step-by-step procedures for handling animal health emergencies",
          content:
            "A detailed emergency response protocol covering immediate actions, veterinary contact procedures, and documentation requirements for various health emergencies.",
          thumbnail:
            "https://images.pexels.com/photos/1108099/pexels-photo-1108099.jpeg",
          duration: "20 min",
        },
        {
          id: 4,
          title: "Using AI Health Scanning Technology",
          type: "video",
          description:
            "Maximize the effectiveness of AI-powered health scanning tools",
          content:
            "Learn how to properly use AI scanning technology, interpret results, and integrate AI insights into your farm management practices.",
          thumbnail:
            "https://images.pexels.com/photos/5212361/pexels-photo-5212361.jpeg",
          duration: "12 min",
        },
        {
          id: 5,
          title: "Compliance Documentation Standards",
          type: "article",
          description:
            "Understanding regulatory requirements and documentation best practices",
          content:
            "Comprehensive overview of compliance requirements, proper documentation methods, and maintaining accurate records for regulatory inspections.",
          thumbnail:
            "https://images.pexels.com/photos/4386339/pexels-photo-4386339.jpeg",
          duration: "8 min",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const loadCompletedItems = () => {
    const completed = localStorage.getItem("trainingCompleted");
    if (completed) {
      setCompletedItems(new Set(JSON.parse(completed)));
    }
  };

  const markAsCompleted = (contentId: number) => {
    const newCompleted = new Set([...completedItems, contentId]);
    setCompletedItems(newCompleted);
    localStorage.setItem(
      "trainingCompleted",
      JSON.stringify([...newCompleted])
    );

    addNotification({
      type: "success",
      title: "Training completed!",
      message: "Great job on completing the training module",
    });
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "video":
        return <Play className="w-5 h-5 text-red-400" />;
      case "article":
        return <FileText className="w-5 h-5 text-blue-400" />;
      case "guide":
        return <BookOpen className="w-5 h-5 text-purple-400" />;
      default:
        return <FileText className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "video":
        return "bg-red-500/20 text-red-300 border-red-400/50";
      case "article":
        return "bg-blue-500/20 text-blue-300 border-blue-400/50";
      case "guide":
        return "bg-purple-500/20 text-purple-300 border-purple-400/50";
      default:
        return "bg-gray-500/20 text-gray-300 border-gray-400/50";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen p-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="glass rounded-xl p-6">
                <div className="loading-shimmer h-32 w-full rounded mb-4"></div>
                <div className="loading-shimmer h-6 w-3/4 rounded mb-2"></div>
                <div className="loading-shimmer h-4 w-full rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (selectedContent) {
    return (
      <div className="min-h-screen p-4 pb-20">
        <div className="max-w-4xl mx-auto">
          <div className="glass-strong rounded-2xl p-6 mb-6">
            <button
              onClick={() => setSelectedContent(null)}
              className="text-blue-400 hover:text-blue-300 mb-4 transition-colors"
            >
              ← Back to Training Hub
            </button>

            <div className="mb-6">
              <div className="flex items-center space-x-2 mb-2">
                {getTypeIcon(selectedContent.type)}
                <span
                  className={`px-2 py-1 rounded border text-xs ${getTypeColor(
                    selectedContent.type
                  )}`}
                >
                  {selectedContent.type.toUpperCase()}
                </span>
                {selectedContent.duration && (
                  <span className="flex items-center text-gray-400 text-sm">
                    <Clock className="w-4 h-4 mr-1" />
                    {selectedContent.duration}
                  </span>
                )}
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                {selectedContent.title}
              </h1>
              <p className="text-gray-300">{selectedContent.description}</p>
            </div>

            {/* Content Area */}
            <div className="mb-6">
              {selectedContent.type === "video" ? (
                <div className="relative">
                  <img
                    src={selectedContent.thumbnail}
                    alt={selectedContent.title}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-lg">
                    <button className="w-16 h-16 bg-red-500/80 rounded-full flex items-center justify-center hover:bg-red-500 transition-colors">
                      <Play className="w-8 h-8 text-white ml-1" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="glass rounded-lg p-6 mb-4">
                  <img
                    src={selectedContent.thumbnail}
                    alt={selectedContent.title}
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                </div>
              )}

              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 leading-relaxed">
                  {selectedContent.content}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between pt-6 border-t border-white/10">
              <div className="flex items-center space-x-4">
                {completedItems.has(selectedContent.id) ? (
                  <div className="flex items-center text-green-400">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span>Completed</span>
                  </div>
                ) : (
                  <button
                    onClick={() => markAsCompleted(selectedContent.id)}
                    className="px-4 py-2 bg-green-500/20 text-green-300 border border-green-400/50 rounded-lg hover:bg-green-500/30 transition-colors"
                  >
                    Mark as Completed
                  </button>
                )}
              </div>

              <button className="flex items-center text-blue-400 hover:text-blue-300 transition-colors">
                <ExternalLink className="w-4 h-4 mr-1" />
                Share
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const completedCount = content.filter((item) =>
    completedItems.has(item.id)
  ).length;
  const progressPercentage =
    content.length > 0
      ? Math.round((completedCount / content.length) * 100)
      : 0;

  return (
    <div className="min-h-screen p-4 pb-20 bg-slate-950 pt-28">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-2xl mb-4">
            <GraduationCap className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Training <span className="gradient-text">Hub</span>
          </h1>
          <p className="text-gray-300">
            Enhance your farm management skills with expert guidance
          </p>
        </div>

        {/* Progress Overview */}
        <div className="glass-strong rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Your Progress</h3>
            <span className="text-sm text-gray-400">
              {completedCount}/{content.length} completed
            </span>
          </div>

          <div className="w-full bg-white/10 rounded-full h-3 mb-2">
            <div
              className="bg-gradient-to-r from-slate-400 to-slate-800 h-3 rounded-full transition-all duration-500"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>

          <p className="text-sm text-gray-400">
            {progressPercentage}% complete
          </p>
        </div>

        {/* Training Content Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {content.map((item) => {
            const isCompleted = completedItems.has(item.id);

            return (
              <div
                key={item.id}
                className="glass-strong rounded-xl overflow-hidden hover:scale-105 transition-transform cursor-pointer"
                onClick={() => setSelectedContent(item)}
              >
                <div className="relative">
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-48 object-cover"
                  />
                  <div className="absolute top-3 left-3">
                    <span
                      className={`px-2 py-1 rounded border text-xs ${getTypeColor(
                        item.type
                      )}`}
                    >
                      {item.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="absolute top-3 right-3">
                    {isCompleted ? (
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    ) : (
                      getTypeIcon(item.type)
                    )}
                  </div>
                  {item.duration && (
                    <div className="absolute bottom-3 right-3 flex items-center bg-black/50 rounded px-2 py-1">
                      <Clock className="w-3 h-3 text-white mr-1" />
                      <span className="text-xs text-white">
                        {item.duration}
                      </span>
                    </div>
                  )}
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-semibold text-white mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-gray-300 text-sm line-clamp-3 mb-4">
                    {item.description}
                  </p>

                  <div className="flex items-center justify-between">
                    <button className="text-green-400 hover:text-green-300 text-sm font-medium transition-colors">
                      Start Learning →
                    </button>
                    {isCompleted && (
                      <span className="text-green-400 text-xs">Completed</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {content.length === 0 && (
          <div className="text-center py-12">
            <GraduationCap className="w-16 h-16 text-gray-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">
              No training content available
            </h3>
            <p className="text-gray-400">
              Check back later for new training materials
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Training;
