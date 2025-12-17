Specification: Physical AI & Humanoid Robotics (Keyword Version)
Project NamePhysical AI & Humanoid Robotics — AI-Native Textbook
MissionAI-native technical textbook for Physical AI and Humanoid Robotics
Docusaurus-based
Interactive, personalized, multilingual, agent-assisted
Core DeliverablesBook CreationMarkdown-only textbook
Spec-Kit Plus compliant
One chapter per Docusaurus doc
Static site deployment (GitHub Pages or Vercel)
RAG ChatbotEmbedded in Docusaurus UI
Chapter-level Q&A
Selected-text Q&A only
No external hallucinations
BackendFastAPI
Qdrant Cloud (vectors)
Neon Postgres (metadata)
OpenAI Agents / Chat SDK
EmbeddingsFull book indexed
Chapter-aware citations
AuthenticationBetter-Auth based signup/login
User Data CollectedGPUCPURAMSoftware background
Robotics experience
User goalStorageNeon Postgres
Accessible to personalization logic
Chapter PersonalizationButton per chapter
Dynamic adaptation via backend API
InputsHardware profile
Skill level
User role
OutputsSimplified or advanced explanations
Adjusted examples
Hardware-aware content
No full page reload
Urdu TranslationButton per chapter
API-based LLM translation
FlowSend chapter_id + content
Receive Urdu output
Replace chapter content dynamically
Layout preserved
No site reload
AI SubagentsClaude Code Subagents
VLA Planner
Voice → ROS actions
ROS 2 Tutor
Nodes
Topics
Services
Isaac Sim Helper
Simulation debugging
GPU optimization
Gazebo Builder
World files
Simulation setup
Robotics Code Generator
Python rclpy scripts
Reusable SkillsSummarization
Code explanation
Personalized lessons
Urdu translation
Book StructurePART I Foundations1 Physical AI & Embodied Intelligence2 Sensors & Perception
PART II ROS 23 ROS 2 Architecture4 Nodes Topics Services5 Python Packages6 Launch Files Params
PART III Simulation7 Gazebo Setup8 URDF SDF9 Physics Sensors10 Unity Visualization
PART IV NVIDIA Isaac11 Isaac Sim12 Isaac ROS13 Nav2 + RL14 Sim-to-Real
PART V Humanoid Robotics15 Kinematics16 Locomotion17 Manipulation
PART VI VLA18 Conversational Robotics19 Voice Interfaces20 LLM to ROS Planning
Capstone21 Full Autonomy Pipeline
Voice → Plan → Navigate → Perceive → Manipulate
Directory Structurephysical-ai-book
docsMarkdown chapters
ragFastAPI backend
EmbeddingIngestDB logic
authBetter-Auth setup
agentsClaude subagents
skillsReusable skills logic
uiDocusaurus components
Personalization
Translation
Chatbot
core configDocusaurus config
Package files
READMERAG RequirementsEmbedding modeltext-embedding-3-large
Query modelsgpt-4o-minior gpt-4.1
Chapter-level citations
Selected-text scope only
Better-Auth RequirementsSignup profiling mandatory
Stored in Neon Postgres
Exposed to personalization API
Personalization LogicInputsHardware
Skill
Role
OutputsAdaptive content
Depth control
FrontendLive updates
No refresh
Urdu Translation LogicAPI-driven
Chapter-specific
LLM based
Dynamic replacement
Evaluation CriteriaBook Core
Deployment
RAG System
Docusaurus Structure
Subagents
Auth
Personalization
Translation
Demo-focused
Max points via working features
Rules and ConstraintsMarkdown = source of truth
Spec-Kit Plus enforced
GitHub version control only
Independent features
Free-tier services only
Success ConditionsBook deployed
3+ interactive chapters
RAG answers correctly
Personalization works
Urdu supported
NotesText-first
Placeholder images
Consistent numbering
Accessible design