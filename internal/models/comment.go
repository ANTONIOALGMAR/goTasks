package models

import "time"

type Comment struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	TaskID    uint      `json:"taskId"`
	Task      Task      `json:"-"`
	UserID    uint      `json:"userId"`
	User      User      `json:"-"`
	Content   string    `json:"content"`
	CreatedAt time.Time `json:"createdAt"`
	UpdatedAt time.Time `json:"updatedAt"`
}