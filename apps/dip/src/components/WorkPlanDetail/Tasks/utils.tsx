// import type { CronRunEntry } from '@/apis/dip-studio/plan'
// import { formatTimeMinute } from '@/utils/handle-function/FormatTime'
// import type {
//   PlanJobDisplayStatus,
//   PlanJobDisplayStyle,
//   PlanJobLeftIconStyle,
//   PlanStatusPill,
// } from './types'

// type PlanRunDisplayEntry = { pill: PlanStatusPill; leftIcon: PlanJobLeftIconStyle }

// const PLAN_RUN_DISPLAY: Record<PlanJobDisplayStatus, PlanRunDisplayEntry> = {
//   disabled: {
//     pill: {
//       text: '已停用',
//       className: 'bg-[rgba(0,0,0,0.06)] text-[rgba(0,0,0,0.45)]',
//     },
//     leftIcon: {
//       boxClassName: 'bg-[rgba(0,0,0,0.06)]',
//       iconClassName: 'text-lg text-[rgba(0,0,0,0.45)]',
//     },
//   },
//   running: {
//     pill: {
//       text: '执行中',
//       className: 'bg-[#ECF2FA] text-[#497ED2]',
//     },
//     leftIcon: {
//       boxClassName: 'bg-[#ECF2FA]',
//       iconClassName: 'text-[#497ED2]',
//     },
//   },
//   ok: {
//     pill: {
//       text: '已完成',
//       className: 'bg-[#E9F6EF] text-[#519B72]',
//     },
//     leftIcon: {
//       boxClassName: 'bg-[#E9F6EF]',
//       iconClassName: 'text-xl text-[#519B72]',
//     },
//   },
//   error: {
//     pill: {
//       text: '失败',
//       className: 'bg-[rgba(255,77,79,0.12)] text-[#ff4d4f]',
//     },
//     leftIcon: {
//       boxClassName: 'bg-[rgba(255,77,79,0.12)]',
//       iconClassName: 'text-xl text-[#ff4d4f]',
//     },
//   },
//   pending: {
//     pill: {
//       text: '待执行',
//       className: 'bg-[rgba(0,0,0,0.06)] text-[rgba(0,0,0,0.65)]',
//     },
//     leftIcon: {
//       boxClassName: 'bg-[rgba(0,0,0,0.06)]',
//       iconClassName: 'text-lg text-[rgba(0,0,0,0.45)]',
//     },
//   },
//   skipped: {
//     pill: {
//       text: '已跳过',
//       className: 'bg-[rgba(0,0,0,0.06)] text-[rgba(0,0,0,0.65)]',
//     },
//     leftIcon: {
//       boxClassName: 'bg-[rgba(0,0,0,0.06)]',
//       iconClassName: 'text-lg text-[rgba(0,0,0,0.45)]',
//     },
//   },
// }

// /** 从运行记录 `status` 解析展示状态 */
// export function getRunDisplayStatus(entry: CronRunEntry): PlanJobDisplayStatus {
//   const s = entry.status?.toLowerCase() ?? ''
//   if (s === 'running' || s === 'in_progress') return 'running'
//   if (s === 'ok' || s === 'success') return 'ok'
//   if (s === 'error' || s === 'failed') return 'error'
//   if (s === 'skipped') return 'skipped'
//   return 'pending'
// }

// /** 左侧图标 + 右侧状态胶囊的完整样式 */
// export function getRunDisplayStyle(entry: CronRunEntry): PlanJobDisplayStyle {
//   const status = getRunDisplayStatus(entry)
//   const row = PLAN_RUN_DISPLAY[status]
//   const pill = { ...row.pill }
//   return { status, pill, leftIcon: row.leftIcon }
// }

// export function rightRunStatusPill(entry: CronRunEntry): PlanStatusPill {
//   return getRunDisplayStyle(entry).pill
// }

// /** 右侧时间胶囊：优先展示运行时间，否则记录时间 */
// export function runTimePillText(entry: CronRunEntry): string {
//   const t = entry.runAtMs ?? entry.ts
//   if (t == null) return ''
//   return formatTimeMinute(t)
// : 'text-lg text-[rgba(0,0,0,0.45)]',
//     },
//   },
// }

// /** 从 CronJob 解析展示状态（与 lastRunStatus：ok / error / skipped 等对齐） */
// export function getPlanJobDisplayStatus(job: CronJob): PlanJobDisplayStatus {
//   if (!job.enabled) return 'disabled'
//   if (job.state?.runningAtMs) return 'running'
//   const last = job.state?.lastRunStatus?.toLowerCase()
//   if (last === 'ok') return 'ok'
//   if (last === 'error') return 'error'
//   if (last === 'skipped') return 'skipped'
//   return 'pending'
// }

// /** 左侧图标 + 右侧状态胶囊的完整样式（颜色与语义统一） */
// export function getPlanJobDisplayStyle(job: CronJob): PlanJobDisplayStyle {
//   const status = getPlanJobDisplayStatus(job)
//   const row = PLAN_JOB_DISPLAY[status]
//   const pill = { ...row.pill }
//   return { status, pill, leftIcon: row.leftIcon }
// }

// export function rightStatusPill(job: CronJob): PlanStatusPill {
//   return getPlanJobDisplayStyle(job).pill
// }
