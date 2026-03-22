import { create } from 'zustand'

interface GlobalLayoutState {
  /** 侧边栏收起状态 */
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
  toggleCollapsed: () => void
}

export const useGlobalLayoutStore = create<GlobalLayoutState>((set) => ({
  collapsed: false,
  setCollapsed: (collapsed) => set({ collapsed }),
  toggleCollapsed: () =>
    set((state) => ({
      collapsed: !state.collapsed,
    })),
}))

/**
 * 供外部非 React 代码控制侧边栏收起/展开
 * 使用方式：`setGlobalSiderCollapsed(true)`
 */
export const setGlobalSiderCollapsed = (collapsed: boolean) => {
  useGlobalLayoutStore.getState().setCollapsed(collapsed)
}

