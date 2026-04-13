import type { NavigateFunction } from 'react-router-dom'
import { getFullPath } from '@/utils/config'
import type { MenuWorkbenchLeafItem, NavigateToMicroWidgetParams } from './types'

/** 按菜单里 micro-app 的 app.name 解析跳转（新标签或路由内 navigate） */
export function createNavigateToMicroWidgetHandler(
  leafMenuItems: MenuWorkbenchLeafItem[],
  navigate: NavigateFunction,
): (params: NavigateToMicroWidgetParams) => void {
  return (params) => {
    const item = leafMenuItems.find(
      (menuItem) => menuItem.page?.type === 'micro-app' && menuItem.page?.app?.name === params.name,
    )
    if (!item) return

    const targetPath = item.path + params.path
    if (params.isNewTab) {
      const url = `${window.location.origin}${getFullPath(targetPath)}`
      window.open(url, '_blank', 'noopener,noreferrer')
    } else {
      navigate(targetPath)
    }
  }
}
