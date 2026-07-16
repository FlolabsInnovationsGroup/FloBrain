# FloBrain Cloud (FastAPI)
# Targets:
#   development  -> uvicorn with --reload (used by docker-compose.yml)
#   production   -> uvicorn without reload (used by docker-compose.demo.yml)

FROM python:3.11-slim AS base

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

RUN apt-get update \
    && apt-get install -y --no-install-recommends build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt /app/
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

COPY . /app/

EXPOSE 8001


FROM base AS development
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001", "--reload"]


FROM base AS production
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8001"]
