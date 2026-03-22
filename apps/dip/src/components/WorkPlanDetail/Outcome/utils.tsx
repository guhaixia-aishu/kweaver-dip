import type { SessionArchiveEntry, SessionArchivesResponse } from '@/apis/dip-studio/sessions'

/** 目录名形如 `{uuid}_{YYYY-MM-DD-HH-mm-ss}`，提取 `YYYY-MM-DD` 用于分组 */
const DIR_NAME_RE =
  /^([0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12})_(.+)$/

export function parseArchiveDirectoryDateKey(name: string): string | null {
  const m = name.match(DIR_NAME_RE)
  if (!m?.[2]) return null
  const tail = m[2]
  const dm = tail.match(/^(\d{4}-\d{2}-\d{2})/)
  return dm?.[1] ?? null
}

/** 按日期分组顶层目录；无法解析日期的归入「其他」 */
export function groupArchiveDirectoriesByDate(
  entries: SessionArchiveEntry[],
): Map<string, SessionArchiveEntry[]> {
  const dirs = entries.filter((e) => e.type === 'directory')
  const map = new Map<string, SessionArchiveEntry[]>()
  for (const d of dirs) {
    const dateKey = parseArchiveDirectoryDateKey(d.name) ?? '其他'
    const list = map.get(dateKey) ?? []
    list.push(d)
    map.set(dateKey, list)
  }
  for (const [, list] of map) {
    list.sort((a, b) => b.name.localeCompare(a.name))
  }
  return map
}

export function sortDateKeysDesc(dateKeys: string[]): string[] {
  return [...dateKeys].sort((a, b) => {
    if (a === '其他') return 1
    if (b === '其他') return -1
    return b.localeCompare(a)
  })
}

export function isSessionArchivesResponse(v: unknown): v is SessionArchivesResponse {
  return (
    v !== null &&
    typeof v === 'object' &&
    'contents' in v &&
    Array.isArray((v as SessionArchivesResponse).contents)
  )
}

export function previewResponseType(fileName: string): 'json' | 'text' {
  return fileName.toLowerCase().endsWith('.json') ? 'json' : 'text'
}

export function formatPreviewContent(
  res: SessionArchivesResponse | string | ArrayBuffer,
  fileName: string,
): string {
  if (typeof res === 'string') return res
  if (res instanceof ArrayBuffer) return '[二进制内容，无法以文本预览]'
  if (isSessionArchivesResponse(res)) return JSON.stringify(res, null, 2)
  if (fileName.toLowerCase().endsWith('.json')) return JSON.stringify(res, null, 2)
  return String(res)
}

export function emptyArchive(path: string): SessionArchivesResponse {
  return { path, contents: [] }
}
