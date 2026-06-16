import * as Yup from 'yup'

const ISBN_REGEX = /^(?:\d{10}|\d{13})$/

export const bookRequestSchema = Yup.object({
  isbn: Yup.string()
  .trim()
  .required('ISBN is required'),

  title: Yup.string()
  .trim()
  .required('Title is required'),

  author: Yup.string()
  .trim()
  .required('Author is required'),

  publisher: Yup.string()
  .trim()
  .required('Publisher is required'),

  description: Yup.string()
  .trim()
  .required('Description is required'),

  coverImage: Yup.string()
  .url('Enter a valid image URL')
  .nullable(),

  category: Yup.string()
  .trim()
  .required('Category is required'),
})

export const adminBookUpdateSchema = Yup.object({
  isbn: Yup.string()
    .trim()
    .matches(ISBN_REGEX, 'ISBN must be 10 or 13 digits')
    .required('ISBN is required'),
  title: Yup.string().trim().min(2, 'Title is too short').max(120, 'Title is too long').required('Title is required'),
  author: Yup.string().trim().min(2, 'Author is too short').max(80, 'Author is too long').required('Author is required'),
  publisher: Yup.string().trim().min(2, 'Publisher is too short').max(80, 'Publisher is too long').required('Publisher is required'),
  category: Yup.string().trim().min(2, 'Category is too short').max(40, 'Category is too long').required('Category is required'),
  coverImage: Yup.string().trim().url('Enter a valid image URL').max(300, 'URL is too long').optional(),
  description: Yup.string()
    .trim()
    .min(20, 'Description must be at least 20 characters')
    .max(1000, 'Description is too long')
    .required('Description is required'),
})
