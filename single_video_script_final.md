# Single Video Script: "Microservices Explained with HashMap + Queue"
**Target length: ~8:30–9:00**
**How to read this: each line is one sentence. Full stop at the end of every line means stop there. Take a small breath before the next line.**

---

## [0:00–0:30] Hook

Okay so think about this.

You order something online.

Just one click.

But that one click actually kicks off four or five different services behind the scenes.

One handles the order.

One handles payment.

One checks stock.

One sends you a notification.

And here's the cool part.

None of them are waiting around for each other.

Today I'm gonna build this whole thing from scratch in Python.

We just need two things.

A HashMap and a Queue.

That's it.

Let's get into it.

**Visual:** Title card, then diagram: Client → Order Service → Queue → [Payment → Inventory → Notification]

---

## [0:30–1:15] The two core ideas

So there's basically two ideas doing all the heavy lifting here.

First one, HashMap.

In Python that's just a dict.

We're using it to store the order status.

And the whole point is it's super fast to look something up.

Doesn't matter if there's ten orders or ten million.

It doesn't slow down.

Second one, Queue.

This is the fun part.

Instead of the Order Service directly calling the Payment Service.

And waiting for a reply.

It just drops the order in a queue and moves on.

Payment picks it up whenever it's free.

Nobody's sitting around waiting.

That's basically the whole secret behind microservices.

Alright, let's actually build it.

**Visual:** Split screen — dict on left, FIFO queue animation on right.

---

## [1:15–2:15] Setup + the HashMap

**Live-type:**
```python
import uuid
import threading
import time
import queue
import random

order_store = {}
store_lock = threading.Lock()
```

**Narration while typing:**

Let's just import what we need.

Uuid to generate order IDs.

Threading because we'll need a lock in a sec.

Time so we can fake some delay.

Like a real service would have.

Queue for our pipeline.

And random.

We'll use that later.

Now here's the important line.

Order_store.

Just an empty dict.

This is our HashMap.

This is where every order's status is gonna live.

And store_lock.

We're adding this now.

Because in a bit.

Multiple services are gonna be touching this same dict at the same time.

So we need to make sure they don't step on each other.

---

## [2:15–3:15] Order Service

**Live-type:**
```python
def create_order(item, qty):
    order_id = str(uuid.uuid4())[:8]
    with store_lock:
        order_store[order_id] = {"item": item, "qty": qty, "status": "CREATED"}
    print(f"[Order Service] Created {order_id} -> {item} x{qty}")
    return order_id
```

**Narration while typing:**

Alright so this function is our Order Service.

First we make a short random ID for the order.

Then we grab the lock using this with block.

It automatically lets go of the lock when we're done.

Even if something goes wrong in between.

So we don't have to worry about it.

Inside, we save the order into our dict.

Item.

Quantity.

And status.

Which starts as CREATED.

Keep an eye on this status field by the way.

Every service coming up is gonna change it.

It's basically how we track where the order is at any point.

---

## [3:15–4:15] The Queue + Payment Service

**Live-type:**
```python
payment_queue = queue.Queue()
inventory_queue = queue.Queue()
notification_queue = queue.Queue()

def payment_service():
    while True:
        order_id = payment_queue.get()
        time.sleep(0.5)
        with store_lock:
            order_store[order_id]["status"] = "PAID"
        print(f"[Payment Service] Payment done for {order_id}")
        inventory_queue.put(order_id)
        payment_queue.task_done()
```

**Narration while typing:**

Okay so we make three queues.

One for each step.

Think of these like a stand-in for something like Kafka in a real company.

Now this payment_service function.

It just runs forever in a loop.

That get call basically just waits patiently until something shows up.

It's not wasting any CPU checking again and again.

Once an order comes in, we sleep for half a second.

Just to pretend like it's actually processing a payment.

Then we update our HashMap.

Print it out.

And push it onto the next queue.

Inventory.

And that's it.

Payment's done its job and moved on.

**Also connect Order Service to this queue:**
```python
def create_order(item, qty):
    order_id = str(uuid.uuid4())[:8]
    with store_lock:
        order_store[order_id] = {"item": item, "qty": qty, "status": "CREATED"}
    print(f"[Order Service] Created {order_id} -> {item} x{qty}")
    payment_queue.put(order_id)   # <-- new line
    return order_id
```
*(quick callout, just point at the new line)*

Just adding one line up here.

After we save the order.

We drop it straight onto the payment queue.

That's literally the whole handoff.

---

## [4:15–5:45] Inventory + Notification Services

**Live-type:**
```python
def inventory_service():
    while True:
        order_id = inventory_queue.get()
        time.sleep(0.3)
        with store_lock:
            order_store[order_id]["status"] = "INVENTORY_RESERVED"
        print(f"[Inventory Service] Stock reserved for {order_id}")
        notification_queue.put(order_id)
        inventory_queue.task_done()

def notification_service():
    while True:
        order_id = notification_queue.get()
        time.sleep(0.2)
        with store_lock:
            order_store[order_id]["status"] = "COMPLETED"
        print(f"[Notification Service] Order {order_id} completed: {order_store[order_id]}")
        notification_queue.task_done()
```

**Narration while typing:**

