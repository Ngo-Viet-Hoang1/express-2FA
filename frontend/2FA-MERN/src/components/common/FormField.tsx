import type { UseFormRegisterReturn } from 'react-hook-form'
import { Field, FieldDescription, FieldLabel } from '../ui/field'
import { Input } from '../ui/input'

interface FormFieldProps {
  id: string
  label: string
  type: string
  placeholder?: string
  register: UseFormRegisterReturn
  description?: string
  error?: string
}

const FormField: React.FC<FormFieldProps> = ({
  id,
  label,
  type,
  placeholder,
  register,
  description,
  error,
}) => {
  return (
    <>
      <Field>
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <Input id={id} type={type} placeholder={placeholder} {...register} />
      </Field>
      {description && <FieldDescription>{description}</FieldDescription>}
      {error && (
        <FieldDescription className="text-red-500">{error}</FieldDescription>
      )}
    </>
  )
}

export default FormField
