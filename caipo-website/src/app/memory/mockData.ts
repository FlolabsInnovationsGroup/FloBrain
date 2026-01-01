export const memoryNodes = [
    // --- CORE & WEB ---
    { id: "root", name: "Technologies", val: 30, group: "core" },
    { id: "fe", name: "Frontend", val: 15, group: "front" },
    { id: "be", name: "Backend", val: 15, group: "back" },
    { id: "react", name: "React", val: 10, group: "front" },
    { id: "vue", name: "Vue.js", val: 10, group: "front" },
    { id: "node", name: "Node.js", val: 10, group: "back" },
    { id: "go", name: "GoLang", val: 10, group: "back" },
    
    // --- INFRA ---
    { id: "db", name: "Database", val: 12, group: "infra" },
    { id: "postgres", name: "PostgreSQL", val: 8, group: "infra" },
    { id: "mongo", name: "MongoDB", val: 8, group: "infra" },
    { id: "docker", name: "Docker", val: 8, group: "devops" },
    { id: "aws", name: "AWS", val: 8, group: "devops" },

    // --- NEW AREA: AI ---
    { id: "ai", name: "Artificial Intelligence", val: 18, group: "ai" },
    { id: "python", name: "Python", val: 14, group: "ai" },
    { id: "ml", name: "Machine Learning", val: 10, group: "ai" },
    { id: "vision", name: "Computer Vision", val: 10, group: "ai" },
    { id: "llm", name: "LLMs / NLP", val: 10, group: "ai" },
    { id: "torch", name: "PyTorch", val: 8, group: "ai" },

    // --- NEW AREA: ROBOTICS ---
    { id: "robotics", name: "Robotics", val: 18, group: "robotics" },
    { id: "ros", name: "ROS 2", val: 12, group: "robotics" },
    { id: "cpp", name: "C / C++", val: 12, group: "robotics" },
    { id: "arduino", name: "Arduino / ESP32", val: 10, group: "robotics" },
    { id: "sensors", name: "Sensors & Actuators", val: 8, group: "robotics" },
    { id: "sim", name: "Gazebo / Simulation", val: 8, group: "robotics" }
  ];

export const memoryLinks = [
    // Original Links (Web/Infra)
    { source: "root", target: "fe" },
    { source: "root", target: "be" },
    { source: "root", target: "db" },
    { source: "root", target: "docker" },
    { source: "fe", target: "react" },
    { source: "fe", target: "vue" },
    { source: "be", target: "node" },
    { source: "be", target: "go" },
    { source: "db", target: "postgres" },
    { source: "db", target: "mongo" },
    { source: "be", target: "db" },
    { source: "docker", target: "aws" },

    // Links to New Clusters
    { source: "root", target: "ai" },
    { source: "root", target: "robotics" },

    // AI Cluster Links
    { source: "ai", target: "python" },
    { source: "ai", target: "ml" },
    { source: "ai", target: "vision" },
    { source: "ml", target: "llm" },
    { source: "ml", target: "torch" },
    { source: "python", target: "torch" },

    // Robotics Cluster Links
    { source: "robotics", target: "ros" },
    { source: "robotics", target: "cpp" },
    { source: "robotics", target: "arduino" },
    { source: "robotics", target: "sim" },
    { source: "arduino", target: "sensors" },
    { source: "ros", target: "sim" },

    // --- CROSS-CLUSTER CONNECTIONS ---
    { source: "be", target: "python" },
    { source: "ros", target: "cpp" },
    { source: "ros", target: "python" },
    { source: "vision", target: "robotics" },
    { source: "ai", target: "robotics" }
];