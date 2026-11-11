# 1. Use an official lightweight Python image
FROM python:3.11-slim

# 2. Set environment variables to prevent python from writing .pyc files
# and to buffer stdout/stderr (logs appear immediately)
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# 3. Set the working directory inside the container
WORKDIR /app

# 4. Copy requirements and install dependencies
COPY requirements.txt /app/
RUN pip install --upgrade pip && pip install -r requirements.txt

RUN apt-get update && apt-get install -y postgresql-client

# 5. Copy the rest of your project code
COPY . /app/

# 6. Command to run the server (listening on all interfaces)
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]