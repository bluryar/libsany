import { isArray, isString, isTrue, isUndef, objectToFlattenMap } from '@bluryar/shared'
import { type MaybeComputedRef, resolveUnref } from '@vueuse/shared'
import { isEqual, uniq } from 'lodash-es'
import { type Ref, ref, unref } from 'vue-demi'
import { type FormItemStatus, StatusDirty, StatusVerifyDefaultMessage, createFormItemStatus } from './FormItemStatus'
import { normalizeFormRulesObject } from './_utils'
import type { KeyOf, Rule, Rules, RulesRecord } from './types'

export class FormItemChecker<Params = {}> {
  public formItemsStatus: Ref<Map<KeyOf<Partial<Params>>, FormItemStatus>>

  private params: MaybeComputedRef<Partial<Params>>
  private paramsPathMap = new Map<KeyOf<Params>, unknown>()
  private shallowKeys: MaybeComputedRef<KeyOf<Params>[]> = () => []

  /** 用于检查字段是否更改 */
  private INIT_PARAMS: Partial<Params>
  private INIT_PARAMS_PATH_MAP = new Map<KeyOf<Params>, unknown>()

  private _rules: MaybeComputedRef<RulesRecord<Params>>

  constructor(params: MaybeComputedRef<Partial<Params>>, INIT_PARAMS: Partial<Params>, rules: MaybeComputedRef<RulesRecord<Params>>, shallowKeys: MaybeComputedRef<KeyOf<Params>[]>) {
    // 1. 同步
    this._rules = rules
    this.params = params
    this.INIT_PARAMS = INIT_PARAMS
    this.shallowKeys = shallowKeys

    // 2. 转换
    this.INIT_PARAMS_PATH_MAP = this.createParamsPathMap(this.INIT_PARAMS)
    this.paramsPathMap = this.createParamsPathMap(this.params)

    // 3. 创建新状态
    this.formItemsStatus = ref(this._createFormStatus())
  }

  updateParamsPathMap() {
    this.paramsPathMap = this.createParamsPathMap(this.params)
  }

  createParamsPathMap(_params: MaybeComputedRef<Partial<Params>>) {
    return objectToFlattenMap({ source: resolveUnref(_params), shallowKeys: resolveUnref(this.shallowKeys) as any }) as Map<KeyOf<Params>, unknown>
  }

  getRules(): Record<KeyOf<Params>, Rule[]> {
    return normalizeFormRulesObject(
      resolveUnref(this._rules),
      (val: Rules) => isArray(val) ? val : [val],
    ) as any
  }

  private _createFormStatus() {
    return new Map(
      Array.from(this.paramsPathMap).map(([k]) => [k, createFormItemStatus()]),
    )
  }

  /**
   * 检查表单是否发生变更
   */
  checkDirty() {
    const { paramsPathMap: currentPathMap, INIT_PARAMS_PATH_MAP, formItemsStatus: formStatus } = this

    const currentKeys = Array.from(currentPathMap.keys())
    const initKeys = Array.from(INIT_PARAMS_PATH_MAP.keys())

    const uniKeys = uniq([...initKeys, ...currentKeys])

    for (const key of uniKeys) {
      let status = unref(formStatus).get(key)
      if (isUndef(status))
        status = createFormItemStatus()

      const inCurrent = currentPathMap.has(key)
      const inInit = INIT_PARAMS_PATH_MAP.has(key)
      const currentVal = currentPathMap.get(key)
      const initVal = INIT_PARAMS_PATH_MAP.get(key)
      // 修改
      if (inCurrent && inInit) {
        status.isDirty = !isEqual(currentVal, initVal)
        if (status.isDirty)
          status.dirtyStatus = StatusDirty.Modify

        else
          status.dirtyStatus = StatusDirty.UnChange
      }

      // 新增
      else if (inCurrent && !inInit) {
        status.isDirty = !!1
        status.dirtyStatus = StatusDirty.Add
      }

      // 删除
      else if (!inCurrent && inInit) {
        status.isDirty = !!1
        status.dirtyStatus = StatusDirty.Remove
      }
      else {
        console.warn('函数内部错误, key必定存在于初始参数或者当前参数中')
      }

      unref(formStatus).set(key, status)
    }
  }

  /**
   * 表单校验
   */
  async checkVerify() {
    const { paramsPathMap, formItemsStatus: _formStatus } = this
    const formStatus = unref(_formStatus)

    for (const [modelKey, rulesList] of Object.entries(this.getRules())) {
      // 初始化了参数Model, 并且有校验规则配置
      if (this.paramsPathMap.has(modelKey)) {
        const modelValue = paramsPathMap.get(modelKey)

        let status = formStatus.get(modelKey)
        if (!status)
          status = createFormItemStatus()

        status.isVerifying = !!1
        const rulesExecuteList = rulesList.map(rule => Promise.resolve(rule(modelValue)))
        const checkPromise = await Promise.allSettled(rulesExecuteList).finally(() => {
          status!.isVerifying = !!0
        })
        const verifyResult = checkPromise.map((res) => {
          if (res.status === 'fulfilled') {
            const { value } = res
            if (isTrue(value) || isString(value))
              return value
            else
              return StatusVerifyDefaultMessage.Fail
          }
          else {
            return res.reason as string
          }
        })

        const failList = verifyResult.filter(isString)
        status.isError = failList.length !== 0
        status.messages = failList.length ? failList : [StatusVerifyDefaultMessage.Success]
        status.isVerifying = !!0

        formStatus.set(modelKey, status)
      }
      else {
        console.warn(`参数传递错误, 不能校验没有在模板中声明参数: ${modelKey}`)
      }
    }
  }
}