Same idea again.

Just two more times.

Inventory waits for something to show up.

Marks it as reserved.

And hands it off.

Notification waits.

Marks the order as completed.

So now we've got four services running.

And none of them are directly calling each other.

Everything's just flowing through the dict and the queues.

---

## [5:45–6:45] Wire it up and run it live

**Live-type:**
```python
for target in (payment_service, inventory_service, notification_service):
    threading.Thread(target=target, daemon=True).start()

create_order("Wireless Mouse", 2)
create_order("Mechanical Keyboard", 1)

time.sleep(3)
print("\nFinal state:")
for order_id, data in order_store.items():
    print(order_id, data)
```

**Narration while typing:**

Now let's actually start all these services as threads.

In a real company, each of these would be its own container running somewhere.

But same idea.

Let's create two orders.

And give it a few seconds to finish.

**Run it. Show terminal output streaming live: CREATED → PAID → INVENTORY_RESERVED → COMPLETED for both orders.**

And look at that.

Two orders going through all four services.

Nobody blocking anybody.

And our HashMap's showing us exactly where each order ended up.

---

## [6:45–7:45] What happens when something fails

One more thing before we finish up.

This whole run assumed everything just works perfectly.

But in real life, payment gateways time out all the time.

So here's a super simple way to handle that.

**Live-type:**
```python
def payment_service():
    while True:
        order_id = payment_queue.get()
        try:
            time.sleep(0.5)
            if random.random() < 0.2:
                raise Exception("Gateway timeout")
            with store_lock:
                order_store[order_id]["status"] = "PAID"
            inventory_queue.put(order_id)
        except Exception as e:
            print(f"[Payment Service] FAILED {order_id}: {e} -> retrying")
            payment_queue.put(order_id)
        finally:
            payment_queue.task_done()
```

We just wrap the work in a try except.

If it fails, we throw it right back on the queue.

And try again.

That's a pretty basic retry.

Real systems usually add some delay.

And eventually give up after a few tries.

But the idea stays the same.

A failure shouldn't crash the whole pipeline.

It should just get retried.

---

## [7:45–8:30] Map it to real infrastructure

So let's connect this to what actually happens in the real world.

Our dict basically becomes something like Redis.

Or a row in a database.

Our queue becomes something like Kafka or RabbitMQ.

Our thread becomes an actual container running somewhere in the cloud.

Even our lock becomes some kind of distributed lock at the database level.

So the whole shape of this thing doesn't really change.

It's just the tools that get bigger.

So next time someone asks you in an interview.

Hey, how would you decouple payment from the order flow.

You already know exactly what to say.

---

## [8:30–9:00] Wrap-up + CTA

So that's it.

A full working microservices setup in like seventy lines of Python.

HashMap for keeping track of stuff.

Queue for keeping everything decoupled.

I'll drop the full code below.

Let me know if you want me to redo this with actual Kafka and Redis.

See you in the next one.

**Visual:** End card — subscribe + related video.

---

## Full Code (for description box / GitHub)
```python
import uuid
import threading
import time
import queue
import random

order_store = {}
store_lock = threading.Lock()

payment_queue = queue.Queue()
inventory_queue = queue.Queue()
notification_queue = queue.Queue()

def create_order(item, qty):
    order_id = str(uuid.uuid4())[:8]
    with store_lock:
        order_store[order_id] = {"item": item, "qty": qty, "status": "CREATED"}
    print(f"[Order Service] Created {order_id} -> {item} x{qty}")
    payment_queue.put(order_id)
    return order_id

def payment_service():
    while True:
        order_id = payment_queue.get()
        try:
            time.sleep(0.5)
            if random.random() < 0.2:
                raise Exception("Gateway timeout")
            with store_lock:
                order_store[order_id]["status"] = "PAID"
            inventory_queue.put(order_id)
        except Exception as e:
            print(f"[Payment Service] FAILED {order_id}: {e} -> retrying")
            payment_queue.put(order_id)
        finally:
            payment_queue.task_done()

def inventory_service():
    while True:
        order_id = inventory_queue.get()
        time.sleep(0.3)
        with store_lock:
            order_store[order_id]["status"] = "INVENTORY_RESERVED"
        print(f"[Inventory Service] Stock reserved for {order_id}")
        notification_queue.put(order_id)
        inventory_queue.task_done()

def notification_service():
    while True:
        order_id = notification_queue.get()
        time.sleep(0.2)
        with store_lock:
            order_store[order_id]["status"] = "COMPLETED"
        print(f"[Notification Service] Order {order_id} completed: {order_store[order_id]}")
        notification_queue.task_done()

for target in (payment_service, inventory_service, notification_service):
    threading.Thread(target=target, daemon=True).start()

create_order("Wireless Mouse", 2)
create_order("Mechanical Keyboard", 1)

time.sleep(3)
print("\nFinal state:")
for order_id, data in order_store.items():
    print(order_id, data)
```

### Production notes
- Every line ends with a full stop. Full stop means stop, take a small breath, then read the next line.
- Lines are kept short on purpose so you never have to hold a long sentence in your head.
- Still don't memorize this. Read it through once out loud before recording, then let your own words fill in the gaps if something feels off.
