---
name: smart-search-tables
version: "1.0.0"
user-invocable: true
description: >-
  找表/找数端到端编排：**先确认** `base_url`、`user_id`、`token`；再用 query_object_instance 在元数据知识网络中检索表与资产相关实例，
  继而用 department_duty_query 按相关部门查询职责与数据治理边界，最后汇总为中文结论（表候选 + 职责 + 下一步）。
  候选视图/表清单**仅**能来自检索结果，且须同时具备非空 **UUID**、非空 **视图（技术）名称** 与非空 **业务名** 才展示，否则整行省略。
  当用户问「表在哪、哪个视图、数据资产归属、谁负责这类数据」时使用。
metadata:
  openclaw:
    skillKey: smart-search-tables
argument-hint: [找表/找数/资产定位类中文问题；可选 kn_id 覆盖]
---

# Smart Search Tables（找表 / 找数）

本 skill 定义 **固定先后顺序** 的找表工具链：先 **确认** `base_url`、`user_id`、`token`，再 **对象实例检索** 锁定表与元数据线索，继以 **部门职责语义查询** 补足治理与责任边界，最后 **总结**。子工具契约以同名 skill 为准；`references/` 提供编排说明、**样例**与跳转。

**OpenClaw**：`metadata.openclaw.skillKey` 为 `smart-search-tables`。流水线与默认 `base_url` / `tools.*.url_path` / `kn_id` / `user_id` 见 [config.json](config.json)。

在数据分析员工体系中，本 skill **宜由** [smart-data-analysis](../smart-data-analysis/SKILL.md) **总入口完成意图与 KN 编排后再进入执行**。

## 必读 references（按步骤）

| 步骤 | 说明 | Reference |
|------|------|-----------|
| 1 | 运行时可调用上下文：确认 `base_url`、`user_id`、`token`（**`base_url` / `user_id` 由 `kweaver auth whoami` 获取**） | [../kweaver-core/SKILL.md](../kweaver-core/SKILL.md)、[../smart-ask-data/references/text2sql.md](../smart-ask-data/references/text2sql.md)（`kweaver token` 等；与脚本 `--base-url` / `--account-id` / `--token` 对齐） |
| 2 | `query_object_instance`（找表/元数据实例） | [references/query-object-instance.md](references/query-object-instance.md) |
| 3 | `department_duty_query`（相关部门职责） | [references/department-duty-query.md](references/department-duty-query.md) |
| — | 端到端逻辑与总结要点 | [references/tool-examples.md](references/tool-examples.md) |


## 主流程（必须按序）

### Step 1：`runtime_ready`（运行时可调用上下文，必须有）

在进入 `query_object_instance` / `department_duty_query` **之前**，须逐项 **确认可用**（解析来源可多种，但结论必须明确写入本轮执行环境或脚本参数）。

**`base_url` 与 `user_id`**：优先通过命令 **`kweaver auth whoami`** 获取（须先 **`kweaver auth login`**）。将输出中的 **Issuer** 用作网关根地址 `base_url`；**User ID** 用作 `user_id`（即请求头 `x-account-id`、脚本 `--account-id`）。字段含义与兜底来源仍以 [smart-ask-data/references/text2sql.md](../smart-ask-data/references/text2sql.md) 为准。

| 项 | 含义 | 优先顺序（编排侧） |
|----|------|-------------------|
| `base_url` | 网关根地址（与 `url_path` 拼接前） | **`kweaver auth whoami` → Issuer**；其次 `KWEAVER_BASE_URL`、`--base-url` 等 |
| `user_id` | 请求头 `x-account-id`（脚本 `--account-id`） | **`kweaver auth whoami` → User ID**；其次 `config.json` 的 `defaults.user_id`、`--account-id` 等 |
| `token` | `Authorization` / 脚本认证 | `kweaver token` / `KWEAVER_TOKEN` / `QOI_TOKEN`、`DDQ_TOKEN` / `--token` 等；**不得**在对外交付中暴露完整 token |

