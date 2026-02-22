# Agent Configuration

This document provides guidelines for agents working on the Worsenote codebase. Walvidence is a Next.js 16 note taking app using TypeScript, Bun, Tailwind CSS, shadcn/ui, Zustand, and React Query. No test framework is currently configured.

## Commands

```bash
# Development
bun run dev              # Start dev server with Turbopack (http://localhost:3000)
bun run build            # Production build
bun run start            # Start production server

# Linting & Formatting
bun run lint             # Run Biome linter (biome check)
bun run lint:fix         # Fix linting issues automatically
bun run format           # Format code with Biome

# Type Checking
bun run type-check       # Run TypeScript type checking

# Installation
bun install              # Install dependencies
bun add <package>        # Add production dependency
bun add -D <package>     # Add dev dependency
```

## Architecture Rules

- **Single Responsibility**: Each function/component does one thing
- **DRY**: Extract reusable logic to utilities/hooks
- **Composition**: Use hooks and context for shared logic
- **Locality**: Keep related code together (co-located types, validations)
- **Follow Patterns**: Match existing code style, don't introduce new patterns

## Post-Change Checklist

1. Run `bun run lint` - fix all issues (no warnings)
2. Run `bun run format` - ensure consistent formatting
3. Run `bun run type-check` - zero type errors
4. Remove console.logs, debugger statements
5. Remove commented-out code
6. Verify build succeeds with `bun run build`

## Token Efficiency
- Never re-read files you just wrote or edited. You know the contents.
- Never re-run commands to "verify" unless the outcome was uncertain.
- Don't echo back large blocks of code or file contents unless asked.
- Batch related edits into single operations. Don't make 5 edits when 1 handles it.
- Skip confirmations like "I'll continue..." just do it.
- If a task needs 1 tool call, don't use 3. Plan before acting.
- Do not summarize what you just did unless the result is ambiguous or you need additional input.

## Never Do This

- Refactor unrelated code in the same PR
- Bypass error handling with empty catch blocks
- Commit broken code "to fix later"
- Hardcode secrets/API keys (use env vars)
- Remove functionality without confirmation
- Use console.log for debugging in production code
- Add or include emojis in responses
