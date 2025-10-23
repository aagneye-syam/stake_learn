# Lighthouse Integration Guide

This guide explains how to set up and use Lighthouse storage for encrypted certificate storage in the StakeLearn platform.

## Overview

Lighthouse is used to store encrypted course completion certificates. Each certificate is encrypted with access control conditions that only allow the certificate owner (student) to decrypt and view their certificates.

## Setup

### 1. Get Lighthouse API Key

1. Visit [Lighthouse Storage](https://lighthouse.storage/)
2. Create an account and get your API key
3. Add the API key to your environment variables:

```bash
LIGHTHOUSE_API_KEY=your_lighthouse_api_key_here
```

### 2. Install Dependencies

The Lighthouse SDK is already installed in the project:

```bash
npm install @lighthouse-web3/sdk
```

## Features

### Encrypted Certificate Storage

- **Access Control**: Only the certificate owner can decrypt their certificates
- **Privacy**: Certificates are encrypted on Lighthouse
- **Decentralized**: Stored on IPFS via Lighthouse
- **Verifiable**: Certificates include cryptographic signatures

### Certificate Structure

```typescript
interface CertificateData {
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
```

## API Endpoints

### Upload Certificate

```typescript
POST /api/completion
{
  "studentAddress": "0x...",
  "courseId": 1,
  "courseName": "HTML & CSS Fundamentals",
  "stakeAmount": "0.0001",
  "modules": [...]
}
```

### Retrieve Certificate

```typescript
GET /api/completion?cid=QmExample&userAddress=0x...
```

## Usage Examples

### Uploading a Certificate

```typescript
import { uploadEncryptedCertificate, generateCertificate } from '@/utils/lighthouse';

const certificate = generateCertificate(
  studentAddress,
  courseId,
  courseName,
  stakeAmount,
  modules
);

const cid = await uploadEncryptedCertificate(certificate, studentAddress);
```

### Decrypting a Certificate

```typescript
import { decryptCertificate } from '@/utils/lighthouse';

const certificate = await decryptCertificate(cid, userAddress);
```

## Access Control

Certificates use Lighthouse's access control conditions to ensure only the owner can decrypt:

```typescript
const accessControlConditions = [
  {
    id: 1,
    chain: "sepolia",
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
```

## Integration with Smart Contracts

The StakingManager contract emits certificate CIDs when courses are completed:

```solidity
event CourseCompleted(address indexed user, uint256 indexed courseId, string certificateCID);
```

## Security Considerations

1. **Private Keys**: Never expose private keys in frontend code
2. **Access Control**: Certificates are encrypted with wallet-based access control
3. **Verification**: Certificates include timestamps and course completion data
4. **Decentralized Storage**: Certificates are stored on IPFS for permanence

## Troubleshooting

### Common Issues

1. **API Key Missing**: Ensure `LIGHTHOUSE_API_KEY` is set in environment variables
2. **Decryption Failed**: Verify the user's wallet is connected and has access
3. **Upload Failed**: Check network connection and API key validity

### Error Messages

- `LIGHTHOUSE_API_KEY is not configured`: Set the environment variable
- `Failed to upload certificate to Lighthouse`: Check API key and network
- `Failed to decrypt certificate`: Verify wallet connection and access rights

## Development

### Testing

1. Set up test environment variables
2. Use Sepolia testnet for development
3. Test certificate upload and decryption flows
4. Verify access control conditions work correctly

### Local Development

```bash
# Set environment variables
export LIGHTHOUSE_API_KEY=your_test_key

# Run development server
npm run dev
```

## Production Deployment

1. Set production Lighthouse API key
2. Configure access control for mainnet
3. Update contract addresses for production
4. Test certificate flows thoroughly

## Support

For Lighthouse-specific issues:
- [Lighthouse Documentation](https://docs.lighthouse.storage/)
- [Lighthouse Discord](https://discord.gg/lighthouse)
- [Lighthouse GitHub](https://github.com/lighthouse-web3)
