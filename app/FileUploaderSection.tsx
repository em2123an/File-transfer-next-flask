"use client"
import React from 'react'
import Image from 'next/image'
import uploadsvg from '../public/Upload.svg'
import axios from 'axios'


const FileUploaderSection = () => {
    let fileInput = React.createRef<HTMLInputElement>()
    const [progress, setProgress] = React.useState(0)
    const [isStarting, setIsStarting] = React.useState(false)
    const [isError, setIsError] = React.useState(false)
    const addr_ip = window.location.hostname
    const addr_port = '8080'
    const addr_com = addr_ip + ':' + addr_port
    function handleOnSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if(!(fileInput.current?.files?.length)){
            alert("please select a file")
            return
        }
        const myFile = fileInput.current.files[0]
        //const myFile = e.target.files[0]
        const myFileSize = myFile.size
        const myFileName = myFile.name
        const chunksize = 4096 * 25 * 5; 
        const totalNumberChunks = Math.ceil(myFileSize/chunksize)
        setIsStarting(true)
        setProgress(0)
        for (let chunkSent = 0; chunkSent < totalNumberChunks; chunkSent++ ){
            const start = chunkSent * chunksize
            let end = (chunkSent + 1) * chunksize
            // end = end >=chunksize ? chunksize : end
            const chunkData = myFile.slice(start,end)
            const myFormData = new FormData()
            myFormData.append('file_name', myFileName)
            myFormData.append('file_size', myFileSize.toString())
            myFormData.append('chunk_size', chunksize.toString())
            myFormData.append('total_number_chunks', totalNumberChunks.toString())    
            myFormData.append('chunk_data', chunkData)
            myFormData.append('chunk_offset', start.toString())
            myFormData.append('chunk_no', (chunkSent+1).toString())
            axios.post(`http://${addr_com}/download_from_react`,myFormData,{
            })
                .then((res)=> {
                    if(res.status === 200)
                    {
                        console.log(`chunk ${chunkSent+1} of ${totalNumberChunks} sent successfully`)
                        console.log(res.data)
                        setIsStarting(false)
                        setProgress(((chunkSent+1)/totalNumberChunks))
                        //setProgress(((chunkSent+1)/totalNumberChunks)*100)
                        if (chunkSent+1 === totalNumberChunks){
                            setProgress(0)
                            alert('Upload Complete!')
                            location.reload()
                        }
                    }
                })
                .catch((err) => {
                    console.log(err)
                    console.log(`chunk ${chunkSent+1} of ${totalNumberChunks} not sent`)
                    alert('upload not Successful :(')
                    setIsStarting(false)
                    setIsError(true)
                    setProgress(0)
                })
        }
    }

  return (
    <div className='flex flex-row md:justify-center items-center bg-gray-400 text-gray-100 p-8'>
        <Image className='m-4 hidden sm:inline' src={uploadsvg} width={80} alt='upload logo'/>
        <form className='ml-4 p-4 w-full md:w-8/12 flex flex-col items-center' onSubmit={(e)=>{handleOnSubmit(e)}}>
          <input className='p-2 m-2 w-full bg-gray-600 border-gray-600 rounded`' type="file" name="file_upload" ref={fileInput}/>
          {progress>0 && <progress value={progress}/>}
          {isError && <p className='p-2 m-2 text-center text-sm'>Unexpected error: Unable to upload a file</p>}
          {isStarting && <p className='p-2 m-2 text-center text-sm'>Uploading...</p>}
          <button className='p-2 m-2 w-6/12 md:w-5/12 bg-gray-600 border-gray-600 rounded'>Upload</button>
        </form>
    </div>
  )
}



export default FileUploaderSection