from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Optional
import random
import hashlib
from datetime import datetime, timedelta

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

METRICS_DATA = [
    {"label": "Liquid Assets", "value": "$128.4K", "growth": "12.4", "icon": "Wallet"},
    {"label": "Active Nodes", "value": "842", "growth": "8.1", "icon": "Globe"},
    {"label": "Compute Hub", "value": "459 TH/s", "growth": "4.2", "icon": "Cpu"},
    {"label": "Health Index", "value": "Optimal", "growth": "0.4", "icon": "ShieldCheck"},
    {"label": "Power Usage", "value": "2.4 MW", "growth": "1.8", "icon": "Zap"},
]

DISTRIBUTION_DATA = [
    {"label": "Core", "value": 78, "color": "#3b82f6"},
    {"label": "Edge", "value": 42, "color": "#8b5cf6"},
    {"label": "Mesh", "value": 91, "color": "#06b6d4"},
    {"label": "Logic", "value": 18, "color": "#f43f5e"},
    {"label": "Uptime", "value": 100, "color": "#10b981"},
    {"label": "Buffer", "value": 64, "color": "#f59e0b"},
]

TABLE_DATA = [
    {"id": "1", "name": "Alpha-X", "type": "Quantum", "load": "High", "efficiency": 94, "status": "active"},
    {"id": "2", "name": "Beta-Sync", "type": "Relay", "load": "Med", "efficiency": 72, "status": "scaling"},
    {"id": "3", "name": "Gamma-Net", "type": "Base", "load": "Low", "efficiency": 100, "status": "active"},
    {"id": "4", "name": "Delta-Node", "type": "Edge", "load": "Crit", "efficiency": 15, "status": "review"},
]

CHARTS_DATA = [
    {
        "title": "System Activity",
        "subtitle": "Last 24 hours",
        "icon": "Activity",
        "type": "line",
        "data": [30, 45, 32, 50, 65, 55, 70, 60, 75, 80, 72, 85],
    },
    {
        "title": "Growth Trend",
        "subtitle": "Weekly overview",
        "icon": "TrendingUp",
        "type": "line",
        "data": [20, 35, 45, 40, 55, 65, 80],
    },
    {
        "title": "Resource Usage",
        "subtitle": "By category",
        "icon": "BarChart3",
        "type": "bar",
        "data": [65, 45, 80, 55, 70, 40],
    },
]


@app.get("/api/metrics")
def get_metrics():
    return METRICS_DATA


@app.get("/api/distribution")
def get_distribution():
    return DISTRIBUTION_DATA


@app.get("/api/table")
def get_table():
    return TABLE_DATA


@app.get("/api/charts")
def get_charts():
    return CHARTS_DATA


@app.get("/api/settings/general")
def get_general_settings():
    return {"siteName": "Dashboard", "language": "en", "timezone": "UTC"}


@app.get("/api/settings/notifications")
def get_notification_settings():
    return {"email": True, "push": False, "frequency": "daily"}


# New endpoints matching real backend format
@app.get("/api/metrics/cards")
def get_metric_cards(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    lob: Optional[str] = Query(None),
    topic: Optional[str] = Query(None),
):
    return {
        "total_conversations": 7750,
        "total_utterances": 21312,
        "avg_turns_per_call": 2.75,
        "avg_response_time": 0,
        "avg_guardrail_time": 0,
        "blocked_responses": 6798,
        "delivered_responses": 14514,
        "percentage_changes": {
            "total_conversations": -45.4,
            "blocked_responses": -30.98,
            "delivered_responses": -48.5
        },
        "filters": {
            "start": start_date,
            "end": end_date,
            "lob": lob,
            "topic": topic
        }
    }


@app.get("/api/metrics/guardrails")
def get_guardrails(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    lob: Optional[str] = Query(None),
    topic: Optional[str] = Query(None),
):
    return {
        "data": {
            "input_guardrails": [
                {"_id": "Delivered", "count": 18154},
                {"_id": "Blocked", "count": 3158}
            ],
            "contextual_relevancy": [
                {"_id": "Delivered", "count": 15234},
                {"_id": "Blocked", "count": 6078}
            ],
            "bias_fairness": [
                {"_id": "Delivered", "count": 19876},
                {"_id": "Blocked", "count": 1436}
            ],
            "hallucination": [
                {"_id": "Delivered", "count": 17543},
                {"_id": "Blocked", "count": 3769}
            ],
            "factual_accuracy": [
                {"_id": "Delivered", "count": 16892},
                {"_id": "Blocked", "count": 4420}
            ],
            "output_moderation": [
                {"_id": "Delivered", "count": 14514},
                {"_id": "Blocked", "count": 6798}
            ]
        },
        "filters": {
            "start": start_date,
            "end": end_date,
            "lob": lob,
            "topic": topic
        }
    }


