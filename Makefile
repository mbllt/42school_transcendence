build:
	docker-compose up --build

down:
	docker-compose down

clear: down
	docker volume rm $(shell docker volume ls -q)

rebuild: clear build

prune:
	docker system prune -a
	docker volume prune

purge: clear prune