package infrastructure

import (
	"github.com/google/wire"
	"github.com/kweaver-ai/kweaver-dip/dsg/services/apps/data-exploration-service/infrastructure/repository/db"
)

var Set = wire.NewSet(
	db.NewData,
)
