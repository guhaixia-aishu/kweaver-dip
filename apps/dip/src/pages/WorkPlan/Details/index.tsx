import { Tabs } from 'antd'
import { useCallback, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import AgentIcon from '@/assets/icons/agent3.svg?react'
import IconFont from '@/components/IconFont'
import Outcome from '@/components/WorkPlanDetail/Outcome'
import Tasks from '@/components/WorkPlanDetail/Tasks'
import Conversation from './Conversation'
import styles from './index.module.less'

export type WorkPlanDetailTab = 'results' | 'tasks' | 'conversation'

/** 计划名称 mock，接入详情 API 后由服务端数据替换 */
const MOCK_PLAN_TITLE = 'agent集群新闻检索日报生成'

/** 工作计划详情（从全局列表或数字员工详情计划 Tab 进入时，通过 location.state.from 返回来源页；Tab 使用内部 state） */
const WorkPlanDetail = () => {
  const { workPlanId } = useParams<{ workPlanId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const from = (location.state as { from?: string } | null)?.from

  const [activeTab, setActiveTab] = useState<WorkPlanDetailTab>('results')

  const handleBack = useCallback(() => {
    if (from) {
      navigate(from)
      return
    }
    navigate('/work-plan')
  }, [from, navigate])

  const tabItems = useMemo(
    () => [
      { key: 'results' satisfies WorkPlanDetailTab, label: '成果' },
      { key: 'tasks' satisfies WorkPlanDetailTab, label: '任务' },
      { key: 'conversation' satisfies WorkPlanDetailTab, label: '对话' },
    ],
    [],
  )

  return (
    <div className="flex h-full flex-col overflow-hidden bg-[--dip-white]">
      <div className="grid h-12 shrink-0 grid-cols-3 items-center gap-2 border-b border-[--dip-border-color] pl-3 pr-6">
        <div className="flex min-w-0 items-center gap-2">
          <button
            type="button"
            onClick={handleBack}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[--dip-text-color]"
            aria-label="返回"
          >
            <IconFont type="icon-dip-left" />
          </button>
          <div className="flex min-w-0 items-center gap-3">
            <AgentIcon className="h-8 w-8 shrink-0 overflow-hidden rounded-md" aria-hidden />
            <div className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate font-medium text-[--dip-text-color]">
                {MOCK_PLAN_TITLE}
              </span>
              <span className="text-xs text-[--dip-text-color-65]">对话由 AI 生成</span>
            </div>
          </div>
        </div>
        <div className="flex min-w-0 justify-center self-end">
          <Tabs
            activeKey={activeTab}
            items={tabItems}
            size="small"
            className={styles.tabs}
            onChange={(key) => setActiveTab(key as WorkPlanDetailTab)}
            styles={{
              header: { padding: '0', margin: '0' },
              indicator: { backgroundColor: 'var(--dip-text-color)' },
            }}
          />
        </div>
        <div className="flex min-w-0 items-center justify-end gap-2" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        {activeTab === 'results' ? <Outcome planId={workPlanId} /> : null}
        {/* {activeTab === 'tasks' ? <Tasks planId={workPlanId} /> : null} */}
        {activeTab === 'conversation' ? <Conversation planId={workPlanId} /> : null}
      </div>
    </div>
  )
}

export default WorkPlanDetail
