import { forwardRef } from "react";

const Card = forwardRef(
  (
    { children, className = "", padding = "p-6", hover = false, ...props },
    ref
  ) => {
    const baseClasses =
      "bg-white dark:bg-gray-800  rounded-lg border border-gray-200 dark:border-gray-700 transition-colors duration-200";
    const hoverClasses = hover ? "card-hover cursor-pointer" : "";
    const classes = `${baseClasses} ${hoverClasses} ${padding} ${className}`;

    return (
      <div ref={ref} className={classes} {...props}>
        {children}
      </div>
    );
  }
);

Card.displayName = "Card";

const CardHeader = forwardRef(({ children, className = "", ...props }, ref) => {
  return (
    <div ref={ref} className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  );
});

CardHeader.displayName = "CardHeader";

const CardTitle = forwardRef(({ children, className = "", ...props }, ref) => {
  return (
    <h3
      ref={ref}
      className={`text-lg font-semibold text-gray-900 dark:text-white ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
});

CardTitle.displayName = "CardTitle";

const CardContent = forwardRef(
  ({ children, className = "", ...props }, ref) => {
    return (
      <div ref={ref} className={className} {...props}>
        {children}
      </div>
    );
  }
);

CardContent.displayName = "CardContent";

const CardFooter = forwardRef(({ children, className = "", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={`mt-4 pt-4 border-t border-gray-200 dark:border-gray-700 text-gray-400 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
});

CardFooter.displayName = "CardFooter";

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
