# PLDT Voice AI Agent - User Guide

## Overview

The PLDT Voice AI Agent ("Gabby") is an intelligent customer service assistant that can:
- Understand Filipino, English, and Taglish
- Help with billing inquiries
- Create support tickets
- Check network outages
- Answer frequently asked questions
- Communicate via voice or text

## Language Modes

Gabby automatically detects and matches your language:

### English Mode
**You:** "Hello, I need help with my bill"  
**Gabby:** "Good day, Sir! I'd be happy to help you with your bill. May I have your account number, please?"

### Filipino/Taglish Mode
**You:** "Kumusta, may problema yung internet ko"  
**Gabby:** "Naku, pasensya na po sa abala. Para ma-check ko po yung issue, paki-bigay po ng account number niyo?"

## Common Tasks

### 1. Check Your Bill

**Text:**
```
You: What's my current bill?
Gabby: I'd be happy to check your bill. May I have your account number please?
You: 123456
Gabby: [Shows billing information]
```

**Voice (Taglish):**
```
You: 🎤 "Magkano na po yung bill ko?"
Gabby: 🔊 "Paki-bigay po ng account number para ma-check ko"
You: 🎤 "123456"
Gabby: 🔊 [Reads bill information]
```

### 2. Report an Internet Issue

**Text:**
```
You: My internet is not working
Gabby: I'm sorry to hear that, Sir. Let me help you with that. 
       What symptoms are you experiencing?
You: The connection keeps dropping
Gabby: I understand. What area are you located in?
You: Quezon City
Gabby: [Checks for outages and creates ticket if needed]
```

**Voice (Filipino):**
```
You: 🎤 "Wala pong internet sa bahay"
Gabby: 🔊 "Naku, sorry po. Ano pong problema specifically?"
You: 🎤 "On and off yung connection"
Gabby: 🔊 "Saan po kayo banda?"
You: 🎤 "Quezon City"
Gabby: 🔊 [Checks outage and offers solutions]
```

### 3. Upgrade Your Plan

**Text:**
```
You: I want to upgrade my plan
Gabby: I can help you with that! What would you like to upgrade to?
       We have plans from 50Mbps to 1Gbps.
You: What's the 100Mbps plan?
Gabby: [Provides plan details from knowledge base]
```

### 4. Check Network Status

**Text:**
```
You: Is there an outage in Manila?
Gabby: Let me check that for you...
       [Shows outage status for Manila area]
```

**Voice:**
```
You: 🎤 "May problema ba sa signal sa Makati?"
Gabby: 🔊 "Check ko po... [Reads outage status]"
```

## Agent Capabilities

### Billing Operations
- View current balance
- Check payment history
- View bill breakdown
- Payment due dates

### Customer Information
- Account details
- Plan information
- Service address
- Contact information

### Support Tickets
- Create new tickets
- Report technical issues
- Request upgrades
- General concerns

### Network Status
- Real-time outage checking
- Coverage by area
- Maintenance schedules

### Knowledge Base
- PLDT plans and pricing
- Troubleshooting guides
- FAQs
- Service policies

## Tips for Best Results

### Voice Input

✅ **DO:**
- Speak clearly at normal pace
- Use natural language (Filipino, English, or mix)
- Speak in short sentences
- Wait for response before continuing

❌ **DON'T:**
- Rush or speak too quickly
- Mumble or whisper
- Have background noise
- Interrupt during playback

### Text Input

✅ **DO:**
- Be specific about your issue
- Provide account number when asked
- Ask one question at a time
- Give clear location for outages

❌ **DON'T:**
- Send very long messages
- Mix multiple unrelated topics
- Use excessive abbreviations

## Example Conversations

### Scenario 1: Frustrated Customer

**You:** "This is ridiculous! My internet has been down for 3 days!"

**Gabby:** "I sincerely apologize for the inconvenience, Sir. I understand how frustrating that must be. Let me prioritize this and get you help immediately. May I have your account number so I can escalate this?"

