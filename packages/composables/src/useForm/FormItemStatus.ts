import { newClassWithParams } from '@bluryar/shared'

export enum StatusVerifyDefaultMessage {
  Success = '校验成功',
  Fail = '校验失败',
}

export enum StatusDirty {
  UnChange = '未修改',
  Modify = '修改',
  Add = '新增',
  Remove = '删除',
}

export class FormItemStatus {
  /**
   * 表单校验是否通过
   *
   * @default false
   */
  isError = false

  /**
   * 表单项是否发送修改
   *
   * @default false
   */
  isDirty = false

  /**
   * 字段发生修改的状态
   *
   * @default '未修改'
   */
  dirtyStatus: StatusDirty = StatusDirty.UnChange

  /**
   * 是否正在校验
   *
   * @default false
   */
  isVerifying = false

  /**
   * 表单校验错误信息, 注意是数组
   *
   * @default [DefaultMessage.Success]
   */
  messages: string[] = [StatusVerifyDefaultMessage.Success]
}

export function createFormItemStatus(): FormItemStatus {
  return newClassWithParams(FormItemStatus)
}
