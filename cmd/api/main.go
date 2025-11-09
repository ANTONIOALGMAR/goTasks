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
	// Auth
	api.Post("/auth/register", authHandler.Register)
	api.Post("/auth/login", authHandler.Login)
	api.Post("/auth/refresh", authHandler.Refresh)

	// Tasks
	api.Get("/tasks", auth.RequireJWT(cfg.JWTSecret), taskHandler.List)
	api.Post("/tasks", auth.RequireJWT(cfg.JWTSecret), taskHandler.Create)
	api.Get("/tasks/:id", auth.RequireJWT(cfg.JWTSecret), taskHandler.GetByID)
	api.Patch("/tasks/:id", auth.RequireJWT(cfg.JWTSecret), taskHandler.Update)
	api.Delete("/tasks/:id", auth.RequireJWT(cfg.JWTSecret), taskHandler.Delete)

	// Comments
	api.Get("/tasks/:id/comments", auth.RequireJWT(cfg.JWTSecret), commentHandler.ListByTask)
	api.Post("/tasks/:id/comments", auth.RequireJWT(cfg.JWTSecret), commentHandler.CreateOnTask)

	// Notifications
	api.Get("/notifications", auth.RequireJWT(cfg.JWTSecret), notificationsHandler.List)
	api.Patch("/notifications/:id/read", auth.RequireJWT(cfg.JWTSecret), notificationsHandler.MarkRead)

	// Swagger, WS etc.
	log.Printf("API ouvindo em http://localhost:%s", cfg.Port)
	// Start
	if err := app.Listen(":" + cfg.Port); err != nil {
		log.Fatal(err)
	}
}