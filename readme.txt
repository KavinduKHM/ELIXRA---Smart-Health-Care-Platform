ELIXRA — Smart Health Care Platform
Deployment / Run Steps (Local)

This repository contains:
- React frontend (Create React App)
- Multiple backend services (Spring Boot)
- Docker Compose setup for running the backend + MySQL dependencies


1) Prerequisites
----------------
- Docker Desktop (with Docker Compose)
- Node.js + npm (recommended: Node 18+)
- (Optional, only if running services without Docker): JDK 17+ and Maven


2) Configure environment variables (recommended)
------------------------------------------------
Docker Compose references the following environment variables (see docker/docker-compose.yml):
- Telemedicine:
  - AGORA_APP_ID
  - AGORA_APP_CERTIFICATE
  - AGORA_TOKEN_EXPIRATION (optional; defaults to 7200)
- Patient service uploads:
  - CLOUDINARY_CLOUD_NAME
  - CLOUDINARY_API_KEY
  - CLOUDINARY_API_SECRET
- AI symptom checker:
  - GEMINI_API_KEY
- Payments:
  - STRIPE_SECRET_KEY
- Notifications:
  - SPRING_MAIL_USERNAME (optional; default is set)
  - SPRING_MAIL_PASSWORD

On Windows (PowerShell), you can set them for the current terminal session like:
  $env:AGORA_APP_ID="..."
  $env:AGORA_APP_CERTIFICATE="..."
  $env:GEMINI_API_KEY="..."
  ...

If you don’t have the 3rd-party credentials yet, some features may not work, but core flows can still be tested.


3) Start backend services via Docker Compose (recommended)
---------------------------------------------------------
From the repo root:

  cd docker
  docker-compose up -d --build

This starts:
- Service Discovery (Eureka): http://localhost:8761
- patient-service:           http://localhost:8082
- doctor-service:            http://localhost:8083
- appointment-service:       http://localhost:8084
- telemedicine-service:      http://localhost:8085
- ai-symptom-checker:        http://localhost:8086
- payment-service:           http://localhost:8087
- notification-service:      http://localhost:3002
- MySQL instances for each service on host ports 3307–3312 (see docker/docker-compose.yml)

To verify quickly:
- Open Eureka: http://localhost:8761
- Check service health endpoints (examples):
  - http://localhost:8085/actuator/health
  - http://localhost:8084/actuator/health

To stop everything:
  cd docker
  docker-compose down


4) Start the frontend
---------------------
From the repo root:

  cd frontend
  npm install
  npm start

Frontend runs at:
  http://localhost:3000

Notes:
- The frontend is wired to these backend ports:
  - patient-service      8082
  - doctor-service       8083
  - appointment-service  8084
  - telemedicine-service 8085
  - ai-symptom-checker   8086


5) Telemedicine / Video consultation flow
-----------------------------------------
- Doctor starts a video call from the Doctor UI.
- The doctor action activates the telemedicine session and broadcasts a WebSocket event.
- Patient “Join Video Session” stays disabled until the session is started by the doctor.
- When the doctor starts, the patient receives an in-page critical alert.

Browser requirements:
- Allow camera and microphone permissions.


6) Optional: build artifacts
----------------------------
Frontend production build:
  cd frontend
  npm run build

Backend JAR build (example for telemedicine service):
  cd services/telemedicine_service
  mvn clean package -DskipTests


7) Kubernetes (optional)
------------------------
A kubernetes/ folder exists, but in this workspace snapshot some YAML files appear empty.
If your YAMLs are populated, typical apply order is:

  kubectl apply -f kubernetes/namespace.yaml
  kubectl apply -f kubernetes/configmaps/
  kubectl apply -f kubernetes/secrets/
  kubectl apply -f kubernetes/deployments/
  kubectl apply -f kubernetes/services/
  kubectl apply -f kubernetes/ingress.yaml
  kubectl apply -f kubernetes/hpa.yaml


Troubleshooting
---------------
- If frontend fails to start/build:
  - Delete and reinstall dependencies:
    cd frontend
    rmdir /s /q node_modules
    del package-lock.json
    npm install
    npm start

- If Docker services fail:
  - Rebuild:
    cd docker
    docker-compose up -d --build
  - Check logs:
    docker logs telemedicine-service
    docker logs appointment-service

