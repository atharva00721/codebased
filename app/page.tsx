"use client";
import { FileText, ExternalLink, Github, MessageSquare } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [activeTab, setActiveTab] = useState("features");

  // Enhanced animation variants
  const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.3,
        ease: "easeOut",
      },
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: 0.2,
        ease: "easeIn",
      },
    },
  };

  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] h-screen">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <h1 className="text-6xl uppercase font-bold">Codebase</h1>
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)] text-gray-600 dark:text-gray-300">
          <li className="mb-2">
            Turn any GitHub repository into a RAG chat with{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold text-black dark:text-white">
              Codebase
            </code>
            .
          </li>
          <li>
            Chat with your codebase to understand and navigate it quickly.
          </li>
        </ol>

        {/* Tab Navigation */}
        <div className="w-full max-w-md">
          <div className="border-b border-gray-200 dark:border-gray-700 relative">
            <nav className="flex gap-6" aria-label="Tabs">
              {["features", "benefits", "examples"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`py-2 text-sm font-medium transition-colors relative ${
                    activeTab === tab
                      ? "text-black dark:text-white"
                      : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute -bottom-[1px] left-0 right-0 h-[2px] bg-black dark:bg-white"
                      initial={{ width: 0 }}
                      animate={{ width: "100%" }}
                      transition={{
                        type: "spring",
                        stiffness: 500,
                        damping: 30,
                      }}
                    />
                  )}
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content with Enhanced Animation */}
          <div className="mt-6 relative" style={{ minHeight: "180px" }}>
            <AnimatePresence mode="wait">
              {activeTab === "features" && (
                <motion.div
                  key="features"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full overflow-hidden"
                >
                  <table className="min-w-full border-collapse">
                    <thead>
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="py-3 px-4 text-left text-sm font-medium text-black dark:text-white">
                          Feature
                        </th>
                        <th className="py-3 px-4 text-left text-sm font-medium text-black dark:text-white">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                        <td className="py-2 px-4 text-sm text-gray-500 dark:text-gray-400">
                          RAG Integration
                        </td>
                        <td className="py-2 px-4 text-sm text-gray-600 dark:text-gray-300">
                          Smart contextual responses
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                        <td className="py-2 px-4 text-sm text-gray-500 dark:text-gray-400">
                          Code Analysis
                        </td>
                        <td className="py-2 px-4 text-sm text-gray-600 dark:text-gray-300">
                          Quick understanding of complex repos
                        </td>
                      </tr>
                      <tr className="hover:bg-gray-50 dark:hover:bg-gray-900/30 transition-colors">
                        <td className="py-2 px-4 text-sm text-gray-500 dark:text-gray-400">
                          Instant Setup
                        </td>
                        <td className="py-2 px-4 text-sm text-gray-600 dark:text-gray-300">
                          Connect & chat within seconds
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </motion.div>
              )}

              {activeTab === "benefits" && (
                <motion.ul
                  key="benefits"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-3 text-sm text-gray-600 dark:text-gray-300"
                >
                  {[
                    "Reduces onboarding time for new developers",
                    "Helps discover hidden patterns in your code",
                    "Makes documentation more accessible",
                    "Speeds up bug identification and resolution",
                  ].map((benefit, index) => (
                    <motion.li
                      key={index}
                      className="flex items-center"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{
                        opacity: 1,
                        x: 0,
                        transition: { delay: index * 0.1 },
                      }}
                    >
                      <span className="mr-2 text-black dark:text-white">•</span>
                      <span>{benefit}</span>
                    </motion.li>
                  ))}
                </motion.ul>
              )}

              {activeTab === "examples" && (
                <motion.div
                  key="examples"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-4 text-sm"
                >
                  {[
                    {
                      query: "How does the authentication flow work?",
                      response:
                        "Codebase will analyze auth files and explain the process step by step.",
                    },
                    {
                      query: "What APIs handle user data?",
                      response:
                        "Codebase will identify relevant endpoints and explain their function.",
                    },
                  ].map((example, index) => (
                    <motion.div
                      key={index}
                      className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:border-gray-300 dark:hover:border-gray-600 transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{
                        opacity: 1,
                        y: 0,
                        transition: { delay: index * 0.15 },
                      }}
                    >
                      <div className="font-medium text-black dark:text-white mb-2">
                        Example Query:
                      </div>
                      <div className="text-gray-600 dark:text-gray-300 mb-2">
                        "{example.query}"
                      </div>
                      <div className="text-gray-500 dark:text-gray-400 italic">
                        {example.response}
                      </div>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-foreground text-background gap-2 hover:bg-[#383838] dark:hover:bg-[#ccc] text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 font-medium"
            href="/dashboard"
            rel="noopener noreferrer"
          >
            <MessageSquare size={20} />
            Start Chatting
          </a>
          <a
            className="rounded-full border border-solid border-black/[.08] dark:border-white/[.145] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] dark:hover:bg-[#1a1a1a] hover:border-transparent text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:min-w-44 text-gray-600 dark:text-gray-300"
            href="https://github.com/atharva00721/codebase"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Github className="mr-2" size={16} />
            View on GitHub
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center text-gray-500 dark:text-gray-400">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 hover:text-black dark:hover:text-white transition-colors"
          href="/documentation"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FileText size={16} />
          Documentation
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 hover:text-black dark:hover:text-white transition-colors"
          href="/examples"
          target="_blank"
          rel="noopener noreferrer"
        >
          <MessageSquare size={16} />
          Example Chats
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4 hover:text-black dark:hover:text-white transition-colors"
          href="https://github.com/atharva00721/codebased"
          target="_blank"
          rel="noopener noreferrer"
        >
          <ExternalLink size={16} />
          GitHub Repository
        </a>
      </footer>
    </div>
  );
}