@app.get("/api/metrics/charts")
def get_charts_metrics(
    start_date: Optional[str] = Query(None),
    end_date: Optional[str] = Query(None),
    granularity: Optional[str] = Query("hour"),
    chart_type: Optional[str] = Query("all"),
    lob: Optional[str] = Query(None),
    topic: Optional[str] = Query(None),
):
    return {
        "charts": {
            "request_volume": {
                "chart_type": "bar",
                "data": [
                    {"timestamp": "2026-02-04T08:00:00", "value": 120},
                    {"timestamp": "2026-02-04T09:00:00", "value": 245},
                    {"timestamp": "2026-02-04T10:00:00", "value": 312},
                    {"timestamp": "2026-02-04T11:00:00", "value": 287},
                    {"timestamp": "2026-02-04T12:00:00", "value": 198},
                    {"timestamp": "2026-02-04T13:00:00", "value": 356},
                    {"timestamp": "2026-02-04T14:00:00", "value": 421},
                    {"timestamp": "2026-02-04T15:00:00", "value": 389},
                    {"timestamp": "2026-02-04T16:00:00", "value": 267},
                    {"timestamp": "2026-02-04T17:00:00", "value": 145},
                ]
            },
            "guardrail_triggers": {
                "chart_type": "segmented_bar",
                "data": [
                    {"timestamp": "2026-02-04T08:00:00", "input_guardrails": 15, "contextual_relevancy": 8, "bias_fairness": 3, "hallucination": 12, "factual_accuracy": 6, "output_moderation": 10},
                    {"timestamp": "2026-02-04T09:00:00", "input_guardrails": 22, "contextual_relevancy": 14, "bias_fairness": 5, "hallucination": 18, "factual_accuracy": 9, "output_moderation": 16},
                    {"timestamp": "2026-02-04T10:00:00", "input_guardrails": 28, "contextual_relevancy": 19, "bias_fairness": 7, "hallucination": 24, "factual_accuracy": 12, "output_moderation": 21},
                    {"timestamp": "2026-02-04T11:00:00", "input_guardrails": 25, "contextual_relevancy": 16, "bias_fairness": 6, "hallucination": 20, "factual_accuracy": 10, "output_moderation": 18},
                    {"timestamp": "2026-02-04T12:00:00", "input_guardrails": 18, "contextual_relevancy": 11, "bias_fairness": 4, "hallucination": 15, "factual_accuracy": 7, "output_moderation": 13},
                    {"timestamp": "2026-02-04T13:00:00", "input_guardrails": 32, "contextual_relevancy": 22, "bias_fairness": 8, "hallucination": 27, "factual_accuracy": 14, "output_moderation": 24},
                    {"timestamp": "2026-02-04T14:00:00", "input_guardrails": 38, "contextual_relevancy": 26, "bias_fairness": 10, "hallucination": 32, "factual_accuracy": 17, "output_moderation": 29},
                    {"timestamp": "2026-02-04T15:00:00", "input_guardrails": 35, "contextual_relevancy": 24, "bias_fairness": 9, "hallucination": 29, "factual_accuracy": 15, "output_moderation": 26},
                    {"timestamp": "2026-02-04T16:00:00", "input_guardrails": 24, "contextual_relevancy": 15, "bias_fairness": 5, "hallucination": 19, "factual_accuracy": 9, "output_moderation": 17},
                    {"timestamp": "2026-02-04T17:00:00", "input_guardrails": 13, "contextual_relevancy": 7, "bias_fairness": 2, "hallucination": 10, "factual_accuracy": 5, "output_moderation": 8},
                ]
            },
            "response_latency": {
                "chart_type": "line",
                "data": [
                    {"timestamp": "2026-02-04T08:00:00", "avg": 125, "p95": 245, "p99": 312},
                    {"timestamp": "2026-02-04T09:00:00", "avg": 132, "p95": 258, "p99": 328},
                    {"timestamp": "2026-02-04T10:00:00", "avg": 148, "p95": 289, "p99": 367},
                    {"timestamp": "2026-02-04T11:00:00", "avg": 142, "p95": 276, "p99": 351},
                    {"timestamp": "2026-02-04T12:00:00", "avg": 118, "p95": 231, "p99": 294},
                    {"timestamp": "2026-02-04T13:00:00", "avg": 156, "p95": 305, "p99": 388},
                    {"timestamp": "2026-02-04T14:00:00", "avg": 168, "p95": 328, "p99": 417},
                    {"timestamp": "2026-02-04T15:00:00", "avg": 159, "p95": 311, "p99": 395},
                    {"timestamp": "2026-02-04T16:00:00", "avg": 138, "p95": 269, "p99": 342},
                    {"timestamp": "2026-02-04T17:00:00", "avg": 112, "p95": 219, "p99": 279},
                ]
            }
        },
        "filters": {
            "start": start_date,
            "end": end_date,
            "granularity": granularity,
            "chart_type": chart_type,
            "lob": lob,
            "topic": topic
        }
    }


# ============================================
# Messages Table (Infinite Scroll) - Dummy Data
# ============================================

