export enum PaymentMethod {
    Card = "card",
    BankTransfer = "bank_transfer",
    Wallet = "wallet",
}

export type PaymentIntent = {
    orderId: string;
    amountCents: number;
    method: PaymentMethod;
    metadata?: Record<string, string>;
};

export type ChargeResult = {
    approved: boolean;
    providerRef: string;
    declineReason?: string;
};

export interface PaymentGateway {
    charge(intent: PaymentIntent): Promise<ChargeResult>;
}

export class MockGateway implements PaymentGateway {
    async charge(intent: PaymentIntent): Promise<ChargeResult> {
        if (intent.amountCents <= 0) {
            return {
                approved: false,
                providerRef: "mock-decline",
                declineReason: "invalid_amount",
            };
        }

        return {
            approved: true,
            providerRef: `mock-${intent.orderId}`,
        };
    }
}

export class BillingService {
    constructor(private readonly gateway: PaymentGateway) { }

    async authorizeOrder(intent: PaymentIntent): Promise<ChargeResult> {
        return this.gateway.charge(intent);
    }
}
