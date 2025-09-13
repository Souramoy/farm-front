"use client";
import React, { useState, useRef } from "react";
import {
  Camera,
  Upload,
  Zap,
  CheckCircle,
  AlertTriangle,
  XCircle,
  ImageIcon,
  Loader,
} from "lucide-react";
import { useNotification } from "@/contexts/NotificationContext";
import axios from "axios";

interface KeyIssue {
  issue: string;
}

interface HealthAssessment {
  status: string;
  confidence: number;
  observations: string;
  key_issues: string[];
}

interface Recommendation {
  treatable: boolean;
  message?: string;
  monitoring_advice?: string;
  emergency?: boolean;
  immediate_actions?: string[];
  prevention?: string;
  condition?: string;
  medications?: string;
  urgency?: string;
  doctors?: string[];
  home_care?: string;
}

interface ScanResult {
  // Legacy fields
  result: string;
  confidence: number;
  scanId: number;
  message: string;
  
  // Enhanced fields from new AI model
  animal_type?: string;
  classification_confidence?: number;
  health_assessment?: HealthAssessment;
  recommendations?: Recommendation;
}

const Scan: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ScanResult | null>(null);
  const [animalId, setAnimalId] = useState("");
  const [notes, setNotes] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { addNotification } = useNotification();

  const handleFileSelect = (file: File) => {
    if (file) {
      setSelectedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setScanResult(null);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      // Create video element to capture frame
      const video = document.createElement("video");
      video.srcObject = stream;
      video.play();

      video.addEventListener("loadedmetadata", () => {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        ctx?.drawImage(video, 0, 0);

        canvas.toBlob(
          (blob) => {
            if (blob) {
              const file = new File([blob], `capture-${Date.now()}.jpg`, {
                type: "image/jpeg",
              });
              handleFileSelect(file);
            }
          },
          "image/jpeg",
          0.8
        );

        // Stop the camera
        stream.getTracks().forEach((track) => track.stop());
      });
    } catch (error) {
      addNotification({
        type: "error",
        title: "Camera access denied",
        message: "Please allow camera access or use file upload",
      });
    }
  };

  const handleScan = async () => {
    if (!selectedFile) {
      addNotification({
        type: "warning",
        title: "No image selected",
        message: "Please select an image to scan",
      });
      return;
    }

    setIsScanning(true);
    setScanResult(null);

    try {
      const formData = new FormData();
      formData.append("image", selectedFile);
      formData.append("animalId", animalId);
      formData.append("notes", notes);

      const response = await axios.post(
        "https://farm-back-production.up.railway.app/api/scan",
        formData,
          // Let the browser/axios set the correct multipart boundary automatically
          {}
      );

      setScanResult(response.data);

      addNotification({
        type:
          response.data.result === "healthy"
            ? "success"
            : response.data.result === "treatable"
            ? "warning"
            : "error",
        title: "Scan completed",
        message: `Result: ${response.data.result} (${Math.round(
          response.data.confidence * 100
        )}% confidence)`,
      });
    } catch (err: unknown) {
      console.error("Scan failed:", err);
      addNotification({
        type: "error",
        title: "Scan failed",
        message: "Please try again",
      });
    } finally {
      setIsScanning(false);
    }
  };

  const getResultIcon = (result: string) => {
    switch (result) {
      case "healthy":
        return <CheckCircle className="w-8 h-8 text-green-400" />;
      case "treatable":
        return <AlertTriangle className="w-8 h-8 text-yellow-400" />;
      case "untreatable":
        return <XCircle className="w-8 h-8 text-red-400" />;
      default:
        return <ImageIcon className="w-8 h-8 text-gray-400" />;
    }
  };

  const getResultColor = (result: string) => {
    switch (result) {
      case "healthy":
        return "status-healthy";
      case "treatable":
        return "status-treatable";
      case "untreatable":
        return "status-untreatable";
      default:
        return "border-gray-400/30";
    }
  };

  return (
    <div className="min-h-screen p-4 pb-20 bg-slate-950">
      <div className="max-w-2xl mx-auto mt-20">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 boder border-green-500 border-2 rounded-2xl mb-4">
            <Zap className="w-8 h-8 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            AI Health <span className="gradient-text">Scanner</span>
          </h1>
          <p className="text-gray-300">
            Upload or capture an image to analyze animal health
          </p>
        </div>

        {/* Upload Section */}
        <div className="glass-strong rounded-2xl p-6 mb-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Animal ID (Optional)
            </label>
            <input
              type="text"
              value={animalId}
              onChange={(e) => setAnimalId(e.target.value)}
              placeholder="Enter animal identification number"
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400"
            />
          </div>

          {/* Image Upload Area */}
          <div className="mb-4">
            {previewUrl ? (
              <div className="relative">
                <img
                  src={previewUrl}
                  alt="Preview"
                  className="w-full h-64 object-cover rounded-lg"
                />
                <button
                  onClick={() => {
                    setSelectedFile(null);
                    setPreviewUrl("");
                    setScanResult(null);
                  }}
                  className="absolute top-2 right-2 p-2 bg-red-500/80 rounded-full text-white hover:bg-red-600/80 transition-colors"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="border-2 border-dashed border-white/20 rounded-lg p-8">
                <div className="text-center">
                  <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-300 mb-4">
                    Select an image to analyze
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3 justify-center">
                    <button
                      onClick={handleCameraCapture}
                      className="flex items-center justify-center px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                    >
                      <Camera className="w-4 h-4 mr-2" />
                      Camera
                    </button>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center justify-center px-4 py-2 bg-green-500/20 text-green-300 rounded-lg hover:bg-green-500/30 transition-colors"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Upload
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileInputChange}
            className="hidden"
          />

          {/* Notes */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Notes (Optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional observations or context"
              rows={3}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-400 resize-none"
            />
          </div>

          {/* Scan Button */}
          <button
            onClick={handleScan}
            disabled={!selectedFile || isScanning}
            className="w-full py-3 bg-green-500 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isScanning ? (
              <div className="flex items-center justify-center">
                <Loader className="animate-spin w-5 h-5 mr-2" />
                Analyzing...
              </div>
            ) : (
              <div className="flex items-center justify-center">
                <Zap className="w-5 h-5 mr-2" />
                Analyze Health
              </div>
            )}
          </button>
        </div>

        {/* Results Section */}
        {scanResult && (
          <div
            className={`glass-strong rounded-2xl p-6 border ${getResultColor(
              scanResult.result
            )}`}
          >
            <div className="text-center">
              {getResultIcon(scanResult.result)}
              
              {/* Animal Type and Classification */}
              {scanResult.animal_type && (
                <div className="mb-2">
                  <span className="px-3 py-1 text-xs font-medium bg-blue-500/30 text-blue-300 rounded-full">
                    {scanResult.animal_type.charAt(0).toUpperCase() + scanResult.animal_type.slice(1)}
                    {scanResult.classification_confidence && 
                      ` (${Math.round(scanResult.classification_confidence * 100)}%)`}
                  </span>
                </div>
              )}
              
              <h3 className="text-2xl font-bold text-white mt-2 mb-2 capitalize">
                {scanResult.result}
              </h3>
              
              <div className="flex items-center justify-center space-x-2 mb-4">
                <span className="text-sm text-gray-300">Confidence:</span>
                <div className="flex items-center">
                  <div className="w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-400 to-blue-500 transition-all duration-1000"
                      style={{ width: `${scanResult.confidence * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-white ml-2">
                    {Math.round(scanResult.confidence * 100)}%
                  </span>
                </div>
              </div>

              {/* Observations */}
              <div className="mb-4">
                <h4 className="font-semibold text-white mb-2">Observations:</h4>
                <p className="text-gray-300">
                  {scanResult.health_assessment?.observations || scanResult.message}
                </p>
              </div>

              {/* Key Issues */}
              {scanResult.health_assessment?.key_issues && scanResult.health_assessment.key_issues.length > 0 && (
                <div className="glass rounded-lg p-4 mb-4">
                  <h4 className="font-semibold text-white mb-2">Detected Issues:</h4>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {scanResult.health_assessment.key_issues.map((issue, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1 text-xs bg-red-500/30 text-red-300 rounded-full"
                      >
                        {issue}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Enhanced Recommendations */}
              <div className="glass rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">
                  Recommendations:
                </h4>
                
                {/* Show different recommendations based on enhanced data when available */}
                {scanResult.recommendations ? (
                  <div className="text-sm text-gray-300 space-y-2">
                    {/* Message if available */}
                    {scanResult.recommendations.message && (
                      <p className="font-medium text-white">
                        {scanResult.recommendations.message}
                      </p>
                    )}
                    
                    {/* Treatment info */}
                    {scanResult.recommendations.treatable && scanResult.recommendations.condition && (
                      <div className="glass-light p-3 rounded-lg mb-3">
                        <h5 className="font-medium text-yellow-200 mb-1">Treatment Information</h5>
                        <p><span className="font-medium">Condition:</span> {scanResult.recommendations.condition}</p>
                        {scanResult.recommendations.medications && (
                          <p><span className="font-medium">Medication:</span> {scanResult.recommendations.medications}</p>
                        )}
                        {scanResult.recommendations.urgency && (
                          <p>
                            <span className="font-medium">Urgency:</span> 
                            <span className={`ml-1 ${
                              scanResult.recommendations.urgency === 'high' ? 'text-red-300' : 
                              scanResult.recommendations.urgency === 'medium' ? 'text-yellow-300' : 'text-green-300'
                            }`}>
                              {scanResult.recommendations.urgency}
                            </span>
                          </p>
                        )}
                        {scanResult.recommendations.home_care && (
                          <p><span className="font-medium">Home Care:</span> {scanResult.recommendations.home_care}</p>
                        )}
                      </div>
                    )}
                    
                    {/* Monitoring advice */}
                    {scanResult.recommendations.monitoring_advice && (
                      <div>
                        <p className="font-medium text-green-300">Monitoring Advice:</p>
                        <p>{scanResult.recommendations.monitoring_advice}</p>
                      </div>
                    )}
                    
                    {/* Emergency actions */}
                    {scanResult.recommendations.emergency && scanResult.recommendations.immediate_actions && (
                      <div className="bg-red-900/30 border border-red-700/50 p-3 rounded-lg">
                        <h5 className="font-medium text-red-300 mb-1">⚠️ Immediate Actions Required</h5>
                        <ul className="list-disc list-inside space-y-1 text-red-100">
                          {scanResult.recommendations.immediate_actions.map((action, i) => (
                            <li key={i}>{action}</li>
                          ))}
                        </ul>
                        {scanResult.recommendations.prevention && (
                          <p className="mt-2 text-red-200">{scanResult.recommendations.prevention}</p>
                        )}
                      </div>
                    )}
                    
                    {/* Professional help */}
                    {scanResult.recommendations.doctors && scanResult.recommendations.doctors.length > 0 && (
                      <div className="mt-3">
                        <p className="font-medium">Contact:</p>
                        <ul className="list-disc list-inside">
                          {scanResult.recommendations.doctors.map((doctor, i) => (
                            <li key={i}>{doctor}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Fallback to legacy recommendations */
                  <div className="text-sm text-gray-300 space-y-2">
                    {scanResult.result === "healthy" && (
                      <ul className="list-disc list-inside space-y-1">
                        <li>Continue regular monitoring</li>
                        <li>Maintain current feeding schedule</li>
                        <li>Schedule routine veterinary check-up</li>
                      </ul>
                    )}
                    {scanResult.result === "treatable" && (
                      <ul className="list-disc list-inside space-y-1">
                        <li>Consult with veterinarian promptly</li>
                        <li>Monitor for symptom changes</li>
                        <li>Isolate if necessary</li>
                        <li>Document treatment progress</li>
                      </ul>
                    )}
                    {scanResult.result === "untreatable" && (
                      <ul className="list-disc list-inside space-y-1 text-red-300">
                        <li>Immediate veterinary attention required</li>
                        <li>Consider humane options</li>
                        <li>Prevent spread to other animals</li>
                        <li>Contact animal health authorities</li>
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Scan;
