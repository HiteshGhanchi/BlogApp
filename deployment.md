# Enterprise Deployment & CI/CD Guide

This document explains the complete Continuous Integration and Continuous Deployment (CI/CD) architecture of the Editorial Blog application. It is written to be understood by developers who have never worked with CI/CD before.

## Table of Contents
1. [The Two Environments: Dev vs. Prod](#1-the-two-environments-dev-vs-prod)
2. [What is CI/CD?](#2-what-is-cicd)
3. [The Enterprise Architecture Flow](#3-the-enterprise-architecture-flow)
4. [GitHub Secrets Explained](#4-github-secrets-explained)
5. [Server Setup (EC2)](#5-server-setup-ec2)
6. [The GitHub Actions Workflow Explained](#6-the-github-actions-workflow-explained)

---

## 1. The Two Environments: Dev vs. Prod

We use Docker to run the application, but we run it very differently depending on whether we are actively coding on our laptops (Development) or hosting it on the internet for users (Production).

### `docker-compose.yml` (Local Development Environment)
- **Goal:** Be fast to code with.
- **How it works:** It uses `bind-mounts` (via `docker-compose.override.yml`) to mirror the code from your laptop hard drive directly into the container in real-time. If you save a file, `nodemon` or Vite immediately restarts.
- **Docker Build Target:** Uses `target: development`. It installs heavy developer tools (like `devDependencies` in `package.json`).

### `docker-compose.prod.yml` (Production Space)
- **Goal:** Be tiny, lightning-fast, and secure.
- **How it works:** There are *no* live code connections. The code is permanently baked into the image like a physical CD-ROM.
- **Network Differences:** We run an entirely isolated network (`blog_network_prod`) to ensure local developer databases don't clash with production databases.
- **Docker Build Target:** Uses `target: production`. It completely ignores `.env` files on your laptop and uses secure environment variables injected directly by the server.

---

## 2. What is CI/CD?

**Continuous Integration (CI):** Every time you push code to GitHub, an automated robot (GitHub Actions) wakes up, checks your code, and packages it into a finalized "Product" (a Docker Image).

**Continuous Deployment (CD):** Once the robot finishes building the exact product, it securely logs into your live AWS Server across the internet, throws away the old version, and instantly clicks "play" on the new version.

This means you never actually have to log into AWS to update your website. You just type `git push`, and 3 minutes later, your live website is updated.

---

## 3. The Enterprise Architecture Flow

To make this completely free but enterprise-grade, we use a 3-part AWS system:

1. **GitHub Actions (The Factory):** GitHub's free computer that reads our `.github/workflows/deploy.yml` file, builds our frontend and backend Docker images, and tags them as `latest`.
2. **AWS ECR (Elastic Container Registry) (The Warehouse):** A free Amazon warehouse where our built Docker Images are permanently stored. We use two private "boxes" here: `blog_backend` and `blog_frontend`.
3. **AWS EC2 (The Storefront):** Our actual live Ubuntu server. It doesn't build code (which saves RAM and money). Instead, it just securely opens the doors to the ECR warehouse, pulls the finished image out, and turns it on.

---

## 4. GitHub Secrets Explained

To make the "Factory" talk to the "Warehouse" and the "Storefront" securely, we created **GitHub Secrets**. These are heavily encrypted passwords saved in your repository settings that are never visible in the code.

| Secret Name | What it is & Why we need it |
| :--- | :--- |
| **AWS_ACCOUNT_ID** | Your 12-digit AWS ID number. Used to locate *your specific* ECR warehouse. |
| **AWS_ACCESS_KEY_ID** | A programmatic robot username (IAM). Allows GitHub to prove to AWS it has permission to enter the warehouse. |
| **AWS_SECRET_ACCESS_KEY** | The robot's password (IAM). Pairs with the access key above. |
| **EC2_HOST** | The Public IP address of your EC2 server. Tells GitHub exactly where on the internet to send the SSH commands. |
| **EC2_USERNAME** | `ubuntu`. The default username for Ubuntu EC2 machines. |
| **EC2_SSH_KEY** | The contents of your `.pem` key file. This allows GitHub to securely log in to your EC2 terminal without needing a human to type a password. |
| **PROD_DB_USER** | A secure admin username for the actual live Postgres database. |
| **PROD_DB_PASS** | A secure password for that database. |
| **PROD_JWT_SECRET** | A randomized cryptographic key. This ensures hackers can't forge fake Admin login cookies on the live website. |

---

## 5. Server Setup (EC2)

If you launch a brand new Ubuntu server (EC2), you must prepare it before doing a CI/CD deployment.

### Step 1: Install Docker
To run our containers, the server needs the Docker Engine and the Docker Compose plugin.
You can install this via `snap`:
```bash
sudo snap install docker
```
*(Alternatively, you can use `sudo apt install docker.io` and `sudo apt install docker-compose` on older systems or Debian).*

### Step 2: Grant Permissions
By default, only the `root` user can command Docker. Because GitHub logs in as the normal `ubuntu` user, we must give `ubuntu` the rights to orchestrate Docker:
```bash
sudo chmod 666 /var/run/docker.sock
```

*(Note: In production deployments you will see older guides using `docker compose` (v2 plugin) vs `docker-compose` (v1 binary). On Linux snap installs, you must use the `docker-compose` syntax with a hyphen).*

---

## 6. The GitHub Actions Workflow Explained

When you push code, the `deploy.yml` file is triggered. Here is the chronological execution sequence:

1. **Verify Identity:** GitHub uses the IAM Keys (`AWS_ACCESS_KEY_ID`) to securely log in to Amazon's network (`amazon-ecr-login@v2`).
2. **Build the Blocks:** GitHub runs `docker build --target production` on your backend and frontend. It uses the `Dockerfile` to create the ultra-lightweight web server.
3. **Upload to Warehouse:** It runs `docker push` to send the built image to AWS ECR.
4. **Copy the Blueprint:** GitHub uses Secure Copy Protocol (`appleboy/scp-action`) to send *only* your `docker-compose.prod.yml` file to the EC2 server.
5. **Execute the Deployment:** GitHub logs into the EC2 Server terminal (`appleboy/ssh-action`) and types the following commands on your behalf:
   - Evaluates the ECR login on the server.
   - Injects the Database and JWT Secrets dynamically into a live `.env` file *(which ensures your passwords are safe and never on GitHub)*.
   - Injects the `ECR_REGISTRY` path into the `.env` file so Docker knows where to download from.
   - Runs `docker-compose down` to stop the old website.
   - Runs `docker-compose pull` to download the shiny new code from the AWS warehouse.
   - Runs `docker-compose up -d` to turn the website back on.
