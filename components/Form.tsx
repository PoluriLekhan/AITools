import React from "react";

export default function Form({ children, ...props }: React.ComponentProps<"form">) {
  return <form {...props}>{children}</form>;
} 