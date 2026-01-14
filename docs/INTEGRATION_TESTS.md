# Relifo Integration Tests

**Test Suite Version:** 1.0.0  
**Environment:** Stellar Testnet  
**Framework:** Jest + Testing Library

---

## 🧪 Test Structure

```
tests/
├── integration/
│   ├── admin.test.ts          # Admin workflow tests
│   ├── ngo.test.ts            # NGO workflow tests
│   ├── donor.test.ts          # Donor workflow tests
│   ├── beneficiary.test.ts    # Beneficiary workflow tests
│   ├── merchant.test.ts       # Merchant workflow tests
│   └── e2e.test.ts            # End-to-end flow tests
├── contracts/
│   ├── vault.test.ts          # ReliefVault contract tests
│   ├── ngo.test.ts            # NGORegistry contract tests
│   ├── beneficiary.test.ts    # BeneficiaryRegistry tests
│   └── merchant.test.ts       # MerchantRegistry tests
└── utils/
    ├── setup.ts               # Test environment setup
    ├── helpers.ts             # Test helper functions
    └── fixtures.ts            # Test data fixtures
```

---

## 📋 Contract Integration Tests

### ReliefVault Tests

```typescript
// tests/contracts/vault.test.ts
import { SorobanClient } from '@stellar/stellar-sdk';

describe('ReliefVault Contract', () => {
  let contract: string;
  let admin: string;
  let donor: string;
  let ngo: string;
  
  beforeAll(async () => {
    contract = process.env.NEXT_PUBLIC_VAULT_CONTRACT_ID!;
    admin = process.env.NEXT_PUBLIC_ADMIN_ADDRESS!;
    // Setup test accounts
  });

  describe('Campaign Creation', () => {
    it('should create campaign with valid parameters', async () => {
      // Test create_campaign function
      const campaignId = await createCampaign({
        ngo,
        category: 'Food',
        target: 10000,
        description: 'Test Campaign'
      });
      
      expect(campaignId).toBeDefined();
      expect(typeof campaignId).toBe('string');
    });

    it('should reject campaign from unverified NGO', async () => {
      // Test that unverified NGOs cannot create campaigns
      await expect(
        createCampaign({ ngo: 'UNVERIFIED_NGO_ADDRESS', ... })
      ).rejects.toThrow();
    });

    it('should initialize campaign with zero balance', async () => {
      const campaignId = await createCampaign({...});
      const balance = await getCampaignBalance(campaignId);
      expect(balance).toBe(0);
    });
  });

  describe('Donations', () => {
    let campaignId: string;

    beforeEach(async () => {
      campaignId = await createCampaign({...});
    });

    it('should accept donation and update balance', async () => {
      const amount = 1000;
      await donate(donor, campaignId, amount);
      
      const balance = await getCampaignBalance(campaignId);
      expect(balance).toBe(amount);
    });

    it('should reject zero amount donation', async () => {
      await expect(
        donate(donor, campaignId, 0)
      ).rejects.toThrow('Amount must be greater than zero');
    });

    it('should track multiple donations', async () => {
      await donate(donor, campaignId, 500);
      await donate(donor, campaignId, 300);
      
      const balance = await getCampaignBalance(campaignId);
      expect(balance).toBe(800);
    });
  });

  describe('Beneficiary Allocation', () => {
    it('should allocate funds to approved beneficiary', async () => {
      const campaignId = await createCampaignWithDonations(1000);
      const beneficiary = await createApprovedBeneficiary(campaignId);
      
      await allocateToBeneficiary(
        campaignId,
        beneficiary,
        500,
        { Food: 300, Healthcare: 200 }
      );
      
      const balance = await getBeneficiaryBalance(beneficiary);
      expect(balance).toBe(500);
    });

    it('should reject allocation exceeding campaign balance', async () => {
      const campaignId = await createCampaignWithDonations(500);
      const beneficiary = await createApprovedBeneficiary(campaignId);
      
      await expect(
        allocateToBeneficiary(campaignId, beneficiary, 1000, {...})
      ).rejects.toThrow('Insufficient campaign balance');
    });
  });

  describe('Spending Authorization', () => {
    it('should authorize spending within limits', async () => {
      const beneficiary = await createBeneficiaryWithBalance(500);
      const merchant = await createApprovedMerchant('Food');
      
      const authId = await authorizeSpending(
        beneficiary,
        merchant,
        100,
        'Food'
      );
      
      expect(authId).toBeDefined();
      const status = await getAuthorizationStatus(authId);
      expect(status).toBe('Authorized');
    });

    it('should reject spending over category limit', async () => {
      const beneficiary = await createBeneficiaryWithBalance(500);
      const merchant = await createApprovedMerchant('Food');
      
      await expect(
        authorizeSpending(beneficiary, merchant, 600, 'Food')
      ).rejects.toThrow('Exceeds category limit');
    });

    it('should execute authorized spending', async () => {
      const beneficiary = await createBeneficiaryWithBalance(500);
      const merchant = await createApprovedMerchant('Food');
      const authId = await authorizeSpending(beneficiary, merchant, 100, 'Food');
      
      await executeSpending(beneficiary, merchant, 100, 'Food');
      
      const balance = await getBeneficiaryBalance(beneficiary);
      expect(balance).toBe(400);
    });
  });
});
```

