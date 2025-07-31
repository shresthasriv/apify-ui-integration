import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Key, Eye, EyeOff } from 'lucide-react';

interface AuthFormProps {
  onAuthenticate: (key: string) => void;
  isLoading: boolean;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onAuthenticate, isLoading }) => {
  const [key, setKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (key.trim()) {
      onAuthenticate(key.trim());
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.3 }}
      className="max-w-md mx-auto"
    >
      <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="p-4 bg-blue-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Key className="w-8 h-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600">
            Enter your Apify API key to access your actors and execute runs.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="relative">
            <input
              type={showKey ? 'text' : 'password'}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Enter your Apify API key"
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-gray-50 focus:bg-white"
              disabled={isLoading}
              required
            />
            <button
              type="button"
              onClick={() => setShowKey(!showKey)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
              disabled={isLoading}
            >
              {showKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          <motion.button
            type="submit"
            disabled={isLoading || !key.trim()}
            className="w-full bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            whileHover={{ scale: isLoading ? 1 : 1.02 }}
            whileTap={{ scale: isLoading ? 1 : 0.98 }}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Authenticating...
              </div>
            ) : (
              'Continue'
            )}
          </motion.button>
        </form>

        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Need an API key?</strong> Visit your{' '}
            <a 
              href="https://console.apify.com/account/integrations" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline hover:no-underline"
            >
              Apify Console
            </a>{' '}
            to generate one.
          </p>
        </div>
      </div>
    </motion.div>
  );
};