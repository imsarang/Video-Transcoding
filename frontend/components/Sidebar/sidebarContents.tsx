import { useRouter } from "next/navigation"
import React, { JSX } from "react"
import { FaDoorOpen } from "react-icons/fa6"

interface Content {
    name: string,
    icon: JSX.Element
}

interface SidebarContentInterface {
    openSidebar: boolean,
    sidebarArray: Content[]
    authArray?: Content[]
    isLoggedIn?: boolean
}

export const SidebarContents = ({ ...props }: SidebarContentInterface) => {

    // props
    const { openSidebar, sidebarArray, authArray, isLoggedIn } = props

    const router = useRouter()

    return <div
        className={`flex flex-col h-full justify-between pt-8 transition-all duration-500 ${openSidebar ? `w-24 sm:w-32 lg:w-48` : `w-8`}`}>
        <div>
            {
                sidebarArray.map((item, index) => {
                    return <div
                        className="flex mt-6 hover:scale-105 cursor-pointer hover:bg-gray-200 p-2 rounded-xl"
                        key={index}
                    >

                        {/* icon */}
                        <span
                            className="flex items-center">
                            {/* {item.icon} */}
                            {React.cloneElement(item.icon, { size: 24 })}
                        </span>

                        {/* name */}
                        <span
                            className={`pl-2 sm:pl-4 lg:pl-8 whitespace-nowrap overflow-hidden transition-all duration-500 ease-in-out ${openSidebar ? `max-w-full opacity-100` : `max-w-0 opacity-0`}`}>
                            {item.name}
                        </span>
                    </div>
                })
            }
        </div>
        <div
        className="mb-4">
            {
                isLoggedIn ?
                    authArray?.map((item, index) => {
                        return <div
                            className="flex hover:scale-105 cursor-pointer hover:bg-gray-200 p-2 rounded-xl"
                            key={index}
                        >

                            {/* icon */}
                            <span
                                className="flex items-center">
                                {/* {item.icon} */}
                                {React.cloneElement(item.icon, { size: 24 })}
                            </span>

                            {/* name */}
                            <span
                                className={`pl-2 sm:pl-4 lg:pl-8 whitespace-nowrap overflow-hidden transition-all duration-500 ease-in-out ${openSidebar ? `max-w-full opacity-100` : `max-w-0 opacity-0`}`}>
                                {item.name}
                            </span>
                        </div>
                    })
                    : <div
                            className="flex hover:scale-105 cursor-pointer hover:bg-gray-200 p-2 rounded-xl"
                            onClick={() => {
                              // handle login click
                              router.push('/auth')
                            }}
                        >

                            {/* icon */}
                            <span
                                className="flex items-center">
                                {/* {item.icon} */}
                                {/* {React.cloneElement(item.icon, { size: 24 })} */}
                                <FaDoorOpen size={24}/>
                            </span>

                            {/* name */}
                            <span
                                className={`pl-2 sm:pl-4 lg:pl-8 whitespace-nowrap overflow-hidden transition-all duration-500 ease-in-out ${openSidebar ? `max-w-full opacity-100` : `max-w-0 opacity-0`}`}>
                                Login
                            </span>
                        </div>
            }
        </div>

    </div>
}