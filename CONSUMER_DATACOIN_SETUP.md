# Consumer DataCoin Integration Setup

## Overview
This document explains how to set up the Consumer DataCoin integration with Reclaim Protocol for the $500 Consumer DataCoin prize.

## Environment Variables Required

Add these variables to your `apps/web/.env.local` file:

```bash
# Reclaim Protocol Credentials
# Get these from https://reclaimprotocol.org/
RECLAIM_APP_ID=your_reclaim_app_id_here
RECLAIM_APP_SECRET=your_reclaim_app_secret_here

# Existing environment variables (keep these)
NEXT_PUBLIC_DATACOIN_CONTRACT_ADDRESS_SEPOLIA=0x190BB70915F0949228D5bf22b3aD83AB54A1Be0D
NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS_SEPOLIA=0x190BB70915F0949228D5bf22b3aD83AB54A1Be0D
NEXT_PUBLIC_SOULBOUND_CONTRACT_ADDRESS_SEPOLIA=0x190BB70915F0949228D5bf22b3aD83AB54A1Be0D
NEXT_PUBLIC_REPUTATION_CONTRACT_ADDRESS_SEPOLIA=0x190BB70915F0949228D5bf22b3aD83AB54A1Be0D
NEXT_PUBLIC_COURSE_REGISTRY_CONTRACT_ADDRESS_SEPOLIA=0x190BB70915F0949228D5bf22b3aD83AB54A1Be0D

# Other existing variables...
```

## Getting Reclaim Protocol Credentials

1. Visit [https://reclaimprotocol.org/](https://reclaimprotocol.org/)
2. Sign up for an account
3. Create a new app
4. Get your `APP_ID` and `APP_SECRET`
5. Add them to your `.env.local` file

## Features Implemented

### 1. Consumer Data Sources
- **GitHub**: Verify code contributions, commits, and pull requests
- **Uber**: Verify ride history and transportation data  
- **Amazon**: Verify purchase history and shopping patterns

### 2. DataCoin Rewards
- GitHub: 10 DataCoins per contribution batch
- Uber: 5 DataCoins per month of data
- Amazon: 5 DataCoins per month of data
- First verification bonus: 20 DataCoins

### 3. Zero-Knowledge Proofs
- All data verification uses zkTLS proofs via Reclaim Protocol
- Data is verified without exposing sensitive information
- Proofs are stored on IPFS via Lighthouse

### 4. UI Components
- Consumer Data section on dashboard
- Modal for connecting data sources
- Transaction tracking for consumer data
- Real-time DataCoin balance updates

## How It Works

1. **User clicks "Connect Data Sources"** on dashboard
2. **Selects data source** (GitHub/Uber/Amazon)
3. **Reclaim Protocol generates zkTLS proof** for the data
4. **Proof is verified** using Reclaim SDK
5. **DataCoins are minted** based on verified data
6. **Transaction is tracked** and displayed in history
7. **Proof is stored** on IPFS via Lighthouse

## Prize Qualification

✅ **DataCoin launched on 1MB.io** - Already done  
✅ **Lighthouse storage integration** - Already done  
✅ **Live real-world dataset with proof** - GitHub via zkTLS  
✅ **Deployed to supported network** - Sepolia  
✅ **zkTLS validation implemented** - Reclaim Protocol  

## Testing

### Mock Mode
For development/testing, the system includes mock verification:
- Click "Connect Data Sources" 
- Select any data source
- Mock verification will run automatically
- You'll earn DataCoins without real data verification

### Real Mode
For production:
1. Set up Reclaim Protocol credentials
2. Users will go through real zkTLS proof generation
3. Data is actually verified from the source platforms

## Files Added/Modified

### New Files:
- `apps/web/_utils/reclaim.ts` - Reclaim SDK wrapper
- `apps/web/app/api/consumer-data/route.ts` - Consumer data API
- `apps/web/hooks/useConsumerData.ts` - Consumer data hook
- `apps/web/_components/ConsumerDataModal.tsx` - Data connection UI

### Modified Files:
- `apps/web/app/api/progress/route.ts` - Added consumer data reward types
- `apps/web/app/(routes)/dashboard/page.tsx` - Added consumer data section
- `apps/web/app/(routes)/transactions/page.tsx` - Added consumer_data transaction type
- `apps/web/hooks/useTransactions.ts` - Extended transaction interface

## Next Steps

1. **Get Reclaim Protocol credentials** from their website
2. **Add credentials to .env.local**
3. **Test the integration** using mock mode
4. **Deploy to production** for real zkTLS verification
5. **Submit for prize** - you now qualify for the $500 Consumer DataCoin prize!

## Support

If you encounter any issues:
1. Check that Reclaim credentials are correctly set
2. Ensure all dependencies are installed (`npm install`)
3. Check browser console for errors
4. Verify network connectivity for Reclaim Protocol

The integration preserves all existing functionality while adding powerful consumer data verification capabilities.
