package handlers

import (
	"strconv"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"goTasks/internal/models"
)

type NotificationsHandler struct {
	DB *gorm.DB
}

func NewNotificationsHandler(db *gorm.DB) *NotificationsHandler {
	return &NotificationsHandler{DB: db}
}

// List lista notificações do usuário autenticado, com opção de filtrar não lidas (?unread=true)
func (h *NotificationsHandler) List(c *fiber.Ctx) error {
	uidVal := c.Locals("userID")
	uid, ok := uidVal.(uint)
	if !ok || uid == 0 {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
	}

	var notifications []models.Notification
	tx := h.DB.Where("user_id = ?", uid).Order("created_at DESC").Limit(50)

	if c.Query("unread") == "true" {
		tx = tx.Where("read = ?", false)
	}

	if err := tx.Find(&notifications).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "db error"})
	}
	return c.JSON(notifications)
}

// MarkRead marca uma notificação como lida se pertencer ao usuário autenticado
func (h *NotificationsHandler) MarkRead(c *fiber.Ctx) error {
	uidVal := c.Locals("userID")
	uid, ok := uidVal.(uint)
	if !ok || uid == 0 {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
	}

	idStr := c.Params("id")
	id, err := strconv.Atoi(idStr)
	if err != nil || id <= 0 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid id"})
	}

	var n models.Notification
	if err := h.DB.First(&n, "id = ? AND user_id = ?", id, uid).Error; err != nil {
		if err == gorm.ErrRecordNotFound {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "not found"})
		}
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "db error"})
	}

	n.Read = true
	if err := h.DB.Save(&n).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "update failed"})
	}

	return c.JSON(fiber.Map{"ok": true})
}