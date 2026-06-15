import type { InputHTMLAttributes } from 'react'
import type { AnyObjectSchema } from 'yup'
import type { FormikHelpers } from 'formik'

export interface ProfileField {
  name: string
  label: string
  type?: InputHTMLAttributes<HTMLInputElement>['type']
  inputMode?: InputHTMLAttributes<HTMLInputElement>['inputMode']
  placeholder?: string
  as?: 'input' | 'textarea'
  className?: string
}

export interface ProfileFormProps<TValues extends object> {
  eyebrow: string
  title: string
  highlight: string
  description: string
  sectionTitle: string
  email: string
  status?: string
  statusClassName?: string
  initialValues: TValues
  validationSchema: AnyObjectSchema
  fields: ProfileField[]
  avatarField: keyof TValues
  displayName: (values: TValues) => string
  locationText?: (values: TValues) => string
  noteTitle?: string
  noteDescription?: string
  submitLabel?: string
  isSaving?: boolean
  wrapperClassName?: string
  onSubmit: (values: TValues, helpers: FormikHelpers<TValues>) => void
}
