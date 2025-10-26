# 🎯 Consumer DataCoin Implementation Plan

## 📋 **Current Status**

### ✅ **Already Implemented:**
- Reclaim SDK wrapper (`_utils/reclaim.ts`) with singleton pattern
- Consumer data reward types in `PROGRESS_REWARDS`
- Basic zkTLS validation infrastructure
- Consumer data section in dashboard UI
- Transaction type support for `consumer_data`

### 🚧 **Just Created:**
- Consumer data API endpoint (`/api/consumer-data`)
- Consumer data hook (`useConsumerData.ts`)
- Consumer data modal component (`ConsumerDataModal.tsx`)
- Updated transaction types to include `consumer_data`

---

## 🎯 **Implementation Logic Flow**

### **1. User Journey**
```
1. User clicks "Connect Data Sources" on dashboard
2. ConsumerDataModal opens with 3 data source options
3. User selects GitHub/Uber/Amazon
4. Reclaim Protocol generates zkTLS proof
5. User submits proof data
6. Backend verifies proof using Reclaim SDK
7. DataCoins are minted and transaction tracked
8. Dashboard updates with new stats
```

### **2. Data Flow**
```
Frontend (Modal) → Reclaim SDK → zkTLS Proof → Backend API → Contract Minting → Transaction Tracking → UI Update
```

---

## 🔧 **Setup Instructions**

### **Step 1: Install Dependencies**
```bash
cd apps/web
npm install @reclaimprotocol/js-sdk
```

### **Step 2: Environment Variables**
Add to `apps/web/.env.local`:
```bash
# Reclaim Protocol Credentials
RECLAIM_APP_ID=your_reclaim_app_id
RECLAIM_APP_SECRET=your_reclaim_app_secret
```

### **Step 3: Get Reclaim Protocol Credentials**
1. Go to [Reclaim Protocol Developer Portal](https://developer.reclaimprotocol.io/)
2. Create a new app
3. Get your App ID and App Secret
4. Add them to your `.env.local`

---

## 🏗️ **Architecture Overview**

### **Backend Components:**
- **`/api/consumer-data`** - Handles proof submission and verification
- **Reclaim SDK Integration** - Validates zkTLS proofs
- **DataCoin Minting** - Mints tokens for verified data
- **Transaction Tracking** - Records consumer data transactions

### **Frontend Components:**
- **`ConsumerDataModal`** - UI for connecting data sources
- **`useConsumerData`** - Hook for managing consumer data state
- **Dashboard Integration** - Shows consumer data stats
- **Transaction History** - Displays consumer data transactions

---

## 📊 **Data Sources & Rewards**

### **GitHub Contributions**
- **What it verifies:** Commits, Pull Requests, Issues, Repositories
- **Reward:** 10 DataCoins per verified contribution batch
- **Data points:** Contribution streak, total contributions, repository count

### **Uber Ride Data**
- **What it verifies:** Ride count, total distance, spending patterns
- **Reward:** 5 DataCoins per month of ride data
- **Data points:** Ride frequency, average cost, total distance

### **Amazon Purchase Data**
- **What it verifies:** Order history, categories, spending analysis
- **Reward:** 5 DataCoins per month of purchase data
- **Data points:** Order frequency, category diversity, spending patterns

---

## 🔄 **Integration Points**

### **1. Existing Course System**
- Consumer data works **alongside** course completion
- Users earn DataCoins from **both** learning and data sharing
- No changes to existing course logic

### **2. DataCoin Contract**
- Reuses existing DataCoin minting logic
- Same contract address and ABI
- Additional reward types for consumer data

### **3. Transaction Tracking**
- Extends existing transaction system
- New `consumer_data` transaction type
- Tracks data source and verification status

### **4. Dashboard Stats**
- Consumer data stats integrated into existing dashboard
- Shows total DataCoins from all sources
- Displays connection status for each data source

---

## 🧪 **Testing Strategy**

### **Phase 1: Mock Testing**
1. Test with mock Reclaim credentials
2. Verify API endpoints work
3. Test UI flow and error handling

### **Phase 2: Real Integration**
1. Get real Reclaim credentials
2. Test with actual GitHub data
3. Verify zkTLS proof generation and validation

### **Phase 3: End-to-End Testing**
1. Complete user journey from modal to DataCoin minting
2. Verify transaction tracking
3. Test dashboard updates

---

## 🎁 **Prize Qualification Checklist**

- [x] **DataCoin launched on 1MB.io** ✅ (Already done)
- [x] **Lighthouse storage integration** ✅ (Already done)
- [x] **Deployed to supported network** ✅ (Sepolia)
- [ ] **Live real-world dataset with proof** 🚧 (GitHub via zkTLS)
- [ ] **zkTLS validation implemented** 🚧 (Reclaim Protocol)

---

## 🚀 **Next Steps**

### **Immediate (Today):**
1. Install `@reclaimprotocol/js-sdk`
2. Get Reclaim Protocol credentials
3. Test the consumer data modal

### **Short Term (This Week):**
1. Test with real GitHub data
2. Verify end-to-end flow
3. Add error handling and edge cases

### **Medium Term (Next Week):**
1. Add Uber and Amazon integration
2. Optimize UI/UX based on testing
3. Add analytics and monitoring

---

## 🔧 **File Structure**

```
apps/web/
├── app/api/consumer-data/route.ts          # Consumer data API
├── hooks/useConsumerData.ts                # Consumer data hook
├── _components/ConsumerDataModal.tsx       # Data connection modal
├── _utils/reclaim.ts                       # Reclaim SDK wrapper
├── _context/TransactionsContext.tsx        # Updated transaction types
└── app/(routes)/dashboard/page.tsx         # Dashboard integration
```

---

## 💡 **Key Benefits**

1. **Qualifies for $500 Consumer DataCoin Prize**
2. **Preserves all existing functionality**
3. **Adds new revenue stream for users**
4. **Demonstrates real-world data integration**
5. **Shows zkTLS proof capabilities**

---

## 🎯 **Success Metrics**

- [ ] Users can connect GitHub data successfully
- [ ] zkTLS proofs are generated and validated
- [ ] DataCoins are minted for consumer data
- [ ] Transactions are properly tracked
- [ ] Dashboard shows consumer data stats
- [ ] End-to-end flow works without errors

This implementation will make your project eligible for the Consumer DataCoin prize while maintaining all existing course completion functionality! 🚀
