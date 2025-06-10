# backend/utils.py

import csv
from io import StringIO
from collections import defaultdict
import os
import json

# Basic description to category mapping
CATEGORY_MAP = {
    # Utilities
    'electricity': 'utilities',
    'water': 'utilities',
    'gas': 'utilities',
    'internet': 'utilities',
    'power': 'utilities',
    'utility': 'utilities',
    'sewer': 'utilities',
    'garbage': 'utilities',

    # Transport
    'uber': 'transport',
    'taxi': 'transport',
    'bus': 'transport',
    'train': 'transport',
    'flight': 'transport',
    'airline': 'transport',
    'fuel': 'transport',
    'petrol': 'transport',
    'diesel': 'transport',
    'parking': 'transport',
    'toll': 'transport',

    # Telecom
    'airtel': 'telecom',
    'safaricom': 'telecom',
    'vodafone': 'telecom',
    'mtn': 'telecom',
    'telkom': 'telecom',
    'verizon': 'telecom',
    'at&t': 'telecom',
    't-mobile': 'telecom',
    'data': 'telecom',
    'mobile': 'telecom',

    # Food & Groceries
    'pizza': 'food',
    'groceries': 'food',
    'supermarket': 'food',
    'restaurant': 'food',
    'coffee': 'food',
    'cafe': 'food',
    'bar': 'food',
    'kfc': 'food',
    'mcdonald': 'food',
    'burger': 'food',
    'food': 'food',
    'dining': 'food',
    'snack': 'food',

    # Entertainment
    'movie': 'entertainment',
    'cinema': 'entertainment',
    'netflix': 'entertainment',
    'spotify': 'entertainment',
    'showmax': 'entertainment',
    'hulu': 'entertainment',
    'theatre': 'entertainment',
    'concert': 'entertainment',
    'game': 'entertainment',
    'event': 'entertainment',

    # Shopping
    'amazon': 'shopping',
    'walmart': 'shopping',
    'jumia': 'shopping',
    'mall': 'shopping',
    'shop': 'shopping',
    'store': 'shopping',
    'boutique': 'shopping',
    'clothes': 'shopping',
    'shoes': 'shopping',
    'fashion': 'shopping',
    'electronics': 'shopping',

    # Income
    'salary': 'income',
    'refund': 'income',
    'bonus': 'income',
    'interest': 'income',
    'dividend': 'income',
    'deposit': 'income',
    'transfer in': 'income',
    'income': 'income',
    'payment received': 'income',

    # Health & Medical
    'hospital': 'health',
    'clinic': 'health',
    'pharmacy': 'health',
    'doctor': 'health',
    'dentist': 'health',
    'medicine': 'health',
    'medical': 'health',
    'insurance': 'health',

    # Education
    'school': 'education',
    'university': 'education',
    'college': 'education',
    'tuition': 'education',
    'course': 'education',
    'exam': 'education',
    'book': 'education',

    # Housing & Rent
    'rent': 'housing',
    'mortgage': 'housing',
    'apartment': 'housing',
    'house': 'housing',
    'lease': 'housing',
    'maintenance': 'housing',

    # Family & Kids
    'child': 'family',
    'kids': 'family',
    'baby': 'family',
    'school fees': 'family',
    'daycare': 'family',

    # Travel
    'hotel': 'travel',
    'airbnb': 'travel',
    'booking.com': 'travel',
    'expedia': 'travel',
    'trip': 'travel',
    'travel': 'travel',
    'visa': 'travel',

    # Miscellaneous
    'gift': 'misc',
    'donation': 'misc',
    'charity': 'misc',
    'subscription': 'misc',
    'fee': 'misc',
    'charge': 'misc',
    'other': 'other',
    # Add more as necessary
}

def categorize(description: str) -> str:
    description = description.lower()
    for key, category in CATEGORY_MAP.items():
        if key in description:
            return category
    return 'other'

def parse_csv_and_analyze(csv_content: str):
    f = StringIO(csv_content)
    reader = csv.DictReader(f)
    transactions = []
    category_totals = defaultdict(float)
    max_expense = {"amount": 0.0, "category": "", "month": ""}

    for row in reader:
        try:
            amount = float(row.get("Amount", 0))
            if amount <= 0:
                continue  # Skip zero or negative amounts
            description = row.get("Description", "")
            date = row.get("Date", "")
            category = categorize(description)
            month = date[:7]  # YYYY-MM for monthly grouping

            category_totals[category] += amount
            if amount > max_expense["amount"]:
                max_expense = {"amount": amount, "category": category, "month": month}

            transactions.append({
                "date": date,
                "description": description,
                "amount": amount,
                "category": category
            })
        except Exception:
            continue  # Ignore malformed rows

    return {
        "transactions": transactions,
        "summary": dict(category_totals),
        "maxExpense": max_expense
    }

def load_expenses():
    path = os.path.join(os.path.dirname(__file__), "../data/expenses.json")
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def load_todos():
    path = os.path.join(os.path.dirname(__file__), "../data/todo.json")
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

def load_jobs():
    path = os.path.join(os.path.dirname(__file__), "../data/jobs.json")
    if not os.path.exists(path):
        return []
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)