*[Gabby detects urgency and frustration - auto-escalates ticket]*

### Scenario 2: Mixed Language

**You:** "Hello, pwede ba malaman yung due date ng bill?"

**Gabby:** "Good day po! Oo naman, check natin yung due date. Paki-bigay lang po ng account number."

*[Gabby matches your Taglish style]*

### Scenario 3: General Inquiry

**You:** "What are your fiber plans?"

**Gabby:** "We have several fiber plans available:
- 50Mbps - ₱1,699/month
- 100Mbps - ₱2,099/month
- 200Mbps - ₱2,899/month
- 500Mbps - ₱3,699/month

Would you like more details about any specific plan?"

### Scenario 4: Outage Check

**You:** 🎤 "Bakit walang signal sa Pasig ngayon?"

**Gabby:** 🔊 "Check ko po... Based sa records namin, meron po kaming scheduled maintenance sa Pasig area from 2am to 5am. Eto na po yung expected restoration time."

## Voice Commands

Quick phrases to try:

### English
- "Check my bill"
- "Report an outage"
- "I need technical support"
- "What are your plans?"

### Filipino
- "Magkano yung bill ko?"
- "May problema yung internet"
- "Gusto ko mag-upgrade"
- "Saan yung bayad?"

### Taglish
- "Failed yung payment ko"
- "Upgrade to 100Mbps"
- "May outage ba sa area namin?"
- "Disconnect na yung service"

## Troubleshooting

### Voice Not Recognized

**Problem:** Gabby doesn't understand your voice input

**Solutions:**
1. Check microphone is working
2. Reduce background noise
3. Speak more clearly
4. Try text input instead
5. Check browser permissions

### Wrong Information

**Problem:** Gabby gives incorrect details

**Tip:** Provide more context
- Include account number early
- Specify exact location for outages
- Clarify which service (internet/phone)

### Response Too Slow

**Problem:** Takes long to respond

**Reasons:**
- First request loads AI model (10-15 seconds)
- Subsequent requests are faster (2-5 seconds)
- Voice responses include TTS generation

## Privacy & Security

### What Gabby Knows
- Your conversation history (current session only)
- Information you provide (account numbers, location)
- N8N data sources (billing, customer info)

### What Gabby Doesn't Know
- Your personal information (unless you provide it)
- Other customers' data
- Information outside PLDT systems

### Data Storage
- Conversations stored in SQLite database
- Audio files deleted after playback
- Session data cleared on browser close

### Security Features
- Asks for account number before showing sensitive data
- No authentication bypass
- All data stays within system
- No external sharing

## Advanced Features

### Multi-Turn Conversations

Gabby remembers context:
```
You: "What's my bill?"
Gabby: "May I have your account number?"
You: "123456"
Gabby: [Shows bill]
You: "When is it due?"
Gabby: [Remembers account, provides due date]
```

### Sentiment Detection

Gabby adjusts to your mood:
- **Frustrated** → Apologetic, escalates
- **Confused** → Explains more clearly
- **Urgent** → Fast-tracks ticket
- **Casual** → Friendly tone

### Smart Routing

Gabby picks the right tool:
- Billing questions → Billing Agent
- Network issues → Network Status
- General info → Knowledge Base
- Can't solve → Human escalation

## Getting Help

If Gabby can't help:
1. Ask for human agent: "I need to speak to a person"
2. Use text if voice isn't working
3. Check system status: http://localhost:8000/credits
4. View logs for errors

## Feedback

Help us improve Gabby:
- Report misunderstandings
- Suggest new features
- Share conversation examples
- Rate responses (if implemented)

---

**Pro Tip:** Gabby works best when you:
1. State your issue clearly
2. Provide requested information promptly
3. One topic per conversation
4. Use natural language (no need to be formal!)

**Ready to chat?** Visit http://localhost:3000 🎉
