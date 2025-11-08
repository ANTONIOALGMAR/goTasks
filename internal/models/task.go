package models

import "time"

type TaskStatus string

const (
	StatusTodo  TaskStatus = "todo"
	StatusDoing TaskStatus = "doing"
	StatusDone  TaskStatus = "done"
)

type Task struct {
	ID          uint       `gorm:"primaryKey" json:"id"`
	Title       string     `json:"title"`
	Description string     `json:"description"`
	Status      TaskStatus `gorm:"type:varchar(16)" json:"status"`
	DueDate     *time.Time `json:"dueDate,omitempty"`
	OwnerID     uint       `json:"ownerId"`
	Owner       User       `json:"owner"`
	CreatedAt   time.Time  `json:"createdAt"`
	UpdatedAt   time.Time  `json:"updatedAt"`
}