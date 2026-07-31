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


if __name__ == "__main__":
    threading.Thread(target=payment_service, daemon=True).start()
    create_order("Wireless Mouse", 2)
    time.sleep(1)
