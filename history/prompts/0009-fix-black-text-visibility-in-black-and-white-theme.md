---
id: 0009
title: Fix Black Text Visibility in Black and White Theme
stage: refactor
date: 2025-12-12
surface: agent
model: gemini-1.5-pro-latest
feature: theming
branch: main
user: Dell
command: no som thing text is black set this
labels: [css, theme, refactor, bugfix]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
  - src/css/custom.css
tests:
  - none
---

## Prompt

no som thing text is black set this

## Response snapshot

I have adjusted the primary color to white and button text to black to improve visibility in the black and white theme.

## Outcome

- ✅ Impact: Text visibility issues in the black and white theme have been addressed by adjusting primary colors and button text.
- 🧪 Tests: No tests were run.
- 📁 Files: `src/css/custom.css` was modified.
- 🔁 Next prompts: none
- 🧠 Reflection: The issue was due to `--ifm-color-primary` being black and used as a foreground color, which conflicted with the black background. Changing it to white and adjusting dependent elements resolved the problem.
