import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, ArrowLeft, Settings } from 'lucide-react';

interface ActorFormProps {
  schema: any;
  onSubmit: (data: any) => void;
  onBack: () => void;
  actorName: string;
  isLoading: boolean;
}

export const ActorForm: React.FC<ActorFormProps> = ({ 
  schema, 
  onSubmit, 
  onBack, 
  actorName, 
  isLoading 
}) => {
  const [formData, setFormData] = useState<any>({});

  const commonClasses = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-gray-50 focus:bg-white";

  useEffect(() => {
    // Pre-fill form with default values from schema
    const defaults: any = {};
    if (schema.properties) {
      for (const key in schema.properties) {
        const field = schema.properties[key];
        if (field.default !== undefined) {
          defaults[key] = field.default;
        }
      }
    }
    setFormData(defaults);
  }, [schema]);

  const handleChange = (key: string, value: any, type: string) => {
    let processedValue = value;
    
    if (type === 'boolean') {
      processedValue = value;
    } else if (type === 'number' || type === 'integer') {
      processedValue = value === '' ? undefined : parseFloat(value);
    } else if (type === 'array' || type === 'object') {
      try {
        processedValue = value === '' ? undefined : JSON.parse(value);
      } catch {
        processedValue = value; // Keep as string if invalid JSON
      }
    }
    
    setFormData((prev: any) => ({ ...prev, [key]: processedValue }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderField = (key: string, field: any) => {
    const { title, type, editor, enum: enumValues } = field;
    const value = formData[key] ?? '';

    const commonClasses = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 bg-gray-50 focus:bg-white";

    if (enumValues && Array.isArray(enumValues)) {
      return (
        <select
          value={value}
          onChange={(e) => handleChange(key, e.target.value, type)}
          className={commonClasses}
        >
          <option value="">Select an option</option>
          {enumValues.map((option: any) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      );
    }

    if (editor === 'json' || type === 'array' || type === 'object') {
      return (
        <textarea
          rows={6}
          value={typeof value === 'object' ? JSON.stringify(value, null, 2) : value}
          onChange={(e) => handleChange(key, e.target.value, type)}
          className={`${commonClasses} font-mono text-sm resize-y`}
          placeholder={`Enter ${type === 'array' ? 'array' : 'object'} as JSON`}
        />
      );
    }

    switch (type) {
      case 'boolean':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={!!value}
              onChange={(e) => handleChange(key, e.target.checked, type)}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <label className="ml-3 text-sm text-gray-700">
              {title || key}
            </label>
          </div>
        );
      case 'integer':
      case 'number':
        return (
          <input
            type="number"
            value={value || ''}
            onChange={(e) => handleChange(key, e.target.value, type)}
            className={commonClasses}
            placeholder={`Enter ${type}`}
          />
        );
      case 'string':
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => handleChange(key, e.target.value, type)}
            className={commonClasses}
            placeholder={`Enter ${type}`}
          />
        );
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
      <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-blue-50">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
              <Settings className="w-6 h-6 mr-3 text-emerald-600" />
              Configure {actorName}
            </h2>
            <p className="text-gray-600 mt-1">
              Set the input parameters for your actor run
            </p>
          </div>
          <button
            onClick={onBack}
            disabled={isLoading}
            className="flex items-center px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-white rounded-lg transition-all duration-200 disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </button>
        </div>
      </div>

      {/* Form */}
      <div className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {schema.properties && Object.entries(schema.properties).map(([key, field]: [string, any], index) => (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="space-y-2"
            >
              {field.type !== 'boolean' && (
                <label className="block text-sm font-medium text-gray-700">
                  {field.title || key}
                  {schema.required?.includes(key) && (
                    <span className="text-red-500 ml-1">*</span>
                  )}
                </label>
              )}
              {field.description && (
                <p className="text-sm text-gray-500">{field.description}</p>
              )}
              {renderField(key, field)}
            </motion.div>
          ))}

          {!schema.properties && schema && typeof schema === 'object' && Object.keys(schema).length > 0 &&
            Object.entries(schema).map(([key, value], index) => {
              const isArray = Array.isArray(value);
              return (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="space-y-2"
                >
                  <label className="block text-sm font-medium text-gray-700">{key}</label>
                  {typeof value === 'boolean' ? (
                    <input
                      type="checkbox"
                      checked={!!formData[key]}
                      onChange={e => handleChange(key, e.target.checked, 'boolean')}
                      className={commonClasses}
                    />
                  ) : isArray ? (
                    <input
                      type="text"
                      value={Array.isArray(formData[key]) ? formData[key].join(', ') : (formData[key] ?? value.join(', '))}
                      onChange={e => handleChange(key, e.target.value.split(',').map((v: string) => v.trim()), 'array')}
                      className={commonClasses}
                      placeholder="comma,separated,values"
                    />
                  ) : typeof value === 'number' ? (
                    <input
                      type="number"
                      value={formData[key] ?? value}
                      onChange={e => handleChange(key, e.target.value, 'number')}
                      className={commonClasses}
                    />
                  ) : (
                    <input
                      type="text"
                      value={formData[key] ?? value}
                      onChange={e => handleChange(key, e.target.value, 'string')}
                      className={commonClasses}
                    />
                  )}
                </motion.div>
              );
            })
          }

          <div className="flex items-center space-x-4 pt-6 border-t border-gray-100">
            <motion.button
              type="submit"
              disabled={isLoading}
              className="flex-1 flex items-center justify-center bg-black text-white py-3 px-6 rounded-lg font-medium hover:bg-gray-800 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: isLoading ? 1 : 1.02 }}
              whileTap={{ scale: isLoading ? 1 : 0.98 }}
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Running Actor...
                </>
              ) : (
                <>
                  <Play className="w-5 h-5 mr-2" />
                  Run Actor
                </>
              )}
            </motion.button>
          </div>
        </form>
      </div>
    </motion.div>
  );
};