package errorcode

import "github.com/kweaver-ai/kweaver-dip/dsg/services/apps/basic-search/common/constant"

func init() {
	registerErrorCode(dataCatalogErrorMap)
}

const (
	dataCatalogPre = constant.ServiceName + "." + dataCatalogModelName + "."
)

var dataCatalogErrorMap = errorCode{}
