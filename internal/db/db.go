package db

import (
	"gorm.io/driver/postgres"
	"gorm.io/gorm"

	"goTasks/internal/models"
)

func Connect(dsn string) (*gorm.DB, error) {
	return gorm.Open(postgres.Open(dsn), &gorm.Config{})
}

func AutoMigrate(db *gorm.DB) error {
	return db.AutoMigrate(&models.User{}, &models.Task{}, &models.Comment{})
}