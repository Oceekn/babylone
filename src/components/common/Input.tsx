import './Input.css'

interface InputProps {
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void
  disabled?: boolean
  label?: string
  icon?: React.ReactNode
  rightIcon?: React.ReactNode
  error?: string
  className?: string
}

const Input = ({ 
  type = 'text', 
  placeholder, 
  value, 
  onChange, 
  onKeyPress,
  disabled,
  label,
  icon,
  rightIcon,
  error,
  className = ''
}: InputProps) => {
  return (
    <div className={`input-wrapper ${className}`.trim()}>
      {label && <label className="input-label">{label}</label>}
      <div className="input-container">
        {icon && <span className="input-icon-left">{icon}</span>}
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onKeyPress={onKeyPress}
          disabled={disabled}
          className={`input ${error ? 'error' : ''}`}
        />
        {rightIcon && <span className="input-icon-right">{rightIcon}</span>}
      </div>
      {error && <span className="input-error">{error}</span>}
    </div>
  )
}

export default Input

