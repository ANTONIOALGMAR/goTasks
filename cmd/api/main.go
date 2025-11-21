package main

import (
	"log"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/logger"
	recovermw "github.com/gofiber/fiber/v2/middleware/recover"

	"goTasks/internal/auth"
	"goTasks/internal/config"
	"goTasks/internal/db"
	"goTasks/internal/handlers"
	"goTasks/internal/ws"
	"goTasks/internal/notify"
)

func main() {
	cfg := config.Load()

	database, err := db.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatalf("erro ao conectar DB: %v", err)
	}
	if err := db.AutoMigrate(database); err != nil {
		log.Fatalf("erro ao migrar DB: %v", err)
	}

	app := fiber.New()
	app.Use(recovermw.New())
	app.Use(logger.New())
	app.Use(cors.New(cors.Config{
		AllowOrigins: "*",
		AllowMethods: "GET,POST,PUT,PATCH,DELETE,OPTIONS",
		AllowHeaders: "Content-Type, Authorization",
	}))

	// Health
	app.Get("/health", func(c *fiber.Ctx) error { return c.SendString("ok") })

	// Swagger
	app.Get("/docs", handlers.SwaggerPage())
	app.Get("/swagger.json", handlers.SwaggerJSON())

	// WebSocket Hub
	hub := ws.NewHub()
	go hub.Run()
	app.Get("/ws", ws.UpgradeWithAuth(cfg.JWTSecret, hub))

	// Handlers
	authHandler := handlers.NewAuthHandler(database, cfg.JWTSecret)
	taskHandler := handlers.NewTaskHandler(database, hub)
	commentHandler := handlers.NewCommentHandler(database, hub)
	notificationsHandler := handlers.NewNotificationsHandler(database)

	// Scheduler de notificações
	scheduler := notify.NewScheduler(database, hub)
	scheduler.Start()

	api := app.Group("/api")
	// rotas públicas
	api.Post("/auth/register", authHandler.Register)
	api.Post("/auth/login", authHandler.Login)
	api.Post("/auth/refresh", authHandler.Refresh)

	// rotas protegidas (JWT)
	// AI
	// AI client e handler
	var aiClient handlers.AIClient
	if cfg.AIProvider == "openai" && cfg.OpenAIKey != "" {
		aiClient = handlers.NewOpenAIClient(cfg.OpenAIKey, cfg.AIModel)
	}
	aiHandler := handlers.NewAIHandler(database, aiClient, cfg.AIModel, cfg.AILimitDaily)

	// grupo protegido
	apiAuth := app.Group("/api", auth.RequireJWT(cfg.JWTSecret))
	apiAuth.Post("/ai/tasks/:id/summary", aiHandler.SummarizeTask)
	// poderia ter: /ai/tasks/:id/next-steps, /ai/chat
	apiAuth.Get("/tasks", taskHandler.List)
	apiAuth.Post("/tasks", taskHandler.Create)
	apiAuth.Get("/tasks/:id", taskHandler.GetByID)
	apiAuth.Patch("/tasks/:id", taskHandler.Update)
	apiAuth.Delete("/tasks/:id", taskHandler.Delete)

	apiAuth.Get("/tasks/:id/comments", commentHandler.ListByTask)
	apiAuth.Post("/tasks/:id/comments", commentHandler.CreateOnTask)

	apiAuth.Get("/notifications", notificationsHandler.List)
	apiAuth.Patch("/notifications/:id/read", notificationsHandler.MarkRead)

	// Swagger, WS etc.
	log.Printf("API ouvindo em http://localhost:%s", cfg.Port)
	// Start
	if err := app.Listen(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}