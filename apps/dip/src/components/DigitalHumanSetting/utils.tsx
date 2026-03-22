import { type DESettingMenuItem, DESettingMenuKey } from './types'

export const deSettingMenuItems: DESettingMenuItem[] = [
  { key: DESettingMenuKey.BASIC, label: '基本设定', iconSymbol: 'icon-dip-deep-thinking' },
  { key: DESettingMenuKey.SKILL, label: '技能配置', iconSymbol: 'icon-dip-deep-thinking' },
  {
    key: DESettingMenuKey.KNOWLEDGE,
    label: '知识配置',
    iconSymbol: 'icon-dip-deep-thinking',
  },
  { key: DESettingMenuKey.CHANNEL, label: '通道接入', iconSymbol: 'icon-dip-deep-thinking' },
]
