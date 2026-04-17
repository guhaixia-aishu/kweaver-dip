package gorm

import (
	"github.com/google/wire"
	"github.com/kweaver-ai/kweaver-dip/dsg/services/apps/data-subject/infrastructure/db"
	"github.com/kweaver-ai/kweaver-dip/dsg/services/apps/data-subject/infrastructure/mq/kafka"
)

var Set = wire.NewSet(
	db.NewDB,
	kafka.NewSyncProducer,
)
