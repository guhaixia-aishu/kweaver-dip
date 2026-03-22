import type { SessionArchivesResponse } from '@/apis/dip-studio/sessions'

/** 为 true 时成果 Tab 走本地 mock，不调归档接口 */
export const RESULTS_PANEL_USE_MOCK = true

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms))

/** 外层归档目录（与 archiveUtils 目录名格式一致） */
const MOCK_ARCHIVES_ROOT: SessionArchivesResponse = {
  path: '/',
  contents: [
    {
      name: '5346e9bf-a493-4722-a1fc-93d857e96d94_2026-03-20-16-11-32',
      type: 'directory',
    },
    {
      name: '5346e9bf-a493-4722-a1fc-93d857e96d94_2026-03-21-14-27-30',
      type: 'directory',
    },
    {
      name: '5346e9bf-a493-4722-a1fc-93d857e96d94_2026-03-21-14-34-17',
      type: 'directory',
    },
  ],
}

function mockFolderListing(folderName: string): SessionArchivesResponse {
  return {
    path: `/${folderName}`,
    contents: [
      { name: '企业数字员工简报.md', type: 'file' },
      { name: '企业数字员工简报.html', type: 'file' },
      { name: 'config.json', type: 'file' },
    ],
  }
}

function mockFileBody(
  subpath: string,
  responseType: 'json' | 'text' | 'arraybuffer' | undefined,
): string {
  const lower = subpath.toLowerCase()
  if (lower.endsWith('.json') || responseType === 'json') {
    return JSON.stringify({ mock: true, path: subpath, message: 'mock json 预览' }, null, 2)
  }
  if (lower.endsWith('.html')) {
    return '<!DOCTYPE html><html><body><p>mock html</p></body></html>'
  }
  return `# mock\n\n子路径：${subpath}\n\n（Markdown 预览）`
}

export async function mockGetDigitalHumanSessionArchives(): Promise<SessionArchivesResponse> {
  await delay(400)
  return MOCK_ARCHIVES_ROOT
}

export async function mockGetDigitalHumanSessionArchiveSubpath(
  subpath: string,
  options?: { responseType?: 'json' | 'text' | 'arraybuffer' },
): Promise<SessionArchivesResponse | string | ArrayBuffer> {
  await delay(300)
  const rt = options?.responseType

  if (!subpath.includes('/')) {
    const isDir = MOCK_ARCHIVES_ROOT.contents.some(
      (c) => c.type === 'directory' && c.name === subpath,
    )
    if (isDir) {
      return mockFolderListing(subpath)
    }
  }

  return mockFileBody(subpath, rt ?? 'text')
}
