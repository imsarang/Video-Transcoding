import { Heading } from "./heading"
import { OtherFunctionalities } from "./others"
import { BasicVideoFunctions } from "./video"

export const Convertor = () => {
    return <div
        className="flex flex-col w-full min-h-screen">
        {/* <div
            className="p-4 text-customText font-bold text-lg ">
            Toolkits
        </div> */}

        {/* main content */}
        <div
            className="m-4 flex flex-col bg-white h-full p-8 rounded-xl">
            {/* heading */}
            <div>
                <Heading />
            </div>

            {/* video convertion, download and trim */}
            <div
            className="pt-8">
                <BasicVideoFunctions />
            </div>

            {/* other functionalities */}
            <div
            className="pt-16">
                <OtherFunctionalities />
            </div>
        </div>
    </div>
}