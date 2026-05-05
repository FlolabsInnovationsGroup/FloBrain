db = db.getSiblingDB('flobrain');

//Workflows
db.workflows.createIndex({ user_id: 1, created_at: -1 });
db.workflows.createIndex({ preset_workflow_id: 1, preset_version: 1 });

// Workflow Steps 
db.workflow_steps.createIndex({ workflow_id: 1, created_at: 1 });
db.workflow_steps.createIndex({ step_type: 1 });

// LLM Calls
db.llmcalls.createIndex({ workflow_id: 1, created_at: 1 });
db.llmcalls.createIndex({ session_id: 1, created_at: -1 });

// Messages
db.messages.createIndex({ session_id: 1, created_at: 1 });

// Locations
db.locations.createIndex({ session_id: 1, created_at: 1 });

// Preset Workflows
db.presetworkflows_planA.createIndex({ name: 1, version: 1 }, { unique: true });

// Preset Workflow Steps
db.presetworkflowsteps.createIndex({ preset_workflow_id: 1, version: 1 });

// Agents
db.agents.createIndex({ name: 1, version: 1 }, { unique: true });

// Tools
db.tools.createIndex({ name: 1, version: 1 }, { unique: true });

// Workflow Events
db.workflow_events.createIndex({ workflow_id: 1, created_at: 1 });
db.workflow_events.createIndex({ user_id: 1, created_at: -1 });
db.workflow_events.createIndex({ event_type: 1 });
db.workflow_events.createIndex({ status: 1});