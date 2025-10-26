import { useState, useMemo } from 'react';
import { useAccount } from 'wagmi';
import { CertificateMetadata } from '@/types/certificate';
import { useTransactionsContext } from '@/_context/TransactionsContext';

export function useCertificates() {
  const { address, isConnected } = useAccount();
  const { transactions, loading, error: contextError, refetch } = useTransactionsContext();
  const [certificates, setCertificates] = useState<CertificateMetadata[]>([]);

  // Calculate certificates from cached transactions
  const calculatedCertificates = useMemo(() => {
    if (!address || !isConnected) {
      return [];
    }

    try {
      // Find completion transactions
      const completionTransactions = transactions.filter(
        (tx: any) => tx.type === 'complete'
      );

      // Convert completion transactions to certificates
      const certificatesFromTransactions: CertificateMetadata[] = completionTransactions.map((tx: any) => {
        const courseNames: { [key: string]: string } = {
          '1': 'Introduction to HTML',
          '2': 'CSS Fundamentals',
          '3': 'Responsive Design',
          '4': 'Advanced CSS',
          '5': 'JavaScript Basics',
          '6': 'React Fundamentals'
        };

        const courseName = courseNames[tx.courseId] || `Course ${tx.courseId}`;
        const completionDate = new Date(tx.timestamp * 1000).toISOString().split('T')[0];

        return {
          cid: tx.certificateCID || `Qm${Math.random().toString(36).substring(2, 15)}`,
          studentAddress: address,
          courseId: parseInt(tx.courseId),
          courseName: courseName,
          completionDate: completionDate,
          uploadedAt: tx.timestamp,
          lighthouseUrl: `https://gateway.lighthouse.storage/ipfs/${tx.certificateCID || 'QmExample'}`,
          modules: [
            { id: 1, title: `${courseName} Module 1`, lessons: 8, duration: "2 hours" },
            { id: 2, title: `${courseName} Module 2`, lessons: 10, duration: "3 hours" },
            { id: 3, title: `${courseName} Module 3`, lessons: 6, duration: "2.5 hours" },
            { id: 4, title: `${courseName} Module 4`, lessons: 12, duration: "4 hours" }
          ],
          stakeAmount: "0.0001",
          completedAt: tx.timestamp
        };
      });

      return certificatesFromTransactions;
    } catch (err) {
      console.error('Certificate calculation error:', err);
      return [];
    }
  }, [address, isConnected, transactions]);

  const addCertificate = (certificate: CertificateMetadata) => {
    setCertificates(prev => [certificate, ...prev]);
  };

  const getCertificateByCourseId = (courseId: number) => {
    return calculatedCertificates.find(cert => cert.courseId === courseId);
  };

  const getTotalDataCoinsEarned = () => {
    return calculatedCertificates.reduce((total, cert) => {
      return total + (cert.modules?.length || 0) * 3; // 3 DataCoins per module
    }, 0);
  };

  return {
    certificates: calculatedCertificates,
    loading,
    error: contextError,
    fetchCertificates: refetch,
    addCertificate,
    getCertificateByCourseId,
    getTotalDataCoinsEarned
  };
}
