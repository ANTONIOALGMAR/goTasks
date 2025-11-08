package handlers

import (
	"testing"

	"gorm.io/driver/sqlite"
	"gorm.io/gorm"

	"goTasks/internal/models"
)

func TestRegisterLogin(t *testing.T) {
	db, err := gorm.Open(sqlite.Open(":memory:"), &gorm.Config{})
	if err != nil {
		t.Fatal(err)
	}
	if err := db.AutoMigrate(&models.User{}); err != nil {
		t.Fatal(err)
	}
	// aqui você pode instanciar o AuthHandler e testar os métodos usando fiber.Ctx com app de teste
}