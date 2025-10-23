"use client";

import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { CertificateViewer } from "@/components/CertificateViewer";
import { CertificateMetadata } from "@/types/certificate";

export default function CertificatePage() {
  const { address, isConnected } = useAccount();
  const searchParams = useSearchParams();
  const courseId = searchParams.get('course');
  const cid = searchParams.get('cid');
  const [certificates, setCertificates] = useState<CertificateMetadata[]>([]);
  const [showCertificate, setShowCertificate] = useState(false);

  useEffect(() => {
    // If we have a course ID or CID, show the certificate viewer
    if (courseId || cid) {
      setShowCertificate(true);
    }
  }, [courseId, cid]);

  useEffect(() => {
    // TODO: Fetch user's certificates from Lighthouse
    // This would query stored certificate metadata
    if (address && isConnected) {
      // Mock data for now
      setCertificates([
        {
          cid: "QmExample1",
          studentAddress: address,
          courseId: 1,
          uploadedAt: Math.floor(Date.now() / 1000),
          lighthouseUrl: "https://gateway.lighthouse.storage/ipfs/QmExample1"
        }
      ]);
    }
  }, [address, isConnected]);

  // Show certificate viewer if we have a specific certificate to view
  if (showCertificate && cid) {
    return (
      <CertificateViewer 
        cid={cid} 
        courseName={`Course ${courseId || 'Unknown'}`}
        onClose={() => {
          setShowCertificate(false);
          // Navigate back to courses or dashboard
          window.history.back();
        }}
      />
    );
  }

  if (!mounted) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Connect Your Wallet
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Connect your wallet to view your certificates and achievements
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-4">
          My Certificates
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Your verified contributions and achievements
        </p>
      </div>

      {/* Certificates Grid */}
      {certificates.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            No Certificates Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Complete courses to earn your first certificate stored on Lighthouse
          </p>
          <a
            href="/courses"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Browse Courses
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((cert, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700 hover:shadow-xl transition-all"
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    Course {cert.courseId} Certificate
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Lighthouse Encrypted
                  </p>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Course ID</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {cert.courseId}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Lighthouse CID</span>
                  <span className="font-mono text-xs text-gray-500 dark:text-gray-400">
                    {cert.cid.slice(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-400">Date</span>
                  <span className="text-gray-900 dark:text-white">
                    {new Date(cert.uploadedAt * 1000).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setShowCertificate(true);
                    // Update URL to include CID
                    window.history.pushState({}, '', `/certificate?cid=${cert.cid}`);
                  }}
                  className="flex-1 px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-medium hover:from-purple-700 hover:to-blue-700 transition-all"
                >
                  View Certificate
                </button>
                <a
                  href={cert.lighthouseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Lighthouse
                </a>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info Section */}
      <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-2xl p-8 border border-purple-100 dark:border-purple-800">
        <div className="text-center max-w-2xl mx-auto">
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            What are Certificates?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Certificates are Soulbound Tokens (SBTs) that prove your contributions to open source projects. 
            They are non-transferable and serve as verifiable proof of your work on the blockchain.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300">Verified by AI</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300">Non-transferable</span>
            </div>
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-gray-700 dark:text-gray-300">On-chain proof</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
