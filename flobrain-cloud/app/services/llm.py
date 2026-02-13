from openai import OpenAI
from app.core.config import settings
import logging

client = OpenAI(api_key=settings.OPENAI_API_KEY) if settings.OPENAI_API_KEY else None


def generate_response(messages: list, model="gpt-3.5-turbo") -> str:
    if not client:
        return "Error: OpenAI API key not configured."

    try:
        chat = client.chat.completions.create(model=model, messages=messages)
        content = chat.choices[0].message.content
        return content.strip() if content else ""
    except Exception as e:
        logging.error(f"LLM generation failed: {e}")
        return f"Error generating response: {str(e)}"
