package tasks

type Store interface {
	Migrate() error
	List(limit, offset int) ([]Task, error)
	Create(title, description string) (Task, error)
	Get(id int) (Task, error)
	Update(id int, title *string, description *string, done *bool) (Task, error)
	Delete(id int) error
}