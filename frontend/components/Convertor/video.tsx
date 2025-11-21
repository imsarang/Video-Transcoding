'use client'

import { useRouter } from "next/navigation"
import { JSX } from "react"
import { BsArrowLeft, BsArrowRight, BsScissors } from "react-icons/bs"
import { FaArrowAltCircleRight } from "react-icons/fa"

interface BasicComponentInterface {
    heading: string,
    subHeading: string,
    color: string,
    mainIcon: JSX.Element,
    subIcon?: JSX.Element,
    link: string
}

const BasicComponent = ({ ...props }: BasicComponentInterface) => {

    // props
    const { heading, subHeading, color, mainIcon, subIcon, link } = props

    // router
    const router = useRouter()
    return <div
        className={`flex flex-row bg-blue-200 p-8 text-white bg-gradient-to-l from-black to ${color} w-full mr-8 rounded-2xl cursor-pointer hover:scale-105 duration-500`}
        onClick={() => router.push(link)}
        >
        <span
            className="flex flex-col w-2/3">
            <span
                className="text-2xl font-bold">
                {heading}
            </span>
            <span
                className="pt-4 text-sm">
                {subHeading}
            </span>
        </span>
        <span
            className="flex flex-col items-center w-1/3 justify-center text-xl font-bold">
            <span>
                {mainIcon}
            </span>
            <span>
                {subIcon}
            </span>
        </span>
    </div>
}

export const BasicVideoFunctions = () => {

    const basicArray = [
        {
            heading: "Convert Video",
            subheading: "Convert video files to different formats",
            color: "bg-blue-400",
            mainIcon: <BsArrowRight size={24} />,
            subIcon: <BsArrowLeft size={24} />,
            link: '/convert/video'
        },
        {
            heading: "Convert Audio",
            subheading: "Convert audio files to different formats",
            color: "bg-orange-400",
            mainIcon: <BsArrowRight size={24} />,
            subIcon: <BsArrowLeft size={24} />,
            link:'/convert/audio'
        },
        {
            heading: "Convert Document",
            subheading: "Convert Docs to different formats",
            color: "bg-violet-400",
            mainIcon: <BsScissors size={24} />,
            link:'/trim/video'
            // subIcon: <BsArrowLeft size={24} />
        }
    ]
    return <div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {
            basicArray.map((item, index) => {
                return <BasicComponent
                    heading={item.heading}
                    subHeading={item.subheading}
                    color={item.color}
                    mainIcon={item.mainIcon}
                    subIcon={item.subIcon}
                    key={index}
                    link={item.link}
                />
            })
        }
    </div>
}