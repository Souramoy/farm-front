"use client";
import { HeroPage } from "@/app/_components/Home";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (user) {
      setRedirecting(true); // Show message
      const timeout = setTimeout(() => {
        console.log("Redirecting to dashboard...");
        router.push("/dashboard");
      }, 4000);

      return () => clearTimeout(timeout);
    }
  }, [user, router]);

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
      {redirecting ? (
        <div className="flex flex-col items-center gap-4">
          <p className="text-lg md:text-xl font-medium">
            You are logged in! Redirecting to your dashboard...
          </p>
          {/* Optional spinner animation */}
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <HeroPage />
      )}
    </div>
  );
}
