'use client'

import { useState } from "react"
import { FormInput } from "../Common/FormInput"
import { api } from "../../utils/apiUtils"
import toast from "react-hot-toast"
import { useDispatch } from "react-redux"
import { userLogin } from "../../redux/userSlice"
import { validateUsername } from "../../utils/validateUtils"

export default function Login() {

  const dispatch = useDispatch()

  const [user, setUser] = useState({
    email: "",
    password: ""
  })

  const handleCustomLogin = async (e: any) => {
    e.preventDefault()
    try {

      if(validateUsername(user.email)) {
        toast.error("Please enter a valid email address.")
        return false;
      }
      
      const response = await api.post('/auth/login', {
        email: user.email,
        password: user.password
      })
      // const response = await api.get('/users/')

      if (response.status === 200 || response.status === 201) {

        // alert("Login successful!")
        dispatch(userLogin({
          email: response.data.email,
          firstname: response.data.firstname,
          lastname: response.data.lastname,
          uuid: response.data.uuid,
          phoneNumber: response.data.phoneNumber,
          profileImage: response.data.profileImage,
          isLoggedIn: true
        }))

        window.location.reload()
        toast.success("Login successful!")
      }
    }
    catch (err) {
      console.error(err);
      toast.error("Login failed! Please try again.")
    }
  }

  return <div>
    <div
      className="p-4 text-xl">
      Login
    </div>
    <form
      onSubmit={handleCustomLogin}>
      <div
        className="mt-6 mx-4">
        <FormInput
          name='email'
          type='password'
          value={user.email}
          data={user}
          setData={setUser} />
      </div>

      <div
        className="mt-6 mx-4">
        <FormInput
          name='password'
          type="password"
          value={user.password}
          data={user}
          setData={setUser} />
      </div>

      <div
        className="mt-6 mx-4">
        <button
          className="w-full rounded-xl bg-blue-200 py-3 duration-500 cursor-pointer hover:scale-105">
          Login
        </button>
      </div>
    </form>

    <div
      className="mt-6 ml-4 relative">
      <hr
        className="dotted" />
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