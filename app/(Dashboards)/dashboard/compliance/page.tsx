"use client";
import React, { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  File,
  Image as ImageIcon,
} from "lucide-react";
import { useNotification } from "@/contexts/NotificationContext";
import axios from "axios";

interface ComplianceRecord {
  id: number;
  title: string;
  description: string;
  category: string;
  documentPath: string | null;
  timestamp: string;
  status: "pending" | "approved" | "rejected";
  reviewedBy: string | null;
  reviewedAt: string | null;
}

const Compliance: React.FC = () => {
  const [records, setRecords] = useState<ComplianceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "vaccination",
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { addNotification } = useNotification();

  const categories = [
    { value: "vaccination", label: "Vaccination Records" },
    { value: "feeding", label: "Feeding Documentation" },
    { value: "health", label: "Health Certificates" },
    { value: "breeding", label: "Breeding Records" },
    { value: "treatment", label: "Treatment Records" },
    { value: "inspection", label: "Inspection Reports" },
    { value: "other", label: "Other Documents" },
  ];

  useEffect(() => {
    loadCompliance();
  }, []);

  const loadCompliance = async () => {
    try {
      const response = await axios.get("http://localhost:4000/api/compliance");
      setRecords(response.data);
    } catch (error) {
      console.error("Failed to load compliance records:", error);
      addNotification({
        type: "error",
        title: "Load failed",
        message: "Could not load compliance records",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      addNotification({
        type: "warning",
        title: "Validation error",
        message: "Please provide a title for the document",
      });
      return;
    }

    setIsUploading(true);
    try {
      const submitData = new FormData();
      submitData.append("title", formData.title);
      submitData.append("description", formData.description);
      submitData.append("category", formData.category);
      if (selectedFile) submitData.append("document", selectedFile);

      await axios.post("http://localhost:4000/api/compliance", submitData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      addNotification({
        type: "success",
        title: "Upload successful",
        message: "Compliance document uploaded successfully",
      });

      setFormData({ title: "", description: "", category: "vaccination" });
      setSelectedFile(null);
      setShowForm(false);
      loadCompliance();
    } catch (error: unknown) {
      let errorMessage = "Failed to upload document";
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      addNotification({
        type: "error",
        title: "Upload failed",
        message: errorMessage,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "rejected":
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-500/10 text-green-400 border border-green-500/20";
      case "rejected":
        return "bg-red-500/10 text-red-400 border border-red-500/20";
      default:
        return "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20";
    }
  };

  const getCategoryLabel = (category: string) => {
    return categories.find((cat) => cat.value === category)?.label || category;
  };

  const getFileIcon = (path: string | null) => {
    if (!path) return <FileText className="w-5 h-5 text-gray-400" />;
    const ext = path.split(".").pop()?.toLowerCase();
    if (["jpg", "jpeg", "png", "gif"].includes(ext || "")) {
      return <ImageIcon className="w-5 h-5 text-blue-400" />;
    }
    return <File className="w-5 h-5 text-gray-400" />;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-slate-900 rounded-xl p-6 animate-pulse">
              <div className="h-6 w-3/4 bg-slate-800 rounded mb-2"></div>
              <div className="h-4 w-1/2 bg-slate-800 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 p-6 pt-25">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-800 rounded-2xl mb-4">
            <FileText className="w-8 h-8 text-blue-400" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Compliance Tracker
          </h1>
          <p className="text-gray-400">
            Manage your farm documentation and compliance records
          </p>
        </div>

        {/* Upload Button */}
        <div className="mb-8 flex justify-center">
          <button
            onClick={() => setShowForm(!showForm)}
            className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-500 transition-colors"
          >
            <Upload className="w-5 h-5 inline mr-2" />
            Upload New Document
          </button>
        </div>

        {/* Upload Form */}
        {showForm && (
          <div className="bg-slate-900 rounded-xl p-6 mb-8 border border-slate-800">
            <h3 className="text-xl font-semibold text-white mb-4">
              Upload Compliance Document
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Document Title *
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) =>
                      setFormData({ ...formData, title: e.target.value })
                    }
                    placeholder="e.g., Vaccination Record - Cow #123"
                    required
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  placeholder="Additional details about the document"
                  rows={3}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Document File
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                  onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  className="w-full px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none focus:border-blue-500 file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-white file:bg-blue-600 hover:file:bg-blue-500 file:cursor-pointer"
                />
                {selectedFile && (
                  <p className="text-sm text-gray-400 mt-1">
                    Selected: {selectedFile.name}
                  </p>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isUploading}
                  className="flex-1 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-500 transition-colors disabled:opacity-50"
                >
                  {isUploading ? "Uploading..." : "Upload Document"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-2 bg-slate-800 text-gray-300 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Records List */}
        <div className="space-y-4">
          {records.length > 0 ? (
            records.map((record) => (
              <div
                key={record.id}
                className="bg-slate-900 rounded-xl p-6 border border-slate-800 hover:bg-slate-800 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getFileIcon(record.documentPath)}
                      <h3 className="text-lg font-semibold text-white">
                        {record.title}
                      </h3>
                    </div>
                    <p className="text-gray-400 text-sm mb-2">
                      {record.description}
                    </p>
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <span className="flex items-center">
                        <Calendar className="w-3 h-3 mr-1" />
                        {new Date(record.timestamp).toLocaleDateString()}
                      </span>
                      <span className="px-2 py-1 bg-slate-800 text-gray-300 rounded">
                        {getCategoryLabel(record.category)}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col items-end space-y-2">
                    <div
                      className={`flex items-center space-x-2 px-3 py-1 rounded-full text-sm ${getStatusColor(
                        record.status
                      )}`}
                    >
                      {getStatusIcon(record.status)}
                      <span className="capitalize">{record.status}</span>
                    </div>

                    {record.reviewedAt && (
                      <p className="text-xs text-gray-500">
                        Reviewed{" "}
                        {new Date(record.reviewedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>

                {record.documentPath && (
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <button className="text-blue-500 hover:text-blue-400 text-sm transition-colors">
                      View Document →
                    </button>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-slate-600 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No compliance records
              </h3>
              <p className="text-gray-400 mb-6">
                Upload your first compliance document to get started
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow hover:bg-blue-500 transition-colors"
              >
                <Upload className="w-5 h-5 inline mr-2" />
                Upload Document
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Compliance;
