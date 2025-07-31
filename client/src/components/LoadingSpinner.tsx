import React from 'react';
import { motion } from 'framer-motion';
import { Loader } from 'lucide-react';

export const LoadingSpinner: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        className="mb-4"
      >
        <Loader className="w-8 h-8 text-blue-600" />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center"
      >
        <p className="text-lg font-medium text-gray-700 mb-2">Processing...</p>
        <p className="text-sm text-gray-500">This may take a moment</p>
      </motion.div>
    </motion.div>
  );
};