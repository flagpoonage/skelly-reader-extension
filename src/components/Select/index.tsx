import { SelectHTMLAttributes } from "react";

type Option = {
  text: string
  value: string
}

interface SelectProps {
  options: Option[]
  defaultValue?: string
  placeholder?: string
}

type Props = SelectHTMLAttributes<HTMLSelectElement> & SelectProps

function Select({options, defaultValue = '', placeholder = '', ...rest}: Props) {
  return (
    <select
      defaultValue={defaultValue}
      className="cursor-pointer bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
      {...rest}
    >
      {placeholder && (<option value='' disabled>{placeholder}</option>)}
      {options.map(({value, text}) => <option value={value} key={value}>{text}</option>)}
    </select>
  )
}

export { Select, Option }
