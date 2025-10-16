# backend.py
# Flask backend for Mental Health Trends Dashboard
# Provides REST API endpoints for time-series emotion data, topic modeling, and social graph.
# Replace mock data generation with real model predictions or database queries.

from flask import Flask, jsonify, request
from datetime import datetime, timedelta
import random
import math

app = Flask(__name__)

@app.route('/')
def index():
    return {"status": "Mental Health Backend API Running"}

@app.route('/api/dashboard')
def get_dashboard():
    # Parameters: from, to, platform
    start_date = request.args.get('from', (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d'))
    end_date = request.args.get('to', datetime.now().strftime('%Y-%m-%d'))
    platform = request.args.get('platform', 'twitter')

    start = datetime.strptime(start_date, '%Y-%m-%d')
    end = datetime.strptime(end_date, '%Y-%m-%d')
    days = (end - start).days + 1

    # Generate mock time-series data
    time_series = []
    for i in range(days):
        d = start + timedelta(days=i)
        base = round(200 + 40 * math.sin(i / 6) + random.random() * 60)
        anxiety = max(0, (math.sin(i / 7 + 0.5) + random.random() * 0.6) / 2)
        sadness = max(0, (math.cos(i / 8) + random.random() * 0.6) / 2)
        joy = max(0, (math.cos(i / 5 + 1) + random.random() * 0.6) / 2)
        time_series.append({"date": d.strftime('%Y-%m-%d'), "count": base, "anxiety": anxiety, "sadness": sadness, "joy": joy})

    topics = [
        {"topic": "exam stress", "changePct": 0.22, "mentions": 420},
        {"topic": "job market anxiety", "changePct": 0.12, "mentions": 320},
        {"topic": "sleep issues", "changePct": 0.08, "mentions": 210},
        {"topic": "financial pressure", "changePct": 0.05, "mentions": 150},
    ]

    emotions = [
        {"name": "sadness", "value": 0.38},
        {"name": "anger", "value": 0.12},
        {"name": "fear", "value": 0.18},
        {"name": "joy", "value": 0.10},
        {"name": "neutral", "value": 0.22},
    ]

    # Mock graph data
    nodes = []
    links = []
    for i in range(40):
        nodes.append({"id": f"user_{i}", "degree": random.randint(1, 10), "sentiment": (random.random() - 0.5) * 1.6})
    for i in range(80):
        a, b = random.sample(nodes, 2)
        links.append({"source": a['id'], "target": b['id'], "value": random.random()})

    return jsonify({
        "timeSeries": time_series,
        "topics": topics,
        "emotions": emotions,
        "graph": {"nodes": nodes, "links": links},
        "meta": {"from": start_date, "to": end_date, "platform": platform}
    })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)
