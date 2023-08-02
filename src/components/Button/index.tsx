import { ButtonHTMLAttributes } from "react";

function Button(props: ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button {...props} className={`px-4 py-2 border-0 rounded-md ${props.className}`}>
      {props.children}
    </button>
  )
}

export { Button }
