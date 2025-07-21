"use client";
import React from "react";

export default function PortfolioPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white flex flex-col items-center justify-center py-8 px-4">
      <h1 className="text-4xl font-bold mb-4">Lekhan's Portfolio</h1>
      {/* Add your portfolio sections/components here */}
      <p className="text-lg text-gray-600 mb-8">
        Welcome to my portfolio! Here you'll find my projects, skills, and more.
      </p>
      {/* Example project card */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-6 w-full max-w-xl">
        <h2 className="text-2xl font-semibold mb-2">Real-Time Chat App</h2>
        <p className="text-gray-700 mb-2">
          A powerful messaging platform with instant messaging, live updates, and multi-device sync.
        </p>
        <a
          href="https://fullstack-chat-app-g4b1.onrender.com/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 hover:underline"
        >
          View Project
        </a>
      </div>
      {/* Repeat for other projects, skills, etc. */}
    </div>
  );
} 