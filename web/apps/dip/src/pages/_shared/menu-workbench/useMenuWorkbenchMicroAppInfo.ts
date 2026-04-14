import { useEffect, useState } from 'react'
import type { CurrentMicroAppInfo } from '@/stores/microAppStore'
import { buildMicroAppInfo, normalizeMicroAppEntry } from './micro-app-info'
import type { MenuWorkbenchLeafItem } from './types'

export function useMenuWorkbenchMicroAppInfo(
  currentMenu: MenuWorkbenchLeafItem,
): CurrentMicroAppInfo | null {
  const [microAppInfo, setMicroAppInfo] = useState<CurrentMicroAppInfo | null>(null)

  useEffect(() => {
    if (currentMenu.page.type !== 'micro-app') {
      setMicroAppInfo(null)
      return
    }
    setMicroAppInfo(
      buildMicroAppInfo(
        currentMenu.key,
        currentMenu.label,
        currentMenu.path,
        currentMenu.page.app.name,
        normalizeMicroAppEntry(currentMenu.page.app.entry),
      ),
    )
  }, [currentMenu])

  return microAppInfo
}
