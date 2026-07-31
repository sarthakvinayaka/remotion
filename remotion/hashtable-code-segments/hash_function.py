from _hashtable_base import SimpleHashTable

if __name__ == "__main__":
    ht = SimpleHashTable(capacity=8)
    print("hash('apple') =", ht._hash("apple"))
    print("hash('banana') =", ht._hash("banana"))
