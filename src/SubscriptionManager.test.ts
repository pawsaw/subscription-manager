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

    it('The handler should be called numerous times while publishing.', () => {
        const handlerImpl = (n: number) => {
            expect(n).toBeDefined();
            expect(n).toBeGreaterThan(0);
        };

        const handler = jest.fn().mockImplementation(handlerImpl);

        const sub1 = sm.subscribe('foo', handler);
        const sub2 = sm.subscribe('foo', handler);

        sm.publish<typeof handlerImpl>('foo', 1);
        sm.publish<typeof handlerImpl>('foo', 2);
        sm.publish<typeof handlerImpl>('foo', 3);

        expect(handler).toBeCalledTimes(6);

        sub1.free();

        handler.mockClear();

        sm.publish<typeof handlerImpl>('foo', 1);
        sm.publish<typeof handlerImpl>('foo', 2);
        sm.publish<typeof handlerImpl>('foo', 3);

        expect(handler).toBeCalledTimes(3);

        sub2.free();

        handler.mockClear();

        sm.publish<typeof handlerImpl>('foo', 1);
        sm.publish<typeof handlerImpl>('foo', 2);
        sm.publish<typeof handlerImpl>('foo', 3);

        expect(handler).toBeCalledTimes(0);
    });
});
