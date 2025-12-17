---
id: 0002
title: Update constitution with AI-Native Textbook project details
stage: constitution
date: 2025-12-06
surface: agent
model: gemini-1.5-flash-latest
feature: none
branch: master
user: Hackathon Developer
command: /sp.constitution
labels: ["constitution", "update", "project-details", "AI-Native-Textbook"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
 - none
---

## Prompt

Constitution: AI-Native Textbook for Teaching Physical AI & Humanoid RoboticsDescriptionA comprehensive AI-native textbook to teach Physical AI and Humanoid Robotics, integrating AI-driven tools, interactive chapters, and a RAG (Retrieval-Augmented Generation) chatbot for guidance. It allows learners to apply concepts in both simulated and real-world environments.PurposeEnable students and professionals to learn Physical AI & Robotics interactively, with personalized and multilingual content, and hands-on exercises.ImageURL: https://via.placeholder.com/150Alt: Placeholder imageVisionMake AI-native education accessible for Physical AI & Humanoid Robotics through Docusaurus-based interactive textbooks and intelligent agents.GoalsWrite a comprehensive AI-driven textbook using Spec-Kit Plus and Claude Code, deployed and structured in Docusaurus.Deploy the book using Docusaurus on GitHub Pages or Vercel.Embed a RAG chatbot capable of answering chapter-specific questions inside the Docusaurus site.Support content personalization based on user background.Provide multi-language support, including Urdu, in Docusaurus chapters.Use subagents and agent skills for reusable intelligence.ScopeIncludedAI-driven book creation workflow in Docusaurus.Interactive chapters with personalization and translation buttons in Docusaurus.Embedded RAG chatbot integrated into the Docusaurus book.User signup and profile tracking for personalization in Docusaurus.ExcludedOffline-only content.Non-technical chapters unrelated to Physical AI or Humanoid Robotics.StakeholdersPrimary: Students, instructors, AI/Robotics enthusiasts.Secondary: Hackathon judges, Panaversity team.RolesAuthor: Create book content in Markdown for Docusaurus.Developer: Integrate RAG chatbot and interactive features into Docusaurus.Reviewer: Ensure quality, accuracy, and hackathon compliance.Translator: Implement multi-language support in Docusaurus chapters.Tester: Verify interactive features in Docusaurus site.StandardsFollow Spec-Kit Plus standards.Chapters in separate Markdown files for Docusaurus.Assets stored in images and assets folders.Consistent naming for chapters, subagents, and agent skills.Use GitHub commit history as version control.ResponsibilitiesAuthor: Write and organize content, diagrams, and code in Docusaurus Markdown.AI Developer: Embed RAG chatbot, implement personalization in Docusaurus.Translator: Add multi-language buttons and check accuracy in Docusaurus chapters.Tester: Verify chatbot, personalization, translation, and interactivity in Docusaurus site.ResourcesSpec-Kit Plus and Claude Code, Docusaurus, OpenAI Agents / ChatKit SDKs, FastAPI, Neon Postgres, Qdrant Cloud, Better-Auth, GitHub Pages.WorkflowWrite chapters in Markdown for Docusaurus using Spec-Kit Plus.Create subagents and agent skills.Integrate RAG chatbot into Docusaurus pages.Implement signup and background questions in Docusaurus site.Add personalization button per Docusaurus chapter.Add multi-language translation button in Docusaurus chapters.Test all features in Docusaurus site.Deploy the textbook using Docusaurus on GitHub Pages.Docusaurus Folder StructureThe main project folder is called physical-ai-book. Inside it, there is a docs folder containing all chapters as Markdown files for Docusaurus, a rag folder for backend scripts, an auth folder for authentication setup, an agents folder for Claude Code subagents, a skills folder for reusable skills, a ui folder for interactive buttons and widgets in Docusaurus, and the main Docusaurus configuration files including docusaurus.config.js, package.json, and README.md.Communication ProtocolsUse GitHub Issues for updates.Have regular checkpoints.Document challenges and solutions.Risk ManagementChallenges include RAG integration, personalization logic, and translation accuracy.Mitigation: Step-by-step implementation, independent feature testing, and clear documentation.Success Criteria

- ✅ Textbook deployed on GitHub Pages using Docusaurus
- ✅ At least three interactive chapters with working RAG chatbot
- ✅ Multi-language support (English + Urdu) functional
- ✅ User personalization and signup system working
- ✅ All tests passing in Docusaurus site
- ✅ Documentation complete and clear

## Response snapshot

The project constitution has been successfully updated to version `0.2.0`, incorporating detailed project principles and guidelines for the AI-Native Textbook.