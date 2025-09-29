import Image from "next/image";
import { Sidebar } from "../../components/Sidebar";
import { Convertor } from "../../components/Convertor";

export default function Home() {
  return (
    // <div className="font-sans grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20">
    //     <Sidebar/>
    // </div>
    <div
    className="flex w-full h-screen">
      <Sidebar/>
      <Convertor/>
    </div>
  );
}
