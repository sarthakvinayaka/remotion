from _hashtable_base import SimpleHashTable

if __name__ == "__main__":
    ht = SimpleHashTable(capacity=8)
    ht.insert("apple", "APPLE")
    print("hash('apple') =", ht._hash("apple"))
    ht.insert("elderberry", "ELDERBERRY")
    print("hash('elderberry') =", ht._hash("elderberry"))
    ht.show_buckets()
    print("get('elderberry') =", ht.get("elderberry"))
