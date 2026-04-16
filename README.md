# The Editorial Curator: Simple Blog App

A 100% containerized, high-performance blog application built with Node.js, React, PostgreSQL, and Redis. This project follows the "Deep Forest" editorial aesthetic and prioritizes cloud resilience.

## Quick Start for Developers

You only need **Docker** installed to run this entire project.

1.  **Clone the project.**
2.  **Ensure you have a `.env` file** in the `backend/` directory (see `backend/.env` for a template).
3.  **Launch the stack:**
    ```bash
    docker-compose up --build
    ```
4.  **Access the App:**
    *   Frontend: [http://localhost:5173](http://localhost:5173)
    *   Backend API: [http://localhost:3000](http://localhost:3000)
    *   Admin Login: [http://localhost:5173/login](http://localhost:5173/login)
    *   **Credentials:** `admin` / `password123`

## Production Architecture: Enterprise vs. MVPs

When taking a containerized application to production, there are two wildly different approaches depending on scale and budget:

### 1. The Enterprise Way (Cloud Native Managed Services)
In a massive enterprise application, we **never** run everything inside Docker on a single EC2 machine.
*   **Frontend (React/Vite):** A React frontend compiles down to static HTML, CSS, and JS files. It wastes server CPU to serve these files from a Node.js or Nginx container. Instead, we compile the app and upload the static files to an **AWS S3 Bucket**, fronted by a CDN like **AWS CloudFront**. The user downloads the frontend directly, completely bypassing the backend server.
*   **Database (PostgreSQL):** Putting a stateful database in a killable, stateless Docker container is incredibly dangerous. If the EC2 instance goes down or the Docker Volume's underlying Elastic Block Store (EBS) is corrupted, you lose user data. Instead, we use a managed service like **AWS RDS** (Relational Database Service). AWS provisions a dedicated VM customized specifically for databases with automated backups, and our backend container simply connects via a URL.
*   **Cache (Redis):** If traffic spikes, a backend container might compete with an in-memory Redis container for the EC2 server's RAM. If the Linux OS runs out of RAM, the "OOM (Out of Memory) Killer" will crash your entire app. Instead, we use **AWS ElastiCache** to give Redis its own dedicated, highly-available machine with massive RAM, cleanly isolated from our backend.

### 2. The Startup & MVP Way (`docker-compose.prod.yml`)
If enterprise companies split everything up (S3, RDS, ElastiCache), why do we even provide a `docker-compose.prod.yml` to run the Frontend, Backend, Postgres, and Redis together?
*   **Bootstrapped Startups:** If you have low traffic and a tight budget, you can't afford RDS ($30/mo) + ElastiCache ($15/mo) + EC2 + S3. Instead, you rent a single $5-$10 EC2 machine and pack everything onto it using `docker-compose`. It’s cheap, incredibly easy to deploy, and handles early-stage traffic perfectly.
*   **Internal Tooling:** An internal dashboard (like Grafana or Metabase) used by 5 employees won't "go viral" and doesn't need Auto Scaling. An all-in-one docker-compose deployment to an internal EC2 box is ideal here.
*   **Self-Hosted Software:** When hosting personal apps (like Bitwarden, Ghost, or Wireguard), creators provide an all-in-one `docker-compose.yml` to run locally or on a single machine just for you.

## Architecture Features

*   **Docker-Only Workflow:** No local dependencies required. The development environment uses bind-mounts for real-time hot-reloading.
*   **Cache-Aside Pattern:** Redis caches the global post list and individual entries. Cache is automatically invalidated upon new post creation or deletion.
*   **Graceful Degradation:** The system remains online even if Redis or PostgreSQL containers fail.
*   **Multi-Stage Builds:** Optimized Dockerfiles for both local development (hot-reload) and production (Nginx / minimal alpine).

## Tech Stack
- **Frontend:** React + Vite
- **Backend:** Node.js + Express
- **Database:** PostgreSQL 15
- **Cache:** Redis 7
- **Style:** Vanilla CSS (The "No-Line" Rule)

## Useful Docker Commands

*   **Start everything:** `docker-compose up`
*   **Rebuild images:** `docker-compose up --build`
*   **Stop services:** `docker-compose down`
*   **View logs:** `docker-compose logs -f`
*   **Stop a specific service (Resilience Test):** `docker-compose stop redis`
