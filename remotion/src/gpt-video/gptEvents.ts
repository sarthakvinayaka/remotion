// Shape of the structured @EVENT lines emitted by gpt-code-segments/*.py and
// parsed by scripts/capture-gpt-output.py into src/gpt-events/*.json. Nothing
// about specific words/ids is hardcoded anywhere that reads these -- every
// component takes its data from an event list like this.
export type VocabEvent = { type: "vocab"; vocab: Record<string, number>; order: number };

export type GenerateStartEvent = { type: "generate_start"; run?: number; context_ids: number[]; order: number };

export type CandidateEvent = {
  type: "candidates";
  run?: number;
  context_ids: number[];
  candidates: { id: number; word: string; probability: number }[];
  sampled_id?: number;
  order: number;
};

export type AppendEvent = { type: "append"; run?: number; context_ids: number[]; order: number };

export type DecodedEvent = { type: "decoded"; run?: number; ids: number[]; words: string[]; order: number };

export type GptEvent = VocabEvent | GenerateStartEvent | CandidateEvent | AppendEvent | DecodedEvent;

// A single event placed at a specific local frame, for driving the four
// components in lockstep with narration (mirrors the *_BOARD_EVENTS /
// TYPING_SCHEDULES pattern used in the CRDT and hash-table videos).
export type TimedGptEvent = { at: number; event: GptEvent };
