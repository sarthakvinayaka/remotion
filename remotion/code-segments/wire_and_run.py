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
print("\nFinal state:")
for order_id, data in order_store.items():
    print(order_id, data)
