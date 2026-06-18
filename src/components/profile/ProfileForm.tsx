import { useState, type TextareaHTMLAttributes } from 'react'
import { Form, Formik } from 'formik'
import { FiCamera, FiMail, FiMapPin, FiPhone, FiUser } from 'react-icons/fi'
import { Badge } from '@/components/common/Badge'
import { Button } from '@/components/common/Button'
import { FormInput } from '@/components/common/FormInput'
import type { ProfileFormProps } from '@/interfaces'

const fieldError = <TValues extends object>(
  errors: Partial<Record<keyof TValues, string>>,
  touched: Partial<Record<keyof TValues, boolean>>,
  name: keyof TValues,
) => (touched[name] && errors[name] ? String(errors[name]) : undefined)

const TextareaField = ({ label, error, className = '', ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string; error?: string; className?: string }) => (
  <label className={`block text-left ${className}`}>
    <span className="mb-1.5 block text-sm font-medium text-stone-700">{label}</span>
    <textarea
      className={`min-h-24 w-full rounded-xl border bg-white px-4 py-3 text-sm text-stone-900 outline-none transition placeholder:text-stone-400 focus:border-amber-700 focus:ring-4 focus:ring-amber-900/10 ${error ? 'border-red-400 focus:border-red-500 focus:ring-red-500/10' : 'border-stone-200'}`}
      {...props}
    />
    {error ? <span className="mt-1 block text-xs text-red-600">{error}</span> : null}
  </label>
)

