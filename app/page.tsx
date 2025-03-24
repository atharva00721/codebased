"use client";
import {
  Github as GitHubIcon,
  MessageSquare,
  Code,
  PanelRight,
  Info,
  ArrowRight,
  CatIcon,
} from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ThemeToggle from "../components/theme-toggle";
import MobileTabs from "../components/mobile-tabs";

export default function Home() {
  const [activeTab, setActiveTab] = useState("features");

  // Enhanced animation variants
  const tabContentVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2, ease: "easeIn" } },
  };

  // Tab definitions
  const tabs = [
    {
      id: "features",
      label: "Features",
      icon: <Code size={16} className="sm:mr-2" />,
    },
    {
      id: "benefits",
      label: "Benefits",
      icon: <PanelRight size={16} className="sm:mr-2" />,
    },
    {
      id: "examples",
      label: "Examples",
      icon: <MessageSquare size={16} className="sm:mr-2" />,
    },
    {
      id: "how-it-works",
      label: "How It Works",
      icon: <Info size={16} className="sm:mr-2" />,
    },
  ];

  return (
    <div className="min-h-screen h-screen flex flex-col items-center justify-between p-6 pb-12 gap-6 sm:p-16 font-[family-name:var(--font-geist-sans)] bg-themeCream dark:bg-themeBlack transition-colors duration-300 overflow-auto">
      {/* Dark mode toggle - positioned top right */}
      <ThemeToggle className="absolute top-6 right-6 sm:top-8 sm:right-8" />

      <main className="flex flex-col gap-6 items-start w-full max-w-4xl my-20">
        <h1 className="text-5xl sm:text-6xl uppercase font-bold text-themeTextBlack dark:text-themeTextWhite text-left">
          Codebased
        </h1>

        <ol className="list-inside list-decimal text-sm font-[family-name:var(--font-geist-mono)] text-themeTextMutedGray dark:text-themeTextGray sm:text-left max-w-xl mx-auto sm:mx-0">
          <li className="mb-1">
            Turn any GitHub repository into a RAG chat with{" "}
            <code className="bg-themeSoftCream dark:bg-themeDarkGray px-1 py-0.5 rounded font-semibold text-themeTextBlack dark:text-themeTextWhite">
              Codebased
            </code>
            .
          </li>
          <li>
            Chat with your codebase to understand and navigate it quickly.
          </li>
        </ol>
        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-themeAccent text-themeTextWhite gap-2 hover:bg-themeAccent/90 text-sm h-10 sm:h-11 px-5 sm:px-6 font-medium w-full sm:w-auto"
            href="/dashboard"
            rel="noopener noreferrer"
          >
            <MessageSquare size={18} />
            Start Chatting
          </a>
          <a
            className="rounded-full border border-solid border-themeAccent transition-colors flex items-center justify-center bg-transparent hover:bg-themeAccent/10 text-sm h-10 sm:h-11 w-10 sm:w-11 p-0 text-foreground hover:text-themeAccent"
            href="https://github.com/atharva00721/codebased"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="View on GitHub"
          >
            <GitHubIcon size={16} />
          </a>
        </div>
        {/* Mobile-optimized Tabs */}
        <div className="w-full">
          <MobileTabs
            tabs={tabs}
            activeTab={activeTab}
            onChange={setActiveTab}
          />

          {/* Tab Content with Enhanced Animation - Increased max-height for "how-it-works" tab */}
          <div
            className="mt-4 relative max-sm:overflow-auto "
            style={{
              minHeight: "200px",
              maxHeight: activeTab === "how-it-works" ? "400px" : "280px",
            }}
          >
            <AnimatePresence mode="wait">
              {activeTab === "features" && (
                <motion.div
                  key="features"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full overflow-auto max-h-[280px]"
                >
                  <table className="min-w-full border-collapse">
                    <thead className="sticky top-0 bg-themeCream dark:bg-themeBlack">
                      <tr className="border-b border-gray-200 dark:border-gray-700">
                        <th className="py-2 px-4 text-left text-sm font-medium text-themeTextBlack dark:text-themeTextWhite">
                          Feature
                        </th>
                        <th className="py-2 px-4 text-left text-sm font-medium text-themeTextBlack dark:text-themeTextWhite">
                          Description
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="hover:bg-themeSoftCream dark:hover:bg-themeGray transition-colors">
                        <td className="py-2 px-4 text-sm text-themeTextMutedGray">
                          RAG Integration
                        </td>
                        <td className="py-2 px-4 text-sm text-themeTextMutedGray">
                          Smart contextual responses based on your code
                        </td>
                      </tr>
                      <tr className="hover:bg-themeSoftCream dark:hover:bg-themeGray transition-colors">
                        <td className="py-2 px-4 text-sm text-themeTextMutedGray">
                          Code Analysis
                        </td>
                        <td className="py-2 px-4 text-sm text-themeTextMutedGray">
                          Understand complex repositories in minutes
                        </td>
                      </tr>
                      <tr className="hover:bg-themeSoftCream dark:hover:bg-themeGray transition-colors">
                        <td className="py-2 px-4 text-sm text-themeTextMutedGray">
                          Instant Setup
                        </td>
                        <td className="py-2 px-4 text-sm text-themeTextMutedGray">
                          Connect and start chatting within seconds
                        </td>
                      </tr>
                      <tr className="hover:bg-themeSoftCream dark:hover:bg-themeGray transition-colors">
                        <td className="py-2 px-4 text-sm text-themeTextMutedGray">
                          Cross-language
                        </td>
                        <td className="py-2 px-4 text-sm text-themeTextMutedGray">
                          Works with any programming language
                        </td>
                      </tr>
                      <tr className="hover:bg-themeSoftCream dark:hover:bg-themeGray transition-colors">
                        <td className="py-2 px-4 text-sm text-themeTextMutedGray">
                          Memory & Context
                        </td>
                        <td className="py-2 px-4 text-sm text-themeTextMutedGray">
                          Maintains conversation history for relevant responses
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </motion.div>
              )}

              {activeTab === "benefits" && (
                <motion.div
                  key="benefits"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="grid grid-cols-1 sm:grid-cols-2 gap-4 overflow-auto max-h-[280px]"
                >
                  {[
                    {
                      title: "Reduced Onboarding Time",
                      description:
                        "New team members can understand your codebase faster",
                    },
                    {
                      title: "Faster Debugging",
                      description: "Quickly identify and understand issues",
                    },
                    {
                      title: "Better Documentation",
                      description:
                        "Access knowledge even when docs are missing",
                    },
                    {
                      title: "Pattern Discovery",
                      description:
                        "Reveal hidden patterns in your code architecture",
                    },
                    {
                      title: "Team Collaboration",
                      description: "Share knowledge with precise references",
                    },
                    {
                      title: "Developer Productivity",
                      description:
                        "Focus on building rather than digging through code",
                    },
                  ].map((benefit, index) => (
                    <motion.div
                      key={index}
                      className="flex flex-col"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <h3 className="font-medium text-themeTextBlack dark:text-themeTextWhite text-sm flex items-center">
                        <ArrowRight
                          size={14}
                          className="mr-2 text-themeAccent"
                        />
                        {benefit.title}
                      </h3>
                      <p className="mt-1 text-sm text-themeTextMutedGray dark:text-themeTextGray ml-6">
                        {benefit.description}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {activeTab === "examples" && (
                <motion.div
                  key="examples"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="space-y-4 text-sm overflow-auto max-h-[280px]"
                >
                  {[
                    {
                      query: "How does the authentication work?",
                      response:
                        "Codebased analyzes auth files and explains the authentication flow.",
                    },
                    {
                      query: "What APIs handle user data?",
                      response:
                        "Codebased identifies relevant endpoints and explains their functions.",
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
                      <p className="text-themeAccent mb-2 font-medium">
                        &quot;{example.query}&quot;
                      </p>
                      <p className="text-themeTextMutedGray dark:text-themeTextGray">
                        {example.response}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>
              )}

              {activeTab === "how-it-works" && (
                <motion.div
                  key="how-it-works"
                  variants={tabContentVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="w-full max-h-[500px] pb-2"
                >
                  <div className=" max-h-[500px] grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {[
                      {
                        step: "1",
                        title: "Connect Repository",
                        description:
                          "Link your GitHub repo securely with just a few clicks.",
                      },
                      {
                        step: "2",
                        title: "Index & Process",
                        description:
                          "AI analyzes code structure, dependencies, and relationships.",
                      },
                      {
                        step: "3",
                        title: "Start Chatting",
                        description:
                          "Ask questions and get contextual answers about your code.",
                      },
                    ].map((item) => (
                      <motion.div
                        key={item.step}
                        className="p-3 border border-gray-200 dark:border-gray-700 rounded-lg relative"
                        initial={{ opacity: 0, y: 10 }}
                        animate={{
                          opacity: 1,
                          y: 0,
                          transition: { delay: parseInt(item.step) * 0.1 },
                        }}
                      >
                        <h3 className="font-medium text-themeTextBlack dark:text-themeTextWhite mb-1 mt-1">
                          {item.title}
                        </h3>
                        <p className="text-sm text-themeTextMutedGray dark:text-themeTextGray">
                          {item.description}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Technical details section - Added with more details and better spacing */}
                  <div className="mt-6 p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <h3 className="font-medium text-themeTextBlack dark:text-themeTextWhite mb-3">
                      How Codebased Understands Your Code
                    </h3>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-themeAccent mb-2">
                          RAG Technology
                        </h4>
                        <p className="text-sm text-themeTextMutedGray dark:text-themeTextGray mb-3">
                          Codebased uses Retrieval Augmented Generation (RAG) to
                          provide accurate context-aware responses about your
                          code. This combines the power of AI with your
                          codebase&apos;s specific information.
                        </p>
                      </div>

                      <div>
                        <h4 className="text-sm font-medium text-themeAccent mb-2">
                          Code Processing
                        </h4>
                        <p className="text-sm text-themeTextMutedGray dark:text-themeTextGray mb-3">
                          Your code is processed into semantic embeddings that
                          capture relationships between files, functions, and
                          components, allowing for intelligent responses based
                          on your specific implementation.
                        </p>
                      </div>
                    </div>

                    <h4 className="text-sm font-medium text-themeTextBlack dark:text-themeTextWhite mt-2 mb-2">
                      Key Benefits:
                    </h4>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <li className="text-sm text-themeTextMutedGray dark:text-themeTextGray flex items-start">
                        <span className="mr-2 text-themeAccent">•</span>
                        <span>
                          Full context from across your entire codebase
                        </span>
                      </li>
                      <li className="text-sm text-themeTextMutedGray dark:text-themeTextGray flex items-start">
                        <span className="mr-2 text-themeAccent">•</span>
                        <span>Language-agnostic analysis for any repo</span>
                      </li>
                      <li className="text-sm text-themeTextMutedGray dark:text-themeTextGray flex items-start">
                        <span className="mr-2 text-themeAccent">•</span>
                        <span>Secure, private processing of your code</span>
                      </li>
                      <li className="text-sm text-themeTextMutedGray dark:text-themeTextGray flex items-start">
                        <span className="mr-2 text-themeAccent">•</span>
                        <span>Continuous learning from your interactions</span>
                      </li>
                    </ul>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      <footer className="flex gap-4 flex-wrap items-center justify-center text-themeTextMutedGray dark:text-themeTextGray py-2 w-full">
        <a
          className="flex items-center gap-1 hover:underline hover:underline-offset-4 hover:text-themeTextBlack dark:hover:text-themeTextWhite transition-colors text-xs"
          href="portfolioarstc.vercel.app"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Code size={14} />
          Portfolio
        </a>
        <a
          className="flex items-center gap-1 hover:underline hover:underline-offset-4 hover:text-themeTextBlack dark:hover:text-themeTextWhite transition-colors text-xs"
          href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
          target="_blank"
          rel="noopener noreferrer"
        >
          <CatIcon size={14} />
          Cute Cat Videos
        </a>
        <a
          className="flex items-center gap-1 hover:underline hover:underline-offset-4 hover:text-themeTextBlack dark:hover:text-themeTextWhite transition-colors text-xs"
          href="https://github.com/atharva00721"
          target="_blank"
          rel="noopener noreferrer"
        >
          <GitHubIcon size={14} />
          Github
        </a>
      </footer>
    </div>
  );
}
