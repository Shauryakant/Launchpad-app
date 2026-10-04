# 🚀 Launchpad

Launchpad is a modern, Vercel-like deployment platform designed to seamlessly clone, build, and deploy GitHub repositories in a highly scalable and decoupled architecture.

[![Launchpad: Instant Global Deployments](https://repoclip.io/api/badge/8e1bdf84-10a1-4846-b8f7-ef682e6d00a2)](https://repoclip.io/v/8e1bdf84-10a1-4846-b8f7-ef682e6d00a2)

<img width="9075" height="5370" alt="diagram" src="https://github.com/user-attachments/assets/abfa2f7d-50e7-4823-8ffa-ddc911f573ec" />

[![Architecture diagram of shauryakant/launchpad-app](https://gitdiagram.com/shauryakant/launchpad-app/diagram.png)](https://gitdiagram.com/shauryakant/launchpad-app?utm_source=readme&utm_medium=picture)
## 🏗 Architecture & Services

The platform is split into four distinct microservices, utilizing a message queue and object storage to ensure high performance and scalability.

### 1. `frontend-deployer` (React + Vite)
- **Role**: The user-facing web application.
- **Functionality**: Provides a premium, clean UI where users can paste a GitHub repository URL. It sends a deployment request to the backend and continuously polls for the real-time status (Initializing -> Uploading -> Deploying -> Deployed). Once deployed, it displays the live URL.

### 2. `uploader-service` (Express.js API)
- **Role**: The API Gateway and Initial Processing node.
- **Functionality**: 
  - Receives the GitHub URL via the `/deploy` endpoint.
  - Generates a unique project ID.
  - Clones the repository locally using `simple-git`.
  - Uploads the raw source code files to Object Storage (like AWS S3).
  - Pushes the project ID to a **Redis `build-queue`**.
  - Updates the deployment status in Redis to `uploaded`.

### 3. `Deployer-service` (Worker Node)
- **Role**: The Build Engine.
- **Functionality**: 
  - Continuously polls the **Redis `build-queue`** for new jobs.
  - Downloads the raw source code from Object Storage.
  - Executes the build process (e.g., `npm install` and `npm run build`).
  - Uploads the final compiled static assets (`dist`/`build`) back to Object Storage.
  - Updates the deployment status in Redis to `deployed`.

### 4. `request handle service` (Proxy/Routing Server)
- **Role**: The Edge Server / CDN.
- **Functionality**: 
  - Listens for incoming HTTP requests on a specific port (e.g., 3001).
  - Extracts the project ID from the subdomain (e.g., `http://[id].localhost:3001`).
  - Dynamically fetches the correct built assets (`index.html`, `.js`, `.css`) from Object Storage and serves them directly to the user's browser.

## 🛠 Tech Stack

- **Frontend**: React, Vite, Axios, Custom CSS (Light Mode / Glassmorphism)
- **Backend**: Node.js, Express.js
- **Database / Cache**: Redis (Upstash) for status tracking and Job Queues (`lpush`/`rpop`)
- **Storage**: Object Storage (AWS S3, Cloudflare R2, or local storage abstraction)
- **Tools**: `simple-git` for cloning, `cors`

## 🔄 Deployment Flow

1. **User** submits a GitHub URL on the Frontend.
2. **Frontend** POSTs to **Uploader Service**.
3. **Uploader** clones repo, uploads raw files to Storage, adds job to **Redis Queue**.
4. **Deployer** pulls job from Queue, builds the app, uploads `dist` to Storage, marks as `deployed`.
5. **Frontend** detects `deployed` status via polling and shows the Live URL.
6. **User** clicks the URL, hits the **Request Handle Service**, which fetches and serves the built site from Storage.
