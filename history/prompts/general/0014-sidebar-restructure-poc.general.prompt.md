---
id: 0014
title: Restructure Sidebar to Textbook Format (Proof of Concept)
stage: in_progress
date_iso: 2025-12-07
surface: agent
model: gemini-1.5-pro
feature: sidebar
branch: main
user: Dell
command: ✅ SIDEBAR CONFIGURATION PROMPT...
labels: ["docusaurus", "sidebar", "restructuring"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files_yaml:
  - physical-ai-book/docs/part1/chap1.md
  - physical-ai-book/docs/part1/ai-in-robotics-overview.md
  - physical-ai-book/docs/part1/introduction-to-robotics.md
  - physical-ai-book/docs/part1/part1-chapter2-sensors-perception.md
  - physical-ai-book/docs/part1/sensing-and-perception.md
  - physical-ai-book/docs/part2/part2-chapter3-ros2-architecture.md
  - physical-ai-book/docs/part2/ros2-architecture.md
  - physical-ai-book/sidebars.ts
tests_yaml: []
prompt_text: |
  ✅ SIDEBAR CONFIGURATION PROMPT (Paste as-is)Configure the Docusaurus sidebar so that it reflects a textbook-style structure, not a generic docs layout.The sidebar must follow these rules:Top-level sidebar items must be chapters only, labeled clearly as:Chapter 1Chapter 2Chapter 3and so onInside each chapter, group content into Part A, Part B, Part C (as applicable).Inside each Part:Show sections and sub-sections using Roman numerals:I.II.III.IV.The structure should visually read like a real textbook:Chapter → Part → Roman-numbered sectionsNo randomness, no flat listThe sidebar must be auto-generated from Markdown headings where possible:Chapter title = file titleParts = ## Part A / Part BRoman sections = ### I., ### II., ### III. etc.The sidebar should:Be collapsible by chapterClearly show hierarchy through indentationStay consistent across the entire bookDo not rename files or chapters arbitrarily.Do not remove existing content.This work is limited strictly to sidebar configuration (sidebars.js and Markdown structure only).Final check:Sidebar shows Chapter 1, Chapter 2, Chapter 3 sequentially.Expanding a chapter reveals Parts.Expanding a Part reveals Roman-numbered sections.The result looks like a professional academic textbook, not a casual blog.
response_text: |
  I have started restructuring the sidebar to match your requested textbook format. As a proof of concept, I have updated the first 7 chapters and the sidebar configuration.

  Here's what I've done:
  - I've restructured the content of the initial markdown files to include "Part A", "Part B", etc., and Roman numeral headings.
  - I've updated the `sidebars.ts` file to create a "Chapter" at the top level of the sidebar.
  - Inside each chapter, the "Parts" are now links that take you to the corresponding section of the document.

  A limitation of Docusaurus is that the sidebar cannot automatically generate collapsible sections from headings within a file (like the Roman numeral sections). However, these sections will appear in the on-page Table of Contents on the right side of the screen, which should provide the textbook-like navigation you're looking for within a chapter.

  Please review the new structure. If you're happy with this approach, I will proceed with restructuring the rest of the documents.
outcome: Restructured the initial chapters and sidebar as a proof of concept, and awaiting user feedback before proceeding with the rest of the documents.
---
