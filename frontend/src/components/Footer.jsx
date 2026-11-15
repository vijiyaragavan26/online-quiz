import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart, Shield, Code, Award, ExternalLink } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-navy-950 text-slate-400 border-t border-slate-800/80 pt-16 pb-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">QuizMaster</span>
            </Link>
            <p className="text-sm text-slate-400 leading-relaxed">
              A modern, intelligent educational assessment and quiz-crafting ecosystem built for learners, educators, and knowledge seekers.
            </p>
            <div className="flex items-center space-x-2 text-xs font-semibold text-purple-400 bg-purple-950/60 border border-purple-800/50 px-3 py-1.5 rounded-full w-fit">
              <Award className="w-3.5 h-3.5 text-purple-400" />
              <span>CodSoft Web Development – Level 2 Task 2</span>
            </div>
          </div>

          {/* Platform Links */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Platform</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/" className="hover:text-purple-400 transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/explore" className="hover:text-purple-400 transition-colors">Explore All Quizzes</Link>
              </li>
              <li>
                <Link to="/create-quiz" className="hover:text-purple-400 transition-colors">Create a Quiz</Link>
              </li>
              <li>
                <Link to="/dashboard" className="hover:text-purple-400 transition-colors">Personal Dashboard</Link>
              </li>
            </ul>
          </div>

          {/* Popular Categories */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Categories</h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link to="/explore?category=Web+Development" className="hover:text-purple-400 transition-colors">Web Development</Link>
              </li>
              <li>
                <Link to="/explore?category=Programming" className="hover:text-purple-400 transition-colors">Programming & Algorithms</Link>
              </li>
              <li>
                <Link to="/explore?category=Science" className="hover:text-purple-400 transition-colors">General Science & Cosmos</Link>
              </li>
              <li>
                <Link to="/explore?category=History" className="hover:text-purple-400 transition-colors">World History & Civilizations</Link>
              </li>
            </ul>
          </div>

          {/* Tech Stack & Features */}
          <div>
            <h4 className="text-sm font-semibold text-white tracking-wider uppercase mb-4">Architecture</h4>
            <p className="text-xs text-slate-400 mb-3 leading-relaxed">
              Engineered with full-stack best practices: React.js, Tailwind CSS, Node.js, Express REST API, JWT auth, and MongoDB.
            </p>
            <div className="flex flex-wrap gap-1.5">
              <span className="text-[11px] bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">React.js</span>
              <span className="text-[11px] bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">Node.js</span>
              <span className="text-[11px] bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">Express</span>
              <span className="text-[11px] bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">MongoDB</span>
              <span className="text-[11px] bg-slate-800/80 text-slate-300 px-2.5 py-1 rounded-md border border-slate-700">Tailwind</span>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 space-y-4 sm:space-y-0">
          <p>© {new Date().getFullYear()} QuizMaster Platform. All rights reserved.</p>
          <div className="flex items-center space-x-4">
            <span className="inline-flex items-center space-x-1 text-slate-400">
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span>Server-Side Grading & Anti-Cheat Validation</span>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
