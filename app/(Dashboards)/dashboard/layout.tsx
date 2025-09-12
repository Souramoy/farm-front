import Navbar from "@/app/_components/Navbar";
import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="dashboard-layout">
      {/* You can add a sidebar or header here if needed */}
      <Navbar />
      <main>{children}</main>
    </div>
  );
}
