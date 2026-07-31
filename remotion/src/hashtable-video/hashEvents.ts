// Shape of the structured @EVENT lines emitted by hashtable-code-segments/*.py
// and parsed by scripts/capture-hashtable-output.py into
// src/hashtable-events/*.json. Nothing about a specific key, capacity, or
// bucket count is hardcoded anywhere that reads these -- every component
// takes its data from an event list like this.
export type InsertEvent = {
  type: "insert";
  key: string;
  hash_value: number;
  bucket_index: number;
  capacity: number;
  is_collision: boolean;
  order: number;
};

export type ResizeEvent = {
  type: "resize";
  old_capacity: number;
  new_capacity: number;
  order: number;
};

export type HashEvent = InsertEvent | ResizeEvent;

// A single insert placed at a specific local frame, for driving the three
// components in lockstep with narration (mirrors the *_BOARD_EVENTS /
// TYPING_SCHEDULES pattern used in the CRDT and microservices videos).
export type TimedHashEvent = { at: number; event: HashEvent };