export const ProfileForm = <TValues extends object>({
  eyebrow,
  title,
  highlight,
  description,
  sectionTitle,
  email,
  status,
  statusClassName,
  initialValues,
  validationSchema,
  fields,
  avatarField,
  displayName,
  locationText,
  noteTitle = '',
  noteDescription = '',
  submitLabel = 'Save profile',
  isSaving = false,
  wrapperClassName = 'mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8',
  onSubmit,
}: ProfileFormProps<TValues>) => {
  const [isImageUploaderOpen, setIsImageUploaderOpen] = useState(false)

  return (
    <section className={wrapperClassName}>
      <div className="rounded-[2rem] bg-[#0d2b1f] p-6 text-white shadow-sm sm:p-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-emerald-300">{eyebrow}</p>
        <h1 className="font-display mt-2 text-3xl font-extrabold uppercase sm:text-4xl">
          {title} <span className="text-[#f5862e]">{highlight}</span>
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/70">{description}</p>
      </div>

      <Formik<TValues>
        enableReinitialize
        initialValues={initialValues}
        validationSchema={validationSchema}
        onSubmit={onSubmit}
      >
        {({ values, errors, touched, handleChange, handleBlur, isSubmitting, setFieldValue }) => {
          const avatarUrl = String(values[avatarField] ?? '')
          const name = displayName(values).trim()
          const initials = name
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join('')
            .toUpperCase()
          const location = locationText?.(values)

          const handleImageFile = (file?: File) => {
            if (!file) return
            if (!file.type.startsWith('image/')) {
              window.alert('Please select an image file')
              return
            }
            if (file.size > 700 * 1024) {
              window.alert('Please select an image smaller than 700 KB')
              return
            }
            const reader = new FileReader()
            reader.onload = () => setFieldValue(String(avatarField), String(reader.result ?? ''))
            reader.readAsDataURL(file)
          }

          return (
            <Form className="mt-8 grid gap-6 lg:grid-cols-[320px_1fr]">
              <aside className="h-fit rounded-3xl border border-stone-200 bg-white p-6 text-center shadow-sm">
                <div className="mx-auto grid h-32 w-32 place-items-center overflow-hidden rounded-full bg-amber-100 text-4xl font-bold text-amber-800 ring-4 ring-amber-50">
                  {avatarUrl ? <img src={avatarUrl} alt="Profile" className="h-full w-full object-cover" /> : <span>{initials || <FiUser />}</span>}
                </div>
                <h2 className="mt-4 text-xl font-bold text-[#16243d]">{name || 'Profile'}</h2>
                <p className="mt-1 flex items-center justify-center gap-1.5 text-sm text-stone-500">
                  <FiMail /> {email}
                </p>
                {'mobileNumber' in values && String((values as Record<string, unknown>).mobileNumber ?? '') ? (
                  <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-stone-500">
                    <FiPhone /> {String((values as Record<string, unknown>).mobileNumber)}
                  </p>
                ) : null}
                {location ? (
                  <p className="mt-2 flex items-center justify-center gap-1.5 text-sm text-stone-500">
                    <FiMapPin /> {location}
                  </p>
                ) : null}
                {status ? <Badge className={`mt-4 ${statusClassName ?? ''}`}>{status}</Badge> : null}

                <Button
                  type="button"
                  variant="secondary"
                  className="mt-4 w-full gap-2"
                  onClick={() => setIsImageUploaderOpen((value) => !value)}
                >
                  <FiCamera /> {isImageUploaderOpen ? 'Hide upload options' : 'Update profile picture'}
                </Button>

                {isImageUploaderOpen ? (
                  <label
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => {
                      event.preventDefault()
                      handleImageFile(event.dataTransfer.files[0])
                    }}
                    className="mt-4 flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-stone-300 bg-white px-4 py-5 text-center transition hover:border-[#f0532d] hover:bg-orange-50"
                  >
                    <FiCamera className="text-xl text-[#f0532d]" />
                    <span className="mt-2 text-sm font-semibold text-[#16243d]">Upload image</span>
                    <span className="mt-1 text-xs leading-5 text-stone-500">Drag & drop here or click to choose from your device</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="sr-only"
                      onChange={(event) => handleImageFile(event.currentTarget.files?.[0])}
                    />
                  </label>
                ) : null}
              </aside>

              <div className="rounded-3xl border border-stone-200 bg-white p-5 shadow-sm sm:p-6">
                <div className="flex items-center gap-2 border-b border-stone-100 pb-4">
                  <FiCamera className="text-[#f0532d]" />
                  <h2 className="font-display text-xl font-extrabold uppercase text-[#16243d]">{sectionTitle}</h2>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {fields.map((field) => {
                    const name = field.name as keyof TValues
                    const commonProps = {
                      name: field.name,
                      value: String(values[name] ?? ''),
                      onChange: handleChange,
                      onBlur: handleBlur,
                      placeholder: field.placeholder,
                    }

                    if (field.as === 'textarea') {
                      return (
                        <TextareaField
                          key={field.name}
                          label={field.label}
                          className={field.className ?? 'md:col-span-2'}
                          error={fieldError(errors as Partial<Record<keyof TValues, string>>, touched as Partial<Record<keyof TValues, boolean>>, name)}
                          {...commonProps}
                        />
                      )
                    }

                    return (
                      <FormInput
                        key={field.name}
                        label={field.label}
                        type={field.type ?? 'text'}
                        inputMode={field.inputMode}
                        className={field.className}
                        error={fieldError(errors as Partial<Record<keyof TValues, string>>, touched as Partial<Record<keyof TValues, boolean>>, name)}
                        {...commonProps}
                      />
                    )
                  })}
                </div>

                <div className="mt-6 flex flex-wrap items-center justify-end gap-3">
                  {noteTitle || noteDescription ? (
                    <div className="flex-1 rounded-2xl border border-amber-200 bg-amber-50 p-3">
                      {noteTitle ? <h4 className="text-xs font-bold text-amber-900">{noteTitle}</h4> : null}
                      {noteDescription ? <p className="mt-0.5 text-xs text-amber-800">{noteDescription}</p> : null}
                    </div>
                  ) : null}
                  <Button type="submit" disabled={isSaving || isSubmitting}>
                    {isSaving ? 'Saving...' : submitLabel}
                  </Button>
                </div>
              </div>
            </Form>
          )
        }}
      </Formik>
    </section>
  )
}
