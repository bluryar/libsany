import 'vue-demi'
import 'vue'
import '@vueuse/core'
import '@vue/runtime-core'

import { useComponentWrapper, useForm } from '@bluryar/composables'
import type { KeyOf, AsyncRule as SimpleAsyncRule, UseFormOptions } from '@bluryar/composables'
import type { FormItemRule } from 'naive-ui'
import { NForm } from 'naive-ui'
import { type MaybeComputedRef, resolveUnref } from '@vueuse/shared'
import type { RuleItem } from 'async-validator'
import { omit } from 'lodash-es'
import type { FormInst } from 'naive-ui/es/form/src/interface'
import { type ExtractPropTypes, ref, shallowRef } from 'vue-demi'
import { isTrue, isUndef } from '@bluryar/shared'

const OmittedUseFormKeys = ['rules'] as const
type NaiveFormRulesRecord<Params = {}> = { [P in KeyOf<Partial<Params>>]: FormItemRule | FormItemRule[]; }
type AsyncValidatorRulesRecord<Params = {}> = { [P in KeyOf<Partial<Params>>]: RuleItem[]; }
type SimpleRulesRecord<Params = {}> = { [K in KeyOf<Partial<Params>>]: SimpleAsyncRule[] }
type NFormProps = ExtractPropTypes<InstanceType<typeof NForm>['$props']>

function _toArray<T>(val: T | T[]): T[] {
  return Array.isArray(val) ? val : [val]
}

export interface UseNaiveFormOptions<Params = {}, Response = {}> extends Omit<UseFormOptions<Params, Response>, typeof OmittedUseFormKeys[number]> {
  /**
   * 重载 `useForm` 的类型， 使其成为 `async-validator` 的类型
   */
  rules?: MaybeComputedRef<NaiveFormRulesRecord<Params>>
}

const OmittedRuleKeys = ['key', 'trigger', 'validator', 'asyncValidator', 'renderMessage'] as const

export function useNaiveForm<Params = {}, Response = {}>(options: UseNaiveFormOptions<Params, Response>) {
  const simpleRulesMap = ref(new Map<KeyOf<Partial<Params>>, SimpleAsyncRule[]>(new Map([])))

  const nFormRef = shallowRef<FormInst | null>(null)
  const {
    rules = () => ({} as any),
  } = options

  const formWrapperReturns = useComponentWrapper({
    ref: nFormRef,
    component: NForm,
    state: getFormState,
  })
  const useFormReturns = useForm({
    ...options,
    formRef: nFormRef,
    rules: () => getUseFormRules(),
  })

  function getFormState(): NFormProps {
    return {
      model: useFormReturns.formParams.value,
      rules: resolveUnref(rules),
    }
  }

  function getUseFormRules(): SimpleRulesRecord<Params> {
    const res = Object.fromEntries(simpleRulesMap.value) as SimpleRulesRecord<Params>
    return res
  }
  return {
    ...useFormReturns,
    ...formWrapperReturns,
    NFromWrapper: formWrapperReturns.Wrapper,
  }
}

export function getAsyncValidatorRules<Params = {}>(nFormRules: NaiveFormRulesRecord<Params>): AsyncValidatorRulesRecord<Params> {
  const nFormRulesMap = new Map(Object.entries(nFormRules))
  const asyncRulesMap = Array.from(nFormRulesMap, ([key, rules]) => {
    const aRules = _toArray(rules).map((rule) => {
      const { validator, asyncValidator, message } = rule

      const getTransformValidator = async (...args: Parameters<NonNullable<RuleItem['asyncValidator']>>) => {
        const [rule, value, callback, source, options] = args
        const res = await validator!(rule as any, value, callback, source, options)
        // boolean | Error | Error[] | Promise<void> | undefined;
        const isPass = isUndef(res) || isTrue(res)
        if (isPass)
          return undefined

        else
          throw res || new Error(resolveUnref(message))
      }
      const getTransformAsyncValidator = async (...args: Parameters<NonNullable<RuleItem['asyncValidator']>>) => {
        const [rule, value, callback, source, options] = args
        await asyncValidator!(rule as any, value, callback, source, options)
      }

      const tRule: RuleItem = {
        ...omit(rule, OmittedRuleKeys),
        asyncValidator: (...args) => !isUndef(validator) ? getTransformValidator(...args) : !isUndef(asyncValidator) ? getTransformAsyncValidator(...args) : undefined,
      }
      return tRule
    })

    return [key, aRules]
  })
  // TODO
  return Object.fromEntries(asyncRulesMap)
}
