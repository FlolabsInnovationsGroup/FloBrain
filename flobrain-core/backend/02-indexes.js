db = db.getSiblingDB('flobrain');

db.workflows.createIndex({ user_id: 1, created_at: -1 });
db.workflow_steps.createIndex({ workflow_id: 1, created_at: 1 });
db.workflow_events.createIndex({ workflow_id: 1, created_at: 1 });
db.workflow_events.createIndex({ user_id: 1, created_at: -1 });
db.workflow_events.createIndex({ event_type: 1, created_at: -1 });
db.llmcalls.createIndex({ workflow_id: 1, created_at: 1 });
db.messages.createIndex({ session_id: 1, created_at: 1 });
db.locations.createIndex({ session_id: 1, created_at: 1 });
db.presetworkflows_planA.createIndex({ name: 1, version: 1 }, { unique: true });
db.presetworkflowsteps.createIndex({ agent_id: 1});
db.agents.createIndex({ name: 1, version: 1 }, { unique: true });
db.tools.createIndex({ name: 1 });
