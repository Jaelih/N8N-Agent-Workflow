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
    check_network_status,
    get_knowledge_base,
    get_customer_info,
    set_meeting_date,
    get_current_time,
    submit_ticket
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
def get_customer_info_tool(user_request: str) -> dict:
    """
    The webhook returns customer account data with three main sections:
    1. `balanceProfile` - current and latest balance with statement info
    2. `serviceProfiles` - an array of active services (voice, DSL, etc.) with plan, credit, and status details
    3. `customerProfile` - full customer identity, billing, consent, loyalty, and verification data

    Key fields to prioritize:
    - `accountStatus`, `balanceDue`, `dueDate` → for billing queries
    - `serviceStatus`, `serviceType`, `packageName` → for service queries
    - `openDispute`, `openConnectSO`, `openTreatmentSO` → for issue/order tracking
    - `dpaConsent`, `promo*`, `loyalty*` → for communication preference checks
    - `mobileStatus`, `emailStatus` → for verification status

    There is no need to confirm the customer's identity with them before calling this tool. Just call it with the user's request and use the returned data to guide your responses and next steps.
    """
    return get_customer_info(user_request)

# @tool
# def get_billing_status(customer_id: str) -> dict:
#     """
#     Retrieves billing status of a PLDT customer by Customer ID.
#     Always ask the customer for their customer ID before calling this.
#     """
#     return get_billing(customer_id)


# @tool
# def get_customer_info(customer_id: str) -> dict:
#     """
#     Retrieves customer account information using their customer ID.
#     Use this to verify customer identity before showing billing info.
#     """
#     return get_customer(customer_id)


# @tool
# def submit_support_ticket(customer_id: str, concern: str, contact_number: str) -> dict:
#     """
#     Submits a support ticket for unresolved customer issues.
#     Always get Customer ID and contact number before calling this.
#     """
#     return submit_ticket(customer_id, concern, contact_number)


@tool
def check_network_status_tool(area: str) -> dict:
    """
    Checks for active network outages in a given city or area in the Philippines.
    Call this immediately when customer mentions any area or location.
    If has_outage is True inform the customer there IS an active outage.
    If has_outage is False inform the customer there is NO outage.
    """
    return check_network_status(area)


@tool
def search_knowledge_base_tool(question: str) -> dict:
    """
    Searches the PLDT knowledge base for answers to frequently asked questions.
    Use this tool when the customer mentions:
    - a blinking red light
    - slow internet speed
    - lag
    - billing payment channels
    - where/how to pay bills
    """
    return get_knowledge_base(question)

@tool
def set_meeting_date_tool(start_meeting_date: str) -> dict:
    """
    Schedules a meeting with a PLDT representative on the date explicitly specified by the user.
    Use this when the customer wants to set up an appointment.

    There must be a clear start date and time, except for the year- let the tool handle that.
    The appintment cannot be scheduled for a past date. Always confirm the date with the customer before calling this tool.
    """
    current_year = get_current_time()["date"].split(", ")[1]
    return set_meeting_date(f"{start_meeting_date} {current_year}")

@tool
def submit_ticket_tool(account_number: str, concern: str, contact_number: str) -> dict:
    """
    Submits a support ticket for unresolved customer issues.
    Always get Account Number and contact number before calling this.
    """
    return submit_ticket(account_number, concern, contact_number)
# ── System Prompt ──────────────────────────────────────

system_prompt = """
# IDENTITY:
You are Gabby, a PLDT customer service voice assistant. Your goal is to be helpful, concise, and sound like a real human agent in the Philippines.

# CRITICAL: DYNAMIC LANGUAGE ADAPTATION
You must match the language the user is speaking.
Stay specifically in either MODE A or MODE B based on the user's language.
Only change modes when the user explicitly switches languages.

## MODE A: IF USER SPEAKS ENGLISH
- Respond in clear, professional, but warm Philippine English.
- No "po", no "Ma'am/Sir", no Tagalog words.
- Sound like a friendly and competent call center agent.

## MODE B: IF USER SPEAKS TAGALOG
- Respond in natural conversational Tagalog.
- Use "po" and "ho" naturally but not excessively.
- Never say "Ma'am/Sir" — use "kayo" instead.
- Sound warm and genuinely caring, like a real Filipino customer service rep.
- Use natural expressions like "Sige", "Ay nako", "Sandali lang", "Check ko na yan", "Wag po kayong mag-alala."
- Example: "Pasensya na po sa abala. Taga-saan po ba kayo para ma-check ko yung signal sa inyong area?"

### notes: 
- if the user only mentions a city or location without explicitly speaking in any language, respond in the same language as your previous response.
- DO not verify the user's identity unless a tool response contains information that requires you to ask the user for specific details (e.g. account number, customer ID, contact number) to proceed with a request. In that case, ask for the specific information needed in a natural way.

# STRICT AUDIO AND FORMATTING RULES
- NO MARKDOWN: Never use bullet points, asterisks, or numbered lists.
- NO ROBOTIC PHRASING: Never say "The network status is..." or "I am an AI" or "Ma'am/Sir."
- SHORT RESPONSES: Keep answers under 3 sentences. You are on a voice call, not writing an email.
- ONE QUESTION RULE: Always end your turn with a single clear follow-up question.
- NATURAL TONE: Sound like a real person, not a robot reading a script.
- LIMIT REQUESTS FOR INFORMATION: Only ask for a maximum of two pieces of information at a time (e.g. "Can I have your account number?" instead of "Can I have your account number, contact number, and the details of your concern?")

# STANDARD PROCEDURES
1. Outages: Ask for the specific city or location before checking network status.
2. Billing: Use the `get_customer_info` tool to get the necessary information.
2. Service: Use the `get_customer_info` tool to get the necessary information.
2. Issue/Order Tracking: Use the `get_customer_info` tool to get the necessary information.
2. Communication Preferences: Use the `get_customer_info` tool to get the necessary information.
2. Verification Status: Use the `get_customer_info` tool to get the necessary information.
"""

# ── Agent ──────────────────────────────────────────────

tools = [
    check_network_status_tool,
    search_knowledge_base_tool, # RAG
    get_customer_info_tool,
    set_meeting_date_tool,
    submit_ticket_tool
]

agent = create_agent(
    model=llm,
    tools=tools,
    system_prompt=system_prompt,
    checkpointer=InMemorySaver()
)

config = {"configurable": {"thread_id": "1"}}

def run_agent(user_input: str, session_id: str) -> str:
    response = agent.invoke(
        {"messages": [
            SystemMessage(content=f"current time: {get_current_time()}"),
            HumanMessage(content=user_input)]},
        config={"configurable": {"thread_id": session_id}}
    )
    return response["messages"][-1].content
