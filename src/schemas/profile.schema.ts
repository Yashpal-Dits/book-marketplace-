import * as Yup from 'yup'

const NAME_REGEX = /^[A-Za-z]+(?:[ '-][A-Za-z]+)*$/
const BUSINESS_NAME_REGEX = /^[A-Za-z0-9]+(?:[ &.'-][A-Za-z0-9]+)*$/

const nameValidation = (label: string) =>
  Yup.string()
    .trim()
    .min(2, `${label} must be at least 2 characters`)
    .max(30, `${label} cannot exceed 30 characters`)
    .matches(NAME_REGEX, `${label} can contain only letters, spaces, apostrophe, or hyphen`)
    .required(`${label} is required`)

const mobileValidation = Yup.string()
  .trim()
  .matches(/^[6-9]\d{9}$/, 'Enter a valid 10 digit Indian mobile number')
  .required('Mobile number is required')

const optionalMobileValidation = Yup.string()
  .trim()
  .matches(/^[6-9]\d{9}$/, 'Enter a valid 10 digit Indian mobile number')
  .optional()

const addressValidation = (label = 'Address') =>
  Yup.string()
    .trim()
    .min(5, `${label} must be at least 5 characters`)
    .max(150, `${label} cannot exceed 150 characters`)
    .required(`${label} is required`)

const cityValidation = Yup.string().trim().min(2, 'City is too short').max(50, 'City is too long').required('City is required')
const stateValidation = Yup.string().trim().min(2, 'State is too short').max(50, 'State is too long').required('State is required')
const pincodeValidation = Yup.string().trim().matches(/^\d{6}$/, 'Enter a valid 6 digit pincode').required('Pincode is required')
const imageValidation = Yup.string()
  .trim()
  .max(1_000_000, 'Image is too large')
  .test('image-url-or-data-url', 'Enter a valid image URL or upload an image file', (value) => {
    if (!value) return true
    return value.startsWith('data:image/') || Yup.string().url().isValidSync(value)
  })
  .optional()

export const customerProfileSchema = Yup.object({
  firstName: nameValidation('First name'),
  lastName: nameValidation('Last name'),
  mobileNumber: mobileValidation,
  addressLine: addressValidation(),
  city: cityValidation,
  state: stateValidation,
  pincode: pincodeValidation,
  profileImage: imageValidation,
})

export const sellerProfileSchema = Yup.object({
  businessName: Yup.string()
    .trim()
    .min(2, 'Business name must be at least 2 characters')
    .max(80, 'Business name cannot exceed 80 characters')
    .matches(BUSINESS_NAME_REGEX, 'Business name contains invalid characters')
    .required('Business name is required'),
  contactPerson: nameValidation('Contact person'),
  mobileNumber: mobileValidation,
  businessAddress: addressValidation('Business address'),
  city: cityValidation,
  state: stateValidation,
  pincode: pincodeValidation,
  storeLogo: imageValidation,
})

export const adminProfileSchema = Yup.object({
  firstName: nameValidation('First name'),
  lastName: nameValidation('Last name'),
  mobileNumber: optionalMobileValidation,
  profileImage: imageValidation,
})
