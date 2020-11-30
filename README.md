# Subscription Manager

![https://github.com/pawsaw/subscription-manager](https://raw.githubusercontent.com/pawsaw/subscription-manager/master/assets/images/subscription-manager.svg)

## What is it?

Subscription Manager - Lightweight JavaScript and TypeScript Utility for managing Subscriptions.

## Why Subscription Manager?

-   Designed with one goal in mind: **managing subscriptions**.
-   **No dependencies** and an incredibly **small footprint**.
-   Developed in TypeScript, usable in **TypeScript** and **JavaScript**.
-   **Elegan**t and **easy to use**.

The best way to describe a situation is often by Example.

## Setup

```sh
npm i @pawsaw/subscription-manager
```

## Subscription Manager API

### Obtain an instance of Subscription Manager

At the beginning it is necessary to get an instance of the Subscription Manager.

```ts
import {
    createSubscriptionManager,
    SubscriptionManager,
    Subscription,
} from '@pawsaw/subscription-manager';

const sm: SubscriptionManager<string> = createSubscriptionManager();
```

Here _string_ is the data type of the channel, as default. Other data types are acceptable, but less unusual.

Here a Subscription Manager is created, where the channels are of the datatype _number_:

```ts
const sm: SubscriptionManager<number> = createSubscriptionManager<number>();
```

### subscribe

We **_subscribe_** to a certain channel and define a callback function that takes any parameters. The parameters must be the same as in the counterpart, the **_publish_** method.

```ts
function onChatMessageReceived(msg: string): void {
    // ...
}

const sub = sm.subscribe('chatMessages', onChatMessageReceived);
```

The result of the _subscribe_ method is a _Subscription_.

### publish

To broadcast data, we use the publish method.

```ts
sm.publish('chatMessages', 'Hello World');
```

For all _Subscribers_ on this channel the stored callback is called.

### Typesafe publish and subscribe

In TypeScript it makes sense to get as much as possible out of static type checking.

```ts
interface OnChatMessageReceived {
    (msg: string): void;
}

const onChatMessageReceived: OnChatMessageReceived = (msg: string) => {
    // ...
};

const sub = sm.subscribe<OnChatMessageReceived>('chatMessages', onChatMessageReceived);
```

When publishing we can ensure the integrity of the parameters with respect to the type by explicitly specifying the type of the callback.

```ts
sm.publish<OnChatMessageReceived>('chatMessages', 'Hello World');
```

**Note:** The Subscription Manager may handle different types of callbacks on different channels.

### free

If a subscription is no longer needed, be sure to free it.

```ts
sub.free();
```

## Example (TypeScript): ChatService

We want to implement a _ChatService_ that looks like this:

```ts
export interface OnChatMessageReceived {
    (msg: string): void;
}

export interface ChatService {
    onChatMessageReceived(listener: OnChatMessageReceived): Subscription;
}
```

... and a _Client_ using it:

```ts
const chatService = ChatService.instance(); // ... access the instance somehow

const onChatMessageReceived: OnChatMessageReceived = (msg: string) => {
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
    (msg: string): void;
}

export interface OnNewChatUser {
    (user: string): void;
}

export interface ChatService {
    onChatMessageReceived(listener: OnChatMessageReceived): Subscription;
    onNewChatUser(listener: OnNewChatUser): Subscription;
}
```

It is easy to see that the implementation of subscription management is quite complex and potentially repetitive.

**Wouldn't it be nice to have a utility here that would make our work easier?**

### How to use the Subscription Manager?

```ts
import {
    createSubscriptionManager,
    SubscriptionManager,
    Subscription,
} from '@pawsaw/subscription-manager';

// [ ... ]

export interface OnChatMessageReceived {
    (msg: string): void;
}

export interface OnNewChatUser {
    (user: string): void;
}

export class ChatService {
    // Usually one SubscriptionManager per service
    private sm = createSubscriptionManager();

    private anyAsyncDatasource = any; // any async data source

    onChatMessageReceived(listener: OnChatMessageReceived): Subscription {
        return this.sm.subscribe('onChatMessageReceived', listener);
    }

    onNewChatUser(listener: OnNewChatUser): Subscription {
        return this.sm.subscribe('onNewChatUser', listener);
    }

    private initDataSource(): void {
        this.anyAsyncDatasource.receive((type: string, data: string) => {
            if (type === 'message') {
                this.sm.publish<OnChatMessageReceived>('onChatMessageReceived', data);
            } else if (type === 'user') {
                this.sm.publish<OnNewChatUser>('onNewChatUser', data);
            }
        });
    }
}
```

That's it folks!

Stay tuned and **_keep on coding_**.
