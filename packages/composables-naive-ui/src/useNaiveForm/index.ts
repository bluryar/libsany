import 'vue-demi'
import 'vue'
import '@vueuse/core'
import '@bluryar/shared'
import '@vue/runtime-core'

import { useComponentWrapper, useForm } from '@bluryar/composables'
import type { KeyOf, Rule as RawRule, UseFormOptions } from '@bluryar/composables'
import type { FormItemRule } from 'naive-ui'
import { NForm } from 'naive-ui'
import { type MaybeComputedRef, resolveUnref } from '@vueuse/shared'
import Schema from 'async-validator'
import { omit } from 'lodash-es'
import type { FormInst, FormItemRuleValidatorParams } from 'naive-ui/es/form/src/interface'
import { type ExtractPropTypes, shallowRef } from 'vue-demi'

const OmittedUseFormKeys = ['rules'] as const
type NaiveFormRulesRecord<Params = {}> = Record<KeyOf<Params>, FormItemRule | FormItemRule[]>
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

function resolveRules<Params = {}>(inputRules: MaybeComputedRef<NaiveFormRulesRecord<Params>>): MaybeComputedRef<Record<KeyOf<Params>, RawRule[]>> {
  function toUseFormRule(key: KeyOf<Params>, rules: FormItemRule[]): RawRule[] {
    const normalizeRules = rules.map((rule) => {
      const { validator, asyncValidator } = rule
      const cleanRule = omit(rule,
        [
          'key',
          'trigger',
          'renderMessage',
          'validator',
          'asyncValidator',
        ] as const,
      )
      if (validator) {
        return {
          ...cleanRule,
          asyncValidator: async (...args: FormItemRuleValidatorParams) => await validator(...args),
        }
      }
      if (asyncValidator) {
        return {
          ...cleanRule,
          asyncValidator: async (...args: FormItemRuleValidatorParams) => await asyncValidator(...args),
        }
      }
      return cleanRule
    })

    return normalizeRules
      .map(
        rule =>
          (val: unknown) =>
            new Schema({ [key]: rule as any })
              .validate({ [key]: val })
              .then(() => !!1)
              .catch(err => err),
      )
  }

  return () => Object.fromEntries(
    new Map(
      Object
        .entries(resolveUnref(inputRules))
        .map(([key, rule]) => [key as KeyOf<Params>, _toArray(rule)] as const)
        .map(([key, rule]) => [key as KeyOf<Params>, toUseFormRule(key, rule)] as const),
    ),
  ) as Record<KeyOf<Params>, RawRule[]>
}

export function useNaiveForm<Params = {}, Response = {}>(options: UseNaiveFormOptions<Params, Response>) {
  const {
    rules = () => ({}),
  } = options

  const nFormRef = shallowRef<FormInst | null>(null)

  const useComponentWrapperReturns = useComponentWrapper({
    component: NForm,
    ref: nFormRef,
    state: getFormState,
  })

  const getRules = () => resolveRules(rules as any)

  const useFormReturns = useForm({
    ...options,
    rules: () => getRules() as any,
  })

  const { Wrapper: NFromWrapper } = useComponentWrapperReturns

  function getFormState(): NFormProps {
    return {
      model: useFormReturns.formParams.value,
      rules: rules as any,
    }
  }

  return {
    ...useFormReturns,
    ...useComponentWrapperReturns,
    NFromWrapper,
  }
}
