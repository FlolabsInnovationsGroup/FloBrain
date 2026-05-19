import {
  GitBranch,
  Brain,
  Cpu,
  RefreshCw,
  Database,
  Plug,
  Layers,
  Watch,
  Smartphone,
  Globe,
  Bot,
  Building2,
} from "lucide-react";

const iconSize = "w-8 h-8";

export const features = [
  {
    id: 1,
    icon: <GitBranch className={iconSize} color="#ffffff" />,
    title: "Workflow Engine",
    description:
      "Orchestrate complex AI workflows with visual drag-and-drop or code-first approaches.",
    color: "#3b82f6",
  },
  {
    id: 2,
    icon: <Database className={iconSize} color="#ffffff" />,
    title: "Memory System",
    description:
      "Persistent, long-term memory that learns from every interaction and context.",
    color: "#8b5cf6",
  },
  {
    id: 3,
    icon: <Brain className={iconSize} color="#ffffff" />,
    title: "AI Orchestration",
    description:
      "Route requests to the best model for the job. Multi-model, multi-provider support.",
    color: "#22c55e",
  },
  {
    id: 4,
    icon: <RefreshCw className={iconSize} color="#ffffff" />,
    title: "Real-Time Sync",
    description:
      "Keep state synchronized across all devices and platforms in real-time.",
    color: "#f97316",
  },
  {
    id: 5,
    icon: <Layers className={iconSize} color="#ffffff" />,
    title: "State Management",
    description:
      "Centralized state management that works across web, mobile, IoT, and embedded systems.",
    color: "#14b8a6",
  },
  {
    id: 6,
    icon: <Plug className={iconSize} color="#ffffff" />,
    title: "Integration Layer",
    description:
      "Pre-built connectors for popular services, APIs, and platforms. Extensible architecture.",
    color: "#ef4444",
  },
];

const appIconSize = "w-8 h-8";

export const applications = [
  {
    id: 1,
    icon: <Watch className={appIconSize} color="#a855f7" />,
    iconColor: "#a855f7",
    title: "Wearables",
    description: "Power smart watches and fitness trackers with on-device AI",
    tags: ["Apple Watch", "Wear OS", "Fitbit", "Garmin"],
  },
  {
    id: 2,
    icon: <Smartphone className={appIconSize} color="#3b82f6" />,
    iconColor: "#3b82f6",
    title: "Mobile Apps",
    description: "Native iOS and Android SDKs for seamless integration",
    tags: ["iOS", "Android", "React Native", "Flutter"],
  },
  {
    id: 3,
    icon: <Globe className={appIconSize} color="#22c55e" />,
    iconColor: "#22c55e",
    title: "Web Apps",
    description: "JavaScript SDK for modern web applications",
    tags: ["React", "Vue", "Next.js", "Svelte"],
  },
  {
    id: 4,
    icon: <Bot className={appIconSize} color="#f97316" />,
    iconColor: "#f97316",
    title: "Robotics",
    description: "Real-time decision making for autonomous systems",
    tags: ["ROS", "ROS2", "NVIDIA Isaac", "Custom"],
  },
  {
    id: 5,
    icon: <Cpu className={appIconSize} color="#ec4899" />,
    iconColor: "#ec4899",
    title: "IoT Devices",
    description: "Lightweight runtime for resource-constrained devices",
    tags: ["ESP32", "Raspberry Pi", "Arduino", "Edge"],
  },
  {
    id: 6,
    icon: <Building2 className={appIconSize} color="#6366f1" />,
    iconColor: "#6366f1",
    title: "Enterprise",
    description: "On-premise deployment with SSO and compliance",
    tags: ["AWS", "Azure", "GCP", "On-Prem"],
  },
];

export const possibilities = [
  "Real-time Sync",
  "Offline Support",
  "Cross-Platform",
  "Privacy-First",
];
