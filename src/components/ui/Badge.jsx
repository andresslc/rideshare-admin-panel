const Badge = ({
  children,
  variant = "default",
  size = "md",
  className = "",
}) => {
  const baseClasses = "inline-flex items-center font-medium rounded-full";

  const variants = {
    default: "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300",
    primary: "bg-primary-100/10 text-primary-800",
    success:
      "bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-400",
    warning: "bg-yellow-100 dark:bg-yellow-500/20 text-yellow-800 dark:text-yellow-400",
    danger: "bg-red-100 dark:bg-red-500/20 text-red-800 dark:text-red-400",
    info: "bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-400",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-0.5 text-sm",
    lg: "px-3 py-1 text-sm",
  };

  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`;

  return <span className={classes}>{children}</span>;
};

export default Badge;
