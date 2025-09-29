import React, { JSX } from "react"

interface Content {
    name: string,
    icon: JSX.Element
}

interface SidebarContentInterface {
    openSidebar: boolean,
    sidebarArray: Content[]
}

export const SidebarContents = ({ ...props }: SidebarContentInterface) => {

    // props
    const { openSidebar, sidebarArray } = props

    return <div
    className={`pt-8 transition-all duration-500 ${openSidebar ? `w-24 sm:w-32 lg:w-48`: `w-8`}`}>
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
                        {React.cloneElement(item.icon, {size: 24})}
                    </span>

                    {/* name */}
                    <span
                    className={`pl-2 sm:pl-4 lg:pl-8 whitespace-nowrap overflow-hidden transition-all duration-500 ease-in-out ${openSidebar ? `max-w-full opacity-100`: `max-w-0 opacity-0`}`}>
                        {item.name}
                    </span>
                </div>
            })
        }
    </div>
}