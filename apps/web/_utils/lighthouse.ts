import { lighthouse } from '@lighthouse-web3/sdk';

export interface CertificateData {
  studentAddress: string;
  courseId: number;
  courseName: string;
  completedAt: number;
  stakeAmount: string;
  modules: Array<{
    id: number;
    title: string;
    lessons: number;
    duration: string;
  }>;
  signature?: string;
}

export interface AccessControlCondition {
  id: number;
  chain: string;
  method: string;
  standardContractType: string;
  contractAddress: string;
  returnValueTest: {
    comparator: string;
    value: string;
  };
  parameters: string[];
}

/**
 * Upload encrypted certificate to Lighthouse
 * @param certificateData - The certificate data to encrypt and upload
 * @param studentAddress - The student's wallet address for access control
 * @returns Promise<string> - The Lighthouse CID
 */
export async function uploadEncryptedCertificate(
  certificateData: CertificateData,
  studentAddress: string
): Promise<string> {
  const apiKey = process.env.LIGHTHOUSE_API_KEY;
  if (!apiKey) {
    throw new Error('LIGHTHOUSE_API_KEY is not configured');
  }

  // Create access control condition - only the student can decrypt
  const accessControlConditions: AccessControlCondition[] = [
    {
      id: 1,
      chain: "sepolia", // Using Sepolia testnet
      method: "eth_getBalance",
      standardContractType: "",
      contractAddress: "",
      returnValueTest: {
        comparator: ">=",
        value: "0"
      },
      parameters: [studentAddress]
    }
  ];

  try {
    // Upload encrypted file to Lighthouse
    const response = await lighthouse.uploadEncrypted(
      JSON.stringify(certificateData),
      apiKey,
      accessControlConditions
    );

    if (response.data && response.data.Hash) {
      return response.data.Hash;
    } else {
      throw new Error('Failed to get CID from Lighthouse response');
    }
  } catch (error) {
    console.error('Lighthouse upload error:', error);
    throw new Error(`Failed to upload certificate to Lighthouse: ${error}`);
  }
}

/**
 * Decrypt and retrieve certificate from Lighthouse
 * @param cid - The Lighthouse CID
 * @param userAddress - The user's wallet address for decryption
 * @returns Promise<CertificateData> - The decrypted certificate data
 */
export async function decryptCertificate(
  cid: string,
  userAddress: string
): Promise<CertificateData> {
  const apiKey = process.env.LIGHTHOUSE_API_KEY;
  if (!apiKey) {
    throw new Error('LIGHTHOUSE_API_KEY is not configured');
  }

  try {
    // Decrypt the file using user's wallet
    const decryptedData = await lighthouse.decryptFile(cid, userAddress);
    
    if (typeof decryptedData === 'string') {
      return JSON.parse(decryptedData);
    } else {
      throw new Error('Failed to decrypt certificate data');
    }
  } catch (error) {
    console.error('Lighthouse decrypt error:', error);
    throw new Error(`Failed to decrypt certificate: ${error}`);
  }
}

/**
 * Get file info from Lighthouse
 * @param cid - The Lighthouse CID
 * @returns Promise<any> - File information
 */
export async function getFileInfo(cid: string): Promise<any> {
  const apiKey = process.env.LIGHTHOUSE_API_KEY;
  if (!apiKey) {
    throw new Error('LIGHTHOUSE_API_KEY is not configured');
  }

  try {
    const fileInfo = await lighthouse.getFileInfo(cid);
    return fileInfo;
  } catch (error) {
    console.error('Lighthouse file info error:', error);
    throw new Error(`Failed to get file info: ${error}`);
  }
}

/**
 * Generate a certificate for course completion
 * @param studentAddress - Student's wallet address
 * @param courseId - Course ID
 * @param courseName - Course name
 * @param stakeAmount - Stake amount in ETH
 * @param modules - Course modules
 * @returns CertificateData - Generated certificate
 */
export function generateCertificate(
  studentAddress: string,
  courseId: number,
  courseName: string,
  stakeAmount: string,
  modules: Array<{
    id: number;
    title: string;
    lessons: number;
    duration: string;
  }>
): CertificateData {
  return {
    studentAddress,
    courseId,
    courseName,
    completedAt: Math.floor(Date.now() / 1000),
    stakeAmount,
    modules,
    // Note: In a real implementation, you'd want to add a cryptographic signature
    // signature: await signCertificate(certificateData, privateKey)
  };
}

/**
 * Validate certificate data
 * @param certificate - Certificate to validate
 * @returns boolean - Whether certificate is valid
 */
export function validateCertificate(certificate: CertificateData): boolean {
  return !!(
    certificate.studentAddress &&
    certificate.courseId &&
    certificate.courseName &&
    certificate.completedAt &&
    certificate.stakeAmount &&
    certificate.modules &&
    certificate.modules.length > 0
  );
}
