import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Copy, Download, RotateCcw, LogOut, ChevronDown, ChevronRight } from 'lucide-react';

interface ResultDisplayProps {
  result: any;
  onReset: () => void;
  onNewSession: () => void;
  actorName: string;
}

export const ResultDisplay: React.FC<ResultDisplayProps> = ({ 
  result, 
  onReset, 
  onNewSession, 
  actorName 
}) => {
  const [copied, setCopied] = useState(false);
  const [expanded, setExpanded] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(result, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${actorName.replace(/[^a-z0-9]/gi, '_')}_result.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatResultPreview = (data: any) => {
    if (Array.isArray(data)) {
      return `Array with ${data.length} items`;
    } else if (typeof data === 'object' && data !== null) {
      const keys = Object.keys(data);
      return `Object with ${keys.length} properties: ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''}`;
    } else {
      return String(data);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-green-50 to-emerald-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <CheckCircle className="w-6 h-6 mr-3 text-green-600" />
              Execution Complete
            </h2>
            <p className="text-gray-600 mt-1">
              {actorName} completed successfully
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopy}
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200"
            >
              <Copy className="w-4 h-4 mr-2" />
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200"
            >
              <Download className="w-4 h-4 mr-2" />
              Download
            </button>
          </div>
        </div>
      </div>

      {/* Result Content */}
      <div className="p-6">
        {/* Status Summary */}
        {result.status && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-center">
              <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
              <span className="font-medium text-green-800">Status: {result.status}</span>
            </div>
            {result.defaultDatasetId && (
              <p className="text-sm text-green-700 mt-1">
                Dataset ID: {result.defaultDatasetId}
              </p>
            )}
          </div>
        )}

        {/* Data Preview */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Result Data</h3>
            <button
              onClick={() => setExpanded(!expanded)}
              className="flex items-center text-sm text-blue-600 hover:text-blue-700 transition-colors duration-200"
            >
              {expanded ? (
                <>
                  <ChevronDown className="w-4 h-4 mr-1" />
                  Collapse
                </>
              ) : (
                <>
                  <ChevronRight className="w-4 h-4 mr-1" />
                  Expand
                </>
              )}
            </button>
          </div>

          {!expanded ? (
            <div className="p-4 bg-gray-50 rounded-lg border">
              <p className="text-sm text-gray-600">
                {formatResultPreview(result.data || result)}
              </p>
            </div>
          ) : (
            <div className="relative">
              <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto text-sm max-h-96 overflow-y-auto">
                <code>{JSON.stringify(result, null, 2)}</code>
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-6 border-t border-gray-100 bg-gray-50">
        <div className="flex items-center space-x-4">
          <motion.button
            onClick={onReset}
            className="flex items-center px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Run Another
          </motion.button>
          
          <motion.button
            onClick={onNewSession}
            className="flex items-center px-6 py-3 text-gray-600 border border-gray-300 rounded-lg font-medium hover:bg-gray-100 hover:text-gray-900 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <LogOut className="w-4 h-4 mr-2" />
            New Session
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};