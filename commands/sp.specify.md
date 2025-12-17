# Specification: Physical AI & Humanoid Robotics (Keyword Version)

Project Name
Physical AI & Humanoid Robotics — AI-Native Textbook

Mission
AI-native technical textbook for Physical AI and Humanoid Robotics
- Docusaurus-based
- Interactive, personalized, multilingual, agent-assisted

Core Deliverables
- Book Creation
  - Markdown-only textbook
  - Spec-Kit Plus compliant
  - One chapter per Docusaurus doc
  - Static site deployment (GitHub Pages or Vercel)
- RAG Chatbot
  - Embedded in Docusaurus UI
  - Chapter-level Q&A
  - Selected-text Q&A only
  - No external hallucinations
- Backend
  - FastAPI
  - Qdrant Cloud (vectors)
  - Neon Postgres (metadata)
  - OpenAI Agents / Chat SDK

Embeddings
- Full book indexed
- Chapter-aware citations

Authentication
- Better-Auth based signup/login

User Data Collected
- GPU, CPU, RAM
- Software background
- Robotics experience
- User goal
- Stored in Neon Postgres and exposed to personalization logic

Chapter Personalization
- Button per chapter
- Dynamic adaptation via backend API
- Inputs: Hardware profile, Skill level, User role
- Outputs: Simplified or advanced explanations, Adjusted examples, Hardware-aware content
- No full page reload

Urdu Translation
- Button per chapter
- API-based LLM translation
- Flow: send chapter_id + content → receive Urdu output → replace chapter content dynamically
- Preserve layout, no site reload

AI Subagents (Claude Code Subagents)
- VLA Planner: Voice → ROS actions
- ROS 2 Tutor: Nodes, Topics, Services
- Isaac Sim Helper: Simulation debugging, GPU optimization
- Gazebo Builder: World files, Simulation setup
- Robotics Code Generator: Python rclpy scripts

Reusable Skills
- Summarization
- Code explanation
- Personalized lessons
- Urdu translation

Book Structure (suggested)
PART I Foundations
1 Physical AI & Embodied Intelligence
2 Sensors & Perception

PART II ROS 2
3 ROS 2 Architecture
4 Nodes Topics Services
5 Python Packages
6 Launch Files Params

PART III Simulation
7 Gazebo Setup
8 URDF SDF
9 Physics Sensors
10 Unity Visualization

PART IV NVIDIA Isaac
11 Isaac Sim
12 Isaac ROS
13 Nav2 + RL
14 Sim-to-Real

PART V Humanoid Robotics
15 Kinematics
16 Locomotion
17 Manipulation

PART VI VLA
18 Conversational Robotics
19 Voice Interfaces
20 LLM to ROS Planning

Capstone
21 Full Autonomy Pipeline — Voice → Plan → Navigate → Perceive → Manipulate

Directory Structure (repo layout)
physical-ai-book
- docs (Markdown chapters)
- rag (FastAPI backend, Embedding, Ingest, DB logic)
- auth (Better-Auth setup)
- agents (Claude subagents)
- skills (Reusable skills logic)
- ui (Docusaurus components, Personalization, Translation, Chatbot)
- core config (Docusaurus config, package files, README)

RAG Requirements
- Embedding model: text-embedding-3-large
- Query models: gpt-4o-mini or gpt-4.1
- Chapter-level citations, selected-text scope only

Better-Auth Requirements
- Signup profiling mandatory
- Profile stored in Neon Postgres and exposed to personalization API

Personalization Logic
- Inputs: Hardware, Skill, Role
- Outputs: Adaptive content, Depth control
- Frontend: Live updates, no refresh

Urdu Translation Logic
- API-driven, chapter-specific, LLM-based, dynamic replacement

Evaluation Criteria
- Book core, Deployment, RAG System, Docusaurus Structure, Subagents, Auth, Personalization, Translation
- Demo-focused: prioritize working features

Rules and Constraints
- Markdown = source of truth
- Spec-Kit Plus enforced
- GitHub version control only
- Independent features
- Free-tier services only

Success Conditions
- Book deployed
- 3+ interactive chapters
- RAG answers correctly
- Personalization works
- Urdu supported

Notes
- Text-first, placeholder images
- Consistent numbering
- Accessible design
- Modular expansion ready

