// Word-anchor schedules: map specific spoken words (by their real whisper
// frame timestamp, global to the whole video) to "the highlighted line
// should be this line index right now". The highlight jumps directly to
// each anchor's target line when its frame arrives -- never scrubs through
// intermediate lines.
export type Anchor = { atFrame: number; throughLine: number };

export const TYPING_SCHEDULES: Record<string, Anchor[]> = {
  setup_text: [
    { atFrame: 2872, throughLine: 9 }, // "we're obviously not training a real neural network"
    { atFrame: 3243, throughLine: 9 }, // "using this tiny made-up paragraph as our training text"
    { atFrame: 3286, throughLine: 9 }, // "we lowercase everything"
    { atFrame: 3363, throughLine: 9 }, // "split the periods off so they count as their own token"
  ],
  encoding: [
    { atFrame: 3457, throughLine: 9 }, // "Here's the encoding step"
    { atFrame: 3667, throughLine: 11 }, // "we take every unique word in our text and give it a number"
    { atFrame: 3767, throughLine: 12 }, // "word to id, and the reverse mapping too"
    { atFrame: 3899, throughLine: 15 }, // "then we turn our entire training text into a list of integers"
    { atFrame: 4048, throughLine: 15 }, // "our model never actually touches the word cat" (idle here)
  ],
  building_model: [
    { atFrame: 4255, throughLine: 6 }, // "This is our whole model" -> CONTEXT_SIZE = 2
    { atFrame: 4388, throughLine: 6 }, // "using the last two tokens as context now"
    { atFrame: 4489, throughLine: 9 }, // "for every pair of consecutive tokens"
    { atFrame: 4557, throughLine: 11 }, // "we look at whatever comes right after that pair"
    { atFrame: 4639, throughLine: 12 }, // "add 1 to a counter"
  ],
  sampling: [
    { atFrame: 5365, throughLine: 9 }, // "Here's the sampling step"
    { atFrame: 5588, throughLine: 10 }, // "context is just a tuple of two token ids"
    { atFrame: 5588, throughLine: 13 }, // "we grab every token id that's ever followed this exact pair"
    { atFrame: 5746, throughLine: 15 }, // "random dot choices with weights picks one"
  ],
  generating_live: [
    { atFrame: 6194, throughLine: 9 }, // "Here's the actual generation loop, the part that matters most"
    { atFrame: 6310, throughLine: 10 }, // "we take our seed words, encode them into ids first"
    { atFrame: 6518, throughLine: 13 }, // "we look at the last two ids we have"
    { atFrame: 6595, throughLine: 14 }, // "predict the next id"
    { atFrame: 6635, throughLine: 17 }, // "and add it on"
    { atFrame: 6671, throughLine: 18 }, // "only at the very end, we turn every id back into its word"
    { atFrame: 7182, throughLine: 21 }, // "there it is, a fully generated sentence"
  ],
  three_runs: [
    { atFrame: 7388, throughLine: 13 }, // "let's run the exact same generation... three separate times"
    { atFrame: 7561, throughLine: 14 }, // "three different sentences from the exact same starting point"
  ],
};
