# CollabPay - Phase 4 Audit Report

## 1. What was Completed
In Phase 4, the core backend logic for Campaign Management, Creator Applications, and Atomic Approvals was successfully developed.

* **Models Created:** `Campaign` and `Application` models were created with the required Mongoose schema constraints (budgetPaise, feePerCreatorPaise, slots, status).
* **Validation (Zod):** Strict validation was implemented using Zod to ensure that `budgetPaise` is always greater than or equal to `feePerCreatorPaise`, and that the `submissionDeadline` occurs after the `applicationDeadline`.
* **Services & Transactions:** All business logic was implemented in `campaign.service.ts` and `application.service.ts`. The approval process is entirely race-condition-free, utilizing MongoDB transactions (`session.withTransaction`).
* **API Endpoints:**
  * **Brand:** Endpoints to create, edit, cancel campaigns, list their own campaigns, and approve/reject applications.
  * **Creator:** Endpoints to view open campaigns (including `payoutPreview`), apply to campaigns, and withdraw their applications.
* **Testing:** 
  * Unit tests implemented for Zod schemas.
  * Integration tests executed against a real MongoDB test cluster covering race conditions (Slots race, budget race, double approve, withdraw, edit limits, and cancel behavior).
  * The complete API flow was manually verified using a PowerShell script (`verify-phase4.ps1`).
* **Git Commit:** The code was successfully committed with the message: `feat(backend): add campaigns, applications and atomic approval`.

## 2. Design Decisions & Implementation Details

1. **Paise as Integers:** 
   All monetary values (budget, fee) are strictly received, calculated, and stored in integer `paise` to completely eliminate float precision issues. The frontend will handle currency formatting. API responses dynamically include a `payoutPreview` calculated in paise.

2. **Atomic Approval (No Race Conditions):** 
   If 5 creators apply concurrently and only 1 slot is available, the system utilizes MongoDB's `$expr` conditional update to approve only the first one. The remaining transactions will safely fail and rollback with `CAMPAIGN_FULL` or `BUDGET_EXCEEDED` errors.
   The atomic query `Campaign.findOneAndUpdate({ $expr: { $and: [...] } })` guarantees that `approvedCount < slots` and that the budget is never exceeded.

3. **Fee Lock & Edit Restrictions:**
   The brand can only edit the `feePerCreatorPaise` while `approvedCount === 0`. As soon as the first creator is approved, the fee is snapshot onto the application document as `reservedFeePaise`, locking the campaign's fee from further edits.
   Additionally, a brand can never reduce the slots below the current `approvedCount` or lower the budget below the currently `reservedPaise`.

4. **Withdraw Logic:**
   When a creator withdraws their approved application (which is only allowed before they submit their work), an atomic transaction executes. It decrements the `approvedCount` by 1 and releases the `reservedPaise` back into the campaign pool, automatically opening up the slot and budget for new applicants.

5. **Cancel Campaign Logic:**
   If a brand cancels a campaign, a transaction is triggered that changes the campaign's status to "cancelled" and automatically rejects all "pending" applicants with the reason `campaign_cancelled`. However, creators that were already "approved" retain their reservation securely (their state is untouched). This ensures they can still submit their work and receive their payout in Phase 5.

## 3. Readiness for Next Phase
All manual API verifications and automated tests for Phase 4 have passed successfully. The backend is now fully prepared for Phase 5, which will involve implementing **Submissions**, **Wallet (Ledger)**, and **Withdrawals**.
