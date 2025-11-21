package config

import "os"

type Config struct {
	Port        string
	DatabaseURL string
	JWTSecret   string
	AIProvider   string
	OpenAIKey    string
	AnthropicKey string
	AIModel      string
	AILimitDaily int
}

func Load() Config {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	dbURL := os.Getenv("DATABASE_URL")
	if dbURL == "" {
		dbURL = "postgres://postgres:postgres@localhost:5432/gotasks?sslmode=disable"
	}
	secret := os.Getenv("JWT_SECRET")
	if secret == "" {
		secret = "dev-secret-change-me"
	}
	provider := os.Getenv("AI_PROVIDER") // "openai" | "anthropic"
	openai := os.Getenv("OPENAI_API_KEY")
	anth := os.Getenv("ANTHROPIC_API_KEY")
	model := os.Getenv("AI_MODEL")
	if model == "" {
		model = "gpt-4o-mini"
	}
	limit := 100 // padrão diário
	return Config{
		Port:        port,
		DatabaseURL: dbURL,
		JWTSecret:   secret,
		AIProvider:   provider,
		OpenAIKey:    openai,
		AnthropicKey: anth,
		AIModel:      model,
		AILimitDaily: limit,
	}
}