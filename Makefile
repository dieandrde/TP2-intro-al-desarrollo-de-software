deps:
	npm install
start-db:
	cd ./Backend && docker compose up -d
start-Backend:
	npm run dev

start-front:
	cd ./Frontend && npx http-server

stop-db:
	cd ./Backend && docker stop backend-postgres-1

