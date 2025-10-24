# Firebase RPC URL Management Setup

This guide explains how to set up Firebase to store and manage RPC URLs for your multi-network Stake-to-Learn platform.

## Overview

Instead of hardcoding RPC URLs in your configuration files, you can now store them in Firebase Firestore, making them:
- **Dynamic**: Update RPC URLs without redeploying
- **Centralized**: Manage all network configurations in one place
- **Scalable**: Add new networks easily
- **Reliable**: Automatic fallback to backup RPC URLs
- **Real-time**: Live updates across all clients

## Firebase Setup

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `stake-learn-rpc`
4. Enable Google Analytics (optional)
5. Click "Create project"

### 2. Enable Firestore Database

1. In your Firebase project, go to "Firestore Database"
2. Click "Create database"
3. Choose "Start in test mode" (for development)
4. Select a location for your database
5. Click "Done"

### 3. Get Firebase Configuration

1. Go to Project Settings (gear icon)
2. Scroll down to "Your apps"
3. Click "Add app" → Web app (</> icon)
4. Enter app nickname: `stake-learn-web`
5. Copy the configuration object

### 4. Configure Environment Variables

Create `.env.local` in your `apps/web/` directory:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef123456
```

## Database Structure

### Firestore Collections

#### `networkRPCs` Collection
Each document represents a blockchain network:

```javascript
// Document ID: chainId (e.g., "1", "11155111", "8453")
{
  id: "1",
  chainId: 1,
  chainName: "Ethereum",
  rpcUrl: "https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY",
  backupRpcUrls: [
    "https://mainnet.infura.io/v3/YOUR_KEY",
    "https://ethereum.publicnode.com"
  ],
  blockExplorer: "https://etherscan.io",
  nativeCurrency: {
    name: "ETH",
    symbol: "ETH", 
    decimals: 18
  },
  isTestnet: false,
  isActive: true,
  priority: 1,
  lastUpdated: 1703123456789,
  createdBy: "admin"
}
```

## Usage

### 1. Initialize Default Networks

```typescript
import { rpcService } from './lib/rpcService';

// Initialize default network configurations
await rpcService.initializeDefaultRPCs();
```

### 2. Get Network Configuration

```typescript
import { useNetworkRPC } from './hooks/useNetworkRPC';

function MyComponent() {
  const { networkRPC, loading, error } = useNetworkRPC(1); // Ethereum mainnet
  
  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  
  return (
    <div>
      <h2>{networkRPC?.chainName}</h2>
      <p>RPC: {networkRPC?.rpcUrl}</p>
    </div>
  );
}
```

### 3. Get Best RPC URL

```typescript
import { useBestRPCUrl } from './hooks/useNetworkRPC';

function NetworkComponent() {
  const { rpcUrl, loading } = useBestRPCUrl(1);
  
  if (loading) return <div>Finding best RPC...</div>;
  
  return <div>Using RPC: {rpcUrl}</div>;
}
```

### 4. Subscribe to Real-time Updates

```typescript
import { useNetworkRPCSubscription } from './hooks/useNetworkRPC';

function NetworkList() {
  const { networkRPCs, loading } = useNetworkRPCSubscription();
  
  return (
    <div>
      {networkRPCs.map(network => (
        <div key={network.chainId}>
          {network.chainName} - {network.rpcUrl}
        </div>
      ))}
    </div>
  );
}
```

## Admin Interface

### Access Admin Panel

Navigate to `/admin/networks` to access the network management interface.

### Features

- **View All Networks**: See all configured networks
- **Add New Network**: Add custom network configurations
- **Edit Networks**: Update RPC URLs, block explorers, etc.
- **Enable/Disable**: Activate or deactivate networks
- **Priority Management**: Set network priority for fallback
- **Backup RPCs**: Configure multiple RPC URLs for reliability

### API Endpoints

#### Initialize Networks
```bash
POST /api/admin/init-networks
```

#### Get All Networks
```bash
GET /api/admin/init-networks
```

## Advanced Features

### 1. RPC Health Monitoring

The service automatically tests RPC URLs and falls back to backup URLs if the primary fails.

### 2. Caching

RPC configurations are cached for 5 minutes to improve performance.

### 3. Real-time Updates

All clients receive real-time updates when network configurations change.

### 4. Backup RPC URLs

Each network can have multiple backup RPC URLs for high availability.

## Security Rules

### Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to networkRPCs for all users
    match /networkRPCs/{document} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.token.admin == true;
    }
  }
}
```

### Environment Security

- Never commit `.env.local` to version control
- Use Firebase App Check for additional security
- Implement proper authentication for admin operations

## Migration from Static Configuration

### 1. Backup Current Configuration

```bash
cp apps/web/config/contracts.ts apps/web/config/contracts.ts.backup
```

### 2. Update Imports

Replace static imports with Firebase-powered ones:

```typescript
// Old
import { NETWORKS } from '../config/contracts';

// New  
import { useNetworkRPCSubscription } from '../hooks/useNetworkRPC';
```

### 3. Initialize Firebase Data

```typescript
// Run once to populate Firebase
await rpcService.initializeDefaultRPCs();
```

## Troubleshooting

### Common Issues

1. **Firebase not initialized**: Check environment variables
2. **Permission denied**: Verify Firestore security rules
3. **RPC URLs not working**: Check network connectivity
4. **Cache issues**: Clear cache with `rpcService.clearCache()`

### Debug Mode

Enable debug logging:

```typescript
// In your app
console.log('Network RPCs:', await rpcService.getAllNetworkRPCs());
```

## Benefits

### For Developers
- **Centralized Management**: All network configs in one place
- **Real-time Updates**: No need to redeploy for RPC changes
- **Easy Testing**: Switch between testnet/mainnet easily
- **Scalable**: Add new networks without code changes

### For Users
- **Better Reliability**: Automatic fallback to backup RPCs
- **Faster Loading**: Cached configurations
- **Always Updated**: Real-time network updates
- **Seamless Experience**: No downtime for RPC changes

## Next Steps

1. Set up Firebase project
2. Configure environment variables
3. Initialize default networks
4. Test network switching
5. Set up admin interface
6. Configure security rules
7. Deploy and monitor

Your Stake-to-Learn platform now has dynamic, centralized RPC URL management powered by Firebase! 🚀
