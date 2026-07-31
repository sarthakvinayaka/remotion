import json


def emit(event):
    print("@EVENT " + json.dumps(event))


class SimpleHashTable:
    def __init__(self, capacity=8):
        self.capacity = capacity
        self.size = 0
        self.buckets = [[] for _ in range(capacity)]

    def _hash(self, key):
        h = 0
        for ch in str(key):
            h = (h * 31 + ord(ch)) % 1000000007
        return h % self.capacity

    def insert(self, key, value):
        index = self._hash(key)
        bucket = self.buckets[index]
        is_collision = len(bucket) > 0 and not any(k == key for k, v in bucket)
        for i, (k, v) in enumerate(bucket):
            if k == key:
                bucket[i] = (key, value)
                emit({
                    "type": "insert",
                    "key": key,
                    "hash_value": self._hash(key),
                    "bucket_index": index,
                    "capacity": self.capacity,
                    "is_collision": False,
                })
                return
        bucket.append((key, value))
        self.size += 1
        emit({
            "type": "insert",
            "key": key,
            "hash_value": self._hash(key),
            "bucket_index": index,
            "capacity": self.capacity,
            "is_collision": is_collision,
        })
        if self.size / self.capacity > 0.7:
            self._resize()

    def get(self, key):
        index = self._hash(key)
        bucket = self.buckets[index]
        for k, v in bucket:
            if k == key:
                return v
        raise KeyError(key)

    def _resize(self):
        old_buckets = self.buckets
        old_capacity = self.capacity
        self.capacity *= 2
        self.buckets = [[] for _ in range(self.capacity)]
        self.size = 0
        emit({
            "type": "resize",
            "old_capacity": old_capacity,
            "new_capacity": self.capacity,
        })
        for bucket in old_buckets:
            for key, value in bucket:
                self.insert(key, value)

    def show_buckets(self):
        for i, bucket in enumerate(self.buckets):
            print(f"  [{i}]: {bucket}")
