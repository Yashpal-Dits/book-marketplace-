import * as Yup from 'yup'

const NAME_REGEX = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/
const BUSINESS_NAME_REGEX = /^[A-Za-z0-9]+(?:[ &.'-][A-Za-z0-9]+)*$/

const EMAIL_MAX_LENGTH = 50
const PASSWORD_MIN_LENGTH = 8
const PASSWORD_MAX_LENGTH = 50

const emailValidation = Yup.string()
  .trim()
  .lowercase()
  .max(EMAIL_MAX_LENGTH, `Email cannot exceed ${EMAIL_MAX_LENGTH} characters`)
  .email('Enter a valid email address')
  .required('Email is required')

const passwordValidation = Yup.string()
  .min(
    PASSWORD_MIN_LENGTH,
    `Password must be at least ${PASSWORD_MIN_LENGTH} characters`,
  )
  .max(
    PASSWORD_MAX_LENGTH,
    `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters`,
  )
  .matches(/[a-z]/, 'Password must contain at least one lowercase letter')
  .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .matches(/[0-9]/, 'Password must contain at least one number')
  .matches(/[^A-Za-z0-9]/, 'Password must contain at least one special character')
  .required('Password is required')

export const loginSchema = Yup.object({
  email: emailValidation,

  password: Yup.string()
    .max(
      PASSWORD_MAX_LENGTH,
      `Password cannot exceed ${PASSWORD_MAX_LENGTH} characters`,
    )
    .required('Password is required'),
})

export const customerRegisterSchema = Yup.object({
  firstName: Yup.string()
    .trim()
    .min(2, 'First name must be at least 2 characters')
    .max(30, 'First name cannot exceed 30 characters')
    .matches(
      NAME_REGEX,
      'First name can contain only letters, spaces, apostrophe, or hyphen',
    )
    .required('First name is required'),

  lastName: Yup.string()
    .trim()
    .min(2, 'Last name must be at least 2 characters')
    .max(30, 'Last name cannot exceed 30 characters')
    .matches(
      NAME_REGEX,
      'Last name can contain only letters, spaces, apostrophe, or hyphen',
    )
    .required('Last name is required'),

  email: emailValidation,

  password: passwordValidation,
})

export const sellerRegisterSchema = Yup.object({
  businessName: Yup.string()
    .trim()
    .min(2, 'Business name must be at least 2 characters')
    .max(80, 'Business name cannot exceed 80 characters')
    .matches(BUSINESS_NAME_REGEX, 'Business name contains invalid characters')
    .required('Business name is required'),

  contactPerson: Yup.string()
    .trim()
    .min(2, 'Contact person name must be at least 2 characters')
    .max(60, 'Contact person name cannot exceed 60 characters')
    .matches(
      NAME_REGEX,
      'Contact person name can contain only letters, spaces, apostrophe, or hyphen',
    )
    .required('Contact person is required'),

  email: emailValidation,

  mobileNumber: Yup.string()
    .trim()
    .matches(/^[6-9]\d{9}$/, 'Enter a valid 10 digit Indian mobile number')
    .required('Mobile number is required'),

  password: passwordValidation,
})