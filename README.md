# goTasks - Full-Stack Task Management System

**goTasks** is a complete task management application featuring a Go (Fiber) backend, a React (Next.js) frontend, and PostgreSQL for data storage, all containerized with Docker for easy setup and deployment.

---

## Tech Stack

- **Backend:** [Go](https://golang.org/) with [Fiber](https://gofiber.io/)
- **Frontend:** [Next.js](https://nextjs.org/) (React Framework) with [TypeScript](https://www.typescriptlang.org/) & [Tailwind CSS](https://tailwindcss.com/)
- **Database:** [PostgreSQL](https://www.postgresql.org/)
- **Containerization:** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- **Real-time Updates:** WebSockets

---

## Getting Started

This project is fully containerized, so the only prerequisites are Docker and Docker Compose.

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Running the Application

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/ANTONIOALGMAR/goTasks.git
    cd goTasks
    ```

2.  **Build and run the services:**
    Use Docker Compose to build the images and start the `api`, `web`, and `db` services.
    ```bash
    docker-compose up --build
    ```
    The services will start, and the application will be accessible shortly. The initial build may take a few minutes.

### Troubleshooting

-   **`address already in use` Error:** If you see an error related to ports `8080` or `3001` being in use, it means another process on your machine is using them. Find and stop that process, or change the port mappings in the `docker-compose.yml` file.

-   **`failed to execute bake: read |0: file already closed` Error:** This is a known issue with some versions of Docker's BuildKit. If you encounter this, you can disable BuildKit for the build command:
    ```bash
    DOCKER_BUILDKIT=0 docker-compose up --build
    ```

---

## Accessing the Application

Once the containers are running, you can access the different parts of the application:

-   **Web Application (Login):**
    [http://localhost:3001/login](http://localhost:3001/login)

-   **Web Application (Tasks Page):**
    [http://localhost:3001/tasks](http://localhost:3001/tasks)
    *(Note: You must log in first to get a token).*

-   **API Health Check:**
    [http://localhost:8080/health](http://localhost:8080/health)

-   **API Documentation (Swagger):**
    [http://localhost:8080/docs](http://localhost:8080/docs)
    *(Strongly recommended for exploring and testing all available API endpoints).*