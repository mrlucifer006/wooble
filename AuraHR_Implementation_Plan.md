# AuraHR: Intelligent Workplace OS
## Project Implementation & Architecture Plan

### 1. Problem Statement
The modern HR ecosystem is highly fragmented. Employees and HR teams struggle with siloed platforms for **leave management, onboarding, attendance tracking, and performance workflows**. This fragmentation leads to:
* Inefficient onboarding experiences that delay employee productivity.
* Communication gaps and slow HR helpdesk response times.
* Manual attendance and leave tracking errors.
* Disjointed performance evaluations lacking continuous data.

**AuraHR** consolidates these workflows into a unified, AI-driven platform, ensuring a frictionless employee experience from day one.

---

### 2. Solution Architecture & Workflow

#### Technical Stack
* **Backend Framework:** FastAPI (Python) for high-performance, asynchronous API routing.
* **Database & Auth:** Supabase (PostgreSQL) for relational data, row-level security, and authentication.
* **AI Engine (HR Helpdesk):** Local LLM integration using Ollama running Llama 3 to process employee queries instantly and securely without exposing sensitive HR data to external APIs.
* **Deployment & Hosting:** Backend and API services deployed on Render.
* **Development Environment:** GitHub Codespaces for seamless team collaboration and standardized environments.

#### Core Workflows
1.  **AI Onboarding:** Upon creation of a user in Supabase, an automated workflow provisions accounts and triggers the LLM to generate a personalized onboarding checklist.
2.  **Attendance & Leave:** Geofenced or IP-based check-ins log directly to the Supabase database. Leave requests are evaluated against employee balances and routed to managers via standard FastAPI endpoints.
3.  **AI Helpdesk:** Employee queries (e.g., "What is the maternity leave policy?") are embedded and queried against the company policy document store using the local Llama 3 model, providing instant, accurate answers.
4.  **Performance Tracking:** Continuous feedback is logged in the database, visualized in the dashboard, and summarized by the AI at the end of the review cycle.

---

### 3. UI/UX Design System (Professional Grade)
To ensure a high-fidelity, professional user experience, the system adheres to the following design language:

* **Color Palette:**
    * **Primary Accent:** Electric Indigo (`#4F46E5`) - Used for primary actions, active states, and AI highlights.
    * **Background:** Slate White (`#F8FAFC`) - Reduces eye strain for continuous dashboard use.
    * **Surface / Cards:** Clean White (`#FFFFFF`) with subtle shadow (`0 4px 6px -1px rgb(0 0 0 / 0.1)`).
    * **Success/Status:** Emerald Green (`#10B981`) for approved leaves and active attendance.
    * **Text/Typography:** Deep Slate (`#0F172A`) for primary headers, (`#64748B`) for secondary text.
* **Typography:** Inter or Roboto (Sans-serif) for clean, highly legible data presentation.
* **Layout:** Sidebar navigation for quick access to Modules (Dashboard, Leaves, Helpdesk, Performance). Data is presented in modular, widget-based cards.

---

### 4. Project Rationale & Impact

#### Why this problem matters
HR inefficiencies cost organizations thousands of hours annually. A confusing onboarding process increases 90-day turnover rates, while slow helpdesk responses frustrate employees. 

#### How the solution works
By centralizing data in Supabase and placing an intelligent AI layer (Ollama/Llama 3) on top of the communication and helpdesk modules, routine tasks are fully automated. FastAPI ensures the system remains highly responsive even under heavy concurrent load during peak check-in times.

#### Expected Business Impact
* **70% reduction** in routine HR ticket volume via the AI Helpdesk.
* **Accelerated Onboarding:** Reducing time-to-productivity for new hires by centralizing their resources.
* **Zero-Friction Tracking:** Automated, error-free attendance and leave accrual.

---

### 5. Deliverables Checklist & Evaluation Mapping
* [x] **Problem Understanding:** Addressed in Section 1.
* [x] **Innovation & AI Integration:** Leveraged local Llama 3 via Ollama for privacy-centric HR automation.
* [x] **Practicality & Scalability:** Supabase + Render provides an enterprise-ready, scalable infrastructure.
* [x] **User Experience:** Defined in the UI/UX Design System section.
