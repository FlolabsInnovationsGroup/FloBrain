from datetime import datetime
from bson import ObjectId
from memory.mongo_client import db


def _now():
    return datetime.utcnow()


def _get_workflow_user_id(workflow_id):
    try:
        workflow = db.workflows.find_one({"_id": ObjectId(workflow_id)})
    except Exception:
        workflow = None

    if workflow is None:
        return None

    return workflow.get("user_id")


def log_workflow_event(workflow_id, user_id, event_type, status="success", payload=None):
    event = {
        "workflow_id": workflow_id,
        "user_id": user_id,
        "event_type": event_type,
        "status": status,
        "payload": payload or {},
        "created_at": _now()
    }

    result = db.workflow_events.insert_one(event)
    return str(result.inserted_id)


def log_system_event(workflow_id, event_type, status="info", payload=None):
    user_id = _get_workflow_user_id(workflow_id)

    event = {
        "workflow_id": workflow_id,
        "user_id": user_id,
        "event_type": f"system_{event_type}",
        "status": status,
        "payload": payload or {},
        "created_at": _now()
    }

    result = db.workflow_events.insert_one(event)
    return str(result.inserted_id)


def create_workflow(user_id, preset_id, version):
    created_at = _now()

    workflow = {
        "user_id": user_id,
        "preset_workflow_id": preset_id,
        "preset_version": version,
        "state": {
            "current_steps": [],
            "completed_steps": [],
            "blocked_steps": []
        },
        "created_at": created_at,
        "updated_at": created_at
    }

    result = db.workflows.insert_one(workflow)
    workflow_id = str(result.inserted_id)

    log_workflow_event(
        workflow_id,
        user_id,
        "workflow_created",
        status="success",
        payload={
            "preset_workflow_id": preset_id,
            "preset_version": version,
        }
    )

    return workflow_id


def add_workflow_step(workflow_id, step_type, input_data=None, output_data=None, status="success"):
    user_id = _get_workflow_user_id(workflow_id)

    step = {
        "workflow_id": workflow_id,
        "step_type": step_type,
        "input": input_data,
        "output": output_data,
        "status": status,
        "created_at": _now(),
    }

    result = db.workflow_steps.insert_one(step)

    if user_id is not None:
        log_workflow_event(
            workflow_id,
            user_id,
            f"workflow_step_{step_type}",
            status=status,
            payload={
                "input": input_data,
                "output": output_data,
            },
        )

    return str(result.inserted_id)