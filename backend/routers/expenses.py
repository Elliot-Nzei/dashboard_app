from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from backend.utils import parse_csv_and_analyze, load_expenses
import os, json
from collections import defaultdict, Counter
from datetime import datetime

router = APIRouter(prefix="/api/expenses", tags=["expenses"])

EXPENSES_FILE = "data/expenses.json"

def save_expenses(data):
    os.makedirs(os.path.dirname(EXPENSES_FILE), exist_ok=True)
    with open(EXPENSES_FILE, "w") as f:
        json.dump(data, f, indent=2)

@router.post("/upload")
async def upload_expenses(csvFile: UploadFile = File(...)):
    if not csvFile.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are accepted.")
    content = await csvFile.read()
    try:
        result = parse_csv_and_analyze(content.decode('utf-8'))
        # Optionally save transactions if your utility returns them
        if "transactions" in result:
            save_expenses(result["transactions"])
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error processing file: {str(e)}")
    return result

@router.get("/summary")
async def get_summary():
    txns = load_expenses()
    if not txns:
        raise HTTPException(status_code=404, detail="No expense data found")
    # If your utility provides a summary function, use it here
    from backend.utils import calculate_summary
    summary = calculate_summary(txns)
    return summary

@router.get("/transactions")
async def get_transactions(category: str = Query(None), month: str = Query(None)):
    txns = load_expenses()
    if category:
        txns = [t for t in txns if t["category"] == category.lower()]
    if month:
        txns = [t for t in txns if t["date"].startswith(month)]
    return {"transactions": txns}

@router.get("/insights")
async def get_insights():
    txns = load_expenses()
    if not txns:
        return {}

    # Saved per month (income - expenses)
    monthly_income = defaultdict(float)
    monthly_expenses = defaultdict(float)
    for t in txns:
        month = t["date"][:7]
        if t["category"] == "income":
            monthly_income[month] += t["amount"]
        else:
            monthly_expenses[month] += t["amount"]
    saved_per_month = {m: monthly_income[m] - monthly_expenses[m] for m in monthly_income.keys() | monthly_expenses.keys()}

    # Top categories (total spent)
    category_totals = defaultdict(float)
    for t in txns:
        if t["category"] != "income":
            category_totals[t["category"]] += t["amount"]
    top_categories = dict(sorted(category_totals.items(), key=lambda x: x[1], reverse=True)[:5])

    # Monthly trends
    months = sorted(set(t["date"][:7] for t in txns))
    monthly_trends = {
        "months": months,
        "expenses": [monthly_expenses[m] for m in months],
        "income": [monthly_income[m] for m in months]
    }

    # Recurring expenses (same description, 3+ months)
    desc_months = defaultdict(set)
    desc_amounts = defaultdict(list)
    for t in txns:
        if t["category"] != "income":
            desc_months[t["description"]].add(t["date"][:7])
            desc_amounts[t["description"]].append(t["amount"])
    recurring = [
        {"description": desc, "amount": sum(desc_amounts[desc]) / len(desc_amounts[desc])}
        for desc, months_set in desc_months.items() if len(months_set) >= 3
    ]

    # Top merchants/descriptions
    desc_counter = Counter()
    desc_total = defaultdict(float)
    for t in txns:
        if t["category"] != "income":
            desc_counter[t["description"]] += 1
            desc_total[t["description"]] += t["amount"]
    top_merchants = [
        {"description": desc, "count": desc_counter[desc], "total": desc_total[desc]}
        for desc in desc_counter.most_common(5)
    ]

    # Monthly totals for budget widget
    monthly_totals = dict(monthly_expenses)

    return {
        "savedPerMonth": saved_per_month,
        "topCategories": top_categories,
        "monthlyTrends": monthly_trends,
        "recurring": recurring,
        "topMerchants": top_merchants,
        "monthlyTotals": monthly_totals,
        "budget": None  # Placeholder, handled client-side
    }

@router.get("/monthly_total")
async def get_monthly_total():
    txns = load_expenses()
    if not txns:
        return {"month": "", "total": 0}
    now = datetime.now()
    month_str = now.strftime("%Y-%m")
    total = sum(
        t["amount"] for t in txns
        if t.get("category") != "income" and t.get("date", "").startswith(month_str)
    )
    return {"month": month_str, "total": total}
