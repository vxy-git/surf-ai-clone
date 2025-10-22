"use client";

import { useState, cloneElement, isValidElement } from "react";
import Sidebar from "@/components/Sidebar";

export default function HubLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const childrenWithProps = isValidElement(children)
    ? cloneElement(children as React.ReactElement<{ onToggleSidebar?: () => void }>, {
        onToggleSidebar: () => setSidebarOpen(!sidebarOpen),
      })
    : children;

  return (
    <div className="flex h-screen bg-[#f7f7f7] dark:bg-gray-900">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} />
      <div className="flex-1 overflow-y-auto">
        {childrenWithProps}
      </div>
    </div>
  );
}
