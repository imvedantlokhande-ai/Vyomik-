# Security Specification - VYOMIK Firestore Rules

This document outlines the security architecture, invariants, and authorization specifications for the Firestore database backing VYOMIK.

## 1. Data Invariants

- **Profile Ownership**: Every user profile document (under `/profiles/{userId}`) belongs to exactly one authenticated user whose `request.auth.uid` matches the document ID `{userId}`.
- **Access Control Isolation**: A user can only read, create, update, or delete their own profile. Cross-user reading or writing of profiles is strictly forbidden.
- **Language Preferences**: The language chosen must be one of 'English', 'Hindi', or 'Marathi'.
- **Immortal Field**: Once created, the `id` field of a profile cannot be altered or modified by any user.
- **Timestamp Integrity**: `updatedAt` and `createdAt` must match server time during write operations.

---

## 2. The "Dirty Dozen" Payloads

Here are 12 specific payloads designed to break Identity, Integrity, and State, which the Firestore rules must securely block.

### Payload 1: ID Poisoning (Sizing Attack)
- **Target Path**: `/profiles/extremely_long_junk_id_designed_to_cause_resource_exhaustion`
- **Payload**: `{ "id": "extremely_long...", "name": "Rahul" }`
- **Expected Outcome**: `PERMISSION_DENIED` (ID must conform to standard size <= 128 characters).

### Payload 2: Identity Spoofing (Modifying user ID)
- **Target Path**: `/profiles/userA`
- **Payload**: `{ "id": "userB", "name": "Rahul Patil" }`
- **Expected Outcome**: `PERMISSION_DENIED` (UID in profile must match authorized user ID).

### Payload 3: Cross-User Read (Infiltration)
- **Target Path**: `/profiles/victimUID` (read by malicious hacker `attackerUID`)
- **Expected Outcome**: `PERMISSION_DENIED` (only owner can read).

### Payload 4: Cross-User Write (Privilege Escalation)
- **Target Path**: `/profiles/victimUID` (write by `attackerUID`)
- **Expected Outcome**: `PERMISSION_DENIED` (only owner can write).

### Payload 5: Anonymous Profile Creation
- **Target Path**: `/profiles/unverifiedUser` (unauthenticated request)
- **Expected Outcome**: `PERMISSION_DENIED` (must be authenticated to write).

### Payload 6: Invalid Caste/Category Enum Injection
- **Target Path**: `/profiles/userA`
- **Payload**: `{ "casteCategory": "SuperElite" }`
- **Expected Outcome**: `PERMISSION_DENIED` (must be within designated category enums).

### Payload 7: Negative Capital/Financial Inputs
- **Target Path**: `/profiles/userA`
- **Payload**: `{ "availableCapital": -50000 }`
- **Expected Outcome**: `PERMISSION_DENIED` (financial values must be non-negative).

### Payload 8: Immutable Field Bypass
- **Target Path**: `/profiles/userA`
- **Operation**: Update `id` from `"userA"` to `"userC"`
- **Expected Outcome**: `PERMISSION_DENIED` (id field is immutable).

### Payload 9: Future Timestamp Poisoning
- **Target Path**: `/profiles/userA`
- **Payload**: `{ "createdAt": "2030-01-01T00:00:00Z" }`
- **Expected Outcome**: `PERMISSION_DENIED` (timestamps must align with `request.time`).

### Payload 10: Value Poisoning (Oversized string injection)
- **Target Path**: `/profiles/userA`
- **Payload**: `{ "name": "A" * 10000 }`
- **Expected Outcome**: `PERMISSION_DENIED` (name field must not exceed 200 characters).

### Payload 11: Missing Required Fields on Create
- **Target Path**: `/profiles/userA`
- **Payload**: `{ "id": "userA" }` (Missing required `name`, `village`, etc.)
- **Expected Outcome**: `PERMISSION_DENIED` (schema requires specific fields).

### Payload 12: Invalid Language Preference
- **Target Path**: `/profiles/userA`
- **Payload**: `{ "preferredLanguage": "Spanish" }`
- **Expected Outcome**: `PERMISSION_DENIED` (only English, Hindi, and Marathi are supported).

---

## 3. The Test Runner (`firestore.rules.test.ts`)

```typescript
import { initializeTestEnvironment, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import { readFileSync } from 'fs';

let testEnv: RulesTestEnvironment;

beforeAll(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: 'gen-lang-client-0734281467',
    firestore: {
      rules: readFileSync('firestore.rules', 'utf8'),
    },
  });
});

afterAll(async () => {
  await testEnv.cleanup();
});

describe('Firestore Security Rules - Vyomik Profiles', () => {
  it('should block unauthenticated read/write to profiles', async () => {
    const unauthedDb = testEnv.unauthenticatedContext().firestore();
    await expect(unauthedDb.doc('profiles/user1').get()).rejects.toThrow();
    await expect(unauthedDb.doc('profiles/user1').set({ name: 'Rahul' })).rejects.toThrow();
  });

  it('should allow user to read and write their own profile', async () => {
    const userDb = testEnv.authenticatedContext('user_123').firestore();
    const profileRef = userDb.doc('profiles/user_123');
    
    // Creating matching profile should succeed
    await expect(profileRef.set({
      id: 'user_123',
      name: 'Rahul Patil',
      village: 'Rajur',
      district: 'Nashik',
      state: 'Maharashtra',
      preferredLanguage: 'Marathi',
      availableCapital: 200000,
      monthlyExpenses: 30000,
      casteCategory: 'OBC',
      skills: ['Dairy farming'],
      resources: ['Small cattle shed'],
      experience: '3 years',
      businessType: 'Dairy',
      businessStage: 'Idea',
      businessGoal: 'Start a profitable local business',
      riskAppetite: 'Balanced'
    })).resolves.not.toThrow();

    // Reading should succeed
    await expect(profileRef.get()).resolves.not.toThrow();
  });

  it('should prevent user from reading or writing other user profiles', async () => {
    const attackerDb = testEnv.authenticatedContext('attacker_uid').firestore();
    await expect(attackerDb.doc('profiles/user_123').get()).rejects.toThrow();
    await expect(attackerDb.doc('profiles/user_123').update({ name: 'Hacked' })).rejects.toThrow();
  });
});
```
