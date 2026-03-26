package recommend

import domain "github.com/kweaver-ai/kweaver-dip/chat-data/sailor-service/domain/recommend"

type Service struct {
	uc domain.UseCase
}

func NewService(uc domain.UseCase) *Service {
	return &Service{uc: uc}
}
