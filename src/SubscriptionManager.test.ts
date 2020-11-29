import { SubscriptionManager } from './SubscriptionManager';

 
describe('Subscription Manager', () => {
   let sm: SubscriptionManager<string, Function>;
 
   beforeEach(() => {
       sm = new SubscriptionManager<string, Function>();
   });
 
   it('A new handler should be registered for (and only for) a given channel.', () => {
       const handler = () => {};
       const sub = sm.subscribe('foo', handler);
       expect(sub).toBeDefined();
 
       const fooHandlers = sm.handlerForChannel('foo');
       expect(fooHandlers).toBeDefined();
       expect(fooHandlers).toHaveLength(1);
       expect(fooHandlers).toContain(handler);
 
       const barHandlers = sm.handlerForChannel('bar');
       expect(barHandlers).toBeDefined();
       expect(barHandlers).toHaveLength(0);
 
       sm.unsubscribe(sub);
       const fooHandlersAfterUnsubscribe = sm.handlerForChannel('foo');
       expect(fooHandlersAfterUnsubscribe).toBeDefined();
       expect(fooHandlersAfterUnsubscribe).toHaveLength(0);
   });
});
