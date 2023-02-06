import { type ExtractPropTypes, nextTick, shallowRef } from 'vue-demi'
import { resolveUnref } from '@vueuse/shared'
import type { FormInst, FormItemRule } from 'naive-ui'
import { NForm } from 'naive-ui'
import { useComponentWrapper } from '../useComponentWrapper'
import type { KeyOf, MaybeShallowRef, UseFormOptions } from './types'
import { useForm } from './useForm'
import type { FormStatusItem } from './_useFormRules'

type NFormProps = ExtractPropTypes<InstanceType<typeof NForm>['$props']>

export interface UseNaiveFormOptions<Params = {}, Response = {}> extends Omit<UseFormOptions<Params, Response>, 'formRef'> {
  /**
   * NForm 的组件实例
   */
  formRef?: MaybeShallowRef<FormInst | null>

  validate?: Parameters<FormInst['validate']>
}

export function useNaiveForm<Params = {}, Response = {}>(_options: UseNaiveFormOptions<Params, Response>) {
  const nFormRef = shallowRef<FormInst | null>(null)

  const {
    Wrapper: MFormWrapper,
  } = useComponentWrapper({
    component: NForm,
    state: getNFormState,
    ref: nFormRef,
  })

  const useFormResult = useForm({
    ..._options,
    formRef: nFormRef,
  })
  const {
    formParams,
    status,
    rules,
  } = useFormResult

  function getNFormState(): NFormProps {
    const nFormRules = Object
      .entries(resolveUnref(rules))
      .map(([key]) => nFormRulesTransformer<Params>(key, status))

    return {
      ref: nFormRef,
      model: formParams.value,
      rules: Object.fromEntries(nFormRules),
    }
  }

  const submit: (typeof useFormResult)['submit'] = (params, options) => {
    return submit(params, {
      ...options,
      onAfterVerify(fields) {
        return nFormRef.value?.validate(
          (errors) => {
            if (errors) {
              console.error(errors)
              throw new Error('校验失败')
            }
          },
          ({ key }) => {
            if (!fields || !key)
              return !!1
            return fields.includes(key)
          },
        ) || Promise.resolve()
      },
    })
  }

  return {
    ...useFormResult,

    MFormWrapper,
    formRef: nFormRef,
    submit,
  }
}

function nFormRulesTransformer<Params = {}>(key: string, status: Map<KeyOf<Params>, FormStatusItem>): (string | FormItemRule)[] {
  return [
    key,
    {
      key,
      trigger: ['blur', 'change'],
      validator() {
        return new Promise<void>((resolve, reject) => {
          // 将UI组件的校验迟延后
          nextTick().then(() => {
            const res = status.get(key) || { isError: !!1, messages: ['表单项校验失败'], isVerifying: !!0 }
            if (res.isVerifying)
              reject(new Error('校验中...'))
            if (res.isError)
              reject(new Error(res.messages[0]))

            else
              resolve()
          })
        })
      },
    } as FormItemRule,
  ]
}
