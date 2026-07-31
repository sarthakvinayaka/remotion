// Word-anchor schedules: map specific spoken words (by their real whisper
// frame timestamp, global to the whole video) to "the highlighted line
// should be this line index right now". The highlight jumps directly to
// each anchor's target line when its frame arrives -- never scrubs through
// intermediate lines.
export type Anchor = { atFrame: number; throughLine: number };

export const TYPING_SCHEDULES: Record<string, Anchor[]> = {
  hash_function_code: [
    { atFrame: 1691, throughLine: 4 }, // "alright so first buckets... one slot for every possible index"
    { atFrame: 1917, throughLine: 6 }, // "now the hash function itself"
    { atFrame: 2096, throughLine: 8 }, // "we walk through every character in a key and build up a number"
    { atFrame: 2231, throughLine: 9 }, // "we multiply by 31 each time and add one character code"
    { atFrame: 2500, throughLine: 10 }, // "this last line is the important part, mod self.capacity"
  ],
  insert_code: [
    { atFrame: 3012, throughLine: 12 }, // "to insert something, we hash the key"
    { atFrame: 3065, throughLine: 13 }, // "to get our index"
    { atFrame: 3109, throughLine: 14 }, // "then we grab that bucket"
    { atFrame: 3222, throughLine: 16 }, // "we loop through whatever's already in that bucket, check if key exists"
    { atFrame: 3380, throughLine: 17 }, // "if it does, we just update it in place"
    { atFrame: 3525, throughLine: 19 }, // "otherwise we append this new key value pair"
    { atFrame: 3602, throughLine: 20 }, // "and increase our size counter"
  ],
  get_and_collision_code: [
    { atFrame: 4946, throughLine: 21 }, // "let's just watch this... quick get function first"
    { atFrame: 5099, throughLine: 22 }, // "hash the key"
    { atFrame: 5132, throughLine: 24 }, // "then scan that bucket's list for the match"
    { atFrame: 5207, throughLine: 31 }, // "apple and elderberry" -> ht.insert("apple"...)
    { atFrame: 5236, throughLine: 33 }, // "...and elderberry, two different words" -> ht.insert("elderberry"...)
    { atFrame: 5294, throughLine: 34 }, // "both hash to index 2" -> print(hash('elderberry'))
    { atFrame: 5442, throughLine: 35 }, // "and get still works" -> print(ht.get("elderberry"))
  ],
  resize_code: [
    { atFrame: 6862, throughLine: 1 }, // "so we double the capacity, clear the buckets"
    { atFrame: 6937, throughLine: 5 }, // "and re-insert every key we had before"
    { atFrame: 7149, throughLine: 2 }, // "that's because the capacity changed" -> self.capacity *= 2
    { atFrame: 7402, throughLine: 7 }, // "everything gets reshuffled into its new correct slot"
    { atFrame: 7516, throughLine: 18 }, // "and this one check at the end of insert" -> if self.size/self.capacity > 0.7
    { atFrame: 7594, throughLine: 19 }, // "now it grows itself automatically" -> self._resize()
  ],
  resize_demo_code: [
    { atFrame: 7718, throughLine: 22 }, // "let's start a fresh table, small capacity of 4"
    { atFrame: 7817, throughLine: 23 }, // "we'll insert 3 keys one at a time"
    { atFrame: 7882, throughLine: 24 }, // "and print the state after each one"
  ],
};
