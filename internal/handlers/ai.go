package handlers

import (
	"context"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"goTasks/internal/models"
)

type AIClient interface {
	Complete(ctx context.Context, system string, user string) (string, error)
}

type AIHandler struct {
	db      *gorm.DB
	client  AIClient
	model   string
	limitPT int // limite diário por usuário
}

func NewAIHandler(db *gorm.DB, client AIClient, model string, limit int) *AIHandler {
	return &AIHandler{db: db, client: client, model: model, limitPT: limit}
}

func (h *AIHandler) SummarizeTask(c *fiber.Ctx) error {
	uidVal := c.Locals("userID")
	uid, ok := uidVal.(uint)
	if !ok || uid == 0 {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
	}
	id := c.Params("id")
	var task models.Task
	if err := h.db.Preload("Owner").First(&task, "id = ?", id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "task not found"})
	}
	if task.OwnerID != uid {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "not allowed"})
	}

	var comments []models.Comment
	if err := h.db.Where("task_id = ?", task.ID).Order("created_at ASC").Find(&comments).Error; err != nil {
		comments = []models.Comment{}
	}

	userPrompt := buildSummaryPrompt(task, comments)
	resp, err := h.client.Complete(c.Context(), summarySystem(), userPrompt)
	if err != nil {
		return c.Status(fiber.StatusBadGateway).JSON(fiber.Map{"error": "ai error"})
	}
	return c.JSON(fiber.Map{"summary": resp})
}

func summarySystem() string {
	return "Você é um assistente de produtividade. Faça resumo objetivo, próximos passos e riscos."
}

func buildSummaryPrompt(task models.Task, comments []models.Comment) string {
	p := "Título: " + task.Title + "\nDescrição: " + task.Description + "\nStatus: " + string(task.Status)
	if task.DueDate != nil {
		p += "\nPrazo: " + task.DueDate.Format(time.RFC3339)
	}
	p += "\nComentários:\n"
	for _, c := range comments {
		p += "- " + c.Content + "\n"
	}
	p += "\nProduza: 1) resumo; 2) checklist de próximos passos; 3) riscos; 4) prazo sugerido se aplicável."
	return p
}