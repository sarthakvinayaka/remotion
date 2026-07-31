// Word-anchor schedules: map specific spoken words (by their real whisper
// frame timestamp, global to the whole video) to "typing should have reached
// through this line index by now". Interpolated smoothly between anchors so
// the typewriter's pace follows the actual narration instead of a flat
// linear reveal across the segment's whole duration.
export type Anchor = { atFrame: number; throughLine: number };

export const TYPING_SCHEDULES: Record<string, Anchor[]> = {
  setup_hashmap: [
    { atFrame: 1973, throughLine: 0 }, // "import what we need" -> import uuid
    { atFrame: 2022, throughLine: 0 }, // "uuid to generate order ids"
    { atFrame: 2093, throughLine: 1 }, // "threading because we'll need a lock"
    { atFrame: 2181, throughLine: 2 }, // "time so we can fake some delay"
    { atFrame: 2299, throughLine: 3 }, // "queue for our pipeline"
    { atFrame: 2368, throughLine: 4 }, // "random, we'll use that later"
    { atFrame: 2442, throughLine: 6 }, // "here's the important line, order store" -> order_store = {}
    { atFrame: 2701, throughLine: 7 }, // "store lock, we are adding this now"
  ],
  order_service: [
    { atFrame: 3046, throughLine: 9 }, // "this function is our order service" -> def create_order(...)
    { atFrame: 3134, throughLine: 10 }, // "we make a short random ID for the order" -> order_id = str(uuid.uuid4())[:8]
    { atFrame: 3228, throughLine: 11 }, // "we grab the lock using the with block"
    { atFrame: 3550, throughLine: 12 }, // "inside we save the order into a dict, item, quantity, status"
    { atFrame: 4037, throughLine: 12 }, // hold on the dict/status field through "keep an eye on status field..."
  ],
  queue_payment: [
    { atFrame: 4037, throughLine: 9 }, // "okay so we make three queues" -> queue.Queue() lines start
    { atFrame: 4151, throughLine: 11 }, // "one for each step... think of this like Kafka" -> all 3 queues
    { atFrame: 4289, throughLine: 21 }, // "this payment service function is just run forever in a loop" -> def payment_service / while True
    { atFrame: 4437, throughLine: 23 }, // "gets called, just wait patiently until something shows up" -> .get()
    { atFrame: 4646, throughLine: 24 }, // "once an order comes up, we sleep for half a second" -> time.sleep(0.5)
    { atFrame: 4844, throughLine: 26 }, // "then we update our hashmap" -> status = "PAID"
    { atFrame: 4900, throughLine: 27 }, // "print it out"
    { atFrame: 4925, throughLine: 28 }, // "push it onto the next queue, inventory" -> inventory_queue.put
    { atFrame: 5149, throughLine: 18 }, // "just adding one line up here... after we save the order, we drop it onto the payment queue" -> payment_queue.put in create_order
  ],
  inventory_notification: [
    { atFrame: 5432, throughLine: 31 }, // "same idea again, just two more times" -> def inventory_service():
    { atFrame: 5481, throughLine: 33 }, // "inventory, wait for something to show up" -> .get()
    { atFrame: 5550, throughLine: 36 }, // "mark it as reserved" -> status = "INVENTORY_RESERVED"
    { atFrame: 5601, throughLine: 38 }, // "and hand it off" -> notification_queue.put
    { atFrame: 5650, throughLine: 41 }, // "notification waits" -> def notification_service():
    { atFrame: 5689, throughLine: 46 }, // "mark the order as completed" -> status = "COMPLETED"
    { atFrame: 5740, throughLine: 47 }, // "now we have four services running, none calling each other" -> print(...) full state
    { atFrame: 5903, throughLine: 48 }, // "everything just flows through the dict and the queues" -> task_done, end of block
  ],
  wire_and_run: [
    { atFrame: 5986, throughLine: 50 }, // "let's actually start all these services as threads"
    { atFrame: 6268, throughLine: 53 }, // "let's create two orders" -> create_order("Wireless Mouse", 2)
    { atFrame: 6296, throughLine: 54 }, // "...and give it a few seconds" -> create_order("Mechanical Keyboard", 1)
    { atFrame: 6335, throughLine: 56 }, // "a few seconds to finish" -> time.sleep(3)
    { atFrame: 6381, throughLine: 57 }, // "and look at that, two orders going through all four services" -> print("\nFinal state:")
    { atFrame: 6542, throughLine: 59 }, // "our hashmap showing up exactly where each order ended up" -> for loop printing order_store
  ],
  failure_handling: [
    { atFrame: 6730, throughLine: 2 }, // "this whole run assumed everything worked perfectly" -> recap happy-path get()
    { atFrame: 6874, throughLine: 6 }, // "payment gateway times out all the time" -> raise Exception("Gateway timeout")
    { atFrame: 6948, throughLine: 3 }, // "so here's a super simple way... wrap the whole work in a try"
    { atFrame: 7129, throughLine: 10 }, // "if it fails, we throw it right back on the queue" -> except block
    { atFrame: 7161, throughLine: 12 }, // "...and try again" -> payment_queue.put(order_id)
    { atFrame: 7482, throughLine: 13 }, // "the idea stays the same, a failure should have crashed the whole pipeline" -> finally:
    { atFrame: 7609, throughLine: 14 }, // "it should get retried" -> payment_queue.task_done()
  ],
};
