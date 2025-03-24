"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "../hooks/use-mobile";

interface TabItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface MobileTabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
}

export default function MobileTabs({
  tabs,
  activeTab,
  onChange,
}: MobileTabsProps) {
  const isMobile = useIsMobile();
  const [expandedTab, setExpandedTab] = useState<string | null>(null);

  const handleTabClick = (tabId: string) => {
    if (isMobile) {
      if (tabId === activeTab) {
        // If already active, toggle expanded state
        setExpandedTab(expandedTab === tabId ? null : tabId);
      } else {
        // If different tab, activate and expand it
        onChange(tabId);
        setExpandedTab(tabId);
      }
    } else {
      // On desktop, just change tabs
      onChange(tabId);
    }
  };

  // Enhanced animation variants
  const textExpandVariants = {
    hidden: {
      width: 0,
      opacity: 0,
      marginLeft: 0,
      transition: {
        duration: 0.2,
        ease: "easeInOut",
      },
    },
    visible: {
      width: "auto",
      opacity: 1,
      marginLeft: "0.25rem", // ml-1 equivalent
      transition: {
        width: { duration: 0.2, ease: "easeOut" },
        opacity: { duration: 0.15, ease: "easeOut", delay: 0.05 },
      },
    },
  };

  // Icon animation variants
  const iconVariants = {
    active: {
      scale: [1, 1.15, 1],
      rotate: [0, -5, 5, 0],
      transition: {
        duration: 0.4,
        ease: "easeInOut",
      },
    },
    inactive: {
      scale: 1,
      rotate: 0,
      transition: {
        duration: 0.2,
      },
    },
  };

  return (
    <div className="border-b border-gray-200 dark:border-gray-700 relative">
      <nav className="flex flex-wrap gap-4 sm:gap-6" aria-label="Tabs">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isExpanded = expandedTab === tab.id || !isMobile;

          return (
            <button
              key={tab.id}
              onClick={() => handleTabClick(tab.id)}
              className={`py-2 text-sm font-medium transition-colors relative flex items-center ${
                isActive
                  ? "text-themeTextBlack dark:text-themeTextWhite"
                  : "text-themeTextMutedGray dark:text-themeTextGray hover:text-themeTextBlack dark:hover:text-themeTextWhite"
              }`}
              aria-label={tab.label}
            >
              {/* Animated icon */}
              <motion.span
                className="flex items-center justify-center"
                variants={iconVariants}
                animate={isActive ? "active" : "inactive"}
                key={`icon-${tab.id}-${isActive}`}
              >
                {tab.icon}
              </motion.span>

              {/* Tab label with improved animation */}
              <AnimatePresence mode="wait">
                {isExpanded && (
                  <motion.span
                    variants={textExpandVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    className="overflow-hidden whitespace-nowrap origin-left"
                  >
                    {tab.label}
                  </motion.span>
                )}
              </AnimatePresence>

              {/* Active indicator with improved animation */}
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-themeAccent"
                  initial={{ width: 0, x: "50%" }}
                  animate={{ width: "100%", x: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 30,
                    mass: 1,
                  }}
                />
              )}
            </button>
          );
        })}
      </nav>
    </div>
  );
}
