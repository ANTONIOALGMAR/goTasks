package auth

import (
	"errors"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

func CreateToken(userID uint, role string, secret string) (string, error) {
	claims := jwt.MapClaims{
		"sub":  userID,
		"role": role,
		"exp":  time.Now().Add(2 * time.Hour).Unix(),
		"iat":  time.Now().Unix(),
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString([]byte(secret))
}

func CreateRefreshToken(userID uint, role string, secret string) (string, error) {
	claims := jwt.MapClaims{
		"sub":  userID,
		"role": role,
		"type": "refresh",
		"exp":  time.Now().Add(14 * 24 * time.Hour).Unix(),
		"iat":  time.Now().Unix(),
	}
	t := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return t.SignedString([]byte(secret))
}

func parseToken(tokenStr, secret string) (*jwt.Token, error) {
	return jwt.Parse(tokenStr, func(t *jwt.Token) (interface{}, error) {
		if t.Method != jwt.SigningMethodHS256 {
			return nil, errors.New("invalid method")
		}
		return []byte(secret), nil
	})
}

func Parse(tokenStr, secret string) (*jwt.Token, error) {
	return parseToken(tokenStr, secret)
}

func RequireJWT(secret string) fiber.Handler {
	return func(c *fiber.Ctx) error {
		authHeader := c.Get("Authorization")
		if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "missing token"})
		}
		tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
		tok, err := parseToken(tokenStr, secret)
		if err != nil || !tok.Valid {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid token"})
		}
		claims, ok := tok.Claims.(jwt.MapClaims)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid claims"})
		}
		sub, ok := claims["sub"].(float64)
		if !ok {
			return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"error": "invalid subject"})
		}
		role, _ := claims["role"].(string)
		c.Locals("userID", uint(sub))
		c.Locals("userRole", role)
		return c.Next()
	}
}