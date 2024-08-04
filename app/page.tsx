import Image from "next/image";
import mylogo from '../public/Logo.svg'
import FileUploaderSection from "./FileUploaderSection";
import FileDownloaderSection from "./FileDownloaderSection";


export default function Home() {
  return (
    <div className="h-dvh flex flex-col">
      <div className="flex flex-col md:flex-row justify-center items-center">{/* for the top heading */}
        <Image className='m-2' src={mylogo} width={80} alt="the logo"/>
        <h3 className="m-2 md:w-9/12 text-center text-xl sm:text-2xl md:text-4xl font-semibold text-gray-200">Tranfer Your Files in Your Local Network</h3>
      </div>
      <div>{/* for file upload */}
        <FileUploaderSection/>
      </div>
      <div className="flex-grow bg-gray-200">{/* for file download */}
        <FileDownloaderSection/>
      </div>
    </div>
  )
}
