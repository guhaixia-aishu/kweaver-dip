package large_language_model

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/kweaver-ai/idrm-go-frame/core/transport/rest/ginx"
	domain "github.com/kweaver-ai/kweaver-dip/chat-data/sailor-service/domain/intelligence"
)

type Service struct {
	uc domain.UseCase
}

func NewService(uc domain.UseCase) *Service {
	return &Service{uc: uc}
}

func (s *Service) errResp(c *gin.Context, err error) {
	c.Writer.WriteHeader(http.StatusBadRequest)
	ginx.ResErrJson(c, err)
}
