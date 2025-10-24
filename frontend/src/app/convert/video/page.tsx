import { ConvertVideo } from "../../../../components/Convert/Video"
import { Sidebar } from "../../../../components/Sidebar"

export default function ConvertVideoPage (){
    return <div
    className="flex w-full h-screen">
        <Sidebar/>
        <ConvertVideo/>
    </div>  
}