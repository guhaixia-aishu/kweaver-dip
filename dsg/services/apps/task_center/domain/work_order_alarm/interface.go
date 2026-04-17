package work_order_alarm

import (
	"github.com/kweaver-ai/kweaver-dip/dsg/services/apps/task_center/adapter/driver/work_order_single/v1"
)

type Interface interface {
	work_order_single.WorkOrderReconcilerGetter
}
