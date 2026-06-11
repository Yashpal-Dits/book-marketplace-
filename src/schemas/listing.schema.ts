import * as Yup from 'yup'

export const listingSchema = Yup.object({
  bookId: Yup.string()
  .required('Book is required'),

  price: Yup.number()
  .typeError('Price must be a number')
  .positive('Price must be greater than 0')
  .required('Price is required'),

  stock: Yup.number()
  .typeError('Stock must be a number')
  .min(0, 'Stock cannot be negative')
  .integer('Stock must be whole number')
  .required('Stock is required'),
})
