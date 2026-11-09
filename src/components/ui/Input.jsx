import { forwardRef } from 'react'

const Input = forwardRef(({ 
  label, 
  prefix,
  error, 
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  ...props 
}, ref) => {
  const baseClasses = 'block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-black dark:text-gray-200 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm'
  const errorClasses = error ? 'border-red-300 focus:ring-red-500 focus:border-red-500' : ''
  
  return (
    <div className="space-y-1">
      {label && !prefix && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-400">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && (
          <span className="absolute left-3 w-28 text-xs font-medium text-gray-500 dark:text-gray-400 pointer-events-none whitespace-nowrap overflow-hidden text-ellipsis">
            {prefix}:
          </span>
        )}
        {leftIcon && !prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          ref={ref}
          className={`${baseClasses} ${errorClasses} ${prefix ? 'pl-32' : (leftIcon ? 'pl-10' : '')} ${rightIcon ? 'pr-10' : ''} ${className} bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600`}
          {...props}
        />
        {rightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {rightIcon}
          </div>
        )}
      </div>
      {error && (
        <p className="text-sm text-red-600">{error}</p>
      )}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  )
})

Input.displayName = 'Input'

export default Input
