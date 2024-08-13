"use client"
import React from 'react'
import axios from 'axios'
import FileCard from './FileCard'

interface Fofile {
    filename : string,
    filepath : string,
    isfolder : boolean
}

const FileDownloaderSection = () => {
    const [fileLists, setFileLists] = React.useState<[Fofile]>([{filename:"",filepath:"",isfolder:false}])
    const [holdPrev, setHoldPrev] = React.useState<[[Fofile]]>([[{filename:"",filepath:"", isfolder:false}]])
    const [isLoading, setIsLoading] = React.useState(true)
    const [isError, setIsError] = React.useState(false)

    //runs on the first to set to shared folder base directory; after that to set it to prev
    React.useEffect(()=>{
        const addr_ip = window.location.hostname
        const addr_port = '8080'
        const addr_com = addr_ip + ':' + addr_port
        axios.get(`http://${addr_com}/download`)
            .then((res)=> {
                setIsLoading(false)
                setFileLists((prev)=>{
                    setHoldPrev([prev])
                    return res.data.folderList})
            })
            .catch((err)=> {
                setIsLoading(false)
                setIsError(true)
                console.log(err)
            })
    },[])

    //function for the back click
    function handleOnBackClick(){
        setFileLists((prev)=>{
            return holdPrev.pop() && holdPrev.length>=1 ? holdPrev.pop()! : prev 
        })
    }

    if(isLoading) return <div className='flex justify-center items-center text-gray-600'><p className='p-5 text-center text-lg '>Loading...</p></div>
    
    if(isError) return <div className='flex justify-center items-center text-gray-600'><p className='p-5 text-center text-lg '>Unexpected error. Please try again later</p></div>

    return (
        <div>
            <div className="p-2 flex items-center bg-gray-500 text-gray-200">
            {/*heading for the list of files */}
            {/*<Image className='mx-2' src={downloadsvg} width={60} alt="download logo"/>*/}
            <button className='bg-gray-700 text-gray-200 rounded p-2 sm:p-1 sm:w-28' onClick={handleOnBackClick}>Back</button>
            <h4 className="m-2 flex-grow text-center text-xl font-semibold sm:text-2xl md:text-3xl">Shared Files from the host</h4>
            </div>
            <div>
            {/*List of files from shared folder */}
                <div className='p-5 flex flex-wrap justify-start'>
                    {
                    fileLists.map((fflist)=>{
                        if(fflist.filename=='' || fflist.filepath == ''){return}
                        return (
                            <FileCard key={fflist.filename} fofile={fflist} setFileLists={setFileLists} setHoldPrev={setHoldPrev}/>
                        )
                    })}
                </div>
            </div>
        </div>
    )

    return (
    <div className='p-5 flex flex-wrap justify-start'>
        {
        fileLists.map((fflist)=>{
            if(fflist.filename=='' || fflist.filepath == ''){return}
            return (
                <FileCard key={fflist.filename} fofile={fflist} setFileLists={setFileLists} setHoldPrev={setHoldPrev}/>
            )
        })}
    </div>
  )
}

export default FileDownloaderSection