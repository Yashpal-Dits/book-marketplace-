import * as Yup from 'yup'

export const checkoutSchema = Yup.object({
  fullName: Yup.string()
  .trim()
  .required('Full name is required'),

  mobileNumber: Yup.string()
  .matches(/^[6-9]\d{9}$/, 'Enter a valid mobile number')
  .required('Mobile number is required'),

  addressLine: Yup.string()
  .trim()
  .required('Address is required'),

  city: Yup.string()
  .trim()
  .required('City is required'),

  state: Yup.string()
  .trim()
  .required('State is required'),

  pincode: Yup.string().matches(/^\d{6}$/, 'Enter a valid 6 digit pincode')
  .required('Pincode is required'),
})

