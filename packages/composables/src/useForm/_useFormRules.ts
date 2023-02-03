import { type Ref, computed, reactive, unref, watchEffect } from 'vue'
import { type MaybeComputedRef, resolveUnref } from '@vueuse/shared'
import { isArray, isString, isTrue } from '@bluryar/shared'
import { normalizeObject, toPathMap } from './_utils'
import type { Rule, Rules, UseFormOptions } from './types'

interface StatusItem {
  /**
   * 表单校验是否通过
   */
  isError: boolean

  /**
   * 表单项是否发送修改
   */
  isDirty: boolean

  /**
   * 表单校验错误信息, 注意是数组
   */
  messages: string[]
}

function createStatusItem(): StatusItem {
  return {
    isError: !!0,
    isDirty: !!0,
    messages: ['校验成功'],
  }
}

export function useFormRules<Params = {}>(
  model: Ref<Partial<Params>>,
  rulesTemplate: MaybeComputedRef<Record<string, Rules>> = () => ({}),
  options: Pick<UseFormOptions, 'lazyVerify'>,
) {
  const {
    lazyVerify: lazeVerify = false,
  } = options

  const getRules = (): Record<string, Rule[]> => normalizeObject(
    resolveUnref(rulesTemplate),
    (val: Rules) => isArray(val) ? val : [val],
  )
  const getModel = () => toPathMap(unref(model))

  const status = reactive(new Map<string, StatusItem>(
    Object.entries(getModel()).map(([k]) => [k, createStatusItem()]),
  ))

  const isError = () => Object.values(status).some((statusItem: StatusItem) => statusItem.isError)
  const isDirty = () => Object.values(status).some((statusItem: StatusItem) => statusItem.isDirty)

  let lastModifyModel = getModel()

  watchEffect(() => {
    const modelMap = getModel()

    !lazeVerify && executeCheckRules(modelMap, getRules, status)

    executeCheckDirty(modelMap, lastModifyModel, status)

    lastModifyModel = modelMap
  })

  const verify = (fields?: string[]): boolean => {
    const modelMap = getModel()

    executeCheckRules(
      fields
        ? new Map(
          Object.entries(modelMap).filter(([k]) => fields.includes(k)),
        )
        : modelMap,
      getRules,
      status,
    )

    return isError()
  }

  const setError = (key: string, messages: string[], isError = true) => {
    const msgs = isError ? messages : ['校验成功']
    const statusItem = mapGetOrInit(status, key)
    statusItem.messages = msgs
    statusItem.isError = isError
    status.set(key, statusItem)
  }

  const clearErrors = (keys?: string[]) => {
    (keys ?? Object.keys(status)).forEach((key) => {
      status.set(key, createStatusItem())
    })
  }

  return {
    /**
     * 表单各项状态
     */
    status,

    /**
     * 表单是否存在校验失败的项目
     */
    isError: computed(isError),

    /**
     * 表单是否存在发送修改的项目
     */
    isDirty: computed(isDirty),

    /**
     * 经过归一化处理的校验规则记录.
     *
     * 进一部的, 你可以
     */
    rules: computed(getRules),

    verify,
    setError,
    clearErrors,
  }
}

function mapGetOrInit(status: Map<string, StatusItem>, modelKey: string) {
  let statusItem = status.get(modelKey)
  if (!statusItem)
    statusItem = createStatusItem()
  return statusItem
}

function executeCheckDirty(modelMap: Map<string, unknown>, lastModifyModel: Map<string, unknown>, status: Map<string, StatusItem>) {
  for (const [modelKey, modelValue] of Object.entries(modelMap)) {
    const lastModelValue = lastModifyModel.get(modelKey)
    let statusItem = status.get(modelKey)
    if (!statusItem)
      statusItem = createStatusItem()

    statusItem.isDirty = lastModelValue !== modelValue
    status.set(modelKey, statusItem)
  }
}

function executeCheckRules(modelMap: Map<string, unknown>, getRules: () => Record<string, Rule[]>, status: Map<string, StatusItem>) {
  for (const [modelKey, ruleList] of Object.entries(getRules())) {
    // 初始化了参数Model, 并且有校验规则配置
    if (modelMap.has(modelKey)) {
      const modelValue = modelMap.get(modelKey)
      const checkResults = ruleList.map(rule => rule(modelValue))

      let statusItem = status.get(modelKey)
      if (!statusItem)
        statusItem = createStatusItem()

      if (checkResults.map(isTrue)) {
        // 校验成功
        statusItem.isError = !!0
        statusItem.messages = ['校验成功']
      }
      else {
        // 校验失败
        const firstErrorMessage = checkResults.filter(isString)
        statusItem.isError = !!1
        statusItem.messages = firstErrorMessage
      }

      status.set(modelKey, statusItem)
    }
  }
}
