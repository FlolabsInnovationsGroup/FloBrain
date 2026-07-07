import json
import logging
import os
import urllib.error
import urllib.request

from django.utils import timezone

from memory.context_assembler import LosslessContextAssembler
from memory.mongo_client import db as mongo_db
from memory.workflow_service import add_workflow_step, create_workflow

logger = logging.getLogger(__name__)

CHAT_WORKFLOW_PRESET = "basic_prompt"
CHAT_WORKFLOW_VERSION = "v1"


def _log_llm_event(user_id, workflow_id, status, message, payload=None):
    try:
        mongo_db.workflow_events.insert_one(
            {
                "workflow_id": workflow_id,
                "user_id": str(user_id),
                "event_type": "brain_llm_call",
                "status": status,
                "payload": {"message": message, **(payload or {})},
                "created_at": timezone.now(),
            }
        )
    except Exception:
        logger.exception("Failed to log LLM workflow event")


def _record_llm_call(workflow_id, user_id, model, messages, reply, status, error=None):
    mongo_db.llmcalls.insert_one(
        {
            "workflow_id": workflow_id,
            "user_id": str(user_id),
            "model": model,
            "status": status,
            "input": messages,
            "output": reply,
            "error": error,
            "created_at": timezone.now(),
        }
    )


def _build_messages(chat_messages, user_text, context):
    system_prompt = "You are FloBrain, CAIPO's central intelligence assistant."
    if context:
        system_prompt += f"\n\nRelevant user memory:\n{context}"

    messages = [{"role": "system", "content": system_prompt}]
    for msg in chat_messages[-10:]:
        role = "assistant" if msg.role == "assistant" else "user"
        content = (msg.text or "").strip()
        if content:
            messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": user_text})
    return messages


def _call_openai(messages):
    api_key = os.environ.get("OPENAI_API_KEY", "").strip()
    if not api_key:
        return None

    model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")
    payload = json.dumps(
        {
            "model": model,
            "messages": messages,
            "temperature": 0.7,
        }
    ).encode("utf-8")

    request = urllib.request.Request(
        "https://api.openai.com/v1/chat/completions",
        data=payload,
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    with urllib.request.urlopen(request, timeout=60) as response:
        data = json.loads(response.read().decode("utf-8"))

    return model, data["choices"][0]["message"]["content"]


def _memory_fallback(context):
    if context:
        snippet = context[:800].strip()
        return f"Here's what I found in your memory related to this:\n\n{snippet}"
    return (
        "I'm connected, but no LLM credentials are configured yet. "
        "Set OPENAI_API_KEY to enable full intelligent replies."
    )


def generate_assistant_reply(user_id, user_text, chat_messages):
    """
    Run the v1 chat workflow (validate_input -> llm_call -> store_response)
    and return a real assistant reply.
    """
    prompt_text = user_text or "The user sent an image without text."
    workflow_id = create_workflow(str(user_id), CHAT_WORKFLOW_PRESET, CHAT_WORKFLOW_VERSION)

    add_workflow_step(
        workflow_id,
        "validate_input",
        input_data={"text": prompt_text},
        output_data={"valid": True},
        status="success",
    )

    assembler = LosslessContextAssembler()
    context, memory_node_ids, _ = assembler.assemble_context(prompt_text, str(user_id))
    messages = _build_messages(chat_messages, prompt_text, context)
    model = os.environ.get("OPENAI_MODEL", "gpt-4o-mini")

    try:
        result = _call_openai(messages)
        if result:
            used_model, reply = result
            reply = reply.strip()
            _record_llm_call(workflow_id, user_id, used_model, messages, reply, "success")
            add_workflow_step(
                workflow_id,
                "llm_call",
                input_data={"messages": messages, "memory_node_ids": memory_node_ids},
                output_data={"reply": reply, "model": used_model},
                status="success",
            )
            add_workflow_step(
                workflow_id,
                "store_response",
                input_data={"reply": reply},
                output_data={"stored": True},
                status="success",
            )
            _log_llm_event(user_id, workflow_id, "success", "LLM response generated")
            return reply
    except urllib.error.HTTPError as exc:
        body = exc.read().decode("utf-8", errors="replace")
        logger.exception("OpenAI HTTP error: %s", body)
        error_message = f"OpenAI request failed: {body[:200]}"
        _record_llm_call(workflow_id, user_id, model, messages, None, "error", error_message)
        add_workflow_step(
            workflow_id,
            "llm_call",
            input_data={"messages": messages},
            output_data={"error": error_message},
            status="error",
        )
        _log_llm_event(user_id, workflow_id, "error", error_message)
    except Exception as exc:
        logger.exception("LLM call failed")
        error_message = str(exc)
        _record_llm_call(workflow_id, user_id, model, messages, None, "error", error_message)
        add_workflow_step(
            workflow_id,
            "llm_call",
            input_data={"messages": messages},
            output_data={"error": error_message},
            status="error",
        )
        _log_llm_event(user_id, workflow_id, "error", error_message)

    if not os.environ.get("OPENAI_API_KEY", "").strip():
        error_message = "OPENAI_API_KEY is not configured"
        _record_llm_call(workflow_id, user_id, model, messages, None, "error", error_message)
        add_workflow_step(
            workflow_id,
            "llm_call",
            input_data={"messages": messages},
            output_data={"error": error_message},
            status="error",
        )
        _log_llm_event(user_id, workflow_id, "error", error_message)

    fallback = _memory_fallback(context)
    add_workflow_step(
        workflow_id,
        "store_response",
        input_data={"fallback": True},
        output_data={"text": fallback},
        status="warning",
    )
    return fallback
