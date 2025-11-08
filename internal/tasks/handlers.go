package tasks

import (
	"encoding/json"
	"io"
	"net/http"
	"strconv"
	"strings"
)

type Server struct {
	store Store
}

func NewServer(store Store) *Server {
	return &Server{store: store}
}

func (s *Server) TasksHandler(w http.ResponseWriter, r *http.Request) {
	switch r.Method {
	case http.MethodGet:
		limit := parseIntDefault(r.URL.Query().Get("limit"), 50)
		offset := parseIntDefault(r.URL.Query().Get("offset"), 0)
		list, err := s.store.List(limit, offset)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "internal error")
			return
		}
		writeJSON(w, http.StatusOK, list)

	case http.MethodPost:
		var body struct {
			Title       string `json:"title"`
			Description string `json:"description"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			writeError(w, http.StatusBadRequest, "invalid JSON")
			return
		}
		if strings.TrimSpace(body.Title) == "" {
			writeError(w, http.StatusBadRequest, "title is required")
			return
		}
		t, err := s.store.Create(body.Title, body.Description)
		if err != nil {
			writeError(w, http.StatusInternalServerError, "internal error")
			return
		}
		writeJSON(w, http.StatusCreated, t)

	default:
		w.Header().Set("Allow", "GET, POST")
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
	}
}

func (s *Server) TaskByIDHandler(w http.ResponseWriter, r *http.Request) {
	idStr := strings.TrimPrefix(r.URL.Path, "/tasks/")
	if idStr == "" || strings.Contains(idStr, "/") {
		writeError(w, http.StatusNotFound, "not found")
		return
	}
	id, err := strconv.Atoi(idStr)
	if err != nil {
		writeError(w, http.StatusBadRequest, "id must be integer")
		return
	}

	switch r.Method {
	case http.MethodGet:
		t, err := s.store.Get(id)
		if err == ErrNotFound {
			writeError(w, http.StatusNotFound, "task not found")
			return
		} else if err != nil {
			writeError(w, http.StatusInternalServerError, "internal error")
			return
		}
		writeJSON(w, http.StatusOK, t)

	case http.MethodPut, http.MethodPatch:
		var body struct {
			Title       *string `json:"title"`
			Description *string `json:"description"`
			Done        *bool   `json:"done"`
		}
		raw, _ := io.ReadAll(r.Body)
		if len(raw) == 0 {
			writeError(w, http.StatusBadRequest, "empty body")
			return
		}
		if err := json.Unmarshal(raw, &body); err != nil {
			writeError(w, http.StatusBadRequest, "invalid JSON")
			return
		}
		t, err := s.store.Update(id, body.Title, body.Description, body.Done)
		if err == ErrNotFound {
			writeError(w, http.StatusNotFound, "task not found")
			return
		} else if err != nil {
			writeError(w, http.StatusInternalServerError, "internal error")
			return
		}
		writeJSON(w, http.StatusOK, t)

	case http.MethodDelete:
		if err := s.store.Delete(id); err == ErrNotFound {
			writeError(w, http.StatusNotFound, "task not found")
			return
		} else if err != nil {
			writeError(w, http.StatusInternalServerError, "internal error")
			return
		}
		w.WriteHeader(http.StatusNoContent)

	default:
		w.Header().Set("Allow", "GET, PUT, PATCH, DELETE")
		writeError(w, http.StatusMethodNotAllowed, "method not allowed")
	}
}

func writeJSON(w http.ResponseWriter, status int, v interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

func writeError(w http.ResponseWriter, status int, msg string) {
	writeJSON(w, status, map[string]string{"error": msg})
}

func parseIntDefault(s string, def int) int {
	if s == "" {
		return def
	}
	n, err := strconv.Atoi(s)
	if err != nil || n < 0 {
		return def
	}
	return n
}