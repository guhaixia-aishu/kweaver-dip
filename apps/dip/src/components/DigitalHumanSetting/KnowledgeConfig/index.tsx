import { Button, Tooltip } from 'antd'
import { memo, useMemo, useState } from 'react'
import type { KnowledgeNetworkInfo } from '@/apis'
import type { BknEntry } from '@/apis/dip-studio/digital-human'
import Empty from '@/components/Empty'
import IconFont from '@/components/IconFont'
import ScrollBarContainer from '@/components/ScrollBarContainer'
import SearchInput from '@/components/SearchInput'
import { useDigitalHumanStore } from '../digitalHumanStore'
import SelectKnowledgeModal from './SelectKnowledgeModal'

interface KnowledgeConfigProps {
  readonly?: boolean
}

const KnowledgeConfig = ({ readonly }: KnowledgeConfigProps) => {
  const { bkn, updateBkn, deleteBkn } = useDigitalHumanStore()
  const [searchValue, setSearchValue] = useState('')
  const [selectKnowledgeModalOpen, setSelectKnowledgeModalOpen] = useState(false)

  /** 过滤后的知识网络列表 */
  const filteredKnowledgeList = useMemo(() => {
    if (!searchValue.trim()) {
      return bkn
    }
    const keyword = searchValue.trim().toLowerCase()
    return bkn.filter((item) => item.name?.toLowerCase().includes(keyword))
  }, [bkn, searchValue])

  /** 搜索知识网络 */
  const handleSearch = (value: string) => {
    setSearchValue(value)
  }

  /** 选择知识网络 */
  const handleSelectKnowledge = () => {
    setSelectKnowledgeModalOpen(true)
  }

  /** 选择知识网络结果 */
  const handleSelectKnowledgeResult = (result: KnowledgeNetworkInfo[]) => {
    const next: BknEntry[] = result.map((k) => ({
      name: k.name,
      url: k.id,
    }))
    updateBkn(next)
  }

  /** 渲染知识网络列表 */
  const renderKnowledgeList = () => {
    return (
      <ScrollBarContainer className="mt-4 w-full flex flex-col gap-y-1 px-6">
        {filteredKnowledgeList.map((item) => (
          <div
            key={item.url}
            className="w-full flex items-center gap-x-2 border border-[--dip-border-color] rounded p-2 pl-3"
          >
            <IconFont type="icon-dip-KG1" />
            <span className="truncate flex-1" title={item.name}>
              {item.name}
            </span>
            {!readonly && (
              <Tooltip title="删除">
                <IconFont
                  type="icon-dip-trash"
                  className="w-8 h-8 flex-shrink-0 flex items-center justify-center hover:bg-[--dip-hover-bg-color-4] rounded"
                  onClick={() => deleteBkn(item.url)}
                />
              </Tooltip>
            )}
          </div>
        ))}
      </ScrollBarContainer>
    )
  }

  /** 渲染状态内容 */
  const renderStateContent = () => {
    if (bkn.length === 0) {
      return (
        <Empty title="暂无知识网络">
          {readonly ? undefined : (
            <Button
              className="mt-2"
              type="primary"
              icon={<IconFont type="icon-dip-add" />}
              onClick={() => {
                handleSelectKnowledge()
              }}
            >
              选择知识网络
            </Button>
          )}
        </Empty>
      )
    }

    if (filteredKnowledgeList.length === 0) {
      return <Empty type="search" desc="抱歉，没有找到相关内容" />
    }

    return null
  }

  const renderContent = () => {
    const stateContent = renderStateContent()

    if (stateContent) {
      return <div className="absolute inset-0 flex items-center justify-center">{stateContent}</div>
    }

    return renderKnowledgeList()
  }

  return (
    <ScrollBarContainer className="h-full flex flex-col py-6 relative flex-1">
      <div className="flex justify-between px-6">
        <div className="flex flex-col gap-y-1">
          <div className="font-medium text-[--dip-text-color]">知识配置</div>
          <div className="text-[--dip-text-color-45]">
            选择该数字员工需要关联的业务知识网络（BKN）。数字员工将基于这些知识网络回答问题和执行任务。
          </div>
        </div>
        {bkn.length > 0 && !readonly && (
          <div className="flex items-end gap-x-3">
            <SearchInput
              onSearch={handleSearch}
              placeholder="搜索知识网络"
              variant="outlined"
              className="!rounded"
            />
            <Button
              type="primary"
              icon={<IconFont type="icon-dip-add" />}
              onClick={handleSelectKnowledge}
            >
              选择知识网络
            </Button>
          </div>
        )}
      </div>
      {renderContent()}

      {/* 选择知识网络弹窗 */}
      <SelectKnowledgeModal
        open={selectKnowledgeModalOpen}
        onOk={handleSelectKnowledgeResult}
        onCancel={() => setSelectKnowledgeModalOpen(false)}
        defaultSelectedIds={bkn.map((item) => item.url) || []}
      />
    </ScrollBarContainer>
  )
}

export default memo(KnowledgeConfig)
