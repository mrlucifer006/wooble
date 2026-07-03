from fastapi import FastAPI, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
import datetime
import json
import os
import uuid
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="AuraHR API", description="Intelligent Workplace OS Backend")

# Allow all origins for easy linking (update in production)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─── JSON File Storage Utility ───────────────────────────────────────────────

DATA_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data")

def _ensure_data_dir():
    os.makedirs(DATA_DIR, exist_ok=True)

def read_json(filename: str) -> list:
    """Read a JSON array from a file in the data directory."""
    _ensure_data_dir()
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        return []
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            return json.load(f)
    except (json.JSONDecodeError, IOError):
        return []

def write_json(filename: str, data: list):
    """Write a JSON array to a file in the data directory (pretty-printed for git)."""
    _ensure_data_dir()
    filepath = os.path.join(DATA_DIR, filename)
    with open(filepath, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# ─── Pydantic Models ─────────────────────────────────────────────────────────

class EmployeeCreate(BaseModel):
    name: str
    role: str
    department: str = "General"
    email: str = ""
    leave_balance: int = 20

class LeaveRequestCreate(BaseModel):
    employee_id: str
    employee_name: str = "Jane Doe"
    leave_type: str = "Annual"
    start_date: str
    end_date: str
    reason: str

class LeaveAction(BaseModel):
    status: str  # "Approved" or "Rejected"

class AttendanceCreate(BaseModel):
    employee_id: str = "E123"
    employee_name: str = "Jane Doe"
    check_type: str = "check_in"

class PerformanceReviewCreate(BaseModel):
    employee_id: str = "E123"
    employee_name: str = "Jane Doe"
    reviewer_name: str = "Manager"
    rating: int  # 1-5
    feedback: str
    goals: str = ""
    quarter: str = ""

class HelpdeskQuery(BaseModel):
    query: str

# ─── Root ─────────────────────────────────────────────────────────────────────

@app.get("/")
def read_root():
    return {"message": "Welcome to AuraHR API", "version": "2.0.0"}

# ─── Visit Tracking ──────────────────────────────────────────────────────────

@app.post("/api/track_visit")
async def track_visit(request: Request):
    client_ip = request.client.host if request.client else "unknown"
    visit_data = {
        "id": str(uuid.uuid4())[:8],
        "timestamp": datetime.datetime.now().isoformat(),
        "client_ip": client_ip,
        "user_agent": request.headers.get("user-agent", "unknown")
    }
    visits = read_json("visits.json")
    visits.append(visit_data)
    write_json("visits.json", visits)
    return {"status": "logged"}

# ─── Employees ────────────────────────────────────────────────────────────────

@app.get("/api/employees")
def list_employees():
    return read_json("employees.json")

@app.get("/api/employees/{employee_id}")
def get_employee(employee_id: str):
    employees = read_json("employees.json")
    for emp in employees:
        if emp["id"] == employee_id:
            return emp
    raise HTTPException(status_code=404, detail="Employee not found")

@app.post("/api/employees")
def create_employee(employee: EmployeeCreate):
    employees = read_json("employees.json")
    new_emp = {
        "id": f"E{str(uuid.uuid4())[:6].upper()}",
        "name": employee.name,
        "role": employee.role,
        "department": employee.department,
        "email": employee.email,
        "leave_balance": employee.leave_balance,
        "joined_date": datetime.date.today().isoformat()
    }
    employees.append(new_emp)
    write_json("employees.json", employees)
    return {"status": "success", "data": new_emp}

# ─── Leave Management ────────────────────────────────────────────────────────

@app.get("/api/leaves")
def list_leaves():
    return read_json("leaves.json")

@app.post("/api/leaves")
def create_leave(leave: LeaveRequestCreate):
    leaves = read_json("leaves.json")
    new_leave = {
        "id": f"L{str(uuid.uuid4())[:6].upper()}",
        "employee_id": leave.employee_id,
        "employee_name": leave.employee_name,
        "leave_type": leave.leave_type,
        "start_date": leave.start_date,
        "end_date": leave.end_date,
        "reason": leave.reason,
        "status": "Pending",
        "submitted_at": datetime.datetime.now().isoformat()
    }
    leaves.append(new_leave)
    write_json("leaves.json", leaves)
    return {"status": "success", "message": "Leave request submitted successfully.", "data": new_leave}

@app.post("/api/leaves/{leave_id}/action")
def action_leave(leave_id: str, action: LeaveAction):
    leaves = read_json("leaves.json")
    for leave in leaves:
        if leave["id"] == leave_id:
            if action.status not in ("Approved", "Rejected"):
                raise HTTPException(status_code=400, detail="Status must be 'Approved' or 'Rejected'")
            leave["status"] = action.status
            leave["actioned_at"] = datetime.datetime.now().isoformat()
            write_json("leaves.json", leaves)
            return {"status": "success", "message": f"Leave {action.status.lower()}.", "data": leave}
    raise HTTPException(status_code=404, detail="Leave request not found")

# ─── Attendance ───────────────────────────────────────────────────────────────

@app.get("/api/attendance")
def list_attendance():
    return read_json("attendance.json")

@app.post("/api/attendance")
def record_attendance(attendance: AttendanceCreate):
    records = read_json("attendance.json")
    new_record = {
        "id": f"A{str(uuid.uuid4())[:6].upper()}",
        "employee_id": attendance.employee_id,
        "employee_name": attendance.employee_name,
        "check_type": attendance.check_type,
        "timestamp": datetime.datetime.now().isoformat(),
        "date": datetime.date.today().isoformat()
    }
    records.append(new_record)
    write_json("attendance.json", records)
    return {"status": "success", "message": "Attendance recorded.", "data": new_record}

# ─── Performance Reviews ─────────────────────────────────────────────────────

@app.get("/api/performance")
def list_performance():
    return read_json("performance.json")

@app.post("/api/performance")
def create_performance_review(review: PerformanceReviewCreate):
    reviews = read_json("performance.json")
    new_review = {
        "id": f"P{str(uuid.uuid4())[:6].upper()}",
        "employee_id": review.employee_id,
        "employee_name": review.employee_name,
        "reviewer_name": review.reviewer_name,
        "rating": review.rating,
        "feedback": review.feedback,
        "goals": review.goals,
        "quarter": review.quarter or f"Q{((datetime.date.today().month - 1) // 3) + 1} {datetime.date.today().year}",
        "submitted_at": datetime.datetime.now().isoformat()
    }
    reviews.append(new_review)
    write_json("performance.json", reviews)
    return {"status": "success", "message": "Performance review submitted.", "data": new_review}

# ─── AI Helpdesk ──────────────────────────────────────────────────────────────

@app.post("/api/helpdesk")
def ask_ai(body: HelpdeskQuery):
    # Log the query to JSON
    queries = read_json("helpdesk_queries.json")
    query_record = {
        "id": f"H{str(uuid.uuid4())[:6].upper()}",
        "query": body.query,
        "timestamp": datetime.datetime.now().isoformat()
    }

    # Mock AI response based on keywords
    query_lower = body.query.lower()
    if "leave" in query_lower or "vacation" in query_lower:
        response = "Our annual leave policy grants 20 days of paid leave per year. You can apply through the Leaves tab. Unused leaves can be carried forward up to 5 days."
    elif "salary" in query_lower or "pay" in query_lower:
        response = "Salary queries are handled by the Finance department. Your payslip is available on the 1st of every month via the HR portal."
    elif "remote" in query_lower or "work from home" in query_lower or "wfh" in query_lower:
        response = "Our hybrid work policy allows up to 2 days of remote work per week. Please coordinate with your manager for scheduling."
    elif "sick" in query_lower or "medical" in query_lower:
        response = "You are entitled to 10 days of sick leave per year. A medical certificate is required for absences exceeding 3 consecutive days."
    elif "onboarding" in query_lower or "new" in query_lower:
        response = "Welcome aboard! Please complete your onboarding checklist on the Dashboard. Contact IT for laptop and access setup."
    elif "performance" in query_lower or "review" in query_lower:
        response = "Performance reviews are conducted quarterly. Your manager will schedule a 1-on-1 meeting. You can track feedback in the Performance tab."
    else:
        response = f"Thank you for your question about '{body.query}'. I've noted this and will get back to you. For urgent matters, please contact hr@aurahr.com."

    query_record["response"] = response
    queries.append(query_record)
    write_json("helpdesk_queries.json", queries)

    return {
        "query": body.query,
        "response": response,
        "source": "AuraHR Policy Knowledge Base"
    }

# ─── Dashboard Stats ──────────────────────────────────────────────────────────

@app.get("/api/dashboard/stats")
def get_dashboard_stats():
    """Aggregate stats for the dashboard view."""
    employees = read_json("employees.json")
    leaves = read_json("leaves.json")
    attendance = read_json("attendance.json")
    reviews = read_json("performance.json")

    today = datetime.date.today().isoformat()
    today_checkins = [a for a in attendance if a.get("date") == today]
    pending_leaves = [l for l in leaves if l.get("status") == "Pending"]
    approved_leaves = [l for l in leaves if l.get("status") == "Approved"]

    # Get Jane's leave balance
    jane = next((e for e in employees if e["id"] == "E123"), None)
    leave_balance = jane["leave_balance"] if jane else 12

    return {
        "total_employees": len(employees),
        "today_checkins": len(today_checkins),
        "checked_in_today": len(today_checkins) > 0,
        "pending_leaves": len(pending_leaves),
        "approved_leaves": len(approved_leaves),
        "total_reviews": len(reviews),
        "leave_balance": leave_balance,
        "latest_review": reviews[-1] if reviews else None
    }

# Instructions for running:
# pip install fastapi uvicorn
# uvicorn main:app --reload
