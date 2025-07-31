import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getActors, getActorSchema, runActor } from './services/apiService';
import { AuthForm } from './components/AuthForm';
import { ActorList } from './components/ActorList';
import { ActorForm } from './components/ActorForm';
import { ResultDisplay } from './components/ResultDisplay';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { Zap, ArrowLeft } from 'lucide-react';

interface Actor {
  id: string;
  name: string;
  description?: string;
}

interface RunResult {
  status: string;
  defaultDatasetId?: string;
  data?: any;
}

function App() {
  const [apiKey, setApiKey] = useState('');
  const [actors, setActors] = useState<Actor[]>([]);
  const [selectedActor, setSelectedActor] = useState<Actor | null>(null);
  const [inputSchema, setInputSchema] = useState<any>(null);
  const [runResult, setRunResult] = useState<RunResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [currentStep, setCurrentStep] = useState<'auth' | 'actors' | 'form' | 'result'>('auth');

  // Fetch actors when API key is set
  useEffect(() => {
    if (!apiKey) return;
    
    setIsLoading(true);
    setError('');
    
    getActors(apiKey)
      .then(response => {
        setActors(response.data);
        setCurrentStep('actors');
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to fetch actors. Please check your API key.');
      })
      .finally(() => setIsLoading(false));
  }, [apiKey]);

  // Fetch schema when an actor is selected
  useEffect(() => {
    if (!selectedActor || !apiKey) return;
    
    setIsLoading(true);
    setError('');
    setInputSchema(null);
    
    getActorSchema(selectedActor.id, apiKey)
      .then(response => {
        setInputSchema(response.data);
        setCurrentStep('form');
      })
      .catch(err => {
        setError(err.response?.data?.error || 'Failed to fetch actor schema.');
      })
      .finally(() => setIsLoading(false));
  }, [selectedActor, apiKey]);

  const handleAuth = async (key: string) => {
    setApiKey(key);
  };

  const handleSelectActor = (actor: Actor) => {
    setSelectedActor(actor);
  };

  const handleRunActor = async (runInput: any) => {
    if (!selectedActor) return;
    
    setIsLoading(true);
    setError('');
    setRunResult(null);
    
    try {
      const response = await runActor(selectedActor.id, runInput, apiKey);
      setRunResult(response.data);
      setCurrentStep('result');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Actor run failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedActor(null);
    setInputSchema(null);
    setRunResult(null);
    setError('');
    setCurrentStep('actors');
  };

  const handleBackToActors = () => {
    setSelectedActor(null);
    setInputSchema(null);
    setError('');
    setCurrentStep('actors');
  };

  const handleNewSession = () => {
    setApiKey('');
    setActors([]);
    setSelectedActor(null);
    setInputSchema(null);
    setRunResult(null);
    setError('');
    setCurrentStep('auth');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center justify-center mb-4">
            <div className="p-3 bg-blue-500 rounded-xl mr-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Apify Actor Runner</h1>
          </div>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Execute Apify actors with dynamic schema loading and real-time results
          </p>
        </motion.div>

        {/* Navigation Breadcrumb */}
        {currentStep !== 'auth' && (
          <motion.div 
            className="flex items-center mb-8 text-sm text-gray-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className={currentStep === 'actors' ? 'text-blue-600 font-medium' : ''}>
              Select Actor
            </span>
            {(currentStep === 'form' || currentStep === 'result') && (
              <>
                <span className="mx-2">→</span>
                <span className={currentStep === 'form' ? 'text-blue-600 font-medium' : ''}>
                  Configure Input
                </span>
              </>
            )}
            {currentStep === 'result' && (
              <>
                <span className="mx-2">→</span>
                <span className="text-blue-600 font-medium">View Results</span>
              </>
            )}
          </motion.div>
        )}

        {/* Error Display */}
        <AnimatePresence>
          {error && (
            <ErrorMessage 
              message={error} 
              onDismiss={() => setError('')}
            />
          )}
        </AnimatePresence>

        {/* Main Content */}
        <AnimatePresence mode="wait">
          {currentStep === 'auth' && (
            <AuthForm 
              key="auth"
              onAuthenticate={handleAuth} 
              isLoading={isLoading}
            />
          )}

          {currentStep === 'actors' && !isLoading && (
            <ActorList 
              key="actors"
              actors={actors} 
              onSelect={handleSelectActor}
              onNewSession={handleNewSession}
            />
          )}

          {currentStep === 'form' && !isLoading && inputSchema && (
            <ActorForm 
              key="form"
              schema={inputSchema}
              onSubmit={handleRunActor}
              onBack={handleBackToActors}
              actorName={selectedActor?.name || ''}
              isLoading={isLoading}
            />
          )}

          {currentStep === 'result' && runResult && (
            <ResultDisplay 
              key="result"
              result={runResult}
              onReset={handleReset}
              onNewSession={handleNewSession}
              actorName={selectedActor?.name || ''}
            />
          )}

          {isLoading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex justify-center py-16"
            >
              <LoadingSpinner />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Back Button */}
        {(currentStep === 'form' || currentStep === 'result') && !isLoading && (
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onClick={currentStep === 'form' ? handleBackToActors : handleReset}
            className="fixed bottom-6 left-6 flex items-center px-4 py-2 bg-white shadow-lg rounded-full text-gray-600 hover:text-gray-900 hover:shadow-xl transition-all duration-200 border border-gray-200"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </motion.button>
        )}
      </div>
    </div>
  );
}

export default App;