'use client'

import { useState } from "react"
import { Hamburger } from "./hamburger"
import { SidebarContents } from "./sidebarContents"
import { FaClock, FaFolder, FaHome, FaVideo } from "react-icons/fa"

const sidebarArray = [
    {
        name:'Home',
        icon: <FaHome/>
    },
    {
        name:'History',
        icon: <FaClock/>
    },
    {
        name:'Saved',
        icon: <FaFolder/>
    },
    {
        name:'My Videos',
        icon: <FaVideo/>
    }
]
export const Sidebar = () => {

    // React states
    const [openSidebar, setOpenSidebar] = useState(false)

    return <div
    className="flex flex-col p-4">
        {/* hamburger */}
        <Hamburger
        openSidebar={openSidebar}
        setOpenSidebar={setOpenSidebar}
        />
        {/* sidebar contents */}
        <SidebarContents
        openSidebar={openSidebar}
        sidebarArray={sidebarArray}
        />
    </div>
}