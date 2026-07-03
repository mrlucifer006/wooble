from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
import datetime

app = FastAPI(title="AuraHR API", description="Intelligent Workplace OS Backend")

class LeaveRequest(BaseModel):
    employee_id: str
    start_date: str
    end_date: str
    reason: str

class EmployeeResponse(BaseModel):
    id: str
    name: str
    role: str
    leave_balance: int

@app.get("/")
def read_root():
    return {"message": "Welcome to AuraHR API"}

@app.get("/api/employee/{employee_id}", response_model=EmployeeResponse)
def get_employee(employee_id: str):
    # Mock database lookup
    if employee_id == "E123":
        return {
            "id": "E123",
            "name": "Jane Doe",
            "role": "Product Designer",
            "leave_balance": 12
        }
    raise HTTPException(status_code=404, detail="Employee not found")

@app.post("/api/leaves")
def request_leave(leave: LeaveRequest):
    # Mock leave processing logic
    return {"status": "success", "message": "Leave request submitted successfully.", "data": leave}

@app.post("/api/helpdesk")
def ask_ai(query: str):
    # Mock Ollama / Llama 3 integration
    return {
        "query": query,
        "response": "I am connected to the local AI service. (Mock LLM Response)",
        "source": "Company Policy Handbook"
    }

# Instructions for running:
# pip install fastapi uvicorn
# uvicorn main:app --reload