### NGORegistry Tests

```typescript
// tests/contracts/ngo.test.ts
describe('NGORegistry Contract', () => {
  describe('NGO Registration', () => {
    it('should register new NGO', async () => {
      const ngo = await generateTestAccount();
      await registerNGO(ngo, 'Test NGO', 'Description');
      
      const status = await getNGOStatus(ngo);
      expect(status).toBe('Pending');
    });

    it('should prevent duplicate registration', async () => {
      const ngo = await generateTestAccount();
      await registerNGO(ngo, 'Test NGO', 'Description');
      
      await expect(
        registerNGO(ngo, 'Test NGO 2', 'Description 2')
      ).rejects.toThrow('Already registered');
    });
  });

  describe('NGO Verification', () => {
    it('should allow admin to verify NGO', async () => {
      const ngo = await registerTestNGO();
      await verifyNGO(admin, ngo);
      
      const verified = await isVerified(ngo);
      expect(verified).toBe(true);
    });

    it('should reject verification from non-admin', async () => {
      const ngo = await registerTestNGO();
      const nonAdmin = await generateTestAccount();
      
      await expect(
        verifyNGO(nonAdmin, ngo)
      ).rejects.toThrow('Unauthorized');
    });
  });

  describe('NGO Status Management', () => {
    it('should suspend NGO', async () => {
      const ngo = await createVerifiedNGO();
      await suspendNGO(admin, ngo);
      
      const status = await getNGOStatus(ngo);
      expect(status).toBe('Suspended');
    });

    it('should revoke NGO', async () => {
      const ngo = await createVerifiedNGO();
      await revokeNGO(admin, ngo);
      
      const status = await getNGOStatus(ngo);
      expect(status).toBe('Revoked');
    });
  });
});
```

### BeneficiaryRegistry Tests

```typescript
// tests/contracts/beneficiary.test.ts
describe('BeneficiaryRegistry Contract', () => {
  describe('Application Process', () => {
    it('should accept application for campaign', async () => {
      const campaignId = await createTestCampaign();
      const beneficiary = await generateTestAccount();
      
      await registerForCampaign(beneficiary, campaignId, 'Need help');
      
      const status = await getApplicationStatus(beneficiary, campaignId);
      expect(status).toBe('Pending');
    });

    it('should prevent duplicate applications', async () => {
      const campaignId = await createTestCampaign();
      const beneficiary = await generateTestAccount();
      await registerForCampaign(beneficiary, campaignId, 'Need help');
      
      await expect(
        registerForCampaign(beneficiary, campaignId, 'Need help 2')
      ).rejects.toThrow('Already applied');
    });
  });

  describe('Approval Process', () => {
    it('should approve beneficiary with limits', async () => {
      const { campaignId, beneficiary } = await createApplicationScenario();
      
      await approveBeneficiary(admin, beneficiary, campaignId);
      
      const approved = await isApproved(beneficiary, campaignId);
      expect(approved).toBe(true);
    });

    it('should reject beneficiary', async () => {
      const { campaignId, beneficiary } = await createApplicationScenario();
      
      await rejectBeneficiary(admin, beneficiary, campaignId);
      
      const status = await getApplicationStatus(beneficiary, campaignId);
      expect(status).toBe('Rejected');
    });
  });

  describe('Category Management', () => {
    it('should track spending by category', async () => {
      const beneficiary = await createApprovedBeneficiary();
      await updateSpending(beneficiary, 'Food', 100);
      
      const spent = await getCategorySpent(beneficiary, 'Food');
      expect(spent).toBe(100);
    });

    it('should enforce category limits', async () => {
      const beneficiary = await createBeneficiaryWithLimit('Food', 500);
      await updateSpending(beneficiary, 'Food', 300);
      
      await expect(
        updateSpending(beneficiary, 'Food', 300)
      ).rejects.toThrow('Category limit exceeded');
    });

    it('should track balance across categories', async () => {
      const beneficiary = await createApprovedBeneficiary();
      const balance = await getCategoryBalance(beneficiary, 'Food');
      expect(balance).toBeGreaterThanOrEqual(0);
    });
  });
});
```

