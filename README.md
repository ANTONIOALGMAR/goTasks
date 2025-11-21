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

## Features

-   **Task Management:** Create, view, edit, and delete tasks.
-   **Real-time Notifications:** Get notified about overdue tasks and tasks due soon.
-   **AI Assistant:** Generate task summaries using OpenAI (requires API key).
-   **User Authentication:** Secure login and registration.
-   **Responsive UI:** Built with Tailwind CSS for a modern look.

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

2.  **Configure OpenAI API Key (for AI Assistant):**
    If you plan to use the AI assistant feature, obtain an OpenAI API Key from [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys).
    Then, open `docker-compose.yml` and replace `sua_chave_openai_aqui` with your actual key in the `api` service's `environment` section.

3.  **Build and run the services:**
    Use Docker Compose to build the images and start the `api`, `web`, and `db` services. Due to potential BuildKit issues, it's recommended to use:
    ```bash
    DOCKER_BUILDKIT=0 docker-compose up --build -d
    ```
    The services will start, and the application will be accessible shortly. The initial build may take a few minutes.

4.  **Seed the database (create default users and tasks):**
    After the services are running, execute the seed program to populate the database with default users (`admin@example.com`/`admin123`, `user@example.com`/`user123`) and sample tasks.
    ```bash
    docker run --rm -it --network gotasks_default -v "$(pwd):/app" -w /app -e "DATABASE_URL=postgres://postgres:postgres@db:5432/gotasks?sslmode=disable" golang:1.24 go run cmd/seed/main.go
    ```

### Troubleshooting

-   **`address already in use` Error:** If you see an error related to ports `8080` or `3001` being in use, it means another process on your machine is using them. Find and stop that process, or change the port mappings in the `docker-compose.yml` file.

-   **`failed to execute bake: read |0: file already closed` Error:** This is a known issue with some versions of Docker's BuildKit. If you encounter this, you can disable BuildKit for the build command:
    ```bash
    DOCKER_BUILDKIT=0 docker-compose up --build
    ```

---

## Accessing the Application

Once the containers are running, you can access the different parts of the application:

