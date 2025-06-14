import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  Video, 
  MessageSquare, 
  Brain, 
  Code, 
  ArrowRight

} from 'lucide-react';

export const Dashboard: React.FC = () => {
  const quickActions = [
    {
      icon: Video,
      title: 'AI Mock Interview',
      description: 'AI-powered interview practice',
      href: '/mock-interview',
      gradient: 'from-blue-500 to-purple-600'
    },

    {
      icon: Video,
      title: 'Real Time Interview',
      description: 'Paid interview practice (SaaS)',
      href: '/real-interview',
      gradient: 'from-purple-600 to-blue-500'
    },
    
    {
      icon: MessageSquare,
      title: 'Language Learning',
      description: 'Improve your communication skills',
      href: '/language-learning',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      icon: Brain,
      title: 'Focus Mode',
      description: 'Start focused study session',
      href: '/focus-mode',
      gradient: 'from-green-500 to-teal-600'
    },
    {
      icon: Code,
      title: 'AI code practice',
      description: 'Practice coding with AI feedback',
      href: '/code-practice',
      gradient: 'from-orange-500 to-red-600'
    },
    {
      icon: Code,
      title: 'Online IDE',
      description: 'Practice coding with AI feedback',
      href: '/online-ide',
      gradient: 'from-red-600 to-orange-500'
    },
    {
      icon: MessageSquare,
      title: 'Doubt Solving',
      description: 'Get instant help with your doubts',
      href: '/doubt-solving',
      gradient: 'from-pink-600 to-purple-500'
    },
    
  ];

  const recentActivity = [
    { action: 'Completed Mock Interview', time: '2 hours ago', score: 85 },
    { action: 'Language Learning Session', time: '1 day ago', score: 92 },
    { action: 'Code Analysis', time: '2 days ago', score: 78 },
    { action: 'Focus Mode Session', time: '3 days ago', score: 95 }
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back to MentoraX
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Continue your learning journey with AI-powered tools
          </p>
        </motion.div>

        
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <Link to={action.href} key={action.title}>
                <motion.div
                  className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-300"
                  whileHover={{ y: -5 }}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-r ${action.gradient} flex items-center justify-center mb-4`}>
                    <action.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    {action.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">
                    {action.description}
                  </p>
                  <div className="flex items-center text-blue-600 dark:text-blue-400 text-sm font-medium">
                    Start now
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            Recent Activity
          </h2>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            {recentActivity.map((activity, index) => (
              <div
                key={index}
                className={`p-4 ${index !== recentActivity.length - 1 ? 'border-b border-gray-200 dark:border-gray-700' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {activity.action}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {activity.time}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      {activity.score}%
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Score
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

       
      </div>
    </div>
  );
};