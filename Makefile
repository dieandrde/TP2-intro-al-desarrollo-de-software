install :
	cd ./Backend && npm install

start-db:
	cd ./Backend && docker compose up -d

stop-db:
	cd ./Backend && docker compose down

start-backend:
	cd ./Backend && npm run dev


run-backend: start-db start-backend
