package tasks

import (
	"database/sql"
	"errors"
	"time"

	_ "github.com/mattn/go-sqlite3"
)

var ErrNotFound = errors.New("task not found")

type SQLiteStore struct {
	db *sql.DB
}

func NewSQLiteStore(path string) (*SQLiteStore, error) {
	db, err := sql.Open("sqlite3", path)
	if err != nil {
		return nil, err
	}
	db.SetMaxOpenConns(1)
	return &SQLiteStore{db: db}, nil
}

func (s *SQLiteStore) Migrate() error {
	_, err := s.db.Exec(`
		CREATE TABLE IF NOT EXISTS tasks (
			id INTEGER PRIMARY KEY AUTOINCREMENT,
			title TEXT NOT NULL,
			description TEXT,
			done INTEGER NOT NULL DEFAULT 0,
			created_at TEXT NOT NULL,
			updated_at TEXT NOT NULL
		);
	`)
	return err
}

func (s *SQLiteStore) List(limit, offset int) ([]Task, error) {
	q := `
		SELECT id, title, description, done, created_at, updated_at
		FROM tasks
		ORDER BY created_at DESC
		LIMIT ? OFFSET ?;
	`
	rows, err := s.db.Query(q, limit, offset)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var out []Task
	for rows.Next() {
		var t Task
		var done int
		var createdAt string
		var updatedAt string
		if err := rows.Scan(&t.ID, &t.Title, &t.Description, &done, &createdAt, &updatedAt); err != nil {
			return nil, err
		}
		t.Done = done == 1
		t.CreatedAt, _ = time.Parse(time.RFC3339Nano, createdAt)
		t.UpdatedAt, _ = time.Parse(time.RFC3339Nano, updatedAt)
		out = append(out, t)
	}
	return out, rows.Err()
}

func (s *SQLiteStore) Create(title, description string) (Task, error) {
	now := time.Now().UTC().Format(time.RFC3339Nano)
	res, err := s.db.Exec(`
		INSERT INTO tasks (title, description, done, created_at, updated_at)
		VALUES (?, ?, 0, ?, ?);
	`, title, description, now, now)
	if err != nil {
		return Task{}, err
	}
	id, err := res.LastInsertId()
	if err != nil {
		return Task{}, err
	}
	return s.Get(int(id))
}

func (s *SQLiteStore) Get(id int) (Task, error) {
	row := s.db.QueryRow(`
		SELECT id, title, description, done, created_at, updated_at
		FROM tasks
		WHERE id = ?;
	`, id)
	var t Task
	var done int
	var createdAt string
	var updatedAt string
	if err := row.Scan(&t.ID, &t.Title, &t.Description, &done, &createdAt, &updatedAt); err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return Task{}, ErrNotFound
		}
		return Task{}, err
	}
	t.Done = done == 1
	t.CreatedAt, _ = time.Parse(time.RFC3339Nano, createdAt)
	t.UpdatedAt, _ = time.Parse(time.RFC3339Nano, updatedAt)
	return t, nil
}

func (s *SQLiteStore) Update(id int, title *string, description *string, done *bool) (Task, error) {
	t, err := s.Get(id)
	if err != nil {
		return Task{}, err
	}
	if title != nil {
		t.Title = *title
	}
	if description != nil {
		t.Description = *description
	}
	if done != nil {
		t.Done = *done
	}

	_, err = s.db.Exec(`
		UPDATE tasks
		SET title = ?, description = ?, done = ?, updated_at = ?
		WHERE id = ?;
	`, t.Title, t.Description, boolToInt(t.Done), time.Now().UTC().Format(time.RFC3339Nano), id)
	if err != nil {
		return Task{}, err
	}
	return s.Get(id)
}

func (s *SQLiteStore) Delete(id int) error {
	res, err := s.db.Exec(`DELETE FROM tasks WHERE id = ?;`, id)
	if err != nil {
		return err
	}
	aff, _ := res.RowsAffected()
	if aff == 0 {
		return ErrNotFound
	}
	return nil
}

func boolToInt(b bool) int {
	if b {
		return 1
	}
	return 0
}