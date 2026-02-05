from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

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
