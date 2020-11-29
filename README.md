# Subscription Manager

![https://github.com/pawsaw/subscription-manager](https://raw.githubusercontent.com/pawsaw/subscription-manager/master/assets/images/subscription-manager.svg)

## What is it?

Subscription Manager - Lightweight JavaScript and TypeScript Utility for managing Subscriptions.

## Why Subscription Manager?

The best way to describe a situation is often by Example.

So here we go...

### Example (TypeScript): ChatService

We want to implement a _ChatService_ that looks like this:

```ts
export interface OnChatMessageReceived {
    (msg: ChatMessage): void;
}

export interface ChatService {
    onChatMessageReceived(listener: OnChatMessageReceived): Subscription;
}
```

... and a _Client_ using it:

```ts
const chatService = // ... access the instance somehow

const onChatMessageReceived: OnChatMessageReceived = (msg: ChatMessage) => {
  console.log(`Got new message: ${msg}`);
};

// start listening for incomming messages
const sub = chatService.onChatMessageReceived(onChatMessageReceived);

// and if we're not longer interested in receiving messages ...
sub.free();
```

As you can see here, the _ChatService_ may be a singleton (not mandatory), where **several (!) clients may want to register** to receive messages.

If a client is no longer interested in receiving the messages, he wants to **unsubscribe**.

Maybe you want to offer another method in the ChatService to get information about new ChatUsers, as the following example shows:

```ts
export interface OnChatMessageReceived {
    (msg: ChatMessage): void;
}

export interface OnNewChatUser {
    (user: ChatUser): void;
}

export interface ChatService {
    onChatMessageReceived(listener: OnChatMessageReceived): Subscription;
    onNewChatUser(listener: OnNewChatUser): Subscription;
}
```

It is easy to see that the implementation of subscription management is quite complex and potentially repetitive.

**Wouldn't it be nice to have a utility here that would make our work easier?**

## How to use the Subscription Manager?

```ts
import {
  createSubscriptionManager,
  SubscriptionManager,
  Subscription
} from '@pawsaw/subscription-manager';

// [ ... ]

export interface OnChatMessageReceived {
  (msg: ChatMessage): void;
}

export interface OnNewChatUser {
  (user: ChatUser): void;
}

export class ChatService {

    // Usually one SubscriptionManager per service
  private sm = createSubscriptionManager();

  private anyAsyncDatasource = // any async data source

  onChatMessageReceived(listener: OnChatMessageReceived): Subscription {
    return this.sm.subscribe('onChatMessageReceived', listener);
  }

  onNewChatUser(listener: OnNewChatUser): Subscription {
    return this.sm.subscribe('onNewChatUser', listener);
  }

  private initDataSource(): void {
    this.anyAsyncDatasource.receive((type, data) => {
      if (type === 'message') {
        this.sm.handler<OnChatMessageReceived>('onChatMessageReceived').forEach(h => h(data as ChatMessage));
      } else if (type === 'user') {
        this.sm.handler<OnNewChatUser>('onNewChatUser').forEach(h => h(data as ChatUser));
      }
    });
  }
}
```

Stay tuned and **_keep on coding_**.
