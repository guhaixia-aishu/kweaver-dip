export interface OptionsType {
  body?: any
  headers?: any
  timeout?: number
  params?: Record<string, any>
  resHeader?: boolean
  returnFullResponse?: boolean
  /** axios responseType，如流式接口使用 `text` */
  responseType?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text' | 'stream'
}

export enum IncrementalActionEnum {
  Upsert = 'upsert',
  Append = 'append',
  Remove = 'remove',
  End = 'end',
}