三项 **任一项无法确认** → 按门禁终止，提示补足方式（含 `kweaver auth login`、环境变量或用户参数），**不得**进入 Step 2（对象实例检索）。

```text
找表进度：
- [ ] 1. **runtime_ready**：已确认 `base_url`、`user_id`、`token`（见上表）
- [ ] 2. 运行 [scripts/query_object_instance.py](scripts/query_object_instance.py)：在元数据 KN 下检索，得到表/视图候选与部门/主题线索；请求体三层结构见 [references/query-object-instance.md](references/query-object-instance.md)
- [ ] 3. 运行 [scripts/department_duty_query.py](scripts/department_duty_query.py)：根据线索构造职责问句并查询；格式见 [references/department-duty-query.md](references/department-duty-query.md)
- [ ] 4. 总结：候选表/视图列表须符合下文「最终交付：视图/表清单真实性」——仅含 Step 2 检索到的真实记录，且每条同时具备非空 **UUID**、非空 **技术名** 与非空 **业务名**；**有则**补充职责要点。若第 3 步失败（如 HTTP **404**，多与职责侧 `kn_id` 与环境不一致），简短说明即可，**仍以第 2 步结果为主要交付**；不暴露 token 与完整调试 URL
```

## 脚本查询（强制）

在完成 **Step 1** 后，两步 **必须使用本目录提供的脚本** 完成调用：`scripts/query_object_instance.py`、`scripts/department_duty_query.py`。默认 URL / `kn_id` 等与 [config.json](config.json) 及脚本一致，字段细节以 `references/` 为准。**禁止**在本 skill 内新建 `_tmp_*.py` / `_tmp_*.sh` 等临时代码作为 HTTP 请求入口。

在 PowerShell 中执行 Python 时，一律使用脚本的**完整路径**，不要依赖当前工作目录；同一条命令行里串联多个操作时，请使用分号（`;`）分隔，例如：`cd C:\path\to\repo; python C:\path\to\script.py ...`。

### 第 2 步：`query_object_instance`

- **脚本**：[scripts/query_object_instance.py](scripts/query_object_instance.py)
- **认证**：`--token` / `-t` 或位置参数；否则由脚本内部使用 `QOI_TOKEN` 和 `kweaver token` 主动获取
- **检索词**：`--search` / `-s` 或第 2 个位置参数（默认 `企业`）
- **必填参数**：
  - `--base-url` / `-b`：平台网关 `base_url`，可通过 `kweaver auth whoami` 的 **Issuer** 字段获取
  - `--account-id` / `-a`：请求头 `x-account-id`，可通过 `kweaver auth whoami` 的 **User ID** 字段获取
- **常用可选**：`--kn-id`、`--ot-id`、`--limit`、`--url-path`、`--x-business-domain`、`--insecure`、`--timeout`、`--out`
- **说明**：脚本内 `need_total` 为 `false`；`kn_id` 须为元数据网且符合 `SOUL.md`。

### 第 3 步：`department_duty_query`

- **脚本**：[scripts/department_duty_query.py](scripts/department_duty_query.py)
- **认证**：`--token` / `-t` 或位置参数；否则由脚本内部使用 `DDQ_TOKEN` 和 `kweaver token` 主动获取
- **必填参数**：
  - `--base-url` / `-b`：平台网关 `base_url`，可通过 `kweaver auth whoami` 的 **Issuer** 字段获取
- **问句**：`--query` / `-q` 或第 2 个位置参数（未给则用脚本内默认长句）
- **注意**：请求 JSON 内 **`kn_id` 当前固定 `menu_kg_dept_infosystem_duty`**，`--kn-id` 未写入 body。脚本会先向 stdout 打印请求体再发请求，联调时注意区分输出。
- **404**：不阻断第 2 步表/视图结论，见「步骤约束」。

## 临时文件清理（成功后）

