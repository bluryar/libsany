import { type Ref, computed, reactive, readonly, unref, watchEffect } from 'vue-demi'
import { resolveUnref } from '@vueuse/shared'
import { isArray, isString, isTrue, objectToFlattenMap } from '@bluryar/shared'
import { pick } from 'lodash-es'
import type { KeyOf, Rule, Rules, UseFormOptions } from './types'
import { normalizeFormRulesObject } from './_utils'

enum DefaultMessage {
  Success = '校验成功',
  Fail = '校验失败',
}

export interface FormStatusItem {
  /**
   * 表单校验是否通过
   *
   * @default false
   */
  isError: boolean

  /**
   * 表单项是否发送修改
   *
   * @default false
   */
  isDirty: boolean

  /**
   * 是否正在校验
   *
   * @default false
   */
  isVerifying: boolean

  /**
   * 表单校验错误信息, 注意是数组
   *
   * @default [DefaultMessage.Success]
   */
  messages: string[]
}

function createStatusItem(): FormStatusItem {
  return {
    isError: !!0,
    isDirty: !!0,
    isVerifying: !!0,
    messages: ['校验成功'],
  }
}

export function useFormRules<Params = {}>(
  model: Ref<Partial<Params>>,
  rulesTemplate: UseFormOptions<Params>['rules'] = () => ({}),
  options: Pick<UseFormOptions, 'lazyVerify'>,
) {
  const {
    lazyVerify = false,
  } = options

  const status = reactive(new Map(
    Array.from(getModel()).map(([k]) => [k, createStatusItem()])),
  )
  let _lastModifyModel = getModel()

  watchEffect(() => {
    const modelMap = getModel()

    !lazyVerify && checkFormRulesAsync(modelMap, getRules, status)

    checkDirty(modelMap, _lastModifyModel, status)

    _lastModifyModel = modelMap
  })

  function getRules(): Record<KeyOf<Params>, Rule[]> {
    return normalizeFormRulesObject(
      resolveUnref(rulesTemplate),
      (val: Rules) => isArray(val) ? val : [val],
    ) as any
  }
  function getModel() {
    return objectToFlattenMap(unref(model))
  }

  function getSomeIsStatus(type: keyof FormStatusItem) {
    return Array.from(status.values()).some(statusItem => statusItem[type])
  }

  function getParamsKeys(type: keyof FormStatusItem) {
    return Array.from(status.entries())
      .filter(([_, statusItem]) => statusItem[type])
      .map(([key, _]) => key)
      // 剔除可以作为前缀的key
      .filter(
        (prefix, _, arr) => !arr.some(toCheckKey => (toCheckKey as string).startsWith((prefix as string)) && toCheckKey !== prefix),
      )
  }
  function getErrorParams() {
    return pick(unref(model) as Params, getParamsKeys('isError'))
  }
  function getDirtyParams() {
    return pick(unref(model) as Params, getParamsKeys('isDirty'))
  }

  /**
   * 校验表单
   * TODO 异步校验
   *
   * @param fields 可以单独校验 **某些** 字段， 为空这校验全部
   */
  async function verifyAsync(fields?: KeyOf<Params>[]): Promise<boolean> {
    const modelMap = getModel()

    clearErrors()

    await checkFormRulesAsync(
      fields
        ? new Map(
          Array.from(modelMap.entries()).filter(([k]) => fields.includes(k)),
        )
        : modelMap,
      getRules,
      status,
    )

    return getSomeIsStatus('isError')
  }

  /**
   * 手动设置某个字段发生错误状态
   */
  function setError(key: KeyOf<Params>, messages: string[], isError = true) {
    const msgs = isError ? messages : [DefaultMessage.Success]
    const statusItem = mapGetOrInit(status, key as string)
    statusItem.messages = msgs
    statusItem.isError = isError
    status.set(key as string, statusItem)
  }

  /**
   * 清楚掉所有或者指定字段的错误状态
   */
  function clearErrors(keys?: KeyOf<Params>[]) {
    const _keys = transformKeys(keys) ?? Object.keys(Object.fromEntries(status))
    _keys.forEach((key) => {
      status.set(key, createStatusItem())
    })
  }

  return {
    /**
     * [响应式]
     *
     * 表单各项状态
     */
    status: status as Map<KeyOf<Params>, FormStatusItem>,

    /**
     * 表单正在校验
     */
    isVerifying: readonly(computed(() => getSomeIsStatus('isVerifying'))),

    /**
     * 表单是否存在校验失败的项目
     */
    isError: readonly(computed(() => getSomeIsStatus('isError'))),

    /**
     * 表单是否存在发送修改的项目
     */
    isDirty: readonly(computed(() => getSomeIsStatus('isDirty'))),

    /**
     * 校验失败的属性对象
     */
    errorParams: readonly(computed(getErrorParams)),

    /**
     * 发生修改的属性对象
     *
     * **用途**： 请求时，可能不希望将所有对象都提交
     */
    dirtyParams: readonly(computed(getDirtyParams)),

    /**
     * 经过归一化处理的校验规则记录.
     *
     * 进一部的, 你可以
     */
    rules: computed(getRules),

    verifyAsync,
    setError,
    clearErrors,
  }
}
function transformKeys<Params = {}>(keys?: KeyOf<Params>[]) {
  return keys as unknown as string[]
}

function mapGetOrInit(status: Map<string, FormStatusItem>, modelKey: string) {
  let statusItem = status.get(modelKey)
  if (!statusItem)
    statusItem = createStatusItem()
  return statusItem
}

function checkDirty(
  modelMap: Map<string, unknown>,
  lastModifyModel: Map<string, unknown>,
  status: Map<string, FormStatusItem>,
) {
  for (const [modelKey, modelValue] of modelMap) {
    const lastModelValue = lastModifyModel.get(modelKey)
    let statusItem = status.get(modelKey)
    if (!statusItem)
      statusItem = createStatusItem()

    statusItem.isDirty = lastModelValue !== modelValue
    status.set(modelKey, statusItem)
  }
}

async function checkFormRulesAsync(
  modelMap: Map<string, unknown>,
  getRules: () => Record<string, Rule[]>,
  status: Map<string, FormStatusItem>,
) {
  for (const [modelKey, ruleList] of Object.entries(getRules())) {
    // 初始化了参数Model, 并且有校验规则配置
    if (modelMap.has(modelKey)) {
      // 设置校验状态
      const statusItem = mapGetOrInit(status, modelKey)
      const modelValue = modelMap.get(modelKey)

      // 归一化处理并执行校验规则
      const checkResultsAsync = ruleList
        .map(rule => Promise.resolve(rule(modelValue)))

      statusItem.isVerifying = !!1
      const checkResults = (
        await Promise.allSettled(checkResultsAsync).finally(() => {
          statusItem.isVerifying = !!0
        })
      ).map(normalizeAsyncRulesResult)
      if (checkResults.every(isTrue)) {
        // 校验成功
        statusItem.isError = !!0
        statusItem.messages = [DefaultMessage.Success]
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

function normalizeAsyncRulesResult(resolved: PromiseSettledResult<string | boolean>): string | boolean {
  const { status } = resolved
  // fullfiled 不一定表示校验通过，可能是一部校验器的方法内部抛出的异常导致该规则校验失败了
  if (status === 'fulfilled') {
    return resolved.value
  }
  else {
    const { reason } = resolved
    return `${DefaultMessage.Fail}: ${reason}`
  }
}
