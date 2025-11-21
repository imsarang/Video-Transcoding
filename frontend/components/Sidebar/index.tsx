'use client'

import { useEffect, useState } from "react"
import { Hamburger } from "./hamburger"
import { SidebarContents } from "./sidebarContents"
import { FaClock, FaDoorOpen, FaFolder, FaHome, FaUserCircle, FaVideo } from "react-icons/fa"
import { useSelector } from "react-redux"

const sidebarArray = [
    {
        name:'Home',
        route: '/',
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
    const isLoggedIn = useSelector((state: any) => state.user?.user?.isLoggedIn);
    // user login status
    // const isLoggedIn = false; // Replace with actual login status
    // const [isLoggedIn, setIsLoggedIn] = useState(false);
    

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
        isLoggedIn={isLoggedIn}
        />
    </div>
}