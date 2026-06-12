import * as Yup from 'yup'

export const newsletterSchema = Yup.object({
  email: Yup.string()
    .trim()
    .lowercase()
    .max(50, 'Email cannot exceed 50 characters')
    .email('Enter a valid email address')
    .required('Email is required'),
})

export const heroSearchSchema = Yup.object({
  search: Yup.string()
    .trim()
    .max(100, 'Search cannot exceed 100 characters'),
  category: Yup.string().max(40),
})
