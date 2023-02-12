import { cloneDeep, get, intersection, set } from 'lodash-es'
import { type Ref, computed, ref, shallowReactive, shallowRef, unref, watchEffect } from 'vue-demi'
import { flattenMapToObject } from '@bluryar/shared'
import { resolveUnref } from '@vueuse/shared'
import { type Service, useFormRequest } from './_useFormRequest'
import { FormItemChecker } from './FormItemChecker'
import type { FormStatus, KeyOf, UseFormOptions } from './types'
import { useFormProvide } from './useFormProvide'
import { type FormItemStatus, StatusVerifyDefaultMessage } from './FormItemStatus'

export function useForm<Params = {}, Response = {}>(options: UseFormOptions<Params, Response>) {
  const {
    service,
    defaultParams,
    formRequestOptions,
    rules = {},
    formRef: _formRef = shallowRef(null),
    shallowKeys = [],
  } = options

  const _defaultParams = cloneDeep(defaultParams)
  const getInitParams = () => {
    const raw = cloneDeep(_defaultParams)

    resolveUnref(shallowKeys).forEach((key) => {
      const val = get(raw, key)
      set(raw as object, key, shallowReactive(val))
    })

    return raw
  }

  const formRef = shallowRef(_formRef)

  const { formParams, formRequestReturns, syncParams } = useFormRequestion()

  const formCheckerReturns = useFormChecker()

  const {
    validate,
  } = formCheckerReturns

  const submit = async (fields?: KeyOf<Partial<Params>>[]) => {
    const res = await validate(fields)

    if (!res)
      throw new Error('校验失败')

    syncParams()

    return formRequestReturns.runAsync()
  }

  const reset = (fields?: KeyOf<Partial<Params>>[]) => {
    const initParams = getInitParams()

    if (fields?.length) {
      fields?.forEach((key) => {
        set(formParams.value, key, get(initParams, key))
      })
    }
    else { formParams.value = initParams }
  }

  return useFormProvide({
    formRef,
    formParams,

    formRequestReturns,

    submit,
    reset,

    ...formCheckerReturns,
  })

  function useFormChecker(): {
    formChecker: FormItemChecker<Params>
    formStatus: FormStatus<Params>
    formItemsStatus: Ref<Map<KeyOf<Partial<Params>>, FormItemStatus>>
    validate: (fields?: KeyOf<Partial<Params>>[]) => Promise<boolean>
    clearErrors: (fields?: KeyOf<Partial<Params>>[]) => void
  } {
    const formChecker = new FormItemChecker(formParams, getInitParams(), rules, shallowKeys)
    const { formItemsStatus } = formChecker

    const getStatusArrayByBool = (type: keyof FormItemStatus) => Array.from(unref(formItemsStatus)).filter(([, status]) => status[type])
    const errorsMap = computed(() => new Map(getStatusArrayByBool('isError')))
    const dirtyMap = computed(() => new Map(getStatusArrayByBool('isDirty')))
    const verifyingMap = computed(() => new Map(getStatusArrayByBool('isVerifying')))

    const isError = computed(() => !!resolveUnref(errorsMap).size)
    const isDirty = computed(() => !!resolveUnref(dirtyMap).size)
    const isVerifying = computed(() => !!resolveUnref(verifyingMap).size)

    const dirtyParams = computed(() => flattenMapToObject(resolveUnref(dirtyMap) as any) as Partial<Params>)

    const errorKeys = computed(() => Array.from((resolveUnref(errorsMap)).keys()))
    const dirtyKeys = computed(() => Array.from((resolveUnref(dirtyMap)).keys()))
    const verifyingKeys = computed(() => Array.from((resolveUnref(dirtyMap)).keys()))

    const checkForm = async () => {
      // 先同步表单数据
      formChecker.updateParamsPathMap()

      // 开启检查
      formChecker.checkDirty()
      // 开启校验
      await formChecker.checkVerify()
    }
    watchEffect(checkForm)

    const getErrorsByFields = (fields?: KeyOf<Partial<Params>>[]) => {
      const _errorKeys = resolveUnref(errorKeys)
      const errors = fields?.length ? intersection(_errorKeys, fields) : _errorKeys

      return new Map(
        Array
          .from(formItemsStatus.value)
          .filter(([key]) => errors.includes(key)),
      )
    }

    const validate = async (fields?: KeyOf<Partial<Params>>[]) => {
      await checkForm()
      const errors = getErrorsByFields(fields)
      return !!errors.size
    }

    const clearErrors = (fields?: KeyOf<Partial<Params>>[]) => {
      const errors = getErrorsByFields(fields)

      for (const [key, status] of formItemsStatus.value) {
        if (errors.has(key)) {
          status.isError = false
          status.messages = [StatusVerifyDefaultMessage.Success]
        }
      }
    }

    const formStatus: FormStatus<Params> = {
      errorsMap,
      dirtyMap,
      verifyingMap,

      isError,
      isDirty,
      isVerifying,

      errorKeys,
      dirtyKeys,
      verifyingKeys,

      dirtyParams,
    }

    return {
      formChecker,

      formStatus,

      formItemsStatus,

      validate,

      clearErrors,
    }
  }

  function useFormRequestion() {
    const _requestParams = ref(getInitParams()) as Ref<Partial<Params>>
    const formParams = ref(getInitParams()) as Ref<Partial<Params>>

    const formService: Service<Params, Response> = (params?: Partial<Params>) => service({ ...unref(_requestParams), ...params })

    const formRequestReturns = useFormRequest(formService, formRequestOptions)

    const syncParams = () => {
      _requestParams.value = formParams.value
    }

    return { formParams, formRequestReturns, syncParams }
  }
}
