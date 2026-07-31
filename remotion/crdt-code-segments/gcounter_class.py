class GCounter:
    def __init__(self, node_id, all_nodes):
        self.node_id = node_id
        self.counts = {node: 0 for node in all_nodes}

    def increment(self):
        self.counts[self.node_id] += 1


if __name__ == "__main__":
    nodes = ["A", "B", "C"]
    counter_a = GCounter("A", nodes)
    counter_a.increment()
    counter_a.increment()
    print(f"[Node A] increment -> {counter_a.counts}")
