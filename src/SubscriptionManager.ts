import uuidv4 from './util/uuidv4';

export type Subscription = string;

export class SubscriptionManager<TChannel, TEventHandler extends Function> {
  private readonly _handlerForSubscription = new Map<Subscription, TEventHandler>();
  private readonly _subscriptionForChannel = new Map<TChannel, Subscription[]>();

  constructor() {}

  subscribe(channel: TChannel, eventHandler: TEventHandler): Subscription {
      const subscription: Subscription = uuidv4();
      this._handlerForSubscription.set(subscription, eventHandler);
      this.subscriptionForChannel(channel).push(subscription);
      return subscription;
  }

  unsubscribe(subscription: Subscription): void {
      this._handlerForSubscription.delete(subscription);
      for (let subscriptions of this._subscriptionForChannel.values()) {
          const i = subscriptions.indexOf(subscription);
          if (i >= 0) {
              subscriptions.splice(i, 1);
              break;
          }
      }
  }

  handlerForChannel(channel: TChannel): TEventHandler[] {
      const subscriptions = this.subscriptionForChannel(channel);
      if (subscriptions.length === 0) {
          return [];
      }
      return subscriptions.map((sub) => this.handlerForSubscription(sub));
  }

  private handlerForSubscription(subscription: Subscription): TEventHandler {
      return this._handlerForSubscription.get(subscription)!;
  }

  private subscriptionForChannel(channel: TChannel): Subscription[] {
      let subscriptions: Subscription[] | undefined = this._subscriptionForChannel.get(channel);
      if (!subscriptions) {
          subscriptions = [];
          this._subscriptionForChannel.set(channel, subscriptions);
      }
      return subscriptions;
  }
}
