import type { ModalProps } from 'antd'
import { Modal, message, Spin } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { getKnowledgeNetworks, type KnowledgeNetworkInfo } from '@/apis'
import IconFont from '@/components/IconFont'
import ScrollBarContainer from '@/components/ScrollBarContainer'
import SearchInput from '@/components/SearchInput'
import { LoadStatus } from '@/types/enums'

export interface SelectKnowledgeModalProps extends Omit<ModalProps, 'onCancel' | 'onOk'> {
  /** 确定成功的回调，传递信息 */
  onOk: (result: KnowledgeNetworkInfo[]) => void
  /** 取消回调 */
  onCancel: () => void
  /** 默认选中的知识网络IDs */
  defaultSelectedIds?: string[]
}

/** 选择知识网络弹窗 */
const SelectKnowledgeModal = ({
  open,
  onOk,
  onCancel,
  defaultSelectedIds = [],
}: SelectKnowledgeModalProps) => {
  const [status, setStatus] = useState<LoadStatus>(LoadStatus.Empty)
  const [knowledgeList, setKnowledgeList] = useState<KnowledgeNetworkInfo[]>([])
  const [searchValue, setSearchValue] = useState('')
  const [selectedList, setSelectedList] = useState<KnowledgeNetworkInfo[]>([])
  const [messageApi, messageContextHolder] = message.useMessage()

  // 过滤后的选项列表
  const filteredList = useMemo(() => {
    if (!searchValue.trim()) {
      return knowledgeList
    }
    const keyword = searchValue.trim().toLowerCase()
    return knowledgeList.filter((item) => item.name?.toLowerCase().includes(keyword))
  }, [knowledgeList, searchValue])

  useEffect(() => {
    setSelectedList(knowledgeList.filter((item) => defaultSelectedIds?.includes(item.id)))
  }, [knowledgeList, defaultSelectedIds])

  // 获取知识网络列表
  const fetchKnowledgeNetworks = async () => {
    if (status === LoadStatus.Loading) return // 防止重复请求
    setStatus(LoadStatus.Loading)
    try {
      const result = await getKnowledgeNetworks({ limit: -1 })
      setKnowledgeList(result.entries)
      setStatus(result.total_count > 0 ? LoadStatus.Normal : LoadStatus.Empty)
    } catch (error: any) {
      messageApi.error(error?.description || '获取知识网络列表失败')
      setKnowledgeList([])
      setStatus(LoadStatus.Failed)
    }
  }

  useEffect(() => {
    if (open) {
      fetchKnowledgeNetworks()
    }
  }, [open])

  // 选择知识网络
  const handleSelect = (item: KnowledgeNetworkInfo) => {
    if (selectedList.some((selected) => selected.id === item.id)) {
      setSelectedList(selectedList.filter((selected) => selected.id !== item.id))
    } else {
      setSelectedList([...selectedList, item])
    }
  }

  // 确定
  const handleOk = () => {
    onOk(selectedList)
    onCancel()
  }

  return (
    <>
      {messageContextHolder}
      <Modal
        title={`选择知识网络`}
        open={open}
        onCancel={onCancel}
        onOk={handleOk}
        closable
        mask={{ closable: false }}
        destroyOnHidden
        styles={{}}
        width={460}
        okText={`确定(${selectedList.length})`}
        cancelText="取消"
        okButtonProps={{ disabled: status === LoadStatus.Loading }}
        footer={(_, { OkBtn, CancelBtn }) => (
          <>
            <OkBtn />
            <CancelBtn />
          </>
        )}
      >
        <div className="w-full flex flex-col gap-y-2">
          {/* 搜索框 */}
          <SearchInput
            variant="outlined"
            className="w-full !rounded"
            placeholder={`搜索知识网络`}
            onSearch={(value) => setSearchValue(value)}
          />

          {/* 列表 */}
          <ScrollBarContainer className="max-h-[240px] overflow-y-auto">
            {status === LoadStatus.Loading ? (
              <div className="flex justify-center py-4">
                <Spin />
              </div>
            ) : status === LoadStatus.Failed ? (
              <div className="mx-auto text-sm text-[rgba(0,0,0,0.45)] text-center py-4">
                加载失败
              </div>
            ) : status === LoadStatus.Empty ? (
              <div className="mx-auto text-sm text-[rgba(0,0,0,0.45)] text-center py-4">
                暂无数据
              </div>
            ) : filteredList.length === 0 ? (
              <div className="mx-auto text-sm text-[rgba(0,0,0,0.45)] text-center py-4">
                抱歉，没有找到相关内容
              </div>
            ) : (
              <div className="space-y-1">
                {filteredList.map((item) => {
                  const isSelected = selectedList.some((selected) => selected.id === item.id)
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelect(item)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          handleSelect(item)
                        }
                      }}
                      className={`w-full h-8 text-left px-3 rounded cursor-pointer transition-colors flex items-center justify-between ${
                        isSelected
                          ? 'bg-[rgba(18,110,227,0.06)] text-[--dip-primary-color]'
                          : 'hover:bg-[rgba(0,0,0,0.04)]'
                      }`}
                    >
                      <span className="truncate" title={item.name}>
                        {item.name}
                      </span>
                      {isSelected && <IconFont type="icon-dip-check" className="text-xl" />}
                    </button>
                  )
                })}
              </div>
            )}
          </ScrollBarContainer>
        </div>
      </Modal>
    </>
  )
}

export default SelectKnowledgeModal
