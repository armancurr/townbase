## Architecture

- Single Responsibility: one thing per function/component
- DRY: extract reusable logic to utilities/hooks
- Composition: hooks and context for shared logic
- Locality: co-locate types and validations
- Follow Patterns: match existing style
- Semantic HTML: prefer main/section/article/nav over divs
- Minimize Divs: apply class to parent instead of wrapping div

## Post-Change Checklist

1. `bun run lint` — fix all issues, no warnings
2. `bun run format`
3. `bun run type-check` — zero errors

## Token Efficiency

- Never re-read files you just wrote
- Never re-run commands to verify unless outcome was uncertain
- Batch related edits into single operations
- Skip confirmations — just act
- Don't summarize unless result is ambiguous

## Never

- Refactor unrelated code
- Empty catch blocks
- Commit broken code
- Hardcode secrets
- Remove functionality without confirmation
- Use console.log in production
