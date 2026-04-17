package v1

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"testing"

	"github.com/gin-gonic/gin"
	"github.com/stretchr/testify/assert"

	"github.com/kweaver-ai/kweaver-dip/dsg/services/apps/configuration-center/common/errorcode"
	"github.com/kweaver-ai/kweaver-dip/dsg/services/apps/configuration-center/common/form_validator"
	"github.com/kweaver-ai/kweaver-dip/dsg/services/apps/configuration-center/common/util/ptr"
)

func TestService_ExistenceCheckPrefix(t *testing.T) {
	form_validator.SetupValidator()

	const apiPath = "/api/configuration-center/v1/uniqueness-check/prefix"

	tests := []struct {
		name string

		uc *FakeUseCase

		request string

		statusCode int
		response   string
	}{
		{
			name:       "检查前缀 存在",
			uc:         &FakeUseCase{Bool: true},
			request:    "existence_check_prefix_0_req.json",
			statusCode: http.StatusOK,
			response:   "existence_check_prefix_0_resp.json",
		},
		{
			name:       "检查前缀 不存在",
			uc:         &FakeUseCase{Bool: false},
			request:    "existence_check_prefix_0_req.json",
			statusCode: http.StatusOK,
			response:   "existence_check_prefix_1_resp.json",
		},
		{
			name:       "发生未定义的错误",
			uc:         &FakeUseCase{Err: errors.New("something wrong")},
			request:    "existence_check_prefix_0_req.json",
			statusCode: http.StatusInternalServerError,
			response:   "resp_error_undefined.json",
		},
		{
			name:       "数据库错误",
			uc:         &FakeUseCase{Err: errorcode.Desc(errorcode.CodeGenerationRuleDatabaseError)},
			request:    "existence_check_prefix_0_req.json",
			statusCode: http.StatusInternalServerError,
			response:   "resp_error_database_error.json",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			s := &Service{
				uc: tt.uc,
			}

			router := gin.New()
			router.POST(apiPath, s.ExistenceCheckPrefix)

			r, err := os.Open(filepath.Join("testdata", tt.request))
			if err != nil {
				t.Fatal(err)
			}
			defer r.Close()

			w := httptest.NewRecorder()
			req, err := http.NewRequest(http.MethodPost, apiPath, r)
			if err != nil {
				t.Fatal(err)
			}

			router.ServeHTTP(w, req)
			t.Logf("response %d: %s", w.Code, w.Body)

			assert.Equal(t, tt.statusCode, w.Code, "status code")
			assertResponseJSON(t, tt.response, w.Body)
		})
	}
}

func TestValidateExistenceCheckPrefixRequest(t *testing.T) {
	tests := []struct {
		name       string
		req        *ExistenceCheckPrefixRequest
		assertFunc ErrorListAssertionFunc
	}{
		{
			name:       "缺少属性 prefix",
			req:        &ExistenceCheckPrefixRequest{},
			assertFunc: AssertErrorListOne,
		},
		{
			name: "仅有属性 prefix 不合法",
			req: &ExistenceCheckPrefixRequest{
				Prefix: ptr.To("xxxx"),
			},
			assertFunc: AssertErrorListOne,
		},
		{
			name: "所有属性都合法",
			req: &ExistenceCheckPrefixRequest{
				Prefix: ptr.To("AA"),
			},
			assertFunc: AssertErrorListEmpty,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.assertFunc(t, ValidateExistenceCheckPrefixRequest(tt.req, nil))
		})
	}
}

func TestValidatePrefixValue(t *testing.T) {
	tests := []struct {
		name       string
		value      string
		assertFunc ErrorListAssertionFunc
	}{
		{
			name:       "合法 长度 2",
			value:      "AB",
			assertFunc: AssertErrorListEmpty,
		},
		{
			name:       "合法 长度 6",
			value:      "ABCDEF",
			assertFunc: AssertErrorListEmpty,
		},
		{
			name:       "过短",
			value:      "A",
			assertFunc: AssertErrorListOne,
		},
		{
			name:       "过长",
			value:      "ABCDEFG",
			assertFunc: AssertErrorListOne,
		},
		{
			name:       "小写字母",
			value:      "ab",
			assertFunc: AssertErrorListOne,
		},
		{
			name:       "表情",
			value:      "🙂",
			assertFunc: AssertErrorListOne,
		},
		{
			name:       "特殊字符",
			value:      "A*",
			assertFunc: AssertErrorListOne,
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			tt.assertFunc(t, ValidatePrefixValue(tt.value, nil))
		})
	}
}
