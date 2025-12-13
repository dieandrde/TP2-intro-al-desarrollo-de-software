start-db:
	cd ./Backend && docker compose up -d
run-backend:
	cd ./Backend && npm run dev