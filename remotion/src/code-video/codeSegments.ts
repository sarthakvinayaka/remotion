// Display code shown on screen per segment -- matches the script's
// "Live-type" blocks exactly (not the demo-harness versions in
// code-segments/*.py, which include extra `if __name__` blocks purely so
// capture-output.py has something runnable to execute).
export const CODE = {
  setup_hashmap: `import uuid
import threading
import time
import queue
import random

order_store = {}
store_lock = threading.Lock()`,

  order_service: `import uuid
import threading
import time
import queue
import random

order_store = {}
store_lock = threading.Lock()

def create_order(item, qty):
    order_id = str(uuid.uuid4())[:8]
    with store_lock:
        order_store[order_id] = {"item": item, "qty": qty, "status": "CREATED"}
    print(f"[Order Service] Created {order_id} -> {item} x{qty}")
    return order_id`,

  queue_payment: `import uuid
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
        time.sleep(0.5)
        with store_lock:
            order_store[order_id]["status"] = "PAID"
        print(f"[Payment Service] Payment done for {order_id}")
        inventory_queue.put(order_id)
        payment_queue.task_done()`,

  inventory_notification: `import uuid
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
        time.sleep(0.5)
        with store_lock:
            order_store[order_id]["status"] = "PAID"
        print(f"[Payment Service] Payment done for {order_id}")
        inventory_queue.put(order_id)
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
        notification_queue.task_done()`,

  wire_and_run: `import uuid
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
        time.sleep(0.5)
        with store_lock:
            order_store[order_id]["status"] = "PAID"
        print(f"[Payment Service] Payment done for {order_id}")
        inventory_queue.put(order_id)
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
print("\\nFinal state:")
for order_id, data in order_store.items():
    print(order_id, data)`,

  failure_handling: `def payment_service():
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
            payment_queue.task_done()`,
} as const;

export type SegmentKey = keyof typeof CODE;

// Previous segment's code, used by CodeTypewriter to only re-type the
// new/changed lines (cumulative feel). failure_handling is a targeted diff
// callout on just payment_service, so it has no "previous" -- it's shown as
// its own focused snippet per the script's callout framing.
export const PREVIOUS_CODE: Partial<Record<SegmentKey, string>> = {
  order_service: CODE.setup_hashmap,
  queue_payment: CODE.order_service,
  inventory_notification: CODE.queue_payment,
  wire_and_run: CODE.inventory_notification,
};
