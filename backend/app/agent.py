import os
from langchain_openai import ChatOpenAI
from langchain.tools import tool
from langchain.agents import create_agent
from dotenv import load_dotenv
from langgraph.checkpoint.memory import InMemorySaver
from langchain.messages import HumanMessage, SystemMessage

from app.n8n_api import (
    # get_billing,
    # get_customer,
    # submit_ticket,
    network_agent,
    knowledge_agent,
    customer_info_agent,
    calendar_agent,
    get_current_time,
    ticket_agent
)

load_dotenv()

# ── LLM via OpenRouter ─────────────────────────────────
llm = ChatOpenAI(
    model=os.getenv("OPENAI_MODEL", "qwen/qwen-2.5-72b-instruct:free"),
    openai_api_key=os.getenv("OPENAI_API_KEY"),
    openai_api_base=os.getenv("OPENAI_API_BASE"),
    default_headers={
        "HTTP-Referer": "https://pldt-gabby.com",
        "X-Title": "PLDT Gabby Voice Agent"
    },
    temperature=0
)

# ── Tools ──────────────────────────────────────────────

@tool
def call_customer_info_agent(user_request: str) -> dict:
    """
    Call this agent for retrieving customer account information using their service number.

    This agent is capable providing the following information:
    1. `balanceProfile` - current and latest balance with statement info
    2. `serviceProfiles` - an array of active services (voice, DSL, etc.) with plan, credit, and status details
    3. `customerProfile` - full customer identity, billing, consent, loyalty, and verification data
    """ 
    return customer_info_agent(user_request)

@tool
def call_network_agent(area: str) -> dict:
    """
    Call this agent to check for active network outages in a given city or area in the Philippines.
    Call this immediately when customer mentions any area or location.
    If has_outage is True inform the customer there IS an active outage.
    If has_outage is False inform the customer there is NO outage.
    """
    return network_agent(area)


@tool
def call_knowledge_agent(question: str) -> dict:
    """
    Call this agent to search the PLDT knowledge base for answers to frequently asked questions.
    Call this agent when the customer mentions:
    - a blinking red light
    - slow internet speed
    - lag
    - billing payment channels
    - where/how to pay bills
    """
    return knowledge_agent(question)

@tool
def call_calendar_agent(month: str, day: str, time: str, reason: str) -> dict:
    """
    Call this agent when the customer wants to set up an appointment or meeting.
    This agent is responsible for scheduling a meeting with a PLDT representative on the date explicitly specified by the user.

    # NOTES
    - There must be a clear start date and time, except for the year- let the agent handle that.
    - The appointment cannot be scheduled for a past date. Always confirm the date with the customer before calling this tool.
    - Only include a reason for the meeting if the customer explicitly states it. Do not assume or make up a reason. Otherwise just say "No reason specified".
    """
    current_year = get_current_time()["date"].split(", ")[1]
    return calendar_agent(month, day, time, reason)

@tool
def call_ticket_agent(user_request: str) -> dict:
    """
    Call this agent for creating and retrieving support tickets.

    # Creating Tickets:
    - Creating tickets is the final step for unresolved issues that require human intervention.

    # Retrieving Tickets:
    - To retrieve a ticket, a service number is required.
    - If there are no ticket details returned, there is no need to escalate the situation. Simply say that the customer has no open tickets.
    """
    return ticket_agent(user_request)
# ── System Prompt ──────────────────────────────────────

system_prompt = """
# IDENTITY:
You are Gabby, a PLDT customer service voice assistant. Your goal is to be concise, and sound like a real human agent.
You go straight to the point, and avoid unnecessary explanations.

# LANGUAGE USAGE (English or Filipino)
- Your default language is English
- If the customer speaks in full Filipino sentences, reply in full Filipino.
- If the customer mixes English and Filipino, reply in full English.
- If the customer only says phrases in Filipino, reply in English. 
    example: you say "What is your location?", customer says "Cebu" -> you reply should be in English, not Filipino.

# STRICT AUDIO AND FORMATTING RULES
- NO MARKDOWN: Never use bullet points, asterisks, or numbered lists.
- NO ROBOTIC PHRASING: Never say "The network status is..." or "I am an AI" or "Ma'am/Sir."
- SHORT RESPONSES: Keep answers under 3 sentences. You are on a voice call, not writing an email.
- ONE QUESTION RULE: Always end your turn with a single clear follow-up question.
- NATURAL TONE: Sound like a real person, not a robot reading a script.
- LIMIT REQUESTS FOR INFORMATION: Only ask for a maximum of ONE piece of information at a time (e.g. "Can I have your account number?" instead of "Can I have your account number, contact number, and the details of your concern?")
"""

# ── Agent ──────────────────────────────────────────────

tools = [
    call_network_agent,
    call_knowledge_agent, # RAG
    call_customer_info_agent,
    call_calendar_agent,
    call_ticket_agent
]

agent = create_agent(
    model=llm,
    tools=tools,
    system_prompt=system_prompt,
    checkpointer=InMemorySaver()
)

def run_agent(user_input: str, session_id: str) -> str:
    response = agent.invoke(
        {"messages": [
            SystemMessage(content=f"current time: {get_current_time()}"),
            HumanMessage(content=user_input)]},
        config={"configurable": {"thread_id": session_id}}
    )
    return response["messages"][-1].content
