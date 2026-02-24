export enum OrderStatus {
    Pending = "pending",
    Confirmed = "confirmed",
    Cancelled = "cancelled",
}

export interface Order {
    id: string;
    userId: string;
    totalCents: number;
    status: OrderStatus;
    createdAt: number;
}

export interface CreateOrderInput {
    userId: string;
    totalCents: number;
}

export class OrderRepository {
    private readonly orders: Order[] = [];

    save(order: Order): Order {
        this.orders.push(order);
        return order;
    }

    findById(orderId: string): Order | undefined {
        return this.orders.find((candidate) => candidate.id === orderId);
    }
}

export class OrderService {
    constructor(private readonly repository: OrderRepository) { }

    createOrder(input: CreateOrderInput): Order {
        const order: Order = {
            id: createOrderId(),
            userId: input.userId,
            totalCents: input.totalCents,
            status: OrderStatus.Pending,
            createdAt: Date.now(),
        };

        return this.repository.save(order);
    }

    confirmOrder(orderId: string): Order {
        const order = this.repository.findById(orderId);
        if (!order) {
            throw new Error("Order not found");
        }

        order.status = OrderStatus.Confirmed;
        return order;
    }
}

const defaultOrderService = new OrderService(new OrderRepository());

export function createOrder(userId: string, totalCents: number): Order {
    return defaultOrderService.createOrder({ userId, totalCents });
}

export function confirmOrder(orderId: string): Order {
    return defaultOrderService.confirmOrder(orderId);
}

function createOrderId(): string {
    return Math.random().toString(36).slice(2, 10);
}
