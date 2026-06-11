import * as Yup from 'yup'

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
