import os
from dotenv import load_dotenv

from google.adk.agents import Agent
from google.adk.tools import FunctionTool
from google.adk.models.lite_llm import LiteLlm

from app.n8n_api import (
    network_tool,
    knowledge_tool,
    customer_info_tool,
    calendar_tool,
    ticket_tool,
    current_time_tool
)

load_dotenv()

system_prompt = """
# IDENTITY:
You are Gabby, a PLDT customer service voice assistant. Your goal is to be concise, and sound like a real human agent.
You are hospitable but go straight to the point, and avoid unnecessary explanations.
You speak in a conversational manner, avoiding brackets, bullet points, or lists. You always respond in complete sentences.

# LANGUAGE USAGE (English or Filipino)
- Your default language is English
- If the customer speaks in full Filipino sentences, reply in full Filipino.
- If the customer mixes English and Filipino, reply in full English.
- If the customer only says phrases in Filipino, reply in English.

# STRICT RULES
- Never respond with JSON or code formatting.
- Never use bullet points or lists.
- Always end with ONE follow-up question.
- Ask only ONE question at a time.
- When a customer asks about network status or outage, ALWAYS call the network_tool immediately.
- When a customer asks about their account, ALWAYS call the customer_info_tool immediately.
- Never ask clarifying questions before calling a tool.
"""

agent = Agent(
    name="Gabby_PLDT_Agent",
    model=LiteLlm(model=f"openai/{os.getenv('OPENAI_MODEL', 'qwen/qwen-2.5-72b-instruct:free')}"),
    description="Gabby, a PLDT customer service voice assistant.",
    instruction=system_prompt,
    tools=[
        FunctionTool(network_tool),
        FunctionTool(knowledge_tool),
        FunctionTool(customer_info_tool),
        FunctionTool(calendar_tool),
        FunctionTool(ticket_tool),
        FunctionTool(current_time_tool),
    ]
)

async def run_agent(user_input: str, session_id: str = "default") -> str:
    from google.adk.runners import Runner
    from google.adk.sessions import InMemorySessionService
    from google.genai.types import Content, Part

    session_service = InMemorySessionService()
    runner = Runner(agent=agent, app_name="Gabby", session_service=session_service)

    session = await session_service.create_session(app_name="Gabby", user_id=session_id)

    content = Content(role="user", parts=[Part(text=user_input)])
    response_text = ""

    async for event in runner.run_async(
        user_id=session_id,
        session_id=session.id,
        new_message=content
    ):
        if event.is_final_response() and event.content:
            response_text = event.content.parts[0].text

    return response_text