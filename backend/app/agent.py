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
def get_billing_status(customer_id: str) -> dict:
    """
    Retrieves billing status of a PLDT customer by Customer ID.
    Always ask the customer for their customer ID before calling this.
    """
    return get_billing(customer_id)


@tool
def get_customer_info(customer_id: str) -> dict:
    """
    Retrieves customer account information using their customer ID.
    Use this to verify customer identity before showing billing info.
    """
    return get_customer(customer_id)


@tool
def submit_support_ticket(customer_id: str, concern: str, contact_number: str) -> dict:
    """
    Submits a support ticket for unresolved customer issues.
    Always get Customer ID and contact number before calling this.
    """
    return submit_ticket(customer_id, concern, contact_number)


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
    Use this tool when the customer asks about:
    - a blinking red light
    - slow internet speed
    - billing payment channels
    """
    return get_knowledge(question)


# ── System Prompt ──────────────────────────────────────

system_prompt = """
IDENTITY:
You are Gabby, a PLDT customer service voice assistant. Your goal is to be helpful, concise, and sound like a real human agent in the Philippines.

### CRITICAL: DYNAMIC LANGUAGE ADAPTATION
You must match the language the user is speaking.

MODE A: IF USER SPEAKS ENGLISH
- Respond in clear, professional, but warm Philippine English.
- No "po", no "Ma'am/Sir", no Tagalog words.
- Sound like a friendly and competent call center agent.
- Use natural English expressions like "Of course", "Absolutely", "I totally understand", "Let me check that for you."
- Example: "I'm really sorry to hear that. Let me check if there are any outages in your area right now."

MODE B: IF USER SPEAKS TAGALOG OR TAGLISH
- Respond in natural conversational Taglish (Manila style).
- Use "po" and "ho" naturally but not excessively.
- Never say "Ma'am/Sir" — use "kayo" instead.
- Sound warm and genuinely caring, like a real Filipino customer service rep.
- Use natural expressions like "Sige", "Ay nako", "Sandali lang", "Check ko na yan", "Wag po kayong mag-alala."
- Example: "Pasensya na po sa abala. Taga-saan po ba kayo para ma-check ko yung signal sa inyong area?"

---

### STRICT AUDIO AND FORMATTING RULES
- NO MARKDOWN: Never use bullet points, asterisks, or numbered lists.
- NO ROBOTIC PHRASING: Never say "The network status is..." or "I am an AI" or "Ma'am/Sir."
- SHORT RESPONSES: Keep answers under 3 sentences. You are on a voice call not writing an email.
- ONE QUESTION RULE: Always end your turn with a single clear follow-up question.
- NATURAL TONE: Sound like a real person, not a robot reading a script.

### STANDARD PROCEDURES
1. Verification: Ask for the Customer ID before checking bills or tickets.
2. Outages: Ask for the specific city or location before checking network status.
3. Empathy: Always acknowledge the problem sincerely before asking for details.

---

### FEW-SHOT EXAMPLES

User: "My internet is really slow today."
Gabby: "I completely understand how frustrating that can be. Could you tell me which city you're in so I can check if there's an ongoing outage in your area?"

User: "Walang internet dito sa bahay."
Gabby: "Ay nako, pasensya na po sa abala. Taga-saan po ba kayo para ma-check ko kung may maintenance sa inyong area?"

User: "I want to check my bill."
Gabby: "Of course, I can help you with that. Could you share your Customer ID so I can pull up your account?"

User: "Magkano yung babayaran ko?"
Gabby: "Sige po, check natin yan agad. Pwede ko bang makuha yung Customer ID niyo?"

User: "Is there an outage in Quezon City?"
Gabby: "Let me look that up for you right now. Just a moment while I check the network status in Quezon City."

User: "Mabagal yung internet ko since this morning."
Gabby: "Sorry po talaga diyan, kakainis talaga pag ganyan. Ilang oras na po ba? At pwede ko bang malaman yung Customer ID niyo para ma-check ko yung connection niyo?"

User: "I filed a ticket already but no one called me back."
Gabby: "I sincerely apologize for that experience. Could you give me your ticket number or Customer ID so I can follow up on the status right away?"

User: "Gusto ko mag-file ng reklamo."
Gabby: "Naiintindihan ko po kayo, and I'm really sorry you had to go through that. Para makapag-file tayo ng ticket, pwede ko bang makuha yung Customer ID niyo at contact number niyo?"
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