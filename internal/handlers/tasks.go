package handlers

import (
	"time"
	"fmt"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"

	"goTasks/internal/models"
	"goTasks/internal/ws"
)

type TaskHandler struct {
	db  *gorm.DB
	hub *ws.Hub
}

func NewTaskHandler(db *gorm.DB, hub *ws.Hub) *TaskHandler {
	return &TaskHandler{db: db, hub: hub}
}

func (h *TaskHandler) List(c *fiber.Ctx) error {
	var tasks []models.Task

	// pagination
	page := parseIntDefault(c.Query("page"), 1)
	size := parseIntDefault(c.Query("size"), 20)
	if size > 100 {
		size = 100
	}
	if page < 1 {
		page = 1
	}
	offset := (page - 1) * size

	// filters
	status := c.Query("status")
	ownerID := c.Query("ownerId")
	q := c.Query("q")
	dueFrom := c.Query("dueFrom")
	dueTo := c.Query("dueTo")
	me := c.Query("me") == "true"

	userID := c.Locals("userID").(uint)
	userRole, _ := c.Locals("userRole").(string)

	qry := h.db.Preload("Owner").Order("created_at DESC")

	// role-based scoping
	if userRole != "admin" {
		// usuário comum: restringe por owner
		qry = qry.Where("owner_id = ?", userID)
	} else {
		// admin pode usar ownerId
		if ownerID != "" {
			qry = qry.Where("owner_id = ?", ownerID)
		}
	}
	// me=true força owner_id = userID
	if me {
		qry = qry.Where("owner_id = ?", userID)
	}

	if status != "" {
		qry = qry.Where("status = ?", status)
	}
	if q != "" {
		like := "%" + q + "%"
		qry = qry.Where("(title ILIKE ? OR description ILIKE ?)", like, like)
	}
	if dueFrom != "" {
		qry = qry.Where("due_date >= ?", dueFrom)
	}
	if dueTo != "" {
		qry = qry.Where("due_date <= ?", dueTo)
	}

	if err := qry.Limit(size).Offset(offset).Find(&tasks).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal error"})
	}

	return c.JSON(fiber.Map{
		"items": tasks,
		"page":  page,
		"size":  size,
		"count": len(tasks),
	})
}

func (h *TaskHandler) Create(c *fiber.Ctx) error {
	uidVal := c.Locals("userID")
	userID, ok := uidVal.(uint)
	if !ok || userID == 0 {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
	}

	var body struct {
		Title       string     `json:"title"`
		Description string     `json:"description"`
		Status      string     `json:"status"`
		DueDate     *time.Time `json:"dueDate"`
	}
	if err := c.BodyParser(&body); err != nil || body.Title == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid data"})
	}
	status := models.StatusTodo
	if body.Status != "" {
		status = models.TaskStatus(body.Status)
	}
	task := models.Task{
		Title:       body.Title,
		Description: body.Description,
		Status:      status,
		DueDate:     body.DueDate,
		OwnerID:     userID,
	}
	if err := h.db.Create(&task).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal error"})
	}
	h.hub.Broadcast(ws.Event{Type: "task.created", Payload: task})
	return c.Status(fiber.StatusCreated).JSON(task)
}

func (h *TaskHandler) GetByID(c *fiber.Ctx) error {
	var task models.Task
	id := c.Params("id")
	if err := h.db.Preload("Owner").First(&task, "id = ?", id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "task not found"})
	}

	uidVal := c.Locals("userID")
	uid, ok := uidVal.(uint)
	if !ok || uid == 0 {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
	}
	userRole, _ := c.Locals("userRole").(string)
	if userRole != "admin" && task.OwnerID != uid {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "task not found"})
	}

	return c.JSON(task)
}

func (h *TaskHandler) Update(c *fiber.Ctx) error {
	var task models.Task
	id := c.Params("id")
	if err := h.db.First(&task, "id = ?", id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "task not found"})
	}

	uidVal := c.Locals("userID")
	uid, ok := uidVal.(uint)
	if !ok || uid == 0 {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
	}
	userRole, _ := c.Locals("userRole").(string)
	if userRole != "admin" && task.OwnerID != uid {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "not allowed"})
	}

	var body struct {
		Title       *string     `json:"title"`
		Description *string     `json:"description"`
		Status      *string     `json:"status"`
		DueDate     *time.Time  `json:"dueDate"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid data"})
	}
	if body.Title != nil {
		task.Title = *body.Title
	}
	if body.Description != nil {
		task.Description = *body.Description
	}
	if body.Status != nil {
		task.Status = models.TaskStatus(*body.Status)
	}
	if body.DueDate != nil {
		task.DueDate = body.DueDate
	}
	if err := h.db.Save(&task).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal error"})
	}
	h.hub.Broadcast(ws.Event{Type: "task.updated", Payload: task})
	return c.JSON(task)
}

func (h *TaskHandler) Delete(c *fiber.Ctx) error {
	id := c.Params("id")
	var task models.Task
	if err := h.db.First(&task, "id = ?", id).Error; err != nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"error": "task not found"})
	}

	uidVal := c.Locals("userID")
	uid, ok := uidVal.(uint)
	if !ok || uid == 0 {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "unauthorized"})
	}
	userRole, _ := c.Locals("userRole").(string)
	if userRole != "admin" && task.OwnerID != uid {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"error": "not allowed"})
	}

	if err := h.db.Delete(&models.Task{}, "id = ?", id).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal error"})
	}
	h.hub.Broadcast(ws.Event{Type: "task.deleted", Payload: fiber.Map{"id": id}})
	return c.SendStatus(fiber.StatusNoContent)
}

func parseIntDefault(s string, def int) int {
	if s == "" {
		return def
	}
	var n int
	_, err := fmt.Sscan(s, &n)
	if err != nil || n < 0 {
		return def
	}
	return n
}