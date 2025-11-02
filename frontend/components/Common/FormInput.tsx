'use client'

import { Dispatch, SetStateAction } from "react"

interface RegisterInterface {
    email: string,
    password: string,
    confirmPassword: string
}

interface LoginInterface {
    email: string,
    paassword: string
}

interface FormInputInterface {
    name: string,
    value: string,
    type: string,
    data: any | RegisterInterface | LoginInterface
    setData: any | Dispatch<SetStateAction<RegisterInterface | LoginInterface>>
}

export const FormInput = ({...props}: FormInputInterface) => {

    const {name, value, type, data, setData} = props
    return <div
    className="flex flex-col relative">
        <input
        type={type}
        name = {name}
        value={value}
        onChange={(e) => setData({...data, [e.target.name] : e.target.value})}
        id={`${name}-formInput`}
        placeholder=" "
        className="peer w-full border text-sm py-3 px-5 rounded focus:outline-none focus:border-blue-500"
        />
        <label 
        htmlFor={`${name}-formInput`}
        className={`
            absolute top-2.5 left-4 text-sm transition-all duration-500 bg-white
            peer-placeholder-shown:bg-white
            peer-placeholder-shown:text-gray-500
            peer-placeholder-shown:text-base
            peer-focus:-translate-y-5
            peer-focus:px-1
            peer-focus:left-4
            peer-focus:text-xs
            peer-focus:text-blue-400
            cursor-text
            pointer-events-none
            ${value === "" ? "translate-y-0":"-translate-y-5 px-1 text-xs" }
            `}
        >
            {name.includes('confirm') ? `Confirm ${name.split('confirm')[1]}` : `Enter ${name}`}
        </label>
    </div>
}