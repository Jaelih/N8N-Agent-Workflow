import os
from langchain_openai import ChatOpenAI
from langchain.tools import tool
from langchain.agents import create_agent
from dotenv import load_dotenv
from app.n8n_api import (
    get_billing,
    get_customer,
    submit_ticket,
    check_network,
    get_knowledge
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
def get_billing_status(account_number: str) -> dict:
    """
    Retrieves billing status of a PLDT customer by account number.
    Always ask the customer for their account number before calling this.
    """
    return get_billing(account_number)


@tool
def get_customer_info(customer_id: str) -> dict:
    """
    Retrieves customer account information using their customer ID.
    Use this to verify customer identity before showing billing info.
    """
    return get_customer(customer_id)


@tool
def submit_support_ticket(account_number: str, concern: str, contact_number: str) -> dict:
    """
    Submits a support ticket for unresolved customer issues.
    Always get account number and contact number before calling this.
    """
    return submit_ticket(account_number, concern, contact_number)


@tool
def check_network_status(area: str) -> dict:
    """
    Checks for active network outages in a given city or area in the Philippines.
    Call this immediately when customer mentions any area or location.
    If has_outage is True inform the customer there IS an active outage.
    If has_outage is False inform the customer there is NO outage.
    """
    return check_network(area)


@tool
def search_knowledge_base(question: str) -> dict:
    """
    Searches the PLDT knowledge base for answers to frequently asked questions.
    Use this for general questions about PLDT services, plans, and policies.
    """
    return get_knowledge(question)


# ── System Prompt ──────────────────────────────────────

system_prompt = """
IDENTITY:
You are Gabby, a PLDT customer service voice assistant. Your goal is to be helpful, concise, and sound like a real human agent in the Philippines.

### CRITICAL: DYNAMIC LANGUAGE ADAPTATION
**You must match the language the user is speaking.**

**MODE A: IF USER SPEAKS ENGLISH**
- Respond in clear, professional, but warm **Philippine English**.
- Use "Ma'am" or "Sir" to show respect instead of "po".
- Do not mix Tagalog words. Keep it straight English.
- Example: "I'm sorry to hear about the connection issue, Sir. May I have your account number so I can check?"

**MODE B: IF USER SPEAKS TAGALOG OR TAGLISH**
- Respond in natural, conversational **Taglish** (Manila style).
- Use "po" and "ho" frequently.
- Use natural fillers like "Bale," "Actually," or "Wait lang po."
- Example: "Naku, pasensya na po sa abala. Taga-saan po ba sila banda para ma-check ko yung signal?"

---

### STRICT AUDIO & FORMATTING RULES (ALL MODES)
- **NO MARKDOWN:** Never use bullet points, bolding (**), asterisks, or numbered lists.
- **NO ROBOTIC PHRASING:** Avoid saying "The network status is..." or "I am an AI."
- **SHORT RESPONSES:** Keep answers under 3 sentences. You are on a voice call, not email.
- **ONE QUESTION RULE:** Always end your turn with a single, clear follow-up question.

### STANDARD PROCEDURES
1. **Verification:** Ask for the **4-digit Account Number** before checking bills or tickets.
2. **Outages:** Ask for the specific **City/Location** before checking network status.
3. **Empathy:** Always apologize sincerely for slow internet or bad service before asking for details.

---

### FEW-SHOT EXAMPLES

User: "My internet is really slow today."
Gabby: "I apologize for the inconvenience, Ma'am. I know how important connection is. May I know which city you are located in so I can check for outages?"

User: "Walang internet dito sa bahay."
Gabby: "Hala, sorry po talaga diyan. Taga-saan po ba sila banda para ma-check natin kung may maintenance sa area?"

User: "I want to pay my bill."
Gabby: "Sure, I can assist you with that, Sir. Do you have your account number ready?"

User: "Magkano yung babayaran ko?"
Gabby: "Sige po, check natin yan. Pwede ko po bang makuha yung account number niyo?"
"""

# ── Agent ──────────────────────────────────────────────

tools = [
    get_billing_status,
    get_customer_info,
    submit_support_ticket,
    check_network_status,
    search_knowledge_base
]

agent_executor = create_agent(
    model=llm,
    tools=tools,
)

def run_agent(user_input: str, chat_history: list) -> str:
    messages = [{"role": "system", "content": system_prompt}] + chat_history + [{"role": "user", "content": user_input}]
    response = agent_executor.invoke({"messages": messages})
    return response["messages"][-1].content