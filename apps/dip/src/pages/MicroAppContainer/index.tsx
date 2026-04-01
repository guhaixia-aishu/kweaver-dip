import { Spin } from 'antd'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { getApplicationsBasicInfo } from '@/apis'
import Empty from '@/components/Empty'
import { getFullPath } from '@/utils/config'
import { setMicroAppGlobalState } from '@/utils/micro-app/globalState'
import MicroAppComponent from '../../components/MicroAppComponent'
import { useMicroAppStore } from '../../stores/microAppStore'

const MicroAppContainer = () => {
  const { appKey } = useParams<{ appKey: string }>()
  const appKeyParam = useMemo(() => (appKey ?? '').trim(), [appKey])
  const currentMicroApp = useMicroAppStore((state) => state.currentMicroApp)
  const setCurrentMicroApp = useMicroAppStore((state) => state.setCurrentMicroApp)
  const setHomeRoute = useMicroAppStore((state) => state.setHomeRoute)
  const clearCurrentMicroApp = useMicroAppStore((state) => state.clearCurrentMicroApp)

  // 微应用返回入口统一回到首页
  const homeRoute = '/'

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchApp = async () => {
      if (!appKeyParam) {
        setError('获取应用失败')
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const appData = await getApplicationsBasicInfo(appKeyParam)
        if (!appData) {
          setError('获取应用配置失败')
        } else {
          setCurrentMicroApp({
            ...appData,
            routeBasename: getFullPath(`/application/${encodeURIComponent(appData.key)}`),
          })
          setHomeRoute(homeRoute)
        }
      } catch (err: any) {
        if (err?.description) {
          setError(err.description)
        } else {
          setError('获取应用配置失败')
        }
      } finally {
        setLoading(false)
      }
    }

    fetchApp()

    return () => {
      setError(null)
      setLoading(false)
      clearCurrentMicroApp()
      setMicroAppGlobalState(
        {
          breadcrumb: [],
        },
        { allowAllFields: true },
      )
    }
  }, [appKeyParam, clearCurrentMicroApp, setCurrentMicroApp, setHomeRoute])

  const renderContent = () => {
    if (loading) {
      return (
        <div className="absolute inset-0 flex justify-center items-center">
          <Spin />
        </div>
      )
    }
    if (error || !currentMicroApp) {
      return (
        <div className="absolute inset-0 flex justify-center items-center">
          <Empty type="failed" title="加载失败" subDesc={error ?? ''} />
        </div>
      )
    }
    return <MicroAppComponent appBasicInfo={currentMicroApp} homeRoute={getFullPath(homeRoute)} />
  }

  return (
    <div className="h-full w-full flex flex-col overflow-hidden relative">{renderContent()}</div>
  )
}

export default MicroAppContainer
