db = db.getSiblingDB('flobrain');

const collections = [
    'workflows',
    'workflow_steps',
  'workflow_events',
    'llmcalls',
    'messages',
    'locations',
    'presetworkflows_planA',
    'presetworkflowsteps',
    'agents',
    'tools'
];

collections.forEach((c) => {
    const exists = db.getCollectionNames().includes(c);
    if (!exists) {
      db.createCollection(c);
    }
  });