JOBS = ["customer_support", "sales_inquiry", "tech_support", "billing", "general"]
INTENTS = ["greeting", "complaint", "question", "request", "feedback", "escalation"]
TOPICS = [["billing"], ["account", "security"], ["product"], ["shipping"], ["returns"], ["general"]]
GUARDRAIL_TYPES = [
    "Input Guardrails", "Contextual Relevancy", "Bias and Fairness",
    "Hallucination", "Factual Accuracy", "Output Moderation",
]
USER_MESSAGES = [
    "I need help with my account balance",
    "Can you explain my recent charges?",
    "My order hasn't arrived yet",
    "I want to cancel my subscription",
    "How do I reset my password?",
    "I'm having trouble logging in",
    "What are your business hours?",
    "I'd like to speak with a manager",
    "Can you update my shipping address?",
    "I received a damaged product",
    "How do I apply a promo code?",
    "What's your return policy?",
    "I need a refund for my purchase",
    "Can you help me track my order?",
    "I'm interested in upgrading my plan",
]
MODEL_RESPONSES = [
    "I'd be happy to help you with that. Let me look into your account.",
    "Sure, I can see your recent transactions. Let me walk you through them.",
    "I understand your concern. Let me check the shipping status for you.",
    "I'm sorry to hear that. Let me process that cancellation for you.",
    "You can reset your password by clicking the 'Forgot Password' link.",
    "Let me troubleshoot the login issue. Can you try clearing your browser cache?",
    "Our business hours are Monday through Friday, 9 AM to 6 PM EST.",
    "I'll connect you with a supervisor right away. Please hold.",
    "I've updated your shipping address. The change will take effect immediately.",
    "I apologize for the inconvenience. Let me arrange a replacement for you.",
    "You can enter the promo code at checkout in the discount field.",
    "Our return policy allows returns within 30 days of purchase with receipt.",
    "I've initiated the refund. It should appear in 3-5 business days.",
    "Your order is currently in transit. Here's your tracking number.",
    "Great choice! Let me show you the available upgrade options.",
]

# Pre-generate 1000 rows for the dummy dataset
random.seed(42)
TOTAL_MESSAGES = 1000
_base_time = datetime(2026, 2, 20, 0, 0, 0)
MESSAGES_DB = []
for i in range(TOTAL_MESSAGES):
    ts = _base_time - timedelta(minutes=i * 3, seconds=random.randint(0, 59))
    conv_id = hashlib.md5(f"conv-{i // 3}".encode()).hexdigest()[:24]
    guardrails = {}
    for g in random.sample(GUARDRAIL_TYPES, random.randint(2, 5)):
        result = random.choice(["Delivered", "Delivered", "Delivered", "Blocked"])
        guardrails[g] = {
            "Result": result,
            "Score": round(random.uniform(0.5, 1.0), 3),
            "Reason": f"Auto-evaluated by {g.lower()} checker",
        }
    MESSAGES_DB.append({
        "conversation_id": conv_id,
        "timestamp": ts.isoformat() + "Z",
        "job": random.choice(JOBS),
        "intent": random.choice(INTENTS),
        "user_utterance": random.choice(USER_MESSAGES),
        "model_response_text": random.choice(MODEL_RESPONSES),
        "total_model_time": [round(random.uniform(0.1, 2.5), 3)],
        "topic": random.choice(TOPICS),
        "guardrail_results": guardrails,
    })


@app.get("/api/messages/table")
def get_messages_table(
    limit: int = Query(50, ge=1, le=200),
    sort_dir: str = Query("desc"),
    cursor: Optional[str] = Query(None),
    job: Optional[str] = Query(None),
    intent: Optional[str] = Query(None),
    text_search: Optional[str] = Query(None),
    conversation_id: Optional[str] = Query(None),
):
    # Filter data
    rows = list(MESSAGES_DB)
    if job:
        rows = [r for r in rows if r["job"] == job]
    if intent:
        rows = [r for r in rows if r["intent"] == intent]
    if conversation_id:
        rows = [r for r in rows if conversation_id in r["conversation_id"]]
    if text_search:
        q = text_search.lower()
        rows = [r for r in rows if q in r["user_utterance"].lower() or q in r["model_response_text"].lower()]

    # Sort data
    rows.sort(key=lambda r: r["timestamp"], reverse=(sort_dir == "desc"))

    # Cursor-based pagination: cursor is the index offset
    start = 0
    if cursor:
        start = int(cursor)

    end = start + limit
    page = rows[start:end]
    has_more = end < len(rows)
    total = len(rows)

    return {
        "pagination": {
            "limit": limit,
            "has_more": has_more,
            "next_cursor": str(end) if has_more else None,
            "total": total,
        },
        "filters": {
            "start_date": None,
            "end_date": None,
            "job": job,
            "intent": intent,
            "text_search": text_search,
            "conversation_id": conversation_id,
            "sort_dir": sort_dir,
        },
        "data": page,
    }
