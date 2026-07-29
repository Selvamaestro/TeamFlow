"use client";

import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function EmployeeLayout({ children, title }) {
  return (
    <div className="min-h-screen flex bg-surface text-on-surface">
      <Sidebar />
      <main className="flex-1 min-h-screen">
        <Topbar title={title} />
        <div className="max-w-container-max mx-auto px-6 md:px-margin-desktop py-base md:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}
