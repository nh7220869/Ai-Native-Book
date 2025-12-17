// Complete Book Content in English
export const bookContent = {
  chapters: [
    {
      id: 1,
      title: "Introduction to Physical AI",
      sections: [
        {
          id: 1.1,
          title: "What is Physical AI?",
          content: `Physical AI represents the intersection of artificial intelligence with the physical world. Unlike traditional AI that operates in digital spaces, Physical AI interacts with, learns from, and manipulates real-world environments through sensors, actuators, and robotic systems.`
        },
        {
          id: 1.2,
          title: "History and Evolution",
          content: `The journey from simple automation to intelligent physical systems has spanned decades. Early robotic arms in manufacturing (1960s) evolved into mobile robots (1980s), and now we have AI-powered humanoid robots capable of complex decision-making and learning.`
        }
      ]
    },
    {
      id: 2,
      title: "Humanoid Robotics Fundamentals",
      sections: [
        {
          id: 2.1,
          title: "Robot Kinematics and Dynamics",
          content: `Understanding how robots move requires studying kinematics (motion geometry) and dynamics (forces causing motion). Forward kinematics calculates end-effector position from joint angles, while inverse kinematics finds joint angles for desired positions.`
        },
        {
          id: 2.2,
          title: "Sensors and Perception",
          content: `Robots perceive the world through sensors: cameras (vision), LIDAR (distance), IMUs (orientation), and tactile sensors (touch). Sensor fusion combines multiple inputs for robust perception in dynamic environments.`
        }
      ]
    },
    {
      id: 3,
      title: "Advanced Topics",
      sections: [
        {
          id: 3.1,
          title: "ROS 2 for Robotics",
          content: `ROS 2 (Robot Operating System) provides tools and libraries for building robot applications. It offers middleware, hardware abstraction, and package management for distributed robotics systems.`
        },
        {
          id: 3.2,
          title: "NVIDIA Isaac Sim",
          content: `Isaac Sim is a robotics simulation platform that enables training, testing, and validation of AI robots in photorealistic virtual environments before deployment in the real world.`
        },
        {
          id: 3.3,
          title: "LLMs in Robotics",
          content: `Large Language Models (LLMs) enable natural language interaction with robots, high-level task planning, and commonsense reasoning for complex robotic applications.`
        }
      ]
    }
  ],
  
  // Book metadata
  metadata: {
    title: "Hackathon Native Book – Physical AI & Humanoid Robotics",
    subtitle: "A Comprehensive Guide to Building Intelligent Robots",
    author: "Hackathon Team",
    version: "1.0.0",
    description: "This textbook explores Physical AI & Humanoid Robotics, from foundational concepts to advanced topics like ROS 2, Isaac Sim, and LLMs."
  }
};

// Translation memory cache
export const translationCache = {};

// Available languages
export const languages = [
  { code: 'ur', name: 'Urdu', emoji: '🇵🇰', native: 'اردو' },
  { code: 'hi', name: 'Hindi', emoji: '🇮🇳', native: 'हिन्दी' },
  { code: 'ar', name: 'Arabic', emoji: '🇸🇦', native: 'العربية' },
  { code: 'es', name: 'Spanish', emoji: '🇪🇸', native: 'Español' },
  { code: 'fr', name: 'French', emoji: '🇫🇷', native: 'Français' },
  { code: 'de', name: 'German', emoji: '🇩🇪', native: 'Deutsch' },
  { code: 'ja', name: 'Japanese', emoji: '🇯🇵', native: '日本語' },
  { code: 'ko', name: 'Korean', emoji: '🇰🇷', native: '한국어' },
  { code: 'zh', name: 'Chinese', emoji: '🇨🇳', native: '中文' },
  { code: 'ru', name: 'Russian', emoji: '🇷🇺', native: 'Русский' }
];