本 skill 在调用子能力时，允许在“本机任务目录”创建临时脚本（用于组织请求 JSON/发起 HTTP）；**MUST NOT** 将临时脚本落在仓库 **`skills/`** 及其任意子目录下，若仓库内另有 **`.claude/skills/`** 等 skill 同步树亦同。**宜** 使用工作区根目录、系统临时目录等与上述路径隔离的位置。为减少磁盘残留，本 skill 增加清理门禁：

- MUST：当且仅当本轮流程成功完成到“总结（主流程进度条目 4）”并输出最终回复后，删除本轮创建的临时脚本文件。
- MUST：仅删除满足以下规则的文件名模式：以 `_tmp_` 开头，后缀为 `.py` / `.sh` / `.ps1`（大小写不敏感也视为匹配）。
- MUST：绝对不删除仓库中的任何 `*_request_example*` 样例脚本，或用户非本轮创建的临时文件。
- MUST：若流程在任一步骤发生异常并提前终止，则不删除临时脚本（保留用于排查）；在异常回执中可提示“临时脚本已保留”。
- MUST：若用户明确要求“保留调试文件/导出详情/展开详情”，则不删除相关临时脚本。

## 严格限定（找数场景）

- **来源强约束**：找表链路使用的知识网络（`kn_id_find_table`、`query_object_instance.query.kn_id`）必须来自 `SOUL.md` 已配置知识网络。
- **缺失处理**：若 `SOUL.md` 缺失或未配置可用知识网络，必须先提醒用户配置 `SOUL.md`，并暂停 **Step 2** 检索。
- **找数必须使用元数据知识网络**：当用户目标是“找数/找表/找字段/定位资产”时，**Step 2** `query_object_instance` 的 `query.kn_id` **只能**为元数据知识网络。
- **无元数据 KN 不得执行检索**：若当前上下文未提供元数据 KN（或 `kn_id` 不明确/不在元数据候选中），必须先向用户确认「请提供或确认元数据知识网络 kn_id」；确认前不得继续 **Step 2**。
- **口径冲突时优先安全**：若用户给出的 `kn_id` 与元数据用途不匹配，先提示并二次确认；未确认前停止执行。

## 最终交付：视图/表清单真实性（MUST）

面向用户的 **表/视图候选列表** 必须可复核、可追溯，**禁止**用推断或脏数据充数。

| 规则 | 说明 |
|------|------|
| **唯一来源** | 列表中的每一条必须 **直接出自 Step 2 `query_object_instance` 的返回**（如 `body.datas` 及其中可解析字段）。**禁止**从 Step 3 职责文本、培训材料、表名猜测或 LLM 补全中 **新增** 视图表项。 |
| **UUID 必填** | 每条须有 **非空** 的对象/实例 UUID（见 [query-object-instance.md](references/query-object-instance.md) 的 `view_uuid` 及平台等价字段）。解析不到、为空或占位符 → **整条不展示**。 |
| **视图（技术）名称必填** | 每条须有 **非空** 的 `view_tech_name` / `table_tech_name`（归并为 `technical_name`）。缺失或空串 → **整条不展示**。 |
| **业务名必填** | 每条须有 **非空** 的 `view_business_name` / `table_business_name`（归并为 `business_name`）。缺失或空串 → **整条不展示**。**禁止**用「暂无」、占位符或推测文案代替真实业务名。 |
| **零命中** | 若检索结果中 **没有任何** 条同时满足 **UUID + 技术名 + 业务名**，则列表为空，并如实说明；**禁止**虚构条目。 |

## 步骤约束（摘要）

1. **双 KN**：**Step 2** **`tools.query_object_instance.kn_id`**（常为元数据网，须写入请求 JSON 的 **`query.kn_id`**）；**Step 3** **`tools.department_duty_query.kn_id`**（常为职责网，如 `duty`）。**禁止**混用未经验证的 `kn_id`。
   - 上述 `kn_id` 均须来自 `SOUL.md` 配置；未配置不得调用。
