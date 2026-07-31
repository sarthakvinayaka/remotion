class GCounter:
    def __init__(self, node_id, all_nodes):
        self.node_id = node_id
        self.counts = {node: 0 for node in all_nodes}

    def increment(self):
        self.counts[self.node_id] += 1

    def merge(self, other_counts):
        for node in self.counts:
            self.counts[node] = max(self.counts[node], other_counts.get(node, 0))

    def value(self):
        return sum(self.counts.values())


if __name__ == "__main__":
    nodes = ["A", "B", "C"]
    counter_a = GCounter("A", nodes)
    counter_b = GCounter("B", nodes)

    counter_a.increment()
    counter_a.increment()
    counter_b.increment()

    counter_b.merge(counter_a.counts)
    print(f"[Merge] B took max per-node -> {counter_b.counts} total={counter_b.value()}")
