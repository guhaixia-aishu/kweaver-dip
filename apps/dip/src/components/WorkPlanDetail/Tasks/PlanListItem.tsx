// import {
//   ClockCircleOutlined,
//   CloseCircleOutlined,
//   LoadingOutlined,
//   MinusCircleOutlined,
// } from '@ant-design/icons'
// import { memo } from 'react'
// import type { CronRunEntry } from '@/apis/dip-studio/plan'
// import IconFont from '@/components/IconFont'
// import type { PlanListItemProps } from './types'
// import { planListPillBase } from './types'
// import { getRunDisplayStyle, rightRunStatusPill, runTimePillText } from './utils'

// function PlanLeftIcon({ run }: { run: CronRunEntry }) {
//   const { status, leftIcon } = getRunDisplayStyle(run)
//   const box = `flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${leftIcon.boxClassName}`

//   switch (status) {
//     case 'disabled':
//       return (
//         <div className={box}>
//           <MinusCircleOutlined className={leftIcon.iconClassName} />
//         </div>
//       )
//     case 'running':
//       return (
//         <div className={box}>
//           <LoadingOutlined spin className={leftIcon.iconClassName} />
//         </div>
//       )
//     case 'ok':
//       return (
//         <div className={box}>
//           <IconFont type="icon-dip-check" className={leftIcon.iconClassName} />
//         </div>
//       )
//     case 'error':
//       return (
//         <div className={box}>
//           <CloseCircleOutlined className={leftIcon.iconClassName} />
//         </div>
//       )
//     case 'pending':
//     case 'skipped':
//       return (
//         <div className={box}>
//           <ClockCircleOutlined className={leftIcon.iconClassName} />
//         </div>
//       )
//   }
// }

// function PlanListItemInner({ run, onClick }: PlanListItemProps) {
//   const statusPill = rightRunStatusPill(run)
//   const title = run.jobName ?? run.summary ?? run.jobId ?? '—'

//   return (
//     <button
//       type="button"
//       onClick={() => onClick?.(run)}
//       className="flex w-full items-center gap-4 rounded-lg bg-[--dip-white] px-4 py-3 text-left transition-all border border-[#EAEEF3]"
//     >
//       <PlanLeftIcon run={run} />

//       <div className="min-w-0 flex-1 flex flex-col gap-1">
//         <div className="flex items-center gap-2">
//           <span className="font-medium text-[--dip-text-color] truncate" title={title}>
//             {title}
//           </span>
//         </div>
//       </div>

//       <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
//         <span
//           className={`${planListPillBase} bg-[rgba(0,0,0,0.04)] text-[rgba(0,0,0,0.65)]`}
//           title={run.summary}
//         >
//           <ClockCircleOutlined className="shrink-0 text-[10px]" />
//           <span className="truncate">{runTimePillText(run)}</span>
//         </span>
//         <span className={`${planListPillBase} ${statusPill.className}`}>{statusPill.text}</span>
//       </div>
//     </button>
//   )
// }

// const PlanListItem = memo(PlanListItemInner)
// export default PlanListItem
