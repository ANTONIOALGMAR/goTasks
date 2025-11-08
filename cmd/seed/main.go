package main

import (
	"log"
	"time"

	"golang.org/x/crypto/bcrypt"

	"goTasks/internal/config"
	"goTasks/internal/db"
	"goTasks/internal/models"
)

func main() {
	cfg := config.Load()
	database, err := db.Connect(cfg.DatabaseURL)
	if err != nil {
		log.Fatal(err)
	}
	if err := db.AutoMigrate(database); err != nil {
		log.Fatal(err)
	}

	// users
	admin := models.User{Name: "Admin", Email: "admin@example.com", Role: "admin"}
	admin.PasswordHash = hash("admin123")
	user := models.User{Name: "User", Email: "user@example.com", Role: "user"}
	user.PasswordHash = hash("user123")

	database.Where(models.User{Email: admin.Email}).FirstOrCreate(&admin)
	database.Where(models.User{Email: user.Email}).FirstOrCreate(&user)

	// tasks for user
	now := time.Now().UTC()
	t1 := models.Task{Title: "Planejar sprint", Description: "Backlog grooming", Status: models.StatusTodo, OwnerID: user.ID, DueDate: &now}
	t2 := models.Task{Title: "Refatorar serviço", Description: "Melhorar performance", Status: models.StatusDoing, OwnerID: user.ID}
	database.Create(&t1)
	database.Create(&t2)

	log.Println("Seeds concluídos:")
	log.Printf("Admin: %s / senha: admin123", admin.Email)
	log.Printf("User: %s / senha: user123", user.Email)
}

func hash(pw string) string {
	h, _ := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.DefaultCost)
	return string(h)
}