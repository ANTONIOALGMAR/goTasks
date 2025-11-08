package handlers

import (
	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"goTasks/internal/models"
	"goTasks/internal/ws"
)

type CommentHandler struct {
	db  *gorm.DB
	hub *ws.Hub
}

func NewCommentHandler(db *gorm.DB, hub *ws.Hub) *CommentHandler {
	return &CommentHandler{db: db, hub: hub}
}

func (h *CommentHandler) ListByTask(c *fiber.Ctx) error {
	taskID := c.Params("id")
	var comments []models.Comment
	if err := h.db.Where("task_id = ?", taskID).Order("created_at ASC").Find(&comments).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal error"})
	}
	return c.JSON(comments)
}

func (h *CommentHandler) CreateOnTask(c *fiber.Ctx) error {
	userID := c.Locals("userID").(uint)
	taskID := c.Params("id")
	var body struct {
		Content string `json:"content"`
	}
	if err := c.BodyParser(&body); err != nil || body.Content == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid data"})
	}
	comment := models.Comment{TaskID: parseUint(taskID), UserID: userID, Content: body.Content}
	if err := h.db.Create(&comment).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal error"})
	}
	h.hub.Broadcast(ws.Event{Type: "comment.created", Payload: comment})
	return c.Status(fiber.StatusCreated).JSON(comment)
}

func parseUint(s string) uint {
	var out uint
	for i := 0; i < len(s); i++ {
		out = out*10 + uint(s[i]-'0')
	}
	return out
}