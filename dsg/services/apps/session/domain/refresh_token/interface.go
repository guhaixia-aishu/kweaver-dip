package refresh_token

import (
	"context"

	"github.com/kweaver-ai/kweaver-dip/dsg/services/apps/session/common/cookie_util"
)

type RefreshService interface {
	DoRefresh(ctx context.Context, cookies *cookie_util.CookieValue) (*DoRefresh, error)
}
type DoRefresh struct {
	Token string
}
