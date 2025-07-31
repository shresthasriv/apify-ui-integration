import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Bot, ChevronRight, LogOut } from 'lucide-react';

interface Actor {
  id: string;
  name: string;
  description?: string;
}

interface ActorListProps {
  actors: Actor[];
  onSelect: (actor: Actor) => void;
  onNewSession: () => void;
}

export const ActorList: React.FC<ActorListProps> = ({ actors, onSelect, onNewSession }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredActors = actors.filter(actor =>
    actor.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden"
    >
      {/* Header */}
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
            <Bot className="w-6 h-6 mr-3 text-blue-600" />
            Select an Actor
          </h2>
          <button
            onClick={onNewSession}
            className="flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200"
          >
            <LogOut className="w-4 h-4 mr-2" />
            New Session
          </button>
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search actors..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-white"
          />
        </div>
      </div>

      {/* Actor List */}
      <div className="max-h-96 overflow-y-auto">
        {filteredActors.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'No actors found matching your search.' : 'No actors available.'}
          </div>
        ) : (
          <div className="p-2 space-y-1">
            {filteredActors.map((actor, index) => (
              <motion.button
                key={actor.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => onSelect(actor)}
                className="w-full p-4 text-left hover:bg-blue-50 rounded-lg transition-all duration-200 group flex items-center justify-between"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-700 transition-colors duration-200 truncate">
                    {actor.name}
                  </h3>
                  {actor.description && (
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                      {actor.description}
                    </p>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors duration-200 flex-shrink-0 ml-4" />
              </motion.button>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-gray-100 bg-gray-50 text-sm text-gray-600 text-center">
        Found {filteredActors.length} of {actors.length} actors
      </div>
    </motion.div>
  );
};