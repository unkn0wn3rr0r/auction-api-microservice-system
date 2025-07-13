# Barnebys Backend Developer Coding Test

A RESTful auction house API system built with **Node.js**, **TypeScript**, **NestJS** and **MongoDB**.

---

## Features:

- Create a new auction item
- List items with pagination
- Get single item details
- Search items by text
- CSV import functionality - another API endpoint
- MongoDB native driver (no ORMs) as a database
- `/monitor` health check endpoint
- Dockerized and Kubernetes-ready
- Unit testing with Jest

---

## Setup Instructions:

### 1. Clone the repo and install dependencies:

```bash
cd ./auction-api
npm install
```

### 2. Running Locally (with Docker Compose):

From the project root:
```bash
docker-compose up --build
```

If you want to clear existing data:
```bash
docker-compose down -v && docker-compose up --build
```

### 3. Running on Kubernetes:

Prerequisites:
- [Docker](https://www.docker.com/)
- [Minikube](https://minikube.sigs.k8s.io/docs/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)

Steps:

```bash
# Start Minikube
minikube start

# Deploy Kubernetes manifests
kubectl apply -f k8s/

# Get external service URL
minikube service auction-api --url
```

Then test for example the monitor endpoint by visiting:
```bash
# Example: http://127.0.0.1:56789/monitor
http://<minikube-url>/<api-endpoint>
```

### 4. Running Tests:

```bash
npm test
```

---

### API Examples:

```bash
# POST - Create new item

curl -X POST http://localhost:3000/items/new \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mona Lisa",
    "description": "19th century oil painting",
    "category": "Art",
    "estimated_value": 25000,
    "status": "upcoming"
  }'
```

```bash
# POST - Import CSV data

curl -X POST http://localhost:3000/import/csv
```

```bash
# GET - Get item by ID - use mongo object id string as ID

curl "http://localhost:3000/items/6873c5f005b0a564af54d12d"
```

```bash
# GET - Get items with pagination

curl "http://localhost:3000/items?limit=1&skip=0"
```

```bash
# GET - Search items

curl "http://localhost:3000/items/search?q=italian"
```

```bash
# GET - Check if db is healthy - useful for k8s

curl "http://localhost:3000/monitor"
```

---

### Brief Note on what you'd improve with more time:

1. Better import of the CSV data - through mongo on application startup, terminal command or something else.
2. Usage of Data Transfer Objects (DTOs).
3. There is very basic validation and error handling - it could be greatly improved.
4. Probably a better application structure and reorganisation of the project - folders, files, etc.
5. At the current state of the project I don't really see a place for middlewares, interceptors or guards, but if the project grows and the business requirements get more complicated we can definitely utilize them - these would be valuable for future features like authentication, rate limiting and many others.
