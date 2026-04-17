package v1

import (
	domain "github.com/kweaver-ai/kweaver-dip/dsg/services/apps/configuration-center/domain/code_generation_rule"
)

type Service struct {
	uc domain.UseCase
}

func NewService(uc domain.UseCase) *Service { return &Service{uc: uc} }
