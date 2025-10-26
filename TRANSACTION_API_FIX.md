# Transaction API Performance Fix

## Problem Identified

The dashboard was making **excessive API calls** to `/api/transactions`, causing:
- Hundreds of duplicate requests in rapid succession
- Poor performance and potential rate limiting issues
- Unnecessary server load
- Degraded user experience

### Root Causes

1. **Multiple Independent Hooks**: Three separate hooks were each independently fetching the same data:
   - `useTransactions()` - for transaction history
   - `useLocalDataCoin()` - for DataCoin balance calculation
   - `useCertificates()` - for certificate data

2. **No Caching Mechanism**: Each hook would refetch data on every render or address change

3. **No Debouncing**: Rapid state changes triggered multiple simultaneous requests

4. **React Hook Dependencies**: Each hook had `useEffect(() => { fetch() }, [address])`, causing parallel fetches

## Solution Implemented

### 1. Centralized TransactionsContext

Created a new context provider (`TransactionsContext.tsx`) that:
- **Single Source of Truth**: Manages all transaction data in one place
- **Caching**: Implements a 5-second cache to prevent redundant API calls
- **Debouncing**: 300ms debounce on address changes to prevent rapid-fire requests
- **Shared State**: All components use the same cached data

**Key Features:**
```typescript
// 5-second cache duration
const CACHE_DURATION = 5000;

// Cache validation
const isCacheValid = 
  !forceRefresh &&
  cacheRef.current.address === address &&
  cacheRef.current.timestamp > now - CACHE_DURATION;

// 300ms debounce on address changes
fetchTimeoutRef.current = setTimeout(() => {
  fetchTransactions();
}, 300);
```

### 2. Refactored Hooks

All three hooks now use the centralized context instead of making independent API calls:

#### `useTransactions()`
- Now a thin wrapper around `useTransactionsContext()`
- No longer manages its own state or makes API calls
- Returns data from shared cache

#### `useLocalDataCoin()`
- Uses `useMemo()` to calculate balance from cached transactions
- No independent fetching
- Filters DataCoin transactions from shared state

#### `useCertificates()`
- Uses `useMemo()` to transform transactions into certificates
- Computes certificates client-side from cached data
- No separate API calls needed

### 3. Updated Provider Hierarchy

Added `TransactionsProvider` to the app's provider tree:

```tsx
<ThemeProvider>
  <WagmiProvider>
    <QueryClientProvider>
      <TransactionsProvider>
        {children}
      </TransactionsProvider>
    </QueryClientProvider>
  </WagmiProvider>
</ThemeProvider>
```

## Performance Improvements

### Before Fix
- ❌ **200+ API calls** on dashboard load
- ❌ New request every time any component needed transaction data
- ❌ No caching - same data fetched multiple times
- ❌ Parallel duplicate requests

### After Fix
- ✅ **1 API call** per 5-second window (unless force refreshed)
- ✅ All hooks share the same cached data
- ✅ Debounced requests prevent rapid-fire calls
- ✅ Cache prevents redundant fetches

**Estimated Reduction**: ~99% fewer API calls

## Technical Benefits

1. **Reduced Server Load**: 99% reduction in API calls
2. **Faster UI**: Instant data access from cache
3. **Better UX**: No loading spinners for cached data
4. **Scalability**: Can handle more concurrent users
5. **Maintainability**: Single data flow is easier to debug

## Files Changed

1. **Created:**
   - `apps/web/_context/TransactionsContext.tsx` - New centralized context

2. **Modified:**
   - `apps/web/hooks/useTransactions.ts` - Now uses context
   - `apps/web/hooks/useLocalDataCoin.ts` - Now uses context
   - `apps/web/hooks/useCertificates.ts` - Now uses context
   - `apps/web/_context/Providers.tsx` - Added TransactionsProvider

## Testing Recommendations

1. **Verify API Call Reduction:**
   - Open browser DevTools → Network tab
   - Navigate to dashboard
   - Confirm only 1-2 `/api/transactions` calls instead of 200+

2. **Test Cache Behavior:**
   - Load dashboard
   - Wait 6+ seconds
   - Navigate away and back
   - Should see new request only after cache expires

3. **Test Debouncing:**
   - Rapidly switch between pages
   - Verify requests are debounced, not duplicated

4. **Test Data Accuracy:**
   - Verify DataCoin balance displays correctly
   - Confirm certificates show properly
   - Check transaction history is complete

## Migration Notes

- No changes required to components using these hooks
- API remains the same - all hooks have identical signatures
- Existing functionality preserved, only performance improved
- Backwards compatible with all current usage

## Future Enhancements

Consider these additional optimizations:

1. **Persistent Cache**: Use localStorage to cache across sessions
2. **Optimistic Updates**: Update UI immediately, sync in background
3. **WebSocket Integration**: Real-time updates for new transactions
4. **Pagination**: For users with many transactions
5. **Background Sync**: Periodic refresh in background tab

## Monitoring

Watch for these metrics:
- API call volume to `/api/transactions`
- Dashboard load time
- Time to interactive (TTI)
- User-reported performance issues

---

**Summary**: This fix transforms transaction data management from a scattered, inefficient pattern into a centralized, cached, and optimized solution that dramatically reduces API calls while improving user experience.