### MerchantRegistry Tests

```typescript
// tests/contracts/merchant.test.ts
describe('MerchantRegistry Contract', () => {
  describe('Merchant Registration', () => {
    it('should register merchant', async () => {
      const merchant = await generateTestAccount();
      await registerMerchant(merchant, 'Test Store', 'Food');
      
      const info = await getMerchantInfo(merchant);
      expect(info.name).toBe('Test Store');
      expect(info.categories).toContain('Food');
    });

    it('should handle pending approval status', async () => {
      const merchant = await registerTestMerchant();
      const approved = await isApproved(merchant);
      expect(approved).toBe(false);
    });
  });

  describe('Merchant Approval', () => {
    it('should approve merchant for category', async () => {
      const merchant = await registerTestMerchant();
      await approveMerchant(admin, merchant);
      await approveForCategory(admin, merchant, 'Food');
      
      const approved = await isApprovedForCategory(merchant, 'Food');
      expect(approved).toBe(true);
    });

    it('should list merchants by category', async () => {
      const m1 = await createApprovedMerchant('Food');
      const m2 = await createApprovedMerchant('Food');
      const m3 = await createApprovedMerchant('Healthcare');
      
      const foodMerchants = await getMerchantsByCategory('Food');
      expect(foodMerchants).toHaveLength(2);
      expect(foodMerchants).toContain(m1);
      expect(foodMerchants).toContain(m2);
      expect(foodMerchants).not.toContain(m3);
    });
  });

  describe('Payment Tracking', () => {
    it('should update received amount', async () => {
      const merchant = await createApprovedMerchant('Food');
      await updateReceived(merchant, 1000);
      
      const info = await getMerchantInfo(merchant);
      expect(info.totalReceived).toBe(1000);
    });
  });
});
```

---

## 🔄 End-to-End Integration Tests

