'use client'

import { useRouter } from "next/navigation"
import { useSelector, useDispatch } from "react-redux"
import { userLogout } from "../../redux/userSlice"
import { FaDoorOpen, FaUserCircle } from "react-icons/fa"

export const Heading = () => {
    const router = useRouter()
    const dispatch = useDispatch()
    const isLoggedIn = useSelector((state: any) => state.user?.user?.isLoggedIn)

    const handleLogin = () => {
        router.push('/auth')
    }

    const handleLogout = () => {
        dispatch(userLogout())
        router.push('/auth')
    }

    const handleProfile = () => {
        // Add profile route if needed
        router.push('/profile')
    }

    return <div
    className="flex flex-row items-center justify-between w-full">
        <div className="flex flex-col">
            <span
            className="font-bold text-3xl"
            >
                Any Video Convertor
            </span>
            <span
            className="pt-2 text-gray-500 text-sm">
                All-in-one and easy-to-use Video Editing Tool
            </span>
        </div>
        <div className="flex items-center gap-4">
            {isLoggedIn ? (
                <>
                    <button
                        onClick={handleProfile}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 rounded-xl transition-colors"
                        title="Profile"
                    >
                        <FaUserCircle size={20} />
                        <span className="hidden sm:inline">Profile</span>
                    </button>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 rounded-xl transition-colors"
                        title="Logout"
                    >
                        <FaDoorOpen size={20} />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </>
            ) : (
                <button
                    onClick={handleLogin}
                    className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 rounded-xl transition-colors"
                    title="Login"
                >
                    <FaDoorOpen size={20} />
                    <span className="hidden sm:inline">Login</span>
                </button>
            )}
        </div>
    </div>
}