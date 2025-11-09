package notify

import (
	"log"
	"time"

	"gorm.io/gorm"

	"goTasks/internal/models"
	"goTasks/internal/ws"
)

type Scheduler struct {
	db   *gorm.DB
	hub  *ws.Hub
	stop chan struct{}
}

func NewScheduler(db *gorm.DB, hub *ws.Hub) *Scheduler {
	return &Scheduler{db: db, hub: hub, stop: make(chan struct{})}
}

func (s *Scheduler) Start() {
	go func() {
		ticker := time.NewTicker(1 * time.Minute)
		defer ticker.Stop()
		for {
			select {
			case <-ticker.C:
				if err := s.runOnce(); err != nil {
					log.Printf("scheduler run error: %v", err)
				}
			case <-s.stop:
				return
			}
		}
	}()
}

func (s *Scheduler) Stop() {
	close(s.stop)
}

func (s *Scheduler) runOnce() error {
	now := time.Now()
	soon := now.Add(24 * time.Hour)

	// Seleciona tarefas com dueDate definido e não concluídas
	var tasks []models.Task
	if err := s.db.
		Where("due_date IS NOT NULL").
		Where("status <> ?", models.StatusDone).
		Find(&tasks).Error; err != nil {
		return err
	}

	for _, t := range tasks {
		if t.DueDate == nil {
			continue
		}
		d := *t.DueDate
		// Overdue
		if d.Before(now) {
			if err := s.createUniqueNotification(t.OwnerID, t.ID, "overdue", "Tarefa atrasada: "+t.Title, 12*time.Hour); err != nil {
				log.Printf("notify overdue err: %v", err)
			}
			continue
		}
		// Due soon (próximas 24h)
		if d.After(now) && d.Before(soon) {
			if err := s.createUniqueNotification(t.OwnerID, t.ID, "due_soon", "Tarefa vence em breve: "+t.Title, 12*time.Hour); err != nil {
				log.Printf("notify due_soon err: %v", err)
			}
		}
	}
	return nil
}

// Cria notificação evitando duplicatas recentes (janela de dedupe)
func (s *Scheduler) createUniqueNotification(userID, taskID uint, typ, msg string, dedupeWindow time.Duration) error {
	// Verifica se já existe notificação não lida igual nas últimas X horas
	var count int64
	cut := time.Now().Add(-dedupeWindow)
	if err := s.db.Model(&models.Notification{}).
		Where("user_id = ? AND task_id = ? AND type = ? AND read = ? AND created_at >= ?", userID, taskID, typ, false, cut).
		Count(&count).Error; err != nil {
		return err
	}
	if count > 0 {
		return nil
	}

	n := models.Notification{
		UserID:  userID,
		TaskID:  taskID,
		Type:    typ,
		Message: msg,
		Read:    false,
	}
	if err := s.db.Create(&n).Error; err != nil {
		return err
	}

	// Broadcast WS
	s.hub.Broadcast(ws.Event{Type: "notification.created", Payload: n})
	return nil
}