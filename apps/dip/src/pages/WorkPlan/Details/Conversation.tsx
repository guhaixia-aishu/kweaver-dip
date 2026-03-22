import { Empty } from 'antd'

export type ConversationProps = {
  planId?: string
}

/** 对话 Tab（接入会话 API 后替换） */
const Conversation = ({ planId: _planId }: ConversationProps) => {
  return (
    <div className="flex flex-1 flex-col items-center justify-center px-6 pb-12">
      <Empty description="暂无对话记录" />
    </div>
  )
}

export default Conversation
