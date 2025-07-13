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
