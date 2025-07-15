import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "bg-white rounded-lg shadow-md p-4 transition-all duration-200 hover:shadow-lg",
      className
    )}
    {...props}
  />
));
Card.displayName = "Card";

export { Card }; 