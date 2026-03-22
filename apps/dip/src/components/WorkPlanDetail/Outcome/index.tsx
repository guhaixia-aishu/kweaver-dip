import { Collapse, Modal, message, Spin } from 'antd'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import type { SessionArchiveEntry, SessionArchivesResponse } from '@/apis/dip-studio/sessions'
import {
  getDigitalHumanSessionArchiveSubpath,
  getDigitalHumanSessionArchives,
} from '@/apis/dip-studio/sessions'
import Empty from '@/components/Empty'
import IconFont from '@/components/IconFont'
import {
  emptyArchive,
  formatPreviewContent,
  groupArchiveDirectoriesByDate,
  isSessionArchivesResponse,
  previewResponseType,
  sortDateKeysDesc,
} from './utils'
import {
  mockGetDigitalHumanSessionArchiveSubpath,
  mockGetDigitalHumanSessionArchives,
  RESULTS_PANEL_USE_MOCK,
} from './resultsPanelMock'

export type ResultsPanelProps = {
  planId?: string
}

const ResultsPanel = ({ planId: _planId }: ResultsPanelProps) => {
  const [searchParams] = useSearchParams()
  const dhId = searchParams.get('dhId') ?? ''
  const sessionId = searchParams.get('sessionId') ?? ''

  const [rootLoading, setRootLoading] = useState(false)
  const [root, setRoot] = useState<SessionArchivesResponse | null>(null)
  const [rootError, setRootError] = useState(false)

  const [activeKeys, setActiveKeys] = useState<string[]>([])
  const [folderContents, setFolderContents] = useState<Record<string, SessionArchivesResponse>>({})
  const loadingFolderRef = useRef<Set<string>>(new Set())

  const grouped = useMemo(() => {
    if (!root?.contents?.length) return new Map<string, SessionArchiveEntry[]>()
    return groupArchiveDirectoriesByDate(root.contents)
  }, [root])

  const dateKeys = useMemo(() => sortDateKeysDesc([...grouped.keys()]), [grouped])

  const loadRoot = useCallback(async () => {
    if (!(dhId && sessionId)) return
    setRootLoading(true)
    setRootError(false)
    try {
      const res = RESULTS_PANEL_USE_MOCK
        ? await mockGetDigitalHumanSessionArchives()
        : await getDigitalHumanSessionArchives(dhId, sessionId)
      setRoot(res)
    } catch {
      setRootError(true)
      message.error('加载归档目录失败')
    } finally {
      setRootLoading(false)
    }
  }, [dhId, sessionId])

  useEffect(() => {
    void loadRoot()
  }, [loadRoot])

  const loadFolder = useCallback(
    async (folderName: string) => {
      if (!(dhId && sessionId)) return
      if (loadingFolderRef.current.has(folderName)) return
      loadingFolderRef.current.add(folderName)
      try {
        const res = RESULTS_PANEL_USE_MOCK
          ? await mockGetDigitalHumanSessionArchiveSubpath(folderName, { responseType: 'json' })
          : await getDigitalHumanSessionArchiveSubpath(dhId, sessionId, folderName, {
              responseType: 'json',
            })
        if (isSessionArchivesResponse(res)) {
          setFolderContents((prev) => ({ ...prev, [folderName]: res }))
        } else {
          message.error('目录数据格式异常')
          setFolderContents((prev) => ({ ...prev, [folderName]: emptyArchive(folderName) }))
        }
      } catch {
        message.error('加载子目录失败')
        setFolderContents((prev) => ({ ...prev, [folderName]: emptyArchive(folderName) }))
      } finally {
        loadingFolderRef.current.delete(folderName)
      }
    },
    [dhId, sessionId],
  )

  useEffect(() => {
    if (!(dhId && sessionId)) return
    for (const dateKey of activeKeys) {
      const dirs = grouped.get(dateKey)
      if (!dirs) continue
      for (const d of dirs) {
        if (folderContents[d.name] !== undefined) continue
        if (loadingFolderRef.current.has(d.name)) continue
        void loadFolder(d.name)
      }
    }
  }, [activeKeys, dhId, sessionId, grouped, folderContents, loadFolder])

  const [preview, setPreview] = useState<{
    open: boolean
    title: string
    subpath: string
    body: string
    loading: boolean
  } | null>(null)

  const openFilePreview = useCallback(
    async (subpath: string, title: string) => {
      if (!(dhId && sessionId)) return
      setPreview({ open: true, title, subpath, body: '', loading: true })
      try {
        const rt = previewResponseType(title)
        const res = RESULTS_PANEL_USE_MOCK
          ? await mockGetDigitalHumanSessionArchiveSubpath(subpath, { responseType: rt })
          : await getDigitalHumanSessionArchiveSubpath(dhId, sessionId, subpath, {
              responseType: rt,
            })
        const body = formatPreviewContent(res, title)
        setPreview((p) => (p ? { ...p, body, loading: false } : null))
      } catch {
        message.error('加载文件失败')
        setPreview((p) => (p ? { ...p, body: '', loading: false } : null))
      }
    },
    [dhId, sessionId],
  )

  const collapseItems = useMemo(() => {
    return dateKeys.map((dateKey) => ({
      key: dateKey,
      label: <span className="text-sm font-medium text-[--dip-text-color]">{dateKey}</span>,
      children: (
        <div className="flex flex-col gap-4 pt-1">
          {(grouped.get(dateKey) ?? []).map((dir) => {
            const loaded = folderContents[dir.name]
            const expanded = activeKeys.includes(dateKey)
            const showSpin = expanded && loaded === undefined
            return (
              <div
                key={dir.name}
                className="overflow-hidden rounded-lg border border-[--dip-border-color]"
              >
                <div className="bg-[--dip-hover-bg-color] px-3 py-2 text-xs text-[--dip-text-color-65]">
                  {dir.name}
                </div>
                <div className="min-h-[48px] px-2 py-2">
                  {showSpin ? (
                    <div className="flex justify-center py-4">
                      <Spin size="small" />
                    </div>
                  ) : loaded ? (
                    <ul className="divide-y divide-[--dip-border-color]">
                      {loaded.contents
                        .filter((e) => e.type === 'file')
                        .map((file) => {
                          const subpath = `${dir.name}/${file.name}`
                          return (
                            <li key={subpath}>
                              <button
                                type="button"
                                className="flex w-full cursor-pointer items-center justify-between gap-3 px-2 py-2.5 text-left text-sm text-[--dip-text-color] transition-colors hover:bg-[--dip-hover-bg-color]"
                                onClick={() => void openFilePreview(subpath, file.name)}
                              >
                                <span className="flex min-w-0 items-center gap-2">
                                  <IconFont
                                    type="icon-dip-KG1"
                                    className="shrink-0 text-base opacity-80"
                                  />
                                  <span className="min-w-0 truncate">{file.name}</span>
                                </span>
                                <span className="shrink-0 text-xs text-[--dip-text-color-65]">
                                  —
                                </span>
                              </button>
                            </li>
                          )
                        })}
                      {loaded.contents.filter((e) => e.type === 'file').length === 0 ? (
                        <div className="py-3 text-center text-xs text-[--dip-text-color-65]">
                          暂无文件
                        </div>
                      ) : null}
                    </ul>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      ),
    }))
  }, [dateKeys, grouped, folderContents, activeKeys, openFilePreview])

  if (!(dhId && sessionId)) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6">
        <Empty type="failed" title="加载失败" />
      </div>
    )
  }

  if (rootLoading) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center">
        <Spin />
      </div>
    )
  }

  if (rootError || !root) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6">
        <Empty title="暂无数据" />
      </div>
    )
  }

  if (dateKeys.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6">
        <Empty title="暂无数据" />
      </div>
    )
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col px-6 pb-6">
      <div className="mb-3 grid grid-cols-[1fr_auto] gap-4 border-b border-[--dip-border-color] pb-3 text-xs text-[--dip-text-color-65]">
        <span>文件名称</span>
        <span className="shrink-0 tabular-nums">更新时间</span>
      </div>
      <div className="flex min-h-0 flex-1 flex-col overflow-auto">
        <Collapse
          activeKey={activeKeys}
          bordered={false}
          className="bg-transparent"
          expandIconPosition="end"
          items={collapseItems}
          onChange={(keys) => {
            setActiveKeys(Array.isArray(keys) ? keys : [keys])
          }}
        />
      </div>

      <Modal
        title={preview?.title}
        open={preview?.open ?? false}
        width="min(900px, 92vw)"
        footer={null}
        destroyOnHidden
        onCancel={() => setPreview(null)}
      >
        {preview?.loading ? (
          <div className="flex justify-center py-10">
            <Spin />
          </div>
        ) : (
          <pre className="max-h-[60vh] overflow-auto whitespace-pre-wrap break-words rounded-md bg-[--dip-hover-bg-color] p-3 text-xs text-[--dip-text-color]">
            {preview?.body ?? ''}
          </pre>
        )}
      </Modal>
    </div>
  )
}

export default ResultsPanel
