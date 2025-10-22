"use client";

import { motion, AnimatePresence } from "framer-motion";

interface WalletConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const wallets = [
  {
    name: "MetaMask",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
        <path d="M36.5 2L22.5 12.5L25 7.5L36.5 2Z" fill="#E17726" stroke="#E17726" strokeWidth="0.25"/>
        <path d="M3.5 2L17.25 12.65L15 7.5L3.5 2Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
        <path d="M31.5 27.5L28 33L35.5 35L37.5 27.65L31.5 27.5Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
        <path d="M2.5 27.65L4.5 35L12 33L8.5 27.5L2.5 27.65Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
        <path d="M11.5 17.5L9.5 20.5L17 20.85L16.75 12.85L11.5 17.5Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
        <path d="M28.5 17.5L23.15 12.75L23 20.85L30.5 20.5L28.5 17.5Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
        <path d="M12 33L16.5 30.85L12.65 27.7L12 33Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
        <path d="M23.5 30.85L28 33L27.35 27.7L23.5 30.85Z" fill="#E27625" stroke="#E27625" strokeWidth="0.25"/>
      </svg>
    ),
    description: "Connect to your MetaMask wallet",
    gradient: "from-orange-400 to-orange-600",
  },
  {
    name: "Coinbase Wallet",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="20" fill="#0052FF"/>
        <path d="M20 30C25.5228 30 30 25.5228 30 20C30 14.4772 25.5228 10 20 10C14.4772 10 10 14.4772 10 20C10 25.5228 14.4772 30 20 30Z" fill="white"/>
        <path d="M16 18H24V22H16V18Z" fill="#0052FF"/>
        <path d="M18 16H22V24H18V16Z" fill="#0052FF"/>
      </svg>
    ),
    description: "Connect to your Coinbase wallet",
    gradient: "from-blue-500 to-blue-700",
  },
  {
    name: "WalletConnect",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="20" fill="#3B99FC"/>
        <path d="M13 16.5C17.5 12 22.5 12 27 16.5L27.5 17L25.5 19L25 18.5C21.5 15 18.5 15 15 18.5L14.5 19L12.5 17L13 16.5Z" fill="white"/>
        <path d="M17 21.5L19 23.5L21 21.5L23 23.5L21 25.5L19 23.5L17 25.5L15 23.5L17 21.5Z" fill="white"/>
      </svg>
    ),
    description: "Scan with WalletConnect to connect",
    gradient: "from-cyan-400 to-blue-500",
  },
  {
    name: "Trust Wallet",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="20" fill="url(#trust-gradient)"/>
        <defs>
          <linearGradient id="trust-gradient" x1="0" y1="0" x2="40" y2="40">
            <stop stopColor="#3375BB"/>
            <stop offset="1" stopColor="#2E9FE6"/>
          </linearGradient>
        </defs>
        <path d="M20 10L12 14V20C12 25.5 15.5 30 20 32C24.5 30 28 25.5 28 20V14L20 10Z" fill="white"/>
      </svg>
    ),
    description: "Connect to your Trust wallet",
    gradient: "from-blue-600 to-blue-800",
  },
  {
    name: "Rainbow",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="20" fill="url(#rainbow-gradient)"/>
        <defs>
          <linearGradient id="rainbow-gradient" x1="0" y1="0" x2="40" y2="40">
            <stop offset="0%" stopColor="#FF4D4D"/>
            <stop offset="25%" stopColor="#FFD93D"/>
            <stop offset="50%" stopColor="#6BCF7F"/>
            <stop offset="75%" stopColor="#4D9EFF"/>
            <stop offset="100%" stopColor="#B84DFF"/>
          </linearGradient>
        </defs>
        <circle cx="20" cy="20" r="8" fill="white"/>
      </svg>
    ),
    description: "Connect to your Rainbow wallet",
    gradient: "from-pink-500 via-purple-500 to-indigo-500",
  },
  {
    name: "Phantom",
    icon: (
      <svg className="w-8 h-8" viewBox="0 0 40 40" fill="none">
        <rect width="40" height="40" rx="20" fill="url(#phantom-gradient)"/>
        <defs>
          <linearGradient id="phantom-gradient" x1="0" y1="0" x2="40" y2="40">
            <stop stopColor="#AB9FF2"/>
            <stop offset="1" stopColor="#4E44CE"/>
          </linearGradient>
        </defs>
        <ellipse cx="20" cy="22" rx="12" ry="10" fill="white"/>
        <circle cx="16" cy="20" r="2" fill="#4E44CE"/>
        <circle cx="24" cy="20" r="2" fill="#4E44CE"/>
      </svg>
    ),
    description: "Connect to your Phantom wallet",
    gradient: "from-purple-400 to-purple-700",
  },
];

export default function WalletConnectModal({ isOpen, onClose }: WalletConnectModalProps) {
  const handleWalletClick = (walletName: string) => {
    console.log(`Connecting to ${walletName}...`);
    // TODO: Implement actual wallet connection logic here
    // For now, just close the modal
    setTimeout(() => {
      onClose();
    }, 500);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden"
            >
              {/* Header */}
              <div className="relative p-6 border-b border-gray-100">
                <button
                  onClick={onClose}
                  className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
                <h2 className="text-2xl font-bold text-gray-900 text-center">Connect Wallet</h2>
                <p className="text-sm text-gray-600 text-center mt-2">
                  Choose your preferred wallet to continue
                </p>
              </div>

              {/* Wallet Options */}
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
                <div className="space-y-3">
                  {wallets.map((wallet, index) => (
                    <motion.button
                      key={wallet.name}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleWalletClick(wallet.name)}
                      className="w-full p-4 rounded-2xl border-2 border-gray-100 hover:border-gray-300 transition-all duration-200 flex items-center gap-4 group hover:shadow-lg"
                    >
                      {/* Icon Container */}
                      <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${wallet.gradient} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                        {wallet.icon}
                      </div>

                      {/* Content */}
                      <div className="flex-1 text-left">
                        <h3 className="font-bold text-gray-900 text-lg group-hover:text-gray-700 transition-colors">
                          {wallet.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {wallet.description}
                        </p>
                      </div>

                      {/* Arrow Icon */}
                      <svg className="w-5 h-5 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.button>
                  ))}
                </div>

                {/* Footer Info */}
                <div className="mt-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                  <div className="flex items-start gap-3">
                    <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="flex-1">
                      <h4 className="text-sm font-semibold text-blue-900 mb-1">New to wallets?</h4>
                      <p className="text-xs text-blue-700">
                        A wallet is used to send, receive, and store digital assets. We recommend MetaMask for beginners.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
