db = db.getSiblingDB('flobrain');

const collections = [
    'workflows',
    'workflow_steps',
    'llmcalls',
    'messages',
    'locations',
    'presetworkflows_planA',
    'presetworkflowsteps',
    'agents',
    'tools',
    'user_events'
];

collections.forEach((c) => {
    const exists = db.getCollectionNames().includes(c);
    if (!exists) {
      db.createCollection(c);
    }
  });