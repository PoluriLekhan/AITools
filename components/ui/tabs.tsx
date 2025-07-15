import * as React from "react";
import { cn } from "@/lib/utils";

interface Tab {
  label: string;
  value: string;
}

interface TabsProps {
  tabs: Tab[];
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({ tabs, value, onChange, className }) => {
  return (
    <div className={cn("flex flex-wrap gap-2 mb-6 border-b border-gray-200", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.value}
          className={cn(
            "px-4 py-2 text-sm font-medium rounded-t-lg transition-all duration-200 focus:outline-none",
            value === tab.value
              ? "bg-blue-600 text-white shadow-md -mb-px"
              : "bg-gray-100 text-gray-700 hover:bg-blue-50 hover:text-blue-700"
          )}
          onClick={() => onChange(tab.value)}
          type="button"
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}; 