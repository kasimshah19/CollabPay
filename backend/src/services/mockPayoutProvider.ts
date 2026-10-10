export interface PayoutResult {
  success: boolean;
  error?: string;
}

export interface IPayoutProvider {
  processPayout(amountPaise: number, upiId: string): Promise<PayoutResult>;
}

export class MockPayoutProvider implements IPayoutProvider {
  async processPayout(amountPaise: number, upiId: string): Promise<PayoutResult> {
    const isTest = process.env.NODE_ENV === "test";
    
    if (!isTest) {
      // 1 to 3 seconds delay
      const delay = Math.floor(Math.random() * 2000) + 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    if (upiId === "fail@mock") {
      return { success: false, error: "Mock failure requested" };
    }
    
    if (upiId === "ok@mock") {
      return { success: true };
    }

    if (isTest) {
      // Deterministic for tests: default to success if not "fail@mock"
      return { success: true };
    }

    // Random success ~80%
    const success = Math.random() < 0.8;
    if (success) {
      return { success: true };
    } else {
      return { success: false, error: "Random network failure" };
    }
  }
}

export const payoutProvider = new MockPayoutProvider();
