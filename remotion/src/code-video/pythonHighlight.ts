// Minimal, dependency-free Python syntax tokenizer -- good enough for this
// project's code samples without pulling in a full highlighting library.
import { cv } from "./theme";

const KEYWORDS = new Set([
  "def", "return", "if", "else", "elif", "while", "for", "in", "import",
  "with", "as", "try", "except", "finally", "raise", "class", "pass",
  "break", "continue", "and", "or", "not", "is", "None", "True", "False",
  "lambda", "global", "yield",
]);

const BUILTINS = new Set([
  "print", "str", "int", "float", "len", "range", "dict", "list", "set",
  "tuple", "uuid", "random",
]);

export type Token = { text: string; color: string };

const isIdentChar = (c: string) => /[A-Za-z0-9_]/.test(c);

export const tokenizeLine = (line: string): Token[] => {
  const tokens: Token[] = [];
  let i = 0;
  const n = line.length;

  while (i < n) {
    const c = line[i];

    // comment
    if (c === "#") {
      tokens.push({ text: line.slice(i), color: cv.comment });
      break;
    }

    // string (single, double, f-string prefix)
    if (c === '"' || c === "'") {
      const quote = c;
      let j = i + 1;
      while (j < n && line[j] !== quote) j++;
      tokens.push({ text: line.slice(i, Math.min(j + 1, n)), color: cv.string });
      i = j + 1;
      continue;
    }
    if ((c === "f" || c === "r") && (line[i + 1] === '"' || line[i + 1] === "'")) {
      const quote = line[i + 1];
      let j = i + 2;
      while (j < n && line[j] !== quote) j++;
      tokens.push({ text: line.slice(i, Math.min(j + 1, n)), color: cv.string });
      i = j + 1;
      continue;
    }

    // number
    if (/[0-9]/.test(c)) {
      let j = i;
      while (j < n && /[0-9.]/.test(line[j])) j++;
      tokens.push({ text: line.slice(i, j), color: cv.number });
      i = j;
      continue;
    }

    // identifier / keyword / builtin / function-call
    if (/[A-Za-z_]/.test(c)) {
      let j = i;
      while (j < n && isIdentChar(line[j])) j++;
      const word = line.slice(i, j);
      let color: string = cv.ink;
      if (KEYWORDS.has(word)) color = cv.keyword;
      else if (BUILTINS.has(word)) color = cv.builtin;
      else if (line[j] === "(") color = cv.func;
      tokens.push({ text: word, color });
      i = j;
      continue;
    }

    // whitespace / punctuation, passthrough
    let j = i;
    while (j < n && !/[A-Za-z0-9_"'#]/.test(line[j])) j++;
    if (j === i) j++;
    tokens.push({ text: line.slice(i, j), color: cv.muted });
    i = j;
  }

  return tokens;
};