2. **tool-box URL**：若 endpoint 含 **`agent-operator-integration/v1/tool-box/`**，**Step 2** POST 体必须为 **`body` + `query` + `header`** 结构（见 [query-object-instance reference](references/query-object-instance.md)）；**`include_logic_params` / `include_type_info` 用 JSON 布尔 `false`**。
3. **Step 3 的职责 `query`** 必须能由 **Step 2** 结果 **派生**；若 **Step 2** 无部门线索，则用用户原问题中的部门/组织词，或 **简要反问** 后再调职责查询。若职责脚本/接口返回 **404** 等错误，**仍须完整交付 Step 2 的表/视图结论**，并简短说明职责步骤未成功（常见为职责 `kn_id` 与环境不一致）。
4. **总结** 中区分：**事实发现**（检索到的表/视图）与 **治理描述**（职责库中的条文）；二者无法强绑定时如实说明。候选列表的收录规则以 **「最终交付：视图/表清单真实性」** 为准：仅展示同时具备 **非空 UUID**、**非空 `technical_name`** 与 **非空 `business_name`** 的条目；展示时以 **业务名** 为阅读主序且须 **完整全称**（不截断、不缩写）。**禁止**输出无法映射回 Step 2 单条记录的「视图」。
5. **映射约定**：在 `query_object_instance` 结果中，视图与表按同等关系处理；`view_tech_name` 等价于 `table_tech_name`（可归并为 `technical_name`），`view_business_name` 等价于 `table_business_name`（可归并为 `business_name`）；**`view_uuid`（或平台等价实例 id）及三类名称字段须在总结中随条保留**，且 **三者均解析成功且非空** 时才列入用户可见列表。
6. **禁止创建临时脚本作为入口**：本 skill 不得新建 `_tmp_*.py` / `_tmp_*.sh` 等临时文件作为 HTTP 请求入口；所有调用必须通过现有脚本或等价内嵌请求逻辑完成。

## 与 smart-data-analysis 的关系

由 [smart-data-analysis](../smart-data-analysis/SKILL.md) 路由到本 skill 时，主意图为 **找表/定位**；若上下文已有 `kn_id_find_table`，仅当其可确认是元数据知识网络时，才可用于 **Step 2** `query_object_instance` 的 `kn_id`。

若 `kn_id_find_table` 缺失、无法确认或与元数据用途冲突，必须先向用户确认元数据知识网络 `kn_id`，确认前不得执行 **Step 2** 检索。

用户后续要 **指标与 SQL 取数** → 转 [smart-ask-data](../smart-ask-data/SKILL.md)。

## 配置

- 统一默认：[config.json](config.json)
  - **`defaults`**：`user_id`、`x_business_domain`
  - **`base_url`**：平台网关域名；完整网关 URL 约定为 `base_url` + `tools.<tool>.url_path`
  - **`tools`**：默认在完成 **runtime_ready** 后执行 `query_object_instance`、`department_duty_query`；另外可选子工具包括 `custom_search_strategy`、`datasource_rerank`（**不加入**本 skill `pipeline`）。各工具均以 **`url_path`**、**`kn_id`**、**`user_id`** 为主要配置；若 `url_path` 含 **`agent-operator-integration/v1/tool-box/`**，**Step 2** 须按 [references/query-object-instance.md](references/query-object-instance.md) 组装 **`body` + `query`（含 `kn_id`/`ot_id`/布尔开关）+ `header`（`x-account-id`/`x-account-type`）**；默认值见 **`default_query`**、**`envelope_header`**
  - **`pipeline`**：每步 **`defaults_key`** 映射到 `tools` 中的键

## 调用示例

```text
/smart-search-tables 采购订单相关宽表在哪个库、叫什么，谁在数据治理里负责？
/smart-search-tables 销售域 KPI 用哪张汇总表，对应部门职责怎么说
```
