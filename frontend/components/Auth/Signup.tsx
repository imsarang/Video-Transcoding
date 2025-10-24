'use client'

import { useState } from "react"
import { FormInput } from "../Common/FormInput"
import { api } from "../../utils/apiUtils"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"

export default function Signup({...props}: any){
    
    const router = useRouter()
    
    const [user, setUser] = useState({
        email: "",
        password: "",
        confirmPassword: ""
    })

    const handleCustomSignup = async (e: any) => {
        e.preventDefault()
        try
        {
            const response = await api.post('/auth/signup',{
                email: user.email,
                password: user.password,
                confirmPassword: user.confirmPassword
            })

            if(response.status === 201 || response.status === 200){
                // alert("Signup successful! Please login to continue.")
                // props.setIsLogin(true)
                toast.success("Signup successful!.")
                router.push('/')
            }
        }
        catch(err)
        {
            console.error(err);
            toast.error("Signup failed! Please try again.")
        }
    }

    return <div
    className="pr-4">
        <div
        className="p-4 text-xl font-bold">
            Sign Up
        </div>
        <form
        onSubmit={handleCustomSignup}>
            <div
            className="mt-6 ml-4">
                <FormInput
                name='email'
                value= {user.email}
                data={user}
                setData={setUser}/>
            </div>
            <div
            className="mt-6 ml-4">
                <FormInput
                name='password'
                value= {user.password}
                data={user}
                setData={setUser}/>
            </div>
            <div
            className="mt-6 ml-4">
                <FormInput
                name='confirmPassword'
                value= {user.confirmPassword}
                data={user}
                setData={setUser}/>
            </div>

            <div
            className="mt-6 ml-4 pr-4 flex w-full justfy-center items-center">
                <button
                type="submit"
                className="bg-blue-200 w-full py-3 duration-500 hover:scale-105 cursor-pointer rounded-xl">
                    Register
                </button>
            </div>
        </form>
        <div
        className="mt-6 ml-4 relative">
        <hr
        className="dotted"/>
        <label
        className="absolute left-[40%] -translate-y-3 bg-white px-2 text-gray-500">
            or login with
        </label>
        </div>

        {/* google login button */}
        <div
        className="mt-6 ml-4">
            <button>
                Login with Google
            </button>
        </div>
    </div>
}