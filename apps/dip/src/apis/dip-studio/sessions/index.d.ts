/**
 * 会话（Sessions）API 类型
 * 与 sessions.paths.yaml / sessions.schemas.yaml 保持一致
 */

/** 会话默认模型配置（SessionDefaults） */
export type SessionDefaults = {
  modelProvider?: string
  model?: string
  contextTokens?: number
} & Record<string, unknown>

/** 会话来源信息（SessionOrigin） */
export type SessionOrigin = {
  provider?: string
  surface?: string
  chatType?: string
} & Record<string, unknown>

/** 会话投递上下文（SessionDeliveryContext） */
export type SessionDeliveryContext = {
  channel?: string
} & Record<string, unknown>

/** 会话摘要（SessionSummary） */
export type SessionSummary = {
  key: string
  kind: string
  updatedAt: number
  sessionId: string
  label?: string
  displayName?: string
  chatType?: string
  origin?: SessionOrigin
  deliveryContext?: SessionDeliveryContext
  lastChannel?: string
  systemSent?: boolean
  abortedLastRun?: boolean
  totalTokensFresh?: boolean
  modelProvider?: string
  model?: string
  contextTokens?: number
} & Record<string, unknown>

/** 会话列表响应（SessionsListResponse） */
export type SessionsListResponse = {
  ts: number
  path: string
  count: number
  sessions: SessionSummary[]
  defaults?: SessionDefaults
} & Record<string, unknown>

/** 会话消息（SessionMessage） */
export type SessionMessage = {
  id?: string
  role?: string
  /** 消息内容，结构随上游返回 */
  content?: unknown
  ts?: number
} & Record<string, unknown>

/** 单个会话消息响应（SessionGetResponse） */
export type SessionGetResponse = {
  key: string
  messages?: SessionMessage[]
} & Record<string, unknown>

/** 会话预览请求（SessionsPreviewRequest） */
export interface SessionsPreviewRequest {
  keys: string[]
  limit?: number
}

/** 会话预览项（SessionPreviewItem） */
export type SessionPreviewItem = {
  key: string
  messages?: SessionMessage[]
} & Record<string, unknown>

/** 会话预览响应（SessionsPreviewResponse） */
export type SessionsPreviewResponse = {
  items?: SessionPreviewItem[]
} & Record<string, unknown>

/** 归档项类型（SessionArchiveEntry.type） */
export type SessionArchiveEntryType = 'file' | 'directory' | 'other'

/** 归档项（SessionArchiveEntry） */
export type SessionArchiveEntry = {
  name: string
  type: SessionArchiveEntryType
} & Record<string, unknown>

/** 会话归档物列表响应（SessionArchivesResponse） */
export type SessionArchivesResponse = {
  path: string
  contents: SessionArchiveEntry[]
} & Record<string, unknown>

// --- Query：会话列表（全局 / 按数字员工）---

/** 列表 query 公共字段 */
type SessionsListQueryBase = {
  limit?: number
  search?: string
  includeDerivedTitles?: boolean
  includeLastMessage?: boolean
  activeMinutes?: number
  label?: string
  includeGlobal?: boolean
  includeUnknown?: boolean
}

/** getSessionsList */
export type GetSessionsListParams = SessionsListQueryBase & {
  /** 过滤特定 Agent 的会话 */
  agentId?: string
}

/** getDigitalHumanSessionsList（路径已含数字员工，无 agentId） */
export type GetDigitalHumanSessionsListParams = SessionsListQueryBase

/** getDigitalHumanSessionMessages */
export interface GetDigitalHumanSessionMessagesParams {
  limit?: number
}
