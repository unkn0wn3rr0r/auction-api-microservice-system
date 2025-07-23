# Auction API microservice system

A RESTful auction house microservice API system built with **Node.js**, **TypeScript**, **NestJS** and **MongoDB**.

---

# Features:

### Auction Item Management API:
- Create a new auction item
- List items with pagination
- Get single item details
- Search items by text
- CSV import functionality (via a dedicated API endpoint)

### User Authentication API:
- Register new users
- Login with credentials
- Validate JWT tokens

### Other:
- MongoDB native driver (no ORMs)
- `/monitor` health check endpoint
- Dockerized and Kubernetes-ready
- Unit testing with Jest

---

# Setup Instructions:

### 1. Clone the repo and install dependencies:

```bash
cd ./auction-api
npm install

cd ./auth-api
npm install
```

### 2. Running Locally (with Docker Compose):

From the project root folder - ./auction-api-microservice-system run:
```bash
docker-compose up --build
```

If you want to clear existing data:
```bash
docker-compose down -v && docker-compose up --build
```

### 3.❗Running on Kubernetes - Currently not working - broke it when I added the auth-api - WIP:❗

Prerequisites:
- [Docker](https://www.docker.com/)
- [Minikube](https://minikube.sigs.k8s.io/docs/)
- [kubectl](https://kubernetes.io/docs/tasks/tools/)

Steps:

### Start Minikube
```bash
minikube start
```

### Deploy Kubernetes manifests
```bash
kubectl apply -f k8s/
```

### Get external service URL
```bash
minikube service auction-api --url
```

Then test for example the monitor endpoint by visiting:
### Example: http://127.0.0.1:56789/monitor

### 4. Running Tests:

```bash
cd ./auction-api
npm test

cd ./auth-api
npm test
```

---

# API Examples:

## auth-api

### POST - register a user - you should first call this route to register a user and then call the /login route to get a token with which you can then be able to call the /import/csv route
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "pass123"
  }'
```

### POST - login with the registered user and get an access token
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "pass123"
  }'
```

### POST - use the token from the /login route to check if it's valid
```bash
curl -X POST http://localhost:3001/auth/validate \
  -H "Content-Type: application/json" \
  -d '{
    "token": "<YOUR-JWT-TOKEN>"
  }'
```

---

## auction-api

### POST - Create new item
```bash
curl -X POST http://localhost:3000/items \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Mona Lisa",
    "description": "19th century oil painting",
    "category": "Art",
    "estimated_value": 25000,
    "status": "upcoming"
  }'
```

### POST - Import CSV data - use a jwt created from the auth-api examples
```bash
curl -X POST http://localhost:3000/import/csv \
  -H "Authorization: Bearer YOUR-JWT-TOKEN" \
  -H "Content-Type: application/json"
```

### GET - Get item details by ID - use mongo object id string as ID
```bash
curl "http://localhost:3000/items/6873c5f005b0a564af54d12d"
```

### GET - Get items with pagination
```bash
curl "http://localhost:3000/items?limit=1&skip=0"
```

### GET - Search items
```bash
curl "http://localhost:3000/items/search?q=italian"
```

### GET - Check if db is healthy - useful for k8s
```bash
curl "http://localhost:3000/monitor"
```
