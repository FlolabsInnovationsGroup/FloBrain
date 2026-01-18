import { 
  GitBranch, 
  Brain, 
  Cpu, 
  RefreshCw, 
  Database, 
  Plug,
  Watch, 
  Smartphone, 
  Laptop, 
  Bot, 
  Wifi, 
  Building2 
} from "lucide-react";

export const features = [ 
    {
        id: 1,
        icon: <GitBranch className="w-5 h-5" color="#1F4F8B"/>,
        title: "Workflow Engine",
        description: "Orchestrate complex AI workflows with sequential, parallel, and conditional execution. Support for 100+ steps with sub-50ms overhead.",
        color: '#AFD3FF'
    },
    {
        id: 2,
        icon: <Brain className="w-5 h-5" color="#610081" />,
        title: "Memory System",
        description: "Persistent, contextual memory with vector embeddings. Store 100K+ memories per user with <100ms semantic search retrieval.",
        color: '#DF9CF5'
    },
    {
        id: 3,
        icon: <Cpu className="w-5 h-5" color="#1F832D" />,
        title: "AI Orchestration",
        description: "Intelligent routing across multiple AI models. Support for GPT-4, Whisper, ElevenLabs, and local models with automatic failover.",
        color: '#8AFDD3'
    },
    {
        id: 4,
        icon: <RefreshCw className="w-5 h-5" color="#B34800" />,
        title: "Real-Time Sync",
        description: "Seamless synchronization across all devices. <500ms sync latency with offline support and conflict resolution.",
        color: '#FCB98C'
    },
    {
        id: 5,
        icon: <Database className="w-5 h-5" color="#53E1FD" />,
        title: "State Management",
        description: "Distributed state handling with Redis. <10ms read latency and 100% consistency across replicas.",
        color: '#A3F0FF'
    },
    {
        id: 6,
        icon: <Plug className="w-5 h-5" color="#8F0909" />,
        title: "Integration Layer",
        description: "RESTful and gRPC APIs with SDKs for Python, JavaScript, and Go. Support for 1000+ API calls per second.",
        color: '#FE9294'
    },
];

export const applications = [
    {
        id: 1,
        icon: <Watch className="w-6 h-6" color="#1F4F8B" />,
        title: "Wearables",
        description: "Smart watches, AI pins, AR glasses",
        tags: ["CAIPO Band", "Smart glasses", "AI Pins"],
    },
    {
        id: 2,
        icon: <Smartphone className="w-6 h-6" color="#1F4F8B" />,
        title: "Mobile Apps",
        description: "iOS and Android applications",
        tags: ["Productivity Apps", "AI Assistants", "Health Trackers"],
    },
    {
        id: 3,
        icon: <Laptop className="w-6 h-6" color="#1F4F8B" />,
        title: "Web Apps",
        description: "Browser-based applications",
        tags: ["Dashboards", "Admin Panels", "SaaS Products"],
    },
    {
        id: 4,
        icon: <Bot className="w-6 h-6" color="#1F4F8B" />,
        title: "Robotics",
        description: "Autonomous robots and drones",
        tags: ["Service Robots", "Drones", "Smart Devices"],
    },
    {
        id: 5,
        icon: <Wifi className="w-6 h-6" color="#1F4F8B" />,
        title: "IoT Devices",
        description: "ESP32, Raspberry Pi, edge devices",
        tags: ["Smart Home", "Sensors", "Edge AI"],
    },
    {
        id: 6,
        icon: <Building2 className="w-6 h-6" color="#1F4F8B" />,
        title: "Enterprise",
        description: "On-premise and cloud deployments",
        tags: ["Private Cloud", "Data Centers", "Hybrid Setup"],
    },
];

export const possibilities = ["Real-time Sync", "Offline Support", "Cross-Platform", "Privacy-First"]