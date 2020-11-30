import uuidv4 from './util/uuidv4';

export type SubscriptionId = string;
export interface Subscription {
    readonly id: SubscriptionId;
    readonly isOpen: boolean;
    free(): void;
}

// type ReturnType<T> = T extends (... args: any[]) => infer T ? T : never;
export type Parameters<T> = T extends (...args: infer T) => any ? T : never;
export interface SubscriptionManager<TChannel> {
    subscribe<TEventHandler extends Function = Function>(
        channel: TChannel,
        eventHandler: TEventHandler,
    ): Subscription;
    handler<TEventHandler extends Function = Function>(channel: TChannel): TEventHandler[];
    publish<TEventHandler extends Function = Function>(
        channel: TChannel,
        ...args: Parameters<TEventHandler>
    ): void;
}

class _Subscription<TChannel> implements Subscription {
    public readonly id: SubscriptionId;
    private _isOpen = true;

    constructor(private readonly sm: _SubscriptionManager<TChannel>) {
        this.id = uuidv4();
    }

    free(): void {
        this.sm.unsubscribe(this);
        this._isOpen = false;
    }

    get isOpen(): boolean {
        return this._isOpen;
    }

    close(): void {
        this._isOpen = false;
    }
}

class _SubscriptionManager<TChannel> implements SubscriptionManager<TChannel> {
    private readonly _handlerForSubscription = new Map<SubscriptionId, any>();
    private readonly _subscriptionForChannel = new Map<TChannel, SubscriptionId[]>();

    subscribe<TEventHandler = Function>(
        channel: TChannel,
        eventHandler: TEventHandler,
    ): Subscription {
        const subscription = new _Subscription(this);
        this._handlerForSubscription.set(subscription.id, eventHandler);
        this.subscriptionForChannel(channel).push(subscription.id);
        return subscription;
    }

    unsubscribe(subscription: Subscription): void {
        this._handlerForSubscription.delete(subscription.id);
        for (let subscriptions of this._subscriptionForChannel.values()) {
            const i = subscriptions.indexOf(subscription.id);
            if (i >= 0) {
                subscriptions.splice(i, 1);
                break;
            }
        }
    }

    handler<TEventHandler extends Function = Function>(channel: TChannel): TEventHandler[] {
        const subscriptionIds = this.subscriptionForChannel(channel);
        if (subscriptionIds.length === 0) {
            return [];
        }
        return subscriptionIds.map((sub) => this.handlerForSubscriptionId<TEventHandler>(sub));
    }

    publish<TEventHandler extends Function = Function>(
        channel: TChannel,
        ...args: Parameters<TEventHandler>
    ): void {
        this.handler<TEventHandler>(channel).forEach((h: TEventHandler) => h(...args));
    }

    private handlerForSubscriptionId<TEventHandler>(subscriptionId: SubscriptionId): TEventHandler {
        return this._handlerForSubscription.get(subscriptionId)!;
    }

    private subscriptionForChannel(channel: TChannel): SubscriptionId[] {
        let subscriptionIds: SubscriptionId[] | undefined = this._subscriptionForChannel.get(
            channel,
        );
        if (!subscriptionIds) {
            subscriptionIds = [];
            this._subscriptionForChannel.set(channel, subscriptionIds);
        }
        return subscriptionIds;
    }
}

export function createSubscriptionManager<TChannel = string>(): SubscriptionManager<TChannel> {
    return new _SubscriptionManager<TChannel>();
}