-   **Web Application:**
    [http://localhost:3001](http://localhost:3001)
    (This will redirect to `/tasks` or `/login` as needed.)

-   **Default Login Credentials (after seeding the database):**
    -   **Admin:** `admin@example.com` / `admin123`
    -   **User:** `user@example.com` / `user123`

-   **API Health Check:**
    [http://localhost:8080/health](http://localhost:8080/health)

-   **API Documentation (Swagger):**
    [http://localhost:8080/docs](http://localhost:8080/docs)
    *(Strongly recommended for exploring and testing all available API endpoints).*

-   **API Health Check:**
    [http://localhost:8080/health](http://localhost:8080/health)

-   **API Documentation (Swagger):**
    [http://localhost:8080/docs](http://localhost:8080/docs)
    *(Strongly recommended for exploring and testing all available API endpoints).*

---

## Deployment

This project is configured for deployment on [Render.com](https://render.com/) using Infrastructure as Code via `render.yaml`.

### Steps to Deploy on Render:

1.  **Connect your Git repository:** Log in to Render, go to the Dashboard, and connect your GitHub/GitLab repository where this project is hosted.
2.  **Create a new Blueprint instance:**
    *   From your Render Dashboard, click "New" -> "Blueprint".
    *   Select your repository and choose "Deploy from a blueprint".
    *   Render will detect the `render.yaml` file and propose to create all services (API, Web, DB, Seed).
3.  **Configure Environment Variables:**
    *   For the `gotasks-api` service, you will need to manually add `OpenAIKey` as an environment variable with your actual OpenAI API key.
    *   Render automatically handles `DATABASE_URL` and `JWT_SECRET` (generates a new one).
4.  **Deploy:** Confirm the settings and deploy.
5.  **Run Seed Service (Optional but Recommended):**
    After the database and API services are deployed, you can manually run the `gotasks-seed` worker service once from the Render Dashboard to populate your production database with default users and tasks.

---

## Deploy

Este projeto está configurado para deploy no [Render.com](https://render.com/) usando Infraestrutura como Código via `render.yaml`.

### Passos para Fazer Deploy no Render:

1.  **Conecte seu repositório Git:** Faça login no Render, vá para o Dashboard e conecte seu repositório GitHub/GitLab onde este projeto está hospedado.
2.  **Crie uma nova instância de Blueprint:**
    *   No seu Dashboard do Render, clique em "New" -> "Blueprint".
    *   Selecione seu repositório e escolha "Deploy from a blueprint".
    *   O Render detectará o arquivo `render.yaml` e proporá a criação de todos os serviços (API, Web, DB, Seed).
3.  **Configure as Variáveis de Ambiente:**
    *   Para o serviço `gotasks-api`, você precisará adicionar manualmente `OpenAIKey` como uma variável de ambiente com sua chave de API OpenAI real.
    *   O Render lida automaticamente com `DATABASE_URL` e `JWT_SECRET` (gera um novo).
4.  **Faça o Deploy:** Confirme as configurações e faça o deploy.
5.  **Execute o Serviço Seed (Opcional, mas Recomendado):**
    Após os serviços de banco de dados e API serem implantados, você pode executar manualmente o serviço worker `gotasks-seed` uma vez no Dashboard do Render para popular seu banco de dados de produção com usuários e tarefas padrão.

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
- **Containerização:** [Docker](https://www.com/) & [Docker Compose](https://docs.docker.com/compose/)
- **Atualizações em Tempo Real:** WebSockets

---

## Funcionalidades

-   **Gestão de Tarefas:** Crie, visualize, edite e exclua tarefas.
-   **Notificações em Tempo Real:** Receba notificações sobre tarefas atrasadas e tarefas que vencem em breve.
-   **Assistente de IA:** Gere resumos de tarefas usando OpenAI (requer chave de API).
-   **Autenticação de Usuário:** Login e registro seguros.
-   **UI Responsiva:** Construída com Tailwind CSS para um visual moderno.

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

2.  **Configure a Chave da API OpenAI (para o Assistente de IA):**
    Se você planeja usar o recurso de assistente de IA, obtenha uma Chave da API OpenAI em [https://platform.openai.com/account/api-keys](https://platform.openai.com/account/api-keys).
    Em seguida, abra o `docker-compose.yml` e substitua `sua_chave_openai_aqui` pela sua chave real na seção `environment` do serviço `api`.

3.  **Construa e rode os serviços:**
    Use o Docker Compose para construir as imagens e iniciar os serviços `api`, `web` e `db`. Devido a possíveis problemas com o BuildKit, é recomendado usar:
    ```bash
    DOCKER_BUILDKIT=0 docker-compose up --build -d
    ```
    Os serviços serão iniciados e a aplicação estará acessível em breve. O build inicial pode levar alguns minutos.

4.  **Popule o banco de dados (crie usuários e tarefas padrão):**
    Após os serviços estarem rodando, execute o programa `seed` para popular o banco de dados com usuários padrão (`admin@example.com`/`admin123`, `user@example.com`/`user123`) e tarefas de exemplo.
    ```bash
    docker run --rm -it --network gotasks_default -v "$(pwd):/app" -w /app -e "DATABASE_URL=postgres://postgres:postgres@db:5432/gotasks?sslmode=disable" golang:1.24 go run cmd/seed/main.go
    ```

### Solução de Problemas

-   **Erro `address already in use`:** Se você encontrar um erro relacionado às portas `8080` ou `3001` já em uso, significa que outro processo em sua máquina as está utilizando. Encontre e pare esse processo, ou altere o mapeamento de portas no arquivo `docker-compose.yml`.

-   **Erro `failed to execute bake: read |0: file already closed`:** Este é um problema conhecido com algumas versões do BuildKit do Docker. Se você encontrar isso, pode desabilitar o BuildKit para o comando de build:
    ```bash
    DOCKER_BUILDKIT=0 docker-compose up --build
    ```

---

## Acessando a Aplicação

Com os contêineres rodando, você pode acessar as diferentes partes da aplicação:

-   **Aplicação Web:**
    [http://localhost:3001](http://localhost:3001)
    (Isso redirecionará para `/tasks` ou `/login` conforme necessário.)

-   **Credenciais de Login Padrão (após popular o banco de dados):**
    -   **Admin:** `admin@example.com` / `admin123`
    -   **Usuário:** `user@example.com` / `user123`

-   **Verificação de Saúde da API (Health Check):**
    [http://localhost:8080/health](http://localhost:8080/health)

-   **Documentação da API (Swagger):**
    [http://localhost:8080/docs](http://localhost:8080/docs)
    *(Fortemente recomendado para explorar e testar todos os endpoints disponíveis da API).*

-   **Verificação de Saúde da API (Health Check):**
    [http://localhost:8080/health](http://localhost:8080/health)

-   **Documentação da API (Swagger):**
    [http://localhost:8080/docs](http://localhost:8080/docs)
    *(Fortemente recomendado para explorar e testar todos os endpoints disponíveis da API).*