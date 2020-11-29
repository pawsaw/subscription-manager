import { createSubscriptionManager, SubscriptionManager } from './SubscriptionManager';

describe('Subscription Manager', () => {
    let sm: SubscriptionManager<string>;

    beforeEach(() => {
        sm = createSubscriptionManager();
    });

    it('A new handler should be registered for (and only for) a given channel.', () => {
        const handler = () => {};
        const sub = sm.subscribe('foo', handler);
        expect(sub).toBeDefined();

        const fooHandlers = sm.handler('foo');
        expect(fooHandlers).toBeDefined();
        expect(fooHandlers).toHaveLength(1);
        expect(fooHandlers).toContain(handler);

        const barHandlers = sm.handler('bar');
        expect(barHandlers).toBeDefined();
        expect(barHandlers).toHaveLength(0);

        sub.free();
        const fooHandlersAfterUnsubscribe = sm.handler('foo');
        expect(fooHandlersAfterUnsubscribe).toBeDefined();
        expect(fooHandlersAfterUnsubscribe).toHaveLength(0);
    });
});
