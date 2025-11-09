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

---
<hr>
---

# goTasks - Sistema Completo de Gestão de Tarefas

**goTasks** é uma aplicação completa de gestão de tarefas com um backend em Go (Fiber), um frontend em React (Next.js) e banco de dados PostgreSQL. O projeto é totalmente containerizado com Docker para facilitar a configuração e o deploy.

---

## Tecnologias Utilizadas

- **Backend:** [Go](https://golang.org/) com [Fiber](https://gofiber.io/)
- **Frontend:** [Next.js](https://nextjs.org/) (React Framework) com [TypeScript](https://www.typescriptlang.org/) & [Tailwind CSS](https://tailwindcss.com/)
- **Banco de Dados:** [PostgreSQL](https://www.postgresql.org/)
- **Containerização:** [Docker](https://www.docker.com/) & [Docker Compose](https://docs.docker.com/compose/)
- **Atualizações em Tempo Real:** WebSockets

---

## Começando

Este projeto é totalmente containerizado, então os únicos pré-requisitos são Docker e Docker Compose.

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)

### Rodando a Aplicação

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/ANTONIOALGMAR/goTasks.git
    cd goTasks
    ```

2.  **Construa e rode os serviços:**
    Use o Docker Compose para construir as imagens e iniciar os serviços `api`, `web` e `db`.
    ```bash
    docker-compose up --build
    ```
    Os serviços serão iniciados e a aplicação estará acessível em breve. O build inicial pode levar alguns minutos.

### Solução de Problemas

-   **Erro `address already in use`:** Se você encontrar um erro relacionado às portas `8080` ou `3001` já em uso, significa que outro processo em sua máquina as está utilizando. Encontre e pare esse processo, ou altere o mapeamento de portas no arquivo `docker-compose.yml`.

-   **Erro `failed to execute bake: read |0: file already closed`:** Este é um problema conhecido com algumas versões do BuildKit do Docker. Se você encontrar isso, pode desabilitar o BuildKit para o comando de build:
    ```bash
    DOCKER_BUILDKIT=0 docker-compose up --build
    ```

---

## Acessando a Aplicação

Com os contêineres rodando, você pode acessar as diferentes partes da aplicação:

-   **Aplicação Web (Login):**
    [http://localhost:3001/login](http://localhost:3001/login)

-   **Aplicação Web (Página de Tarefas):**
    [http://localhost:3001/tasks](http://localhost:3001/tasks)
    *(Observação: Você precisa fazer login primeiro para obter um token).*

-   **Verificação de Saúde da API (Health Check):**
    [http://localhost:8080/health](http://localhost:8080/health)

-   **Documentação da API (Swagger):**
    [http://localhost:8080/docs](http://localhost:8080/docs)
    *(Fortemente recomendado para explorar e testar todos os endpoints disponíveis da API).*