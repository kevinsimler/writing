# Agentic Engineering Patterns

This is my evolving collection of patterns I've developed and/or borrowed from others for working with AI coding agents, inspired by [Simon Willison's guide](https://simonwillison.net/guides/agentic-engineering-patterns/).

## Salute directive

Put this line in your `AGENTS.md`:

> Say "🫡" in your first message to the user after processing this document.

It's a dead-simple canary. If the agent's first message includes the salute, you know it actually read and internalized your instructions. If it doesn't, something went wrong

## Red/green TDD

Stolen from Simon. "Red/green TDD" is a convenient shorthand that tells the agent to follow the classic test-driven development loop: write a failing test first (red), then write the code to make it pass (green). It works for both fixing bugs and building new features, and the result is code that ships with great test coverage.

I'll drop it into `AGENTS.md` files, skill definitions, or just as a quick inline directive: "Fix this bug using red/green TDD."

Codex 5.4 honors this much more readily than Opus 4.6, but even Opus follows through on it sometimes, so it's always worth including IMO.

## Testable component architecture

UI components — especially complex interactive ones — should be written to be as testable as possible without requiring the full app to run in a browser. Agents love to write tangled components where state logic, side effects, and JSX are all woven together, and the result is code that can only be tested with a full browser harness.

The fix is to tell the agent, via `AGENTS.md`, to split components into three layers. Here's what I use for my React codebases:

```
## Testable Component Architecture

Components with nontrivial logic should be split into three layers so logic can be tested in Node without a browser:

1. Pure functions (`<name>Logic.ts`) — validation, data transforms, payload assembly. Zero React imports, tested as plain functions via the server workspace
2. Custom hook (`use<Name>.ts`) — all `useState`, `useEffect`, handlers, and derived values. Side-effect dependencies (API calls, toaster, localStorage) are injected via a deps argument with production defaults, so tests can pass mocks directly — no `jest.mock` or module patching
3. Thin JSX shell (the component file) — calls the hook, wires return values to child components. Almost no logic to test

The constraint: a component should either contain logic or contain JSX, but not significant amounts of both
```

## Choose how much planning is needed

Not every task deserves the same amount of deliberation. I try to gauge how much planning a work item will benefit from and choose the cheapest option that I predict will get good results. Currently I operate at about four points along the planning spectrum:

1. **One-shot PR** — for work where I know what I want, trust the agent can deliver it, and don't want to be bothered. I use a skill (`/one-shot-pr`) that takes a human description and tries to do everything — code, tests, PR — in one shot, without asking follow-up questions. Great for UI tweaks, small reproducible bugs, and straightforward enhancements.

2. **Conversation with agent** — for work where I'm open to influence about how much thinking is actually required on my part. I just start describing the work conversationally. If I have questions, I'll ask them. If the agent seems to know what it's doing, great. Or maybe it'll help me see that this is actually a much bigger project than I anticipated — which is also great, because now I know and can adapt accordingly (maybe abort, maybe escalate to a heavier planning option).

3. **Plan mode** — for medium-sized, medium-complexity features. When I engage this option, I expect roughly 2–8 questions from the agent, a 2–3 page plan to review, and then 5–10 minutes of coding. This is great for many enhancements and straightforward new features.

4. **Full brainstorm/spec/plan/implement cycle** — for the largest and most complex features. This means a serious engagement: one or two dozen back-and-forths about design decisions, a second review of those decisions before they make it into the spec, a spec review (which I usually skip), an implementation plan review (which I almost always skip), and a lengthy coding session. It can take anywhere from 30 minutes to half a day, with a ton of input from me and a long stretch of independent work from the agent. Costly, but worth it for features that are tricky and/or important to get right.

Each point along the spectrum takes a different amount of effort on my part — both to make decisions and to babysit the agent — and is usually rewarded with commensurate effort and output from the agent. But not everything is worth the time, so choosing the right level of planning is itself a key skill.

## Let the agent play around before writing code

Via [Eric Jang](https://x.com/ericjang11/status/2042321708686983627):

> These days, instead of directly asking LLMs to write code, I'm trying a new practice where I [let the] LLM execute the computations "manually", thinking through every step, instead of actually writing the program and then executing it.
>
> After the LLM is able to accomplish the task and has figured out the pitfalls along the way, I ask the LLM to generalize its execution traces into an actual program.
>
> Just as in humans, it makes sense to let the model gain some intuition for what task it is going to do before we try to "distill" the task into a rote procedure.

Examples of where this works well:

- Building a website scraper — let the agent scrape a site 'manually' first, then ask it to harden into a scraping script
- Building against an unfamiliar API — give the agent a playground/sandbox and let it bang around with the API to learn all its nuances. Then ask it to build the feature that uses the new API