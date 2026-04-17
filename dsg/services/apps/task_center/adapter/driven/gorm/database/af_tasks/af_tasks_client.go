package af_tasks

import "gorm.io/gorm"

type AFTasksClient struct {
	db *gorm.DB

	dbName string
}

// WorkOrders implements AFTasksInterface.
func (c *AFTasksClient) WorkOrders() WorkOrderInterface {
	return newWorkOrders(c.db, c.dbName)
}

var _ AFTasksInterface = &AFTasksClient{}

func New(db *gorm.DB) *AFTasksClient {
	return NewWithDBName(db, "kweaver")
}

func NewWithDBName(db *gorm.DB, dbName string) *AFTasksClient {
	return &AFTasksClient{db: db, dbName: dbName}
}
