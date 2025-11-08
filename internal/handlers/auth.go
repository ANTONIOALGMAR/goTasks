package handlers

import (
	"strings"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/gorm"

	"goTasks/internal/auth"
	"goTasks/internal/models"
)

type AuthHandler struct {
	db        *gorm.DB
	jwtSecret string
}

func NewAuthHandler(db *gorm.DB, secret string) *AuthHandler {
	return &AuthHandler{db: db, jwtSecret: secret}
}

func (h *AuthHandler) Register(c *fiber.Ctx) error {
	var body struct {
		Name     string `json:"name"`
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid JSON"})
	}
	body.Email = strings.ToLower(strings.TrimSpace(body.Email))
	if body.Name == "" || body.Email == "" || len(body.Password) < 6 {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid data"})
	}

	var existing models.User
	if err := h.db.Where("email = ?", body.Email).First(&existing).Error; err == nil {
		return c.Status(fiber.StatusConflict).JSON(fiber.Map{"error": "email already registered"})
	}

	hash, _ := bcrypt.GenerateFromPassword([]byte(body.Password), bcrypt.DefaultCost)
	user := models.User{Name: body.Name, Email: body.Email, PasswordHash: string(hash), Role: "user"}
	if err := h.db.Create(&user).Error; err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal error"})
	}

	token, err := auth.CreateToken(user.ID, user.Role, h.jwtSecret)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal error"})
	}
	refresh, err := auth.CreateRefreshToken(user.ID, user.Role, h.jwtSecret)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal error"})
	}
	return c.JSON(fiber.Map{"token": token, "refreshToken": refresh, "user": fiber.Map{"id": user.ID, "name": user.Name, "email": user.Email, "role": user.Role}})
}

func (h *AuthHandler) Login(c *fiber.Ctx) error {
	var body struct {
		Email    string `json:"email"`
		Password string `json:"password"`
	}
	if err := c.BodyParser(&body); err != nil {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid JSON"})
	}
	body.Email = strings.ToLower(strings.TrimSpace(body.Email))

	var user models.User
	if err := h.db.Where("email = ?", body.Email).First(&user).Error; err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid credentials"})
	}
	if err := bcrypt.CompareHashAndPassword([]byte(user.PasswordHash), []byte(body.Password)); err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid credentials"})
	}

	token, err := auth.CreateToken(user.ID, user.Role, h.jwtSecret)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal error"})
	}
	refresh, err := auth.CreateRefreshToken(user.ID, user.Role, h.jwtSecret)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal error"})
	}
	return c.JSON(fiber.Map{"token": token, "refreshToken": refresh, "user": fiber.Map{"id": user.ID, "name": user.Name, "email": user.Email, "role": user.Role}})
}

func (h *AuthHandler) Refresh(c *fiber.Ctx) error {
	var body struct {
		RefreshToken string `json:"refreshToken"`
	}
	if err := c.BodyParser(&body); err != nil || body.RefreshToken == "" {
		return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"error": "invalid JSON"})
	}
	tok, err := auth.Parse(body.RefreshToken, h.jwtSecret)
	if err != nil || !tok.Valid {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid refresh"})
	}
	claims, ok := tok.Claims.(jwt.MapClaims)
	if !ok || claims["type"] != "refresh" {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid refresh"})
	}
	subF, _ := claims["sub"].(float64)
	role, _ := claims["role"].(string)
	token, err := auth.CreateToken(uint(subF), role, h.jwtSecret)
	if err != nil {
		return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"error": "internal error"})
	}
	return c.JSON(fiber.Map{"token": token})
}