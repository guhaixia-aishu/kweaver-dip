// import { message, Spin } from 'antd'
// import { throttle } from 'lodash'
// import { memo, useCallback, useEffect, useMemo, useRef, useState } from 'react'
// import { List } from 'react-window'
// import type { CronRunEntry } from '@/apis/dip-studio/plan'
// import { getDigitalHumanPlanRuns } from '@/apis/dip-studio/plan'
// import Empty from '@/components/Empty'
// import ScrollBarContainer from '@/components/ScrollBarContainer'
// import { mockFetchPlanRunsPage, PLAN_LIST_USE_MOCK } from './mockPlanList'
// import PlanListItem from './PlanListItem'
// import {
//   DEFAULT_PAGE_SIZE,
//   PLAN_LIST_ROW_HEIGHT,
//   type TasksProps,
//   SCROLL_THRESHOLD_PX,
// } from './types'

// function TasksInner({
//   planId,
//   pageSize = DEFAULT_PAGE_SIZE,
//   className,
//   onRunClick,
// }: TasksProps) {
//   const offsetRef = useRef(0)
//   const hasMoreRef = useRef(true)
//   const isLoadingMoreRef = useRef(false)
//   const requestIdRef = useRef(0)

//   const [runs, setRuns] = useState<CronRunEntry[]>([])
//   const [initialLoading, setInitialLoading] = useState(true)
//   const [loadingMore, setLoadingMore] = useState(false)

//   const fetchPage = useCallback(
//     async (isLoadMore: boolean) => {
//       const id = planId?.trim()
//       if (!id) {
//         setRuns([])
//         setInitialLoading(false)
//         return
//       }

//       if (isLoadMore) {
//         if (!hasMoreRef.current || isLoadingMoreRef.current) return
//         isLoadingMoreRef.current = true
//         setLoadingMore(true)
//       } else {
//         hasMoreRef.current = true
//         offsetRef.current = 0
//         isLoadingMoreRef.current = false
//         setInitialLoading(true)
//       }

//       const currentOffset = isLoadMore ? offsetRef.current : 0
//       const reqId = ++requestIdRef.current

//       try {
//         const params = { offset: currentOffset, limit: pageSize }
//         const res = PLAN_LIST_USE_MOCK
//           ? await mockFetchPlanRunsPage(currentOffset, pageSize)
//           : await getDigitalHumanPlanRuns(id, params)

//         if (reqId !== requestIdRef.current) return

//         hasMoreRef.current = res.hasMore
//         offsetRef.current = res.nextOffset ?? currentOffset + res.entries.length

//         if (isLoadMore) {
//           setRuns((prev) => [...prev, ...res.entries])
//         } else {
//           setRuns(res.entries)
//         }
//       } catch (err: unknown) {
//         if (reqId !== requestIdRef.current) return
//         const desc = (err as { description?: string })?.description
//         if (desc) message.error(desc)
//         else message.error('加载运行记录失败')
//         if (!isLoadMore) setRuns([])
//       } finally {
//         if (reqId === requestIdRef.current) {
//           isLoadingMoreRef.current = false
//           setLoadingMore(false)
//           setInitialLoading(false)
//         }
//       }
//     },
//     [pageSize, planId],
//   )

//   useEffect(() => {
//     void fetchPage(false)
//   }, [fetchPage])

//   const handleScroll = useMemo(
//     () =>
//       throttle((params: { target?: HTMLElement }) => {
//         const target = params?.target
//         if (!target || isLoadingMoreRef.current || !hasMoreRef.current) return
//         const { scrollTop, clientHeight, scrollHeight } = target
//         if (scrollHeight - scrollTop - clientHeight > SCROLL_THRESHOLD_PX) return
//         void fetchPage(true)
//       }, 150),
//     [fetchPage],
//   )

//   useEffect(() => () => handleScroll.cancel(), [handleScroll])

//   const getRow = useCallback(
//     ({ index, style, data }: any) => {
//       const run = data[index] as CronRunEntry | undefined
//       if (!run) return null
//       return (
//         <div style={style} className="box-border px-6 pb-3">
//           <PlanListItem run={run} onClick={onRunClick} />
//         </div>
//       )
//     },
//     [onRunClick],
//   )

//   if (!planId?.trim()) {
//     return (
//       <div className={`flex flex-1 min-h-0 items-center justify-center px-6 ${className ?? ''}`}>
//         <Empty title="暂无数据" />
//       </div>
//     )
//   }

//   if (initialLoading) {
//     return (
//       <div className={`flex flex-1 min-h-0 items-center justify-center ${className ?? ''}`}>
//         <Spin />
//       </div>
//     )
//   }

//   if (runs.length === 0) {
//     return (
//       <div className={`flex flex-1 min-h-0 items-center justify-center px-6 ${className ?? ''}`}>
//         <Empty title="暂无数据" />
//       </div>
//     )
//   }

//   return (
//     <div className={`flex flex-1 min-h-0 flex-col overflow-hidden ${className ?? ''}`}>
//       <div className="flex min-h-0 flex-1 flex-col">
//         <div className="min-h-0 flex-1">
//           <List
//             tagName={ScrollBarContainer as any}
//             className="h-full w-full"
//             rowComponent={getRow}
//             rowCount={runs.length}
//             rowHeight={PLAN_LIST_ROW_HEIGHT}
//             rowProps={{
//               data: runs,
//             }}
//             style={{ height: '100%', width: '100%' }}
//             onScroll={(e) => {
//               handleScroll({ target: e.currentTarget })
//             }}
//           />
//         </div>
//         {loadingMore ? (
//           <div className="flex shrink-0 justify-center px-6 py-2">
//             <Spin size="small" />
//           </div>
//         ) : null}
//       </div>
//     </div>
//   )
// }

// const Tasks = memo(TasksInner)
// export default Tasks
