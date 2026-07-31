import uuid
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
    return order_id


if __name__ == "__main__":
    create_order("Wireless Mouse", 2)
    create_order("Mechanical Keyboard", 1)
