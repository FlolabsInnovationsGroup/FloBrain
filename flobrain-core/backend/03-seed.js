db = db.getSiblingDB('flobrain');

db.presetworkflows_planA.insertOne({
    name: 'Basic Prompt Execution',
    description: 'Send prompt to AI microservice',
    version: 'v1',
    available_steps: ['validate_input', 'llm_call', 'store_response'],
    created_at: new Date(),

});
