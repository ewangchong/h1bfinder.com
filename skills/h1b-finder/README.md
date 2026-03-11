# h1b-finder skill packaging

This directory separates the same underlying H1B sponsor lookup capability by publishing target.

## Layout

- `clawhub/`: packaging and metadata intended for ClawHub distribution
- `openai-codex/`: packaging intended for OpenAI Codex Skills style distribution

## Notes

- Keep target-specific metadata inside the matching subdirectory.
- Do not place OpenAI-specific metadata inside `clawhub/`.
- Do not place ClawHub-specific packaging files inside `openai-codex/`.
- Shared product logic should stay outside this packaging folder unless a target explicitly requires a bundled resource.
