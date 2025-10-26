"use client";

import { useState, useEffect } from 'react';
import { useConsumerData } from '@/hooks/useConsumerData';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Github, Car, ShoppingBag, CheckCircle, AlertCircle } from 'lucide-react';

interface ConsumerDataModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DATA_SOURCES = [
  {
    id: 'github',
    name: 'GitHub',
    description: 'Verify your code contributions',
    icon: Github,
    color: 'from-gray-800 to-gray-600',
    reward: '10 DataCoins per batch',
    features: ['Commits', 'Pull Requests', 'Issues', 'Repositories']
  },
  {
    id: 'uber',
    name: 'Uber',
    description: 'Verify your ride history',
    icon: Car,
    color: 'from-black to-gray-800',
    reward: '5 DataCoins per month',
    features: ['Ride Count', 'Total Distance', 'Spending Patterns']
  },
  {
    id: 'amazon',
    name: 'Amazon',
    description: 'Verify your purchase history',
    icon: ShoppingBag,
    color: 'from-orange-500 to-orange-600',
    reward: '5 DataCoins per month',
    features: ['Order History', 'Categories', 'Spending Analysis']
  }
] as const;

type DataSource = typeof DATA_SOURCES[number]['id'];

export function ConsumerDataModal({ isOpen, onClose }: ConsumerDataModalProps) {
  const { 
    stats, 
    loading, 
    error, 
    requestProof, 
    submitProof, 
    hasConnectedSource,
    getDataCoinsBySource 
  } = useConsumerData();

  const [selectedSource, setSelectedSource] = useState<DataSource | null>(null);
  const [proofData, setProofData] = useState<string>('');
  const [zkProof, setZkProof] = useState<string>('');
  const [step, setStep] = useState<'select' | 'request' | 'submit' | 'success'>('select');
  const [requestUrl, setRequestUrl] = useState<string>('');

  // Reset modal state when opened
  useEffect(() => {
    if (isOpen) {
      setStep('select');
      setSelectedSource(null);
      setProofData('');
      setZkProof('');
      setRequestUrl('');
    }
  }, [isOpen]);

  const handleSourceSelect = (source: DataSource) => {
    setSelectedSource(source);
    setStep('request');
  };

  const handleRequestProof = async () => {
    if (!selectedSource) return;

    const result = await requestProof(selectedSource);
    
    if (result.success && result.url) {
      setRequestUrl(result.url);
      setStep('submit');
    } else {
      console.error('Failed to request proof:', result.error);
    }
  };

  const handleSubmitProof = async () => {
    if (!selectedSource || !proofData || !zkProof) return;

    const result = await submitProof(selectedSource, proofData, zkProof);
    
    if (result.success) {
      setStep('success');
    } else {
      console.error('Failed to submit proof:', result.error);
    }
  };

  const handleClose = () => {
    setStep('select');
    setSelectedSource(null);
    setProofData('');
    setZkProof('');
    setRequestUrl('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Connect Consumer Data</h2>
              <p className="text-gray-600">Verify your real-world data to earn DataCoins</p>
            </div>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-gray-500" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6">
            {step === 'select' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {DATA_SOURCES.map((source) => {
                    const Icon = source.icon;
                    const isConnected = hasConnectedSource(source.id);
                    const dataCoinsEarned = getDataCoinsBySource(source.id);

                    return (
                      <motion.button
                        key={source.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleSourceSelect(source.id)}
                        className={`p-6 rounded-xl border-2 transition-all text-left ${
                          isConnected 
                            ? 'border-green-200 bg-green-50' 
                            : 'border-gray-200 bg-white hover:border-purple-300 hover:bg-purple-50'
                        }`}
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div className={`p-3 rounded-lg bg-gradient-to-r ${source.color} text-white`}>
                            <Icon className="w-6 h-6" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{source.name}</h3>
                            <p className="text-sm text-gray-600">{source.description}</p>
                          </div>
                          {isConnected && (
                            <CheckCircle className="w-5 h-5 text-green-600 ml-auto" />
                          )}
                        </div>
                        
                        <div className="space-y-2">
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Reward</span>
                            <span className="font-medium text-purple-600">{source.reward}</span>
                          </div>
                          {isConnected && (
                            <div className="flex justify-between text-sm">
                              <span className="text-gray-600">Earned</span>
                              <span className="font-medium text-green-600">{dataCoinsEarned} DataCoins</span>
                            </div>
                          )}
                        </div>

                        <div className="mt-3">
                          <div className="text-xs text-gray-500 mb-2">Verifies:</div>
                          <div className="flex flex-wrap gap-1">
                            {source.features.map((feature) => (
                              <span
                                key={feature}
                                className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {/* Stats Summary */}
                <div className="mt-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-gray-900">Total Consumer DataCoins</h4>
                      <p className="text-sm text-gray-600">
                        {stats.totalContributions} connected sources
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-purple-600">
                        {stats.totalDataCoins}
                      </p>
                      <p className="text-sm text-gray-600">DataCoins earned</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {step === 'request' && selectedSource && (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🔗</span>
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Connect {DATA_SOURCES.find(s => s.id === selectedSource)?.name}
                  </h3>
                  <p className="text-gray-600">
                    Click below to generate a secure proof of your data
                  </p>
                </div>
                <button
                  onClick={handleRequestProof}
                  disabled={loading}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50"
                >
                  {loading ? 'Generating Proof...' : 'Generate Proof'}
                </button>
              </div>
            )}

            {step === 'submit' && selectedSource && (
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Submit Your Proof
                  </h3>
                  <p className="text-gray-600">
                    Copy the proof data from the Reclaim Protocol window and paste it below
                  </p>
                </div>

                {requestUrl && (
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 mb-2">
                      If the Reclaim window didn't open automatically:
                    </p>
                    <a
                      href={requestUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline"
                    >
                      Click here to open Reclaim Protocol
                    </a>
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Proof Data
                    </label>
                    <textarea
                      value={proofData}
                      onChange={(e) => setProofData(e.target.value)}
                      placeholder="Paste the proof data here..."
                      className="w-full h-32 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      ZK Proof (optional)
                    </label>
                    <textarea
                      value={zkProof}
                      onChange={(e) => setZkProof(e.target.value)}
                      placeholder="Paste the ZK proof here (if available)..."
                      className="w-full h-24 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep('select')}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={handleSubmitProof}
                    disabled={!proofData || loading}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all disabled:opacity-50"
                  >
                    {loading ? 'Verifying...' : 'Submit Proof'}
                  </button>
                </div>
              </div>
            )}

            {step === 'success' && (
              <div className="text-center space-y-6">
                <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-8 h-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Data Verified Successfully!
                  </h3>
                  <p className="text-gray-600">
                    Your consumer data has been verified and DataCoins have been minted
                  </p>
                </div>
                <button
                  onClick={handleClose}
                  className="px-6 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 transition-all"
                >
                  Continue
                </button>
              </div>
            )}

            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-3">
                <AlertCircle className="w-5 h-5 text-red-600" />
                <span className="text-red-800">{error}</span>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}