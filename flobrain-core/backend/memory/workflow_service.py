from datetime import datetime
from bson import ObjectId
from pymongo import ReturnDocument
from memory.mongo_client import db


def _now():
    return datetime.utcnow()

def _refresh_message_index():
    from memory.embedding_service import build_message_index

    build_message_index()


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

def save_message(user_id, session_id, workflow_id, role, content, metadata=None):
    message = {
        "user_id": user_id,
        "session_id": session_id,
        "workflow_id": workflow_id,
        "role": role,
        "content": content,
        "metadata": metadata or {},
        "created_at": _now()
    }

    result = db.messages.insert_one(message)
    _refresh_message_index()
    return str(result.inserted_id)


def save_llm_call(user_id, workflow_id, prompt, response, model="unknown", metadata=None):
    llm_call = {
        "user_id": user_id,
        "workflow_id": workflow_id,
        "prompt": prompt,
        "response": response,
        "model": model,
        "metadata": metadata or {},
        "created_at": _now()
    }

    result = db.llmcalls.insert_one(llm_call)
    return str(result.inserted_id)
    

def update_workflow(workflow_id, updates):
    result = db.workflows.find_one_and_update(
        {"_id": ObjectId(workflow_id)},
        {
            "$set": {
                **updates,
                "updated_at": _now()
            }
        },
        return_document=ReturnDocument.AFTER
    )

    if result:
        result["_id"] = str(result["_id"])

    return result


def update_message(message_id, updates):
    result = db.messages.find_one_and_update(
        {"_id": ObjectId(message_id)},
        {"$set": updates},
        return_document=ReturnDocument.AFTER
    )

    if result:
        result["_id"] = str(result["_id"])
        _refresh_message_index()

    return result


def update_llm_call(llm_call_id, updates):
    result = db.llmcalls.find_one_and_update(
        {"_id": ObjectId(llm_call_id)},
        {"$set": updates},
        return_document=ReturnDocument.AFTER
    )

    if result:
        result["_id"] = str(result["_id"])

    return result

def delete_workflow(workflow_id):
    result = db.workflows.delete_one(
        {"_id": ObjectId(workflow_id)}
    )
    return result.deleted_count


def delete_message(message_id):
    result = db.messages.delete_one(
        {"_id": ObjectId(message_id)}
    )

    if result.deleted_count:
        _refresh_message_index()

    return result.deleted_count


def delete_llm_call(llm_call_id):
    result = db.llmcalls.delete_one(
        {"_id": ObjectId(llm_call_id)}
    )
    return result.deleted_count

def get_workflow(workflow_id):
    workflow = db.workflows.find_one(
        {"_id": ObjectId(workflow_id)}
    )

    if workflow:
        workflow["_id"] = str(workflow["_id"])

    return workflow


def get_message(message_id):
    message = db.messages.find_one(
        {"_id": ObjectId(message_id)}
    )

    if message:
        message["_id"] = str(message["_id"])

    return message


def get_llm_call(llm_call_id):
    llm_call = db.llmcalls.find_one(
        {"_id": ObjectId(llm_call_id)}
    )

    if llm_call:
        llm_call["_id"] = str(llm_call["_id"])

    return llm_call