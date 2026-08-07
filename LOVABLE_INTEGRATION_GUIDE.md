# Lovable AI + Supabase Edge Functions Integration Guide

This guide details step-by-step how to connect **Lovable AI** to your **HirePth** project using **Supabase Deno Edge Functions**.

---

## 🏗️ Architecture Overview

```
 ┌────────────────────────┐      ┌─────────────────────────┐      ┌─────────────────────────────┐
 │  HirePth Frontend UI  │ ──── │   FastAPI Backend API   │ ──── │  Supabase Edge Functions    │
 │ (WhatsApp / AI Agent)  │      │ (app/services/lovable)  │      │     (Deno Runtime)          │
 └────────────────────────┘      └─────────────────────────┘      └──────────────┬──────────────┘
                                                                                 │
                                                                                 ▼
                                                                      ┌─────────────────────┐
                                                                      │   Lovable AI Agent  │
                                                                      └─────────────────────┘
```

1. **WhatsApp & Frontend Agent** messages arrive at the FastAPI backend.
2. FastAPI dispatches requests to the **Supabase Edge Function** (`lovable-whatsapp-agent`).
3. The **Deno runtime** executes the Edge Function and passes context to **Lovable AI**.
4. Responses (replies, intents, candidate evaluations) stream back to HirePth.

---

## ⚙️ Step 1: Configure Environment Variables

Add the following keys to your `backend/.env` file:

```env
# Supabase Configuration
SUPABASE_URL="https://<your-project-ref>.supabase.co"
SUPABASE_ANON_KEY="your-supabase-anon-key"
SUPABASE_SERVICE_ROLE_KEY="your-supabase-service-role-key"

# Lovable AI Configuration
LOVABLE_API_KEY="your-lovable-api-key-here"
LOVABLE_EDGE_FUNCTION_NAME="lovable-whatsapp-agent"
```

---

## 🚀 Step 2: Deploy the Supabase Deno Edge Function

The Deno Edge Function code is located in:
`supabase/functions/lovable-whatsapp-agent/index.ts`

### Prerequisites:
Install the Supabase CLI:
```bash
brew install supabase/tap/supabase
```

### 1. Login & Link Your Supabase Project:
```bash
supabase login
supabase link --project-ref <your-project-ref>
```

### 2. Set Lovable Secrets on Supabase:
```bash
supabase secrets set LOVABLE_API_KEY="your-lovable-api-key-here"
supabase secrets set OPENROUTER_API_KEY="your-openrouter-key"
```

### 3. Deploy the Edge Function:
```bash
supabase functions deploy lovable-whatsapp-agent
```

Your Edge Function will be live at:
`https://<your-project-ref>.supabase.co/functions/v1/lovable-whatsapp-agent`

---

## 🔄 Step 3: Triggering Lovable AI from HirePth

### 1. WhatsApp Inbound Messages
In `backend/app/services/lovable_agent.py`, the backend calls:
```python
from app.services.lovable_agent import lovable_ai_service

# Process inbound WhatsApp message through Lovable AI
result = await lovable_ai_service.process_whatsapp_message(
    phone="94771234567",
    message_text="I want to apply for React developer job",
    candidate_name="Kasun Perera",
    language="en"
)
```

### 2. Frontend AI Agent Drawer
The `/api/v1/ai/lovable-chat` endpoint routes queries from the web dashboard directly to Lovable AI:
```bash
curl -X POST "http://localhost:8000/api/v1/ai/lovable-chat" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Evaluate Kasun Perera for Senior React Developer position"
  }'
```

---

## 🧪 Step 4: Verification & Testing

Run unit tests to verify the integration:
```bash
cd backend
python3 -m pytest tests/test_whatsapp_agent.py
```

### Expected Response:
```json
{
  "status": "success",
  "reply": "✨ Lovable AI Agent (Supabase Deno Edge) ✨\n\nHello Kasun Perera!...",
  "intent": "LOVABLE_PROCESSED",
  "auto_replied": true,
  "engine": "Lovable AI (Supabase Deno Edge)"
}
```

---

## 📂 Key File Locations

- **Deno Edge Function**: [`supabase/functions/lovable-whatsapp-agent/index.ts`](file:///Users/yasiru/Desktop/Business/HirePth/supabase/functions/lovable-whatsapp-agent/index.ts)
- **Backend Lovable Connector**: [`backend/app/services/lovable_agent.py`](file:///Users/yasiru/Desktop/Business/HirePth/backend/app/services/lovable_agent.py)
- **Lovable API Endpoint**: [`backend/app/api/v1/ai.py`](file:///Users/yasiru/Desktop/Business/HirePth/backend/app/api/v1/ai.py#L95)
- **Config Settings**: [`backend/app/core/config.py`](file:///Users/yasiru/Desktop/Business/HirePth/backend/app/core/config.py#L53)