```typescript
// tests/integration/e2e.test.ts
describe('End-to-End Campaign Flow', () => {
  let admin: string;
  let ngo: string;
  let donor1: string;
  let donor2: string;
  let beneficiary: string;
  let merchant: string;

  beforeAll(async () => {
    // Setup all test accounts
    admin = process.env.NEXT_PUBLIC_ADMIN_ADDRESS!;
    ngo = await generateTestAccount();
    donor1 = await generateTestAccount();
    donor2 = await generateTestAccount();
    beneficiary = await generateTestAccount();
    merchant = await generateTestAccount();
    
    // Fund all accounts
    await fundAccount(ngo);
    await fundAccount(donor1);
    await fundAccount(donor2);
    await fundAccount(beneficiary);
    await fundAccount(merchant);
  });

  it('should complete full relief workflow', async () => {
    // 1. NGO Registration and Verification
    await registerNGO(ngo, 'Relief Org', 'Humanitarian aid');
    await verifyNGO(admin, ngo);
    expect(await isVerified(ngo)).toBe(true);

    // 2. Merchant Registration and Approval
    await registerMerchant(merchant, 'Food Store', 'Food');
    await approveMerchant(admin, merchant);
    await approveForCategory(admin, merchant, 'Food');
    expect(await isApprovedForCategory(merchant, 'Food')).toBe(true);

    // 3. Campaign Creation
    const campaignId = await createCampaign(ngo, {
      category: 'Food',
      target: 10000,
      description: 'Winter Relief'
    });
    expect(campaignId).toBeDefined();

    // 4. Donations
    await donate(donor1, campaignId, 6000);
    await donate(donor2, campaignId, 4000);
    const campaignBalance = await getCampaignBalance(campaignId);
    expect(campaignBalance).toBe(10000);

    // 5. Beneficiary Application
    await registerForCampaign(beneficiary, campaignId, 'Need support');
    expect(await getApplicationStatus(beneficiary, campaignId)).toBe('Pending');

    // 6. Beneficiary Approval with Limits
    await approveBeneficiary(admin, beneficiary, campaignId);
    await allocateToBeneficiary(campaignId, beneficiary, 2000, {
      Food: 1500,
      Healthcare: 500
    });
    expect(await isApproved(beneficiary, campaignId)).toBe(true);
    expect(await getBeneficiaryBalance(beneficiary)).toBe(2000);

    // 7. Spending Authorization and Execution
    const authId = await authorizeSpending(beneficiary, merchant, 500, 'Food');
    await executeSpending(beneficiary, merchant, 500, 'Food');
    
    // 8. Verify Final State
    const finalBeneficiaryBalance = await getBeneficiaryBalance(beneficiary);
    expect(finalBeneficiaryBalance).toBe(1500); // 2000 - 500
    
    const foodSpent = await getCategorySpent(beneficiary, 'Food');
    expect(foodSpent).toBe(500);
    
    const merchantInfo = await getMerchantInfo(merchant);
    expect(merchantInfo.totalReceived).toBe(500);
    
    const finalCampaignBalance = await getCampaignBalance(campaignId);
    expect(finalCampaignBalance).toBe(8000); // 10000 - 2000 allocated
  });

  it('should handle concurrent operations', async () => {
    const campaignId = await createTestCampaign();
    
    // Multiple donors donating simultaneously
    await Promise.all([
      donate(donor1, campaignId, 1000),
      donate(donor2, campaignId, 1000),
    ]);
    
    const balance = await getCampaignBalance(campaignId);
    expect(balance).toBe(2000);
  });

  it('should maintain data consistency across contracts', async () => {
    // Create complete scenario
    const { campaignId, beneficiary, merchant } = await setupCompleteScenario();
    
    // Perform spending
    await authorizeSpending(beneficiary, merchant, 200, 'Food');
    await executeSpending(beneficiary, merchant, 200, 'Food');
    
    // Verify consistency across all contracts
    const vaultBalance = await getCampaignBalance(campaignId);
    const beneficiaryBalance = await getBeneficiaryBalance(beneficiary);
    const categorySpent = await getCategorySpent(beneficiary, 'Food');
    const merchantReceived = (await getMerchantInfo(merchant)).totalReceived;
    
    // All data should be consistent
    expect(categorySpent).toBe(200);
    expect(merchantReceived).toBeGreaterThanOrEqual(200);
  });
});
```

---

## 🛠️ Test Utilities

```typescript
// tests/utils/helpers.ts
import { Keypair } from '@stellar/stellar-sdk';

export async function generateTestAccount(): Promise<string> {
  const keypair = Keypair.random();
  return keypair.publicKey();
}

export async function fundAccount(address: string): Promise<void> {
  const response = await fetch(
    `https://friendbot.stellar.org?addr=${address}`,
    { method: 'POST' }
  );
  if (!response.ok) {
    throw new Error(`Failed to fund account: ${address}`);
  }
}

export async function waitForTransaction(txHash: string): Promise<void> {
  // Poll for transaction confirmation
  const maxAttempts = 30;
  for (let i = 0; i < maxAttempts; i++) {
    try {
      const tx = await getTransaction(txHash);
      if (tx.status === 'SUCCESS') return;
    } catch (e) {
      // Transaction not yet confirmed
    }
    await sleep(1000);
  }
  throw new Error(`Transaction ${txHash} not confirmed`);
}

export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
```

---

## 📊 Test Coverage Goals

- **Contract Functions:** 100% coverage
- **Integration Paths:** All major workflows tested
- **Error Scenarios:** All error paths covered
- **Edge Cases:** Boundary values and race conditions tested
- **Security:** Access control and authorization tested

---

## ▶️ Running Tests

```bash
# Install dependencies
npm install --save-dev jest @testing-library/react @testing-library/jest-dom

# Run all tests
npm test

# Run specific test suite
npm test -- tests/contracts/vault.test.ts

# Run with coverage
npm test -- --coverage

# Run in watch mode
npm test -- --watch
```

---

## ✅ Test Status

Current implementation: **FRAMEWORK DEFINED**  
Tests to implement: **24 test suites**  
Expected total tests: **~150 individual tests**

**Priority:**
1. Contract unit tests (HIGH)
2. Integration tests (HIGH)
3. E2E tests (MEDIUM)
4. Performance tests (LOW)
