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
