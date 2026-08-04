# How Cursor Works: Designing the Architecture of an AI Software Engineer

## INTRO --- The New Software Engineer (0:00 - 0:50)

Five years ago, if you wanted to add a major feature to a software
project, you needed an engineer.

Someone who could read thousands of lines of code. Understand the
architecture. Find the right files. Make changes. Run tests. Fix errors.

But today, a developer can open Cursor and simply type:

> "Add Google authentication to my application."

And an AI agent can explore the codebase, modify multiple files, create
new components, run commands, and help complete the task.

But the interesting question is not:

**What can Cursor do?**

The interesting question is:

**What architecture allows an AI system to behave like a software
engineer?**

Because Cursor is not just a chatbot inside an editor.

Behind that simple interface is a collection of systems working
together:

-   A code intelligence system
-   A context engine
-   An AI agent
-   A tool execution layer
-   A model orchestration platform
-   A code modification pipeline

Today, we are going to design the architecture behind an AI coding
agent.

------------------------------------------------------------------------

# PART 1 --- The Wrong Architecture (0:50 - 1:40)

Let's start with the simplest possible design.

``` text
Developer
   │
Prompt
   │
LLM
   │
Generated Code
```

This works for small questions, but software engineering is different.

A real application contains thousands of interconnected files. The AI
needs to understand where authentication lives, how APIs connect, what
database schema exists, and which components depend on each other.

A model sitting alone cannot do this.

So the architecture needs something more.

------------------------------------------------------------------------

# PART 2 --- The High-Level Architecture (1:40 - 2:40)

``` text
                 Developer
                     │
                Cursor IDE
                     │
              AI Engineering Platform
     --------------------------------------
     Repository Intelligence
     Context Engine
     Agent Orchestrator
     Memory System
     Tool Execution Layer
     --------------------------------------
                     │
               LLM Gateway
                     │
          Claude / GPT / Gemini
                     │
              Code Changes
```

The key idea:

The LLM is not the product.

The LLM is one component inside a larger software system.

The surrounding architecture is what turns a language model into an
engineer.

------------------------------------------------------------------------

# PART 3 --- The IDE Client Layer (2:40 - 3:30)

The Cursor editor is responsible for:

-   Chat interface
-   Inline suggestions
-   Showing diffs
-   Managing conversations
-   Tracking the current workspace

Most importantly, it captures context such as the active file, cursor
position, selected code, diagnostics, and recent edits.

The IDE is the AI's connection to the developer's environment.

------------------------------------------------------------------------

# PART 4 --- Repository Intelligence System (3:30 - 5:00)

The first engineering challenge is understanding a massive repository.

``` text
Repository
    │
Code Parser
    │
Symbol Extraction
    │
Dependency Graph
    │
Search Index
    │
Code Knowledge Base
```

The system analyzes files, classes, functions, imports, and dependencies
to build a searchable map of the codebase---similar to how Google
indexes the web before answering searches.

------------------------------------------------------------------------

# PART 5 --- The Context Engine (5:00 - 6:20)

The Context Engine decides what information the AI actually needs.

``` text
User Request
      │
Context Engine
      │
Relevant Information
      │
LLM
```

It combines:

-   Current file
-   Open tabs
-   Repository search
-   Code relationships
-   Previous conversation
-   Error messages

Its job is to provide enough context for the model to succeed without
wasting tokens.

------------------------------------------------------------------------

# PART 6 --- The Agent Orchestrator (6:20 - 8:00)

Unlike a chatbot, an AI engineer must plan.

``` text
User Goal
    │
Planner
    │
Search → Edit → Execute → Validate
    │
Final Result
```

The agent repeatedly:

1.  Thinks
2.  Takes an action
3.  Observes the result
4.  Decides the next action

This continuous planning cycle is the agent loop.

------------------------------------------------------------------------

# PART 7 --- Tool Execution Layer (8:00 - 9:00)

The model cannot interact with your computer directly.

Instead it invokes tools such as:

-   Read files
-   Write files
-   Search code
-   Terminal
-   Git
-   Test runner

The model provides reasoning.

The tools provide capabilities.

------------------------------------------------------------------------

# PART 8 --- LLM Gateway (9:00 - 9:50)

``` text
Agent
  │
LLM Gateway
  │
Claude | GPT | Gemini | Others
```

The gateway abstracts model providers and manages routing, latency,
cost, and reliability.

------------------------------------------------------------------------

# PART 9 --- Code Change Pipeline (9:50 - 10:40)

``` text
AI Output
   │
Diff Generator
   │
Change Preview
   │
Developer Approval
   │
Apply Changes
```

Instead of replacing entire files, Cursor generates safe patches that
developers can review.

------------------------------------------------------------------------

# FINAL ARCHITECTURE (10:40 - 11:30)

``` text
Developer
    │
Cursor IDE
    │
Repository Intelligence
Context Engine
Agent Orchestrator
Memory System
Tool Layer
    │
LLM Gateway
    │
AI Models
    │
Code Modifications
```

The model is only one piece of the system.

The real innovation is the architecture surrounding it: retrieval,
planning, tools, memory, and execution.

------------------------------------------------------------------------

# OUTRO

Cursor represents a new kind of software architecture.

Instead of applications built around business logic, AI-native products
are built around reasoning, orchestration, retrieval, and tool use.

That same pattern is now appearing in Claude Code, GitHub Copilot Agent,
Windsurf, and many future AI systems.
