import * as Yup from 'yup'

const ISBN_REGEX = /^(?:\d{10}|\d{13})$/

export const sellerListingSchema = Yup.object({
  bookId: Yup.string().required('Select an approved book'),
  price: Yup.number()
    .typeError('Price must be a number')
    .positive('Price must be greater than 0')
    .max(99999, 'Price is too high')
    .required('Selling price is required'),
  mrp: Yup.number()
    .typeError('MRP must be a number')
    .positive('MRP must be greater than 0')
    .max(99999, 'MRP is too high')
    .required('MRP is required')
    .test('mrp-greater-price', 'MRP should be greater than or equal to selling price', function (value) {
      return !value || !this.parent.price || Number(value) >= Number(this.parent.price)
    }),
  stock: Yup.number()
    .typeError('Stock must be a number')
    .integer('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .max(10000, 'Stock is too high')
    .required('Stock is required'),
})

export const sellerListingUpdateSchema = Yup.object({
  price: Yup.number()
    .typeError('Price must be a number')
    .positive('Price must be greater than 0')
    .max(99999, 'Price is too high')
    .required('Selling price is required'),
  mrp: Yup.number()
    .typeError('MRP must be a number')
    .positive('MRP must be greater than 0')
    .max(99999, 'MRP is too high')
    .required('MRP is required')
    .test('mrp-greater-price', 'MRP should be greater than or equal to selling price', function (value) {
      return !value || !this.parent.price || Number(value) >= Number(this.parent.price)
    }),
  stock: Yup.number()
    .typeError('Stock must be a number')
    .integer('Stock must be a whole number')
    .min(0, 'Stock cannot be negative')
    .max(10000, 'Stock is too high')
    .required('Stock is required'),
  isActive: Yup.boolean().required(),
})

export const sellerBookRequestSchema = Yup.object({
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
