package handlers

import "github.com/gofiber/fiber/v2"

func SwaggerJSON() fiber.Handler {
	return func(c *fiber.Ctx) error {
		c.Type("json")
		return c.SendString(swaggerSpec)
	}
}

func SwaggerPage() fiber.Handler {
	return func(c *fiber.Ctx) error {
		c.Type("html")
		return c.SendString(swaggerHTML)
	}
}

const swaggerHTML = `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <title>goTasks API Docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css">
</head>
<body>
<div id="swagger-ui"></div>
<script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
<script>
window.onload = () => {
  SwaggerUIBundle({ url: '/swagger.json', dom_id: '#swagger-ui' });
};
</script>
</body>
</html>`

const swaggerSpec = `{
  "openapi": "3.0.0",
  "info": { "title": "goTasks API", "version": "1.0.0" },
  "paths": {
    "/api/auth/register": { "post": { "summary": "Register", "responses": { "200": { "description": "OK" } } } },
    "/api/auth/login": { "post": { "summary": "Login", "responses": { "200": { "description": "OK" } } } },
    "/api/tasks": {
      "get": { "summary": "List tasks", "responses": { "200": { "description": "OK" } } },
      "post": { "summary": "Create task", "responses": { "201": { "description": "Created" } } }
    },
    "/api/tasks/{id}": {
      "get": { "summary": "Get task", "responses": { "200": { "description": "OK" } } },
      "patch": { "summary": "Update task", "responses": { "200": { "description": "OK" } } },
      "delete": { "summary": "Delete task", "responses": { "204": { "description": "No Content" } } }
    },
    "/api/tasks/{id}/comments": {
      "get": { "summary": "List comments", "responses": { "200": { "description": "OK" } } },
      "post": { "summary": "Create comment", "responses": { "201": { "description": "Created" } } }
    },
    "/ws": { "get": { "summary": "WebSocket", "responses": { "101": { "description": "Switching Protocols" } } } }
  }
}`