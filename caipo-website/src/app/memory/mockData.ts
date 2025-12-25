export const memoryParticles = [
  // Cluster: Ciência de Dados e Algoritmos
  { id: "p4", description: "Neural Networks", weight: 20, relations: ["p8", "p9", "p11", "p88"] },
  { id: "p5", description: "Deep Learning", weight: 18, relations: ["p4", "p73"] },
  { id: "p8", description: "Algorithms", weight: 15, relations: ["p9", "p17", ] },
  { id: "p9", description: "Data Science", weight: 22, relations: ["p18", "p29", "p43"] },
  { id: "p11", description: "Computer Vision", weight: 12, relations: [] },
  { id: "p17", description: "Optimization", weight: 10, relations: [] },
  { id: "p18", description: "Big Data", weight: 16, relations: ["p29"] },
  { id: "p29", description: "Statistics", weight: 14, relations: ["p43", "p58"] },
  { id: "p43", description: "Probability", weight: 12, relations: [ "p58"] },
  { id: "p58", description: "Bayesian", weight: 8, relations: ["p73"] },
  { id: "p73", description: "Machine Learning", weight: 40, relations: ["p4", "p5", "p88"] },
  { id: "p88", description: "Reinforcement Learning", weight: 15, relations: ["p73", ] },

];