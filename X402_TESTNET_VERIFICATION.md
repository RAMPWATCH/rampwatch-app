# x402 Testnet Verification Plan

**Status**: Ready for manual testing  
**Network**: Stellar Testnet  
**Endpoints to Test**: `/api/v1/x402/*`

## Prerequisites

1. **Stellar Testnet Account** with funded USDC
   - Use https://testnet.stellar.expert to fund account
   - Minimum 5 USDC for multiple test calls

2. **Environment Setup**
   ```bash
   # In apps/api/.env.local
   STELLAR_PAYTO_ADDRESS=<testnet-address-with-funds>
   X402_FACILITATOR_URL=<x402-facilitator-testnet>
   X402_NETWORK=stellar:testnet
   
   # Pricing (from platform_settings)
   PRICE_CHECK=0.02        # USDC per check
   PRICE_FULL_REPORT=0.10  # USDC for full SEP report
   PRICE_VERIFY_DOMAIN=0.05  # USDC per domain verification
   ```

3. **Running Servers**
   ```bash
   # Terminal 1: API
   pnpm --filter @sepgate/api dev
   
   # Terminal 2: Web  
   pnpm --filter @sepgate/web dev
   
   # Visit http://localhost:3000
   ```

## Test Plan

### Test 1: Verify Domain (Paid Check)

**Objective**: Fresh SEP compliance check on any domain via x402 payment

**Endpoint**: `POST /api/v1/x402/verify-domain`

**Test Flow**:
```bash
# 1. Make initial request (expect 402 Payment Required)
curl -X POST http://localhost:4000/api/v1/x402/verify-domain \
  -H "Content-Type: application/json" \
  -d '{"domain": "stellar.org"}'

# Response should include:
# HTTP 402 with x402 payment challenge headers

# 2. Pay using x402 client (requires external x402 handler)
# The payment is sent to STELLAR_PAYTO_ADDRESS
# Must include check=<checkRunId> in memo to correlate payment

# 3. Retry with payment header
curl -X POST http://localhost:4000/api/v1/x402/verify-domain \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <x402-receipt>" \
  -d '{"domain": "stellar.org"}'

# Expected 200 response:
# {
#   "checked_at": "2026-08-27T...",
#   "check_run_id": "uuid",
#   "verification_link": "https://localhost:3000/directory/stellar-org?run=uuid"
# }
```

**Expected Outcomes**:
- ✅ Initial request returns 402 Payment Required
- ✅ Payment is recorded in x402_transactions table
- ✅ Transaction status: "settled" after payment succeeds
- ✅ Second request (with payment) returns 200 with full results
- ✅ check_run is created and linked to transaction
- ✅ Verification link resolves and shows the check results

### Test 2: Check Specific Anchor (Paid)

**Endpoint**: `GET /api/v1/x402/anchors/:slug/check`

**Test Flow**:
```bash
# First, get an anchor slug from /directory
# Then request fresh check via x402

curl -X GET http://localhost:4000/api/v1/x402/anchors/stellar-org/check \
  -H "Authorization: Bearer <x402-payment>"

# Expected: 200 response with check results
# {
#   "checked_at": "...",
#   "check_run_id": "...",
#   "verification_link": "..."
# }
```

**Expected Outcomes**:
- ✅ 402 Payment Required on first request
- ✅ Payment settles and transaction is recorded
- ✅ Second request returns complete check results

### Test 3: Full Report (Paid)

**Endpoint**: `GET /api/v1/x402/anchors/:slug/full-report`

**Test Flow**:
```bash
curl -X GET http://localhost:4000/api/v1/x402/anchors/stellar-org/full-report \
  -H "Authorization: Bearer <x402-payment>"

# Expected: 200 response with all 5 SEP results
# {
#   "checked_at": "...",
#   "check_run_id": "...",
#   "results": [
#     { "sep_type": "sep1", "passed": true, "latency_ms": 145, ... },
#     { "sep_type": "sep6", "passed": true, ... },
#     ...
#   ]
# }
```

**Expected Outcomes**:
- ✅ More expensive than single check (0.10 vs 0.02)
- ✅ Full SEP-1 through SEP-38 results returned
- ✅ Payment is correctly deducted

### Test 4: Failed Check After Successful Payment

**Objective**: Ensure failed checks after payment are still recorded

**Setup**:
- Test against a domain that has real SEP compliance issues
- Or mock a failure in sep_check_results

**Expected Outcomes**:
- ✅ Payment is settled in x402_transactions
- ✅ check_run shows status "degraded" or "down"
- ✅ sep_check_results show which SEPs failed
- ✅ error_detail is populated for failed checks
- ✅ check_run_id is returned despite failures

### Test 5: Verification Link Accessibility

**Objective**: Ensure check results are publicly verifiable

**Test**:
```bash
# After successful x402 check, visit the verification link
# Should be publicly accessible without auth
curl http://localhost:3000/directory/stellar-org?run=<check_run_id>

# GET /api/v1/checks/<checkRunId> should return results
curl http://localhost:4000/api/v1/checks/<checkRunId>
```

**Expected Outcomes**:
- ✅ Verification link is public (no auth required)
- ✅ Results match the paid check
- ✅ check_run_id links to original x402_transaction

## Post-Testnet Checklist

Before moving to production mainnet:

- [ ] All 5 tests above pass on testnet
- [ ] Pricing is configured correctly
- [ ] Payto address receives payments
- [ ] Admin can view all x402_transactions in /admin/transactions
- [ ] Audit log records all x402 operations
- [ ] No failed payments trigger checks
- [ ] Payment settlement time is acceptable
- [ ] Network is confirmed as stellar:testnet (not mainnet)
- [ ] All error paths are handled gracefully

## Troubleshooting

### 402 Not Returned
- Check: STELLAR_PAYTO_ADDRESS is set and valid
- Check: X402_FACILITATOR_URL is accessible
- Check: API is reachable at http://localhost:4000

### Payment Not Settling
- Check: x402 facilitator is reachable
- Check: Testnet account has sufficient balance
- Check: x402_transactions table shows status="pending"
- Check: Check memo includes check_run_id

### Check Results Not Returned
- Check: SEP checkers are functional (run test checks from /verify page)
- Check: check_runs table has the run record
- Check: sep_check_results table has all SEP types
- Check: No errors in API logs

### Verification Link Not Working
- Check: Public routes are not auth-gated
- Check: check_run_id is correctly passed in query
- Check: Directory page can load and filter by check_run_id

## Success Criteria

✅ **PROMPT NO. 1 x402 Testnet Verification Complete** when:
1. All 5 tests pass without errors
2. Payments are correctly settled on testnet
3. All transactions are recorded in the database
4. Verification links are publicly accessible
5. No errors in production logs
6. Network is confirmed as testnet (not mainnet)
