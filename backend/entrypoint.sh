#!/bin/sh
set -e

python -m app.sql.db_manager create
python -m app.sql.db_manager seed

exec uvicorn app.main:app --host 0.0.0.0 --port 8000