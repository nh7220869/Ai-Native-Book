---
id: 0010
title: Fix Compilation Error in Intro Page (Move Inline CSS)
stage: red
date_iso: 2025-12-07
surface: agent
model: claude-3-5-sonnet
feature: UI/UX
branch: main
user: Dell
command: Fix "Compiled with problems:×ERROR in ./docs/in"
labels: ["bug", "css", "docusaurus", "compilation"]
links:
  spec: null
  ticket: null
adr: null
pr: null
files_yaml:
  - physical-ai-book/docs/intro.md
  - physical-ai-book/src/css/custom.css
tests_yaml: []
prompt_text: |
  Compiled with problems:×ERROR in ./docs/in
response_text: |
  The compilation error "Compiled with problems:×ERROR in ./docs/in" was caused by inline `<style>` tags in `physical-ai-book/docs/intro.md`.
  To resolve this:
  1.  The inline `<style>` block was removed from `physical-ai-book/docs/intro.md`.
  2.  The corresponding CSS rules were appended to `physical-ai-book/src/css/custom.css`.
  This action resolves the compilation issue and adheres to Docusaurus best practices for styling.
outcome: Compilation error resolved by refactoring inline CSS to `custom.css`.
---