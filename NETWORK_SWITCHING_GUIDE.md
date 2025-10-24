# Network Switching Guide

Your Stake-to-Learn app now supports seamless switching between **15+ blockchain networks**! Here's how to use the network switching functionality.

## Available Components

### 1. NetworkSwitcher (Enhanced)
The main network switcher component that shows when users are on unsupported networks or allows switching when on supported networks.

```tsx
import { NetworkSwitcher } from "./_components/NetworkSwitcher";

// Use in your layout or pages
<NetworkSwitcher />
```

**Features:**
- ✅ Shows current network status
- ✅ Allows switching between all supported networks
- ✅ Organized by testnets and mainnets
- ✅ Includes faucet links for testnets
- ✅ Visual feedback for current network

### 2. AdvancedNetworkSelector
A dropdown-style network selector for more compact UI.

```tsx
import { AdvancedNetworkSelector } from "./_components/AdvancedNetworkSelector";

// Basic usage
<AdvancedNetworkSelector />

// With custom styling
<AdvancedNetworkSelector 
  className="w-full max-w-sm" 
  showFaucets={true} 
/>
```

**Features:**
- ✅ Dropdown interface
- ✅ Current network highlighting
- ✅ Organized by testnets/mainnets
- ✅ Optional faucet links
- ✅ Compact design

### 3. NetworkStatus
A simple status indicator showing the current network.

```tsx
import { NetworkStatus } from "./_components/NetworkStatus";

// Basic status
<NetworkStatus />

// With detailed information
<NetworkStatus showDetails={true} />
```

**Features:**
- ✅ Simple status indicator
- ✅ Green for supported networks
- ✅ Red for unsupported networks
- ✅ Optional detailed information

## How Network Switching Works

### 1. **Automatic Detection**
The app automatically detects which network the user is connected to and shows appropriate UI:

- **Supported Network**: Shows green status with option to switch
- **Unsupported Network**: Shows red warning with network options

### 2. **Supported Networks**
Users can switch between these networks:

#### Testnets (for development/testing)
- **Ethereum Sepolia** (Chain ID: 11155111)
- **Base Sepolia** (Chain ID: 84532)
- **Arbitrum Sepolia** (Chain ID: 421614)
- **BSC Testnet** (Chain ID: 97)
- **Avalanche Fuji** (Chain ID: 43113)
- **Polygon Mumbai** (Chain ID: 80001)
- **Filecoin Calibration** (Chain ID: 314159)
- **Worldchain Testnet** (Chain ID: 480)

#### Mainnets (for production)
- **Ethereum Mainnet** (Chain ID: 1)
- **Base** (Chain ID: 8453)
- **Arbitrum One** (Chain ID: 42161)
- **BSC** (Chain ID: 56)
- **Avalanche C-Chain** (Chain ID: 43114)
- **Filecoin Mainnet** (Chain ID: 314)
- **Yellow Network** (Chain ID: 23011913)
- **0G Network** (Chain ID: 2043)

### 3. **User Experience Flow**

1. **User connects wallet** → App detects current network
2. **If unsupported network** → Shows warning with switch options
3. **If supported network** → Shows success status with switch option
4. **User clicks switch** → Shows all available networks
5. **User selects network** → Wallet prompts to switch
6. **Network switched** → App updates to new network

## Implementation Examples

### In Your Layout Component
```tsx
// apps/web/app/layout.tsx
import { NetworkSwitcher } from "../_components/NetworkSwitcher";

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <header>
          <NetworkSwitcher />
        </header>
        <main>{children}</main>
      </body>
    </html>
  );
}
```

### In Your Dashboard
```tsx
// apps/web/app/(routes)/dashboard/page.tsx
import { AdvancedNetworkSelector } from "../../_components/AdvancedNetworkSelector";
import { NetworkStatus } from "../../_components/NetworkStatus";

export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Network Status */}
      <NetworkStatus showDetails={true} />
      
      {/* Network Selector */}
      <AdvancedNetworkSelector className="w-full max-w-md" />
      
      {/* Rest of your dashboard */}
    </div>
  );
}
```

### In Your Staking Component
```tsx
// apps/web/_components/StakingButton.tsx
import { NetworkStatus } from "./NetworkStatus";

export function StakingButton() {
  return (
    <div className="space-y-4">
      {/* Show current network */}
      <NetworkStatus />
      
      {/* Staking interface */}
      <button>Stake & Start Learning</button>
    </div>
  );
}
```

## Network-Specific Features

### Gas Costs & Performance
- **Ethereum**: Highest security, highest gas costs
- **Base**: Low gas, Coinbase ecosystem
- **Arbitrum**: Low gas, fast finality
- **BSC**: Very low gas, high throughput
- **Avalanche**: Low gas, sub-second finality
- **Filecoin**: Storage-focused
- **Yellow**: AI/ML optimized
- **0G**: AI data infrastructure

### Native Currencies
- **ETH**: Ethereum, Base, Arbitrum
- **BNB**: Binance Smart Chain
- **AVAX**: Avalanche
- **MATIC**: Polygon
- **FIL**: Filecoin
- **WLD**: Worldchain
- **YELLOW**: Yellow Network
- **0G**: 0G Network

## Faucet Integration

The components automatically include faucet links for testnets:

- **Sepolia ETH**: https://sepoliafaucet.com
- **Base Sepolia ETH**: https://faucet.quicknode.com/base/sepolia
- **Arbitrum Sepolia ETH**: https://faucet.arbitrum.io/
- **BSC Testnet tBNB**: https://testnet.binance.org/faucet-smart
- **Avalanche Fuji AVAX**: https://faucet.avax.network/
- **Polygon Mumbai MATIC**: https://faucet.polygon.technology/
- **Filecoin Calibration tFIL**: https://faucet.calibration.fildev.network/
- **Worldchain WLD**: https://worldchain-testnet.blockscout.com/faucet

## Customization

### Styling
All components accept `className` props for custom styling:

```tsx
<NetworkSwitcher className="my-custom-class" />
<AdvancedNetworkSelector className="w-full max-w-lg" />
<NetworkStatus className="mb-4" />
```

### Configuration
You can customize which networks are shown by modifying the `NETWORKS` configuration in `config/contracts.ts`.

## Best Practices

1. **Always show network status** in your main UI
2. **Include network switcher** in your header/navigation
3. **Show faucet links** for testnets
4. **Handle network switching errors** gracefully
5. **Update contract addresses** when switching networks
6. **Test thoroughly** across different networks

## Troubleshooting

### Common Issues
1. **Wallet not switching**: Ensure wallet supports the network
2. **Network not recognized**: Check if network is in `NETWORKS` config
3. **RPC errors**: Verify RPC URLs in environment variables
4. **Contract not found**: Ensure contracts are deployed on the network

### Debug Information
The components provide detailed information about:
- Current chain ID
- Network name
- Native currency
- Support status
- Available networks

This comprehensive network switching system gives your users the flexibility to choose their preferred blockchain network while maintaining a seamless user experience! 🚀
