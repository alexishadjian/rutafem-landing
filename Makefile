# Variables
COMPOSE_FILE_DEV=compose.yml
COMPOSE_FILE_PROD=compose.prod.yml


# Commandes
install: ## Install dependencies
	docker compose run frontend bash -c 'npm install' && docker compose down --remove-orphans


# Start containers
up-dev: ## Run containers
	docker compose -f $(COMPOSE_FILE_DEV) up --build

up-dev-d: ## Run containers
	docker compose -f $(COMPOSE_FILE_DEV) up --build -d


up-prod: ## Run containers
	docker compose -f $(COMPOSE_FILE_PROD) up --build

up-prod-d: ## Run containers
	docker compose -f $(COMPOSE_FILE_PROD) up --build -d


# Show logs
logs:
	docker compose -f $(COMPOSE_FILE_DEV) logs -f

logs-prod:
	docker compose -f $(COMPOSE_FILE_PROD) logs -f


# Stop containers
down-dev: ##  Down and remove a running container
	docker compose -f $(COMPOSE_FILE_DEV) down --remove-orphans

down-prod: ##  Down and remove a running container
	docker compose -f $(COMPOSE_FILE_PROD) down --remove-orphans