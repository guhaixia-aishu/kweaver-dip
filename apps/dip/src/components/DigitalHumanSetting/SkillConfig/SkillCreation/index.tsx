import type { EventSourceMessage } from '@microsoft/fetch-event-source'
import { Button, message } from 'antd'
import { useRef, useState } from 'react'
import { useDigitalEmployeeDraftStore } from '@/stores'
import { streamingOutHttp } from '@/utils/http/streaming-http'
import AdPromptInput from '../../AdPromptInput'

const SkillCreation = () => {
  const { basic } = useDigitalEmployeeDraftStore()
  const [description, setDescription] = useState<string>('')
  const [generating, setGenerating] = useState(false)
  const [messageApi, contextHolder] = message.useMessage()
  const abortControllerRef = useRef<AbortController | null>(null)

  const trigger = [
    {
      character: '$',
      options: [
        { label: '用户昵称', value: '$userName', type: 'string' },
        { label: '最近行为', value: '$recentBehavior', type: 'string' },
      ],
    },
  ]

  const handleStreamMessage = (event: EventSourceMessage) => {
    if (!event.data) return
    const rawText = event.data
    const trimmed = rawText.trim()
    if (!trimmed || trimmed === '#' || trimmed === '[DONE]') return

    setDescription((prev) => {
      const cleanedText = trimmed.replace(/\s+/g, ' ').trim()
      let newText: string = rawText

      // 对标题/列表做适配，保证换行表现一致
      if ((cleanedText === '###' || cleanedText === '##') && prev) {
        newText = `\n\n${cleanedText} `
      } else if (cleanedText === '-' && prev) {
        if (prev.endsWith('\n')) {
          newText = `${cleanedText} `
        } else {
          newText = `\n${cleanedText} `
        }
      } else if (cleanedText === ':') {
        newText = `${cleanedText}\n`
      }

      // 有序列表：在数字序号前补换行
      let updateText = prev.replace(/(?<!\n)(\d+\.)/g, '\n$1') + newText
      // 额外规整：最多保留一个空行（两次换行），避免连续多次换行
      updateText = updateText.replace(/\n{3,}/g, '\n\n')
      return updateText
    })
  }

  const handleStreamClose = () => {
    setGenerating(false)
    abortControllerRef.current = null
    messageApi.success({ content: '技能描述生成成功', key: 'generateSkill' })
  }

  const handleStreamError = (error: any) => {
    setGenerating(false)
    abortControllerRef.current = null
    messageApi.error({
      content: error?.error || error?.description || '技能描述生成失败，请稍后重试',
      key: 'generateSkill',
    })
  }

  const abortGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
      setGenerating(false)
      messageApi.info({ content: '已取消生成', key: 'generateSkill' })
    }
  }

  const handleGenerate = () => {
    if (generating) {
      console.log('abortGeneration')
      abortGeneration()
      return
    }

    setGenerating(true)
    setDescription('')
    messageApi.loading({ content: '正在为你生成技能描述...', key: 'generateSkill' })

    const controller = streamingOutHttp({
      url: '/api/agent-factory/v3/agent/ai-autogen',
      method: 'POST',
      headers: {
        'x-business-domain': 'bd_public',
      },
      body: {
        params: {
          name: basic.name || '',
          profile: basic.description || '',
          skills: [],
          sources: [],
        },
        from: 'system_prompt',
      },
      onMessage: handleStreamMessage,
      onClose: handleStreamClose,
      onError: handleStreamError,
      onOpen: (c) => {
        abortControllerRef.current = c
      },
    })

    abortControllerRef.current = controller
  }

  const placeholder = `描述你希望这个技能完成什么任务...\n\n例如：\n分析供应商最近6个月的交货记录，计算每个供应商的准时交货率，识别交货延迟超过3天的异常订单，并按延迟严重程度生成报告。`

  return (
    <div className="flex flex-col">
      {contextHolder}
      <AdPromptInput
        style={{ minHeight: '200px', maxHeight: 'calc(100vh-279px)' }}
        value={description}
        onChange={setDescription}
        placeholder={placeholder}
        trigger={trigger}
        disabled={generating}
      />
      <div className="text-[--dip-text-color-25] mt-2">
        提示：描述越具体，生成的技能越准确。建议包含输入数据、处理逻辑和期望输出。
      </div>
      <Button type="primary" size="small" onClick={handleGenerate} className="mt-4 w-fit">
        {generating ? '停止生成' : 'AI生成技能'}
      </Button>
    </div>
  )
}

export default SkillCreation
