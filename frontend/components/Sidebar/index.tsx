'use client'

import { useState } from "react"
import { Hamburger } from "./hamburger"
import { SidebarContents } from "./sidebarContents"
import { FaClock, FaDoorOpen, FaFolder, FaHome, FaUserCircle, FaVideo } from "react-icons/fa"

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

const authArray = [
    {
        name:'Profile',
        icon: <FaUserCircle/>
    },
    {
        name: 'Logout',
        icon: <FaDoorOpen/>
    }
]

export const Sidebar = () => {

    // React states
    const [openSidebar, setOpenSidebar] = useState(false)

    // user login status
    const isLoggedIn = false; // Replace with actual login status

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
        authArray={authArray}
        isLoggedIn={isLoggedIn}
        />
    </div>
}