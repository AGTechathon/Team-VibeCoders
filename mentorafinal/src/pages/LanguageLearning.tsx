import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageSquare } from 'lucide-react';
import { Link } from 'react-router-dom';
import GrammarCheckPage from '@/app/grammar-check/page';

export const LanguageLearning: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <Link
            to="/dashboard"
            className="inline-flex items-center text-blue-400 hover:text-blue-300 mb-6"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
          
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageSquare className="h-8 w-8 text-white" />
          </div>
          
          <h1 className="text-3xl font-bold text-white mb-4">
            Language Learning & Practice
          </h1>
          
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Improve your communication skills with our AI-powered language learning tools.
            Practice speaking, get instant feedback, and enhance your vocabulary.
          </p>
        </motion.div>

        <div className="bg-gray-800 rounded-lg shadow-lg border border-gray-700">
          <GrammarCheckPage />
        </div>
      </div>
    </div>
  );
};