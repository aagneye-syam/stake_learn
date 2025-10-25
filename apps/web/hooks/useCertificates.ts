import { useState, useEffect } from 'react';
import { useAccount } from 'wagmi';
import { CertificateMetadata } from '@/types/certificate';

export function useCertificates() {
  const { address, isConnected } = useAccount();
  const [certificates, setCertificates] = useState<CertificateMetadata[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchCertificates = async () => {
    if (!address || !isConnected) {
      setCertificates([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // For now, we'll use mock certificates
      // In a real implementation, you'd fetch from a database or Lighthouse
      const mockCertificates: CertificateMetadata[] = [
        {
          cid: "QmExample1",
          studentAddress: address,
          courseId: 1,
          courseName: "Introduction to HTML",
          completionDate: new Date().toISOString().split('T')[0],
          uploadedAt: Math.floor(Date.now() / 1000),
          lighthouseUrl: "https://gateway.lighthouse.storage/ipfs/QmExample1",
          modules: [
            { id: 1, title: "HTML Basics", lessons: 8, duration: "2 hours" },
            { id: 2, title: "CSS Fundamentals", lessons: 10, duration: "3 hours" },
            { id: 3, title: "Responsive Design", lessons: 6, duration: "2.5 hours" },
            { id: 4, title: "Advanced CSS", lessons: 12, duration: "4 hours" }
          ],
          stakeAmount: "0.0001",
          completedAt: Math.floor(Date.now() / 1000)
        },
        {
          cid: "QmExample2",
          studentAddress: address,
          courseId: 2,
          courseName: "CSS Fundamentals",
          completionDate: new Date(Date.now() - 86400 * 1000).toISOString().split('T')[0], // 1 day ago
          uploadedAt: Math.floor(Date.now() / 1000) - 86400,
          lighthouseUrl: "https://gateway.lighthouse.storage/ipfs/QmExample2",
          modules: [
            { id: 1, title: "CSS Basics", lessons: 6, duration: "2 hours" },
            { id: 2, title: "Layout Techniques", lessons: 8, duration: "3 hours" },
            { id: 3, title: "Animations", lessons: 4, duration: "1.5 hours" },
            { id: 4, title: "Advanced CSS", lessons: 10, duration: "4 hours" }
          ],
          stakeAmount: "0.0001",
          completedAt: Math.floor(Date.now() / 1000) - 86400
        }
      ];

      setCertificates(mockCertificates);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch certificates');
      console.error('Certificate fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCertificates();
  }, [address, isConnected]);

  const addCertificate = (certificate: CertificateMetadata) => {
    setCertificates(prev => [certificate, ...prev]);
  };

  const getCertificateByCourseId = (courseId: number) => {
    return certificates.find(cert => cert.courseId === courseId);
  };

  const getTotalDataCoinsEarned = () => {
    return certificates.reduce((total, cert) => {
      return total + (cert.modules?.length || 0) * 3; // 3 DataCoins per module
    }, 0);
  };

  return {
    certificates,
    loading,
    error,
    fetchCertificates,
    addCertificate,
    getCertificateByCourseId,
    getTotalDataCoinsEarned
  };
}
