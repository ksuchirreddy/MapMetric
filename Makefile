.PHONY: install up down logs test cov lint format migrate run sample-data clean

install:
	pip install -r requirements-dev.txt

up:
	docker compose up --build

down:
	docker compose down

logs:
	docker compose logs -f api

test:
	pytest

cov:
	pytest --cov=app --cov-report=term-missing

lint:
	ruff check .
	ruff format --check .

format:
	ruff check --fix .
	ruff format .

migrate:
	alembic upgrade head

run:
	uvicorn app.main:create_app --factory --reload

sample-data:
	python scripts/generate_sample_data.py

clean:
	find . -type d -name __pycache__ -prune -exec rm -rf {} +
	rm -rf .pytest_cache .ruff_cache .coverage htmlcov
