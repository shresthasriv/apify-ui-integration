import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, X } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
  onDismiss: () => void;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onDismiss }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start"
    >
      <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
      <div className="flex-1">
        <p className="text-red-800 font-medium">Error</p>
        <p className="text-red-700 text-sm mt-1">{message}</p>
      </div>
      <button
        onClick={onDismiss}
        className="text-red-400 hover:text-red-600 transition-colors duration-200 p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};