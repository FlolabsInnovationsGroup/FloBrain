from datetime import datetime
from memory.mongo_client import db

def create_workflow(user_id, preset_id, version):
    workflow = {
        "user_id": user_id,
        "preset_workflow_id": preset_id,
        "preset_version": version,
        "state": {
            "current_steps": [],
            "completed_steps": [],
            "blocked_steps": []
        },
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    result = db.workflows.insert_one(workflow)
    return str(result.inserted_id)


def add_workflow_step(workflow_id, step_type, input_data=None, output_data=None, status="success"):
    step = {
        "workflow_id": workflow_id,
        "step_type": step_type,
        "input": input_data,
        "output": output_data,
        "status": status,
        "created_at": datetime.utcnow()
    }

    result = db.workflow_steps.insert_one(step)
    return str(result.inserted_id)

def create_user_event(
    user_id,
    event_type,
    workflow_id=None,
    preset_id=None,
    version=None,
    event_status="created",
    payload=None,
    scheduled_time=None
):
    user_event = {
        "user_id": user_id,
        "event_type": event_type,
        "workflow_id": workflow_id,
        "preset_workflow_id": preset_id,
        "preset_version": version,
        "event_status": event_status,
        "payload": payload or {},
        "scheduled_time": scheduled_time,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }

    result = db.user_events.insert_one(user_event)
    return str(result.inserted_id)