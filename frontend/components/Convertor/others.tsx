import { JSX } from "react"
import { BiCrop, BiFolder, BiMerge, BiPaint, BiVideoRecording } from "react-icons/bi"
import { BsFillClockFill } from "react-icons/bs"
import { FaCompress } from "react-icons/fa"
import { MdAudioFile, MdBrandingWatermark } from "react-icons/md"
import { SlSpeech } from "react-icons/sl"

interface OtherComponentsInterface {
    heading: string,
    content: string,
    icon: JSX.Element
}

const OtherFunctionsComponents = ({ ...props }: OtherComponentsInterface) => {

    // props
    const { heading, content, icon } = props

    return <div
        className="flex flex-col border-gray-200 border-1 shadow-md p-4 hover:scale-105 duration-500 cursor-pointer rounded-xl">

        {/* icon */}
        <span
        className="flex items-center justify-center">
            {icon}
        </span>

        {/* heading */}
        <span
        className="flex justify-center items-center text-xl font-bold pt-4 text-center">
            {heading}
        </span>

        {/* content */}
        <span
        className="flex justify-center items-center pt-2 text-md text-center">
            {content}
        </span>
    </div>
}

export const OtherFunctionalities = () => {

    const otherFunctionsArray = [
        {
            heading: 'Merge Video',
            content: 'Combine multiple video clips into one',
            icon: <BiMerge size={48}/>
        },
        {
            heading: 'Compress Video',
            content: 'Reduce video file size',
            icon: <FaCompress size={48}/>
        },
        {
            heading: 'Speech to Text',
            content: 'Convert audio files into text files',
            icon: <SlSpeech size={48}/>
        },
        {
            heading: 'Screen Record',
            content: 'Capture everything from your screen',
            icon: <BiVideoRecording size={48}/>
        },
        {
            heading: 'Add Audio',
            content: 'Add Background Audio to your Video',
            icon: <MdAudioFile size={48}/>
        },
        {
            heading: 'Add Watermark',
            content: 'Apply text watermarks to your video',
            icon: <MdBrandingWatermark size={48}/>
        },
        {
            heading: 'Crop Video',
            content: 'Remove unwanted parts from your video',
            icon: <BiCrop size={48}/>
        },
        {
            heading: 'Adjust Colour',
            content: 'Enhance videos with colour adjustments',
            icon: <BiPaint size={48}/>
        },
        {
            heading: 'Speed Change',
            content: 'Adjust the video playback speed',
            icon: <BsFillClockFill size={48}/>
        },
        {
            heading: 'Video Overlay',
            content: 'Overlay multiple videos on top on another',
            icon: <BiFolder size={48}/>
        }
    ]
    return <div
    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {
            otherFunctionsArray.map((item, index) => {
                return <OtherFunctionsComponents
                    heading={item.heading}
                    content={item.content}
                    icon={item.icon}
                    key={index}
                />
            })
        }
    </div>
}