package models

import "time"

type Notification struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserID    uint      `json:"userId"`
	TaskID    uint      `json:"taskId"`
	Type      string    `json:"type"`    // e.g., "due_soon", "overdue", "comment"
	Message   string    `json:"message"` // texto amigável
	Read      bool      `json:"read"`    // lida?
	CreatedAt time.Time `json:"createdAt"`
}