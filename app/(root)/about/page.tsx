import React from 'react';
import { FaGithub, FaLinkedin } from 'react-icons/fa';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-center py-8 px-4">
      {/* Top Card Section */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl p-8 mb-8 flex flex-col items-center animate-fade-in-up transition-all duration-700">
        <img
          src="/Portifolio/assets/jsm-logo.png"
          alt="Lekhan's Avatar"
          className="w-28 h-28 rounded-full border-4 border-blue-200 shadow-lg mb-4 object-cover"
        />
        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-2 tracking-tight">Lekhan</h1>
        <p className="text-lg md:text-xl text-gray-600 text-center mb-2 font-medium">
          Hi, I'm Lekhan – a React developer building smart AI-powered websites.
        </p>
        <span className="inline-block bg-blue-100 text-blue-700 px-4 py-1 rounded-full text-xs font-semibold mb-2 animate-fade-in">Open to new opportunities</span>
      </div>

      {/* Info Card Section */}
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-xl p-8 mb-8 grid grid-cols-1 md:grid-cols-3 gap-8 animate-fade-in transition-all duration-700">
        {/* Skills */}
        <div>
          <h2 className="text-xl font-bold text-blue-700 mb-3">Skills</h2>
          <ul className="space-y-2 text-gray-700">
            <li>React.js & Next.js</li>
            <li>TypeScript & JavaScript</li>
            <li>Tailwind CSS & Styled Components</li>
            <li>Node.js & Express</li>
            <li>REST APIs & Firebase</li>
            <li>UI/UX Design</li>
          </ul>
        </div>
        {/* Tools */}
        <div>
          <h2 className="text-xl font-bold text-blue-700 mb-3">Tools I Use</h2>
          <ul className="space-y-2 text-gray-700">
            <li>VS Code</li>
            <li>Figma</li>
            <li>Git & GitHub</li>
            <li>Vercel & Netlify</li>
            <li>Framer Motion</li>
            <li>Postman</li>
          </ul>
        </div>
        {/* Experience/Projects */}
        <div>
          <h2 className="text-xl font-bold text-blue-700 mb-3">Experience & Projects</h2>
          <ul className="space-y-2 text-gray-700">
            <li>Real-Time Chat App</li>
            <li>LiveDoc (Google Docs Clone)</li>
            <li>CarePulse (Health Management)</li>
            <li>Imaginify (AI SaaS)</li>
            <li>Horizon (Banking Platform)</li>
            <li>Freelance Web Projects</li>
          </ul>
        </div>
      </div>

      {/* Contact Me Section */}
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-8 flex flex-col items-center animate-fade-in-up transition-all duration-700 mb-8">
        <h2 className="text-2xl font-bold text-blue-700 mb-4">Contact Me</h2>
        <div className="flex flex-col md:flex-row items-center gap-6 mb-6">
          <div className="flex flex-col items-center">
            <span className="text-gray-600 font-medium">Email</span>
            <a href="mailto:lekhan@example.com" className="text-blue-600 hover:underline font-semibold">lekhan@example.com</a>
          </div>
          {/* Uncomment if you want to show phone
          <div className="flex flex-col items-center">
            <span className="text-gray-600 font-medium">Phone</span>
            <span className="text-blue-600 font-semibold">+91-XXXXXXXXXX</span>
          </div>
          */}
          <div className="flex flex-col items-center">
            <span className="text-gray-600 font-medium">Social</span>
            <div className="flex gap-4 mt-1">
              <a href="https://github.com/lekhan" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-700 text-2xl"><FaGithub /></a>
              <a href="https://linkedin.com/in/lekhan" target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-blue-700 text-2xl"><FaLinkedin /></a>
            </div>
          </div>
        </div>
        <a
          href="https://portifolio-steel-psi-95.vercel.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-4 px-8 py-4 bg-blue-700 hover:bg-blue-800 text-white text-lg font-bold rounded-full shadow-lg transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 animate-bounce"
        >
          Contact Me Now
        </a>
      </div>

      {/* Subtle fade-in animation keyframes */}
      <style jsx>{`
        .animate-fade-in {
          animation: fadeIn 1s ease-in;
        }
        .animate-fade-in-up {
          animation: fadeInUp 1s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(40px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
} 