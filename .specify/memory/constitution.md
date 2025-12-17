<!--
Sync Impact Report:
Version change: 0.1.0 -> 0.2.0
Modified principles: All previous principles updated/merged with new ones.
Added sections: "Project Overview", "Project-Specific Guidelines", "Docusaurus Folder Structure", "Communication Protocols", "Risk Management", "Success Criteria".
Removed sections: Previous Core Principles and General Guidelines have been restructured.
Templates requiring updates:
- .specify/templates/plan-template.md ⚠ pending
- .specify/templates/spec-template.md ⚠ pending
- .specify/templates/tasks-template.md ⚠ pending
- .gemini/commands/sp.adr.md ⚠ pending
- .gemini/commands/sp.analyze.md ⚠ pending
- .gemini/commands/sp.checklist.md ⚠ pending
- .gemini/commands/sp.clarify.md ⚠ pending
- .gemini/commands/sp.git.commit_pr.md ⚠ pending
- .gemini/commands/sp.implement.md ⚠ pending
- .gemini/commands/sp.phr.md ⚠ pending
- .gemini/commands/sp.plan.md ⚠ pending
- .gemini/commands/sp.specify.md ⚠ pending
- .gemini/commands/sp.tasks.md ⚠ pending
Follow-up TODOs: TODO(RATIFICATION_DATE)
-->
# AI-Native Textbook Project Constitution

## Project Overview

### Description
A comprehensive AI-native textbook to teach Physical AI and Humanoid Robotics, integrating AI-driven tools, interactive chapters, and a RAG (Retrieval-Augmented Generation) chatbot for guidance. It allows learners to apply concepts in both simulated and real-world environments.

### Purpose
Enable students and professionals to learn Physical AI & Robotics interactively, with personalized and multilingual content, and hands-on exercises.

### Vision
Make AI-native education accessible for Physical AI & Humanoid Robotics through Docusaurus-based interactive textbooks and intelligent agents.

## Core Principles

### 1. AI-driven Textbook Creation
Write a comprehensive AI-driven textbook using Spec-Kit Plus and Claude Code, deployed and structured in Docusaurus.

### 2. Deployment & Accessibility
Deploy the book using Docusaurus on GitHub Pages or Vercel.

### 3. Interactive RAG Chatbot
Embed a RAG chatbot capable of answering chapter-specific questions inside the Docusaurus site.

### 4. Content Personalization
Support content personalization based on user background.

### 5. Multi-language Support
Provide multi-language support, including Urdu, in Docusaurus chapters.

### 6. Subagents and Agent Skills
Use subagents and agent skills for reusable intelligence.

### 7. Spec-Kit Plus Compliance
Follow Spec-Kit Plus standards.

### 8. File Organization
Chapters in separate Markdown files for Docusaurus. Assets stored in images and assets folders.

### 9. Naming Conventions
Consistent naming for chapters, subagents, and agent skills.

### 10. GitHub Version Control
Use GitHub commit history as version control; no edits bypassing GitHub version control.

### 11. Independently Testable Features
Features independently testable.

## Project-Specific Guidelines

### Hackathon Constraints
- Time-bound implementation
- Free-tier services only

### Demo-first Approach
Working features prioritized over completeness

### Image Usage
- Use placeholder images
- Skip automatic image agents

### Content Formatting
- Text-first content
- Consistent headers and numbering
- Modular structure for extension
- Accessible colors and fonts

## Docusaurus Folder Structure
The main project folder is called physical-ai-book. Inside it, there is a docs folder containing all chapters as Markdown files for Docusaurus, a rag folder for backend scripts, an auth folder for authentication setup, an agents folder for Claude Code subagents, a skills folder for reusable skills, a ui folder for interactive buttons and widgets in Docusaurus, and the main Docusaurus configuration files including docusaurus.config.js, package.json, and README.md.

## Communication Protocols
- Use GitHub Issues for updates.
- Have regular checkpoints.
- Document challenges and solutions.

## Risk Management
- Challenges include RAG integration, personalization logic, and translation accuracy.
- Mitigation: Step-by-step implementation, independent feature testing, and clear documentation.

## Success Criteria
Textbook deployed on GitHub Pages using Docusaurus.

## Development Workflow
Code review requirements, testing gates, deployment approval process, etc.

## Governance
- All PRs/reviews must verify compliance.
- Complexity must be justified.
- Use guidance files for runtime development guidance.
- Amendments require documentation, approval, and a migration plan.
- Semantic Versioning (MAJOR.MINOR.PATCH) is used for constitution versioning.
- Compliance is reviewed quarterly.

**Version**: 0.2.0 | **Ratified**: TODO(RATIFICATION_DATE) | **Last Amended**: 2025-12-06
