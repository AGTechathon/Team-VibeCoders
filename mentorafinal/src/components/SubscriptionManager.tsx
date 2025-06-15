import React, { useState } from 'react';
import { LemonSqueezy } from '@lemonsqueezy/lemonsqueezy.js';
import { motion } from 'framer-motion';
import { CreditCard, CheckCircle2, XCircle } from 'lucide-react';

interface SubscriptionManagerProps {
  onSubscriptionComplete: () => void;
}

const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ onSubscriptionComplete }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const lemonSqueezy = createLemonSqueezy({
        apiKey: process.env.NEXT_PUBLIC_LEMON_SQUEEZY_API_KEY || '',
      });

      // Create a checkout
      const checkout = await lemonSqueezy.createCheckout({
        storeId: process.env.NEXT_PUBLIC_LEMON_SQUEEZY_STORE_ID || '',
        variantId: process.env.NEXT_PUBLIC_LEMON_SQUEEZY_VARIANT_ID || '',
        customData: {
          userId: 'user_id', // Replace with actual user ID
        },
      });

      // Open the checkout URL
      if (checkout.data?.attributes?.url) {
        window.location.href = checkout.data.attributes.url;
      }
    } catch (err) {
      setError('Failed to create subscription. Please try again.');
      console.error('Subscription error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-gray-800 rounded-xl p-8 max-w-md mx-auto">
      <div className="text-center mb-8">
        <div className="bg-blue-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
          <CreditCard className="h-8 w-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">
          Video Interview Subscription
        </h2>
        <p className="text-gray-300">
          Get access to real-time video interviews with professional mentors
        </p>
      </div>

      <div className="space-y-4 mb-8">
        <div className="flex items-center text-gray-300">
          <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" />
          <span>Unlimited video interviews</span>
        </div>
        <div className="flex items-center text-gray-300">
          <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" />
          <span>Professional mentor feedback</span>
        </div>
        <div className="flex items-center text-gray-300">
          <CheckCircle2 className="h-5 w-5 text-green-500 mr-3" />
          <span>Real-time code collaboration</span>
        </div>
      </div>

      {error && (
        <div className="flex items-center text-red-500 mb-4">
          <XCircle className="h-5 w-5 mr-2" />
          <span>{error}</span>
        </div>
      )}

      <motion.button
        className="w-full bg-green-500 text-white py-3 px-6 rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSubscribe}
        disabled={isLoading}
      >
        {isLoading ? 'Processing...' : 'Subscribe Now'}
      </motion.button>

      <p className="text-gray-400 text-sm text-center mt-4">
        Secure payment powered by Lemon Squeezy
      </p>
    </div>
  );
};

export default SubscriptionManager; 