import { Dispatch, SetStateAction } from "react"

interface HamburgerInterface {
    openSidebar: boolean,
    setOpenSidebar: Dispatch<SetStateAction<boolean>>
}

export const Hamburger = ({ ...props }: HamburgerInterface) => {

    // props
    const { openSidebar, setOpenSidebar } = props

    return <div
        onClick={() => setOpenSidebar(!openSidebar)}
        className="pt-2 pl-2 cursor-pointer">
        <div
            className={`w-6 h-1 rounded-2xl bg-black transform transition-transform duration-300 ease-in-out ${openSidebar ? "rotate-45 translate-y-2" : "rotate-0 translate-y-0"
                }`}
        ></div>

        <div
            className={`w-6 h-1 rounded-2xl bg-black mt-1 transition-opacity duration-300 ${openSidebar ? "opacity-0" : "opacity-100"
                }`}
        ></div>

        <div
            className={`w-6  h-1 rounded-2xl bg-black mt-1 transform transition-transform duration-300 ease-in-out ${openSidebar ? "-rotate-45 -translate-y-2" : "rotate-0 translate-y-0"
                }`}
        ></div>
    </div>
}