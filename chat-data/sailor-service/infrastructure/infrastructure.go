package infrastructure

import (
	"github.com/google/wire"
	"github.com/kweaver-ai/kweaver-dip/chat-data/sailor-service/infrastructure/repository/db"
)

var Set = wire.NewSet(
	db.NewData,
)
