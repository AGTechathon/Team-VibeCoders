import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  Video, 
  MessageSquare, 
  Brain, 
  Code, 
  Phone, 
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import { SignUpButton } from '@clerk/nextjs';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const features = [
    {
      icon: Video,
      title: 'AI Mock Interview & Feedback',
      description: 'Advanced video-based AI system that analyzes your responses and provides real-time, personalized feedback to improve your interview performance.',
      gradient: 'from-blue-500 to-purple-600'
    },
    {
      icon: MessageSquare,
      title: 'AI-Powered Language Learning',
      description: 'Intelligent assistant that corrects grammar, enhances vocabulary, and accelerates your language learning journey with personalized guidance.',
      gradient: 'from-purple-500 to-pink-600'
    },
    {
      icon: Brain,
      title: 'Meditation & Study Focus Mode',
      description: 'AI-generated study notes with audio narration, focus timers, and ambient background music to optimize your learning environment.',
      gradient: 'from-green-500 to-teal-600'
    },
    {
      icon: Code,
      title: 'Live Code IDE Sharing',
      description: 'Real-time collaborative coding environment where interviewers can monitor and review your coding solutions as you work.',
      gradient: 'from-orange-500 to-red-600'
    },
    {
      icon: Phone,
      title: 'Video & Audio Call Support',
      description: 'Seamless high-quality video and audio calling for face-to-face interviews with crystal-clear communication.',
      gradient: 'from-indigo-500 to-blue-600'
    },
    {
      icon: BarChart3,
      title: 'AI-Based Code Analysis',
      description: 'Comprehensive AI evaluation of your code quality, efficiency, performance, and correctness with detailed improvement suggestions.',
      gradient: 'from-teal-500 to-green-600'
    }
  ];

  const techStack = [
    { name: 'ZegoCloud', description: 'Voice, Video & Chat API', logo: '🎥' },
    { name: 'LemonSqueezy', description: 'Payment Processing', logo: '🍋' },
    { name: 'Next.js', description: 'Frontend Framework', logo: '⚡' },
    // we will un comment this if we ever deploy our project 
    // { name: 'Vercel', description: 'Deployment Platform', logo: '▲' },
    { name: 'Clerk', description: 'Authentication', logo: '🔐' },
    // { name: 'Firebase', description: 'Database & Storage', logo: '🔥' },
    { name: 'Vapi AI', description: 'NLP & AI Processing', logo: '🤖' },
    { name: 'Google AI Studio', description: 'AI Development', logo: '🧠' },
    { name: 'WebRTC', description: 'Real-time Communication', logo: '📡' },
    { name: 'Node.js', description: 'Backend Runtime', logo: '🟢' }
  ];

  

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <motion.h1 
              className="text-4xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Master Your Skills with{' '}
              <span className="text-blue-600 dark:text-blue-400">
                AI-Powered Learning
              </span>
            </motion.h1>
            
            <motion.p 
              className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              Transform your interview preparation and learning journey with advanced AI technology, 
              real-time feedback, and comprehensive skill development tools.
            </motion.p>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <SignUpButton mode="modal">
                <motion.button
                  className="px-8 py-4 bg-purple-600 text-white rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Start Learning Today
                  <ArrowRight className="ml-2 h-5 w-5 inline-block group-hover:translate-x-1 transition-transform" />
                </motion.button>
              </SignUpButton>
              
              <motion.button
                className="px-8 py-4 border-2 border-blue-600 text-blue-600 dark:text-blue-400 rounded-lg font-semibold text-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/dashboard')}
              >
                Go to Dashboard
              </motion.button>
            </motion.div>

            {/* Stats */}
            <motion.div
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
            >
              
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8 bg-gray-50 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Powerful Features for Modern Learning
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover our comprehensive suite of AI-powered tools designed to accelerate your learning 
              and boost your career prospects.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -5 }}
              >
                <div className={`w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center mb-4`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Stack Section */}
      <section id="tech-stack" className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Built with Industry-Leading Technology
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Our platform leverages cutting-edge technologies to deliver the best learning experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {techStack.map((tech, index) => (
              <motion.div
                key={tech.name}
                className="bg-white dark:bg-gray-800 rounded-lg p-6 text-center shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 dark:border-gray-700"
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.05 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-3xl mb-3">{tech.logo}</div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-1">{tech.name}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{tech.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to Transform Your Learning Journey?
            </h2>
            
            <SignUpButton mode="modal" >
              <motion.button
                className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get Started Free
                <ArrowRight className="ml-2 h-5 w-5 inline-block group-hover:translate-x-1 transition-transform" />
              </motion.button>
            </SignUpButton>
          </motion.div>
        </div>
      </section>

      
    </div>
  );
};