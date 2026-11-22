# CAIPO Core (The Brain)

This is the central intelligence layer of CAIPO. Responsible for all runtime logic including workflows, memory AI orchestration, context generation, and system lifecycle.

## Purpose
- Central Decision Making
- Context Management
- AI Model Orchestration
- "The Ghost in the Shell"

## Status
Under Development.

## How to run the backend (terminal)

From the `flobrain-core` directory:

1. **Create and activate a virtual environment** (first time only)
   python -m venv .venv
   source .venv/bin/activate   # On Windows: .venv\Scripts\activate


2. **Install dependencies** (first time or after changing requirements.txt)
   pip install -r requirements.txt


3. **Start the development server**
   python manage.py runserver 8001

   The API will be available at [http://localhost:8001](http://localhost:8001).



## Changes
- Backend Django project setup and structure
- Auth APIs (sign in, register, sign out)
- Quick start guide for running backend and database services
- Database and API integration for frontend (flobrain-website) connection
