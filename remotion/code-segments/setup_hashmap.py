import uuid
import threading
import time
import queue
import random

order_store = {}
store_lock = threading.Lock()
