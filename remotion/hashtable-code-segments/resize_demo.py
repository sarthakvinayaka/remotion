from _hashtable_base import SimpleHashTable

if __name__ == "__main__":
    ht2 = SimpleHashTable(capacity=4)
    for key in ["a", "b", "c"]:
        ht2.insert(key, key.upper())
        print(f"after '{key}': size={ht2.size}, capacity={ht2.capacity}")
