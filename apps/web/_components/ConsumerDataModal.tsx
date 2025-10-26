"use client";
import { useState, useEffect } from 'react';
import { useConsumerData } from '@/hooks/useConsumerData';

interface ConsumerDataModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSource?: 'github' | 'uber' | 'amazon';
}

export function ConsumerDataModal({ isOpen, onClose, selectedSource }: ConsumerDataModalProps) {
  const [currentStep, setCurrentStep] = useState<'select' | 'requesting' | 'verifying' | 'success' | 'error'>('select');
  const [selectedDataSource, setSelectedDataSource] = useState<'github' | 'uber' | 'amazon' | null>(selectedSource || null);
  const [proofUrl, setProofUrl] = useState<string>('');
  const [dataCoinsEarned, setDataCoinsEarned] = useState<number>(0);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [proofData, setProofData] = useState<string>('');

  const {
    requestProof,
    submitProof,
    mockVerify,
    loading,
    error,
    hasConnectedSource,
    getDataCoinsBySource,
  } = useConsumerData();

  // Reset state when modal opens/closes
  useEffect(() => {
    if (isOpen) {
      setCurrentStep('select');
      setSelectedDataSource(selectedSource || null);
      setProofUrl('');
      setDataCoinsEarned(0);
      setErrorMessage('');
      setProofData('');
    }
  }, [isOpen, selectedSource]);

  const dataSources = [
    {
      id: 'github' as const,
      name: 'GitHub',
      description: 'Verify your code contributions, commits, and pull requests',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
        </svg>
      ),
      reward: '10 DataCoins per contribution batch',
      color: 'from-gray-800 to-gray-600',
    },
    {
      id: 'uber' as const,
      name: 'Uber',
      description: 'Verify your ride history and transportation data',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M0 24h24V0H0v24z" fill="none"/>
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
      ),
      reward: '5 DataCoins per month of data',
      color: 'from-black to-gray-800',
    },
    {
      id: 'amazon' as const,
      name: 'Amazon',
      description: 'Verify your purchase history and shopping patterns',
      icon: (
        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
          <path d="M7.77 6.76L6.23 8.3c-.45.45-.45 1.18 0 1.63l1.54 1.54c.45.45 1.18.45 1.63 0l1.54-1.54c.45-.45.45-1.18 0-1.63L9.4 6.76c-.45-.45-1.18-.45-1.63 0zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"/>
        </svg>
      ),
      reward: '5 DataCoins per month of data',
      color: 'from-orange-500 to-orange-600',
    },
  ];

  const handleSourceSelect = (source: 'github' | 'uber' | 'amazon') => {
    setSelectedDataSource(source);
    setCurrentStep('requesting');
    setErrorMessage('');
  };

  const handleRequestProof = async () => {
    if (!selectedDataSource) return;

    setCurrentStep('requesting');
    setErrorMessage('');

    try {
      const result = await requestProof(selectedDataSource);
      
      if (result.success && result.url) {
        setProofUrl(result.url);
        setCurrentStep('verifying');
        
        // In a real implementation, you would open the URL in a popup
        // and wait for the user to complete the verification
        // For now, we'll simulate the process
        setTimeout(() => {
          handleMockVerification();
        }, 2000);
      } else {
        setErrorMessage(result.error || 'Failed to request proof');
        setCurrentStep('error');
      }
    } catch (err) {
      setErrorMessage('An unexpected error occurred');
      setCurrentStep('error');
    }
  };

  const handleMockVerification = async () => {
    if (!selectedDataSource) return;

    try {
      const result = await mockVerify(selectedDataSource);
      
      if (result.success) {
        setDataCoinsEarned(result.dataCoinsEarned || 0);
        setCurrentStep('success');
      } else {
        setErrorMessage(result.error || 'Verification failed');
        setCurrentStep('error');
      }
    } catch (err) {
      setErrorMessage('Verification failed');
      setCurrentStep('error');
    }
  };

  const handleClose = () => {
    setCurrentStep('select');
    setSelectedDataSource(null);
    setProofUrl('');
    setDataCoinsEarned(0);
    setErrorMessage('');
    setProofData('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">Connect Consumer Data</h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {currentStep === 'select' && (
            <div className="space-y-4">
              <p className="text-gray-600 mb-6">
                Connect your data sources to earn DataCoins. Your data is verified using zero-knowledge proofs 
                and stored securely on IPFS.
              </p>
              
              {dataSources.map((source) => (
                <div
                  key={source.id}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                    hasConnectedSource(source.id)
                      ? 'border-green-200 bg-green-50'
                      : 'border-gray-200 hover:border-purple-300 hover:bg-purple-50'
                  }`}
                  onClick={() => handleSourceSelect(source.id)}
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-lg bg-gradient-to-r ${source.color} text-white`}>
                      {source.icon}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold text-gray-900">{source.name}</h3>
                        {hasConnectedSource(source.id) && (
                          <span className="text-green-600 text-sm">✓ Connected</span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{source.description}</p>
                      <p className="text-sm text-purple-600 font-medium mt-1">{source.reward}</p>
                      {hasConnectedSource(source.id) && (
                        <p className="text-sm text-green-600 mt-1">
                          Earned: {getDataCoinsBySource(source.id)} DataCoins
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {currentStep === 'requesting' && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Requesting Proof</h3>
              <p className="text-gray-600">
                Initializing Reclaim Protocol for {selectedDataSource} verification...
              </p>
            </div>
          )}

          {currentStep === 'verifying' && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent mb-4"></div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Verifying Data</h3>
              <p className="text-gray-600 mb-4">
                Verifying your {selectedDataSource} data using zero-knowledge proofs...
              </p>
              {proofUrl && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-sm text-blue-800">
                    In a real implementation, you would complete verification at:
                  </p>
                  <p className="text-xs text-blue-600 font-mono break-all mt-1">{proofUrl}</p>
                </div>
              )}
            </div>
          )}

          {currentStep === 'success' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Verification Successful!</h3>
              <p className="text-gray-600 mb-4">
                Your {selectedDataSource} data has been verified and stored securely.
              </p>
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <p className="text-green-800 font-semibold">
                  🪙 Earned {dataCoinsEarned} DataCoins!
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Continue
              </button>
            </div>
          )}

          {currentStep === 'error' && (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Verification Failed</h3>
              <p className="text-gray-600 mb-4">{errorMessage}</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setCurrentStep('select')}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Try Again
                </button>
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
