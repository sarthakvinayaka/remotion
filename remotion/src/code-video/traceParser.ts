import type { TraceLine } from "./TerminalOutput";

// Generic trace -> diagram event parsing. Nothing here is specific to
// "orders" or "payments" -- it only looks for:
//   - an id-like token (short alphanumeric word) that recurs across lines
//   - a service name (the "[X Service]" prefix already extracted by capture-output.py)
//   - a trailing status-ish word (all-caps token, or a word immediately after "->")
// so this keeps working if the underlying example changes.

export type DiagramEvent = {
  order: number;
  service: string | null;
  entityId: string | null;
  status: string | null;
  raw: string;
};

const ID_RE = /\b([a-f0-9]{6,10})\b/i;
const STATUS_RE = /\b([A-Z]{4,}(?:_[A-Z]+)*)\b/;

export const parseTrace = (trace: TraceLine[]): DiagramEvent[] => {
  return trace.map((t) => {
    const idMatch = t.line.match(ID_RE);
    const statusMatch = t.line.match(STATUS_RE);
    return {
      order: t.order,
      service: t.service,
      entityId: idMatch ? idMatch[1] : null,
      status: statusMatch ? statusMatch[1] : null,
      raw: t.line,
    };
  });
};

// Distinct services in first-seen order -- this becomes the diagram's stage
// sequence (HashMap is the shared store; each service after the first is a
// queue stage the entity flows through).
export const deriveStages = (events: DiagramEvent[]): string[] => {
  const seen: string[] = [];
  for (const e of events) {
    if (e.service && !seen.includes(e.service)) seen.push(e.service);
  }
  return seen;
};

// For a given frame's "events so far" (events with order <= upTo), compute:
//  - current known entities and their latest status
//  - in-flight tokens: entities whose latest event was service[i], meaning
//    they are conceptually "moving toward" service[i+1]'s queue
export type EntityState = { id: string; status: string | null; atStage: number };

export const computeEntityStates = (
  events: DiagramEvent[],
  stages: string[],
  upTo: number
): EntityState[] => {
  const byId = new Map<string, EntityState>();
  for (const e of events) {
    if (e.order > upTo || !e.entityId) continue;
    const stageIdx = e.service ? stages.indexOf(e.service) : -1;
    const existing = byId.get(e.entityId);
    // first time we see this entity with no explicit status word -> treat as
    // just-entered-the-system ("CREATED"), a generic default rather than
    // leaving the pill blank
    const status = e.status ?? existing?.status ?? (existing ? null : "CREATED");
    byId.set(e.entityId, {
      id: e.entityId,
      status,
      atStage: stageIdx >= 0 ? stageIdx : (existing?.atStage ?? -1),
    });
  }
  return Array.from(byId.values());
};
