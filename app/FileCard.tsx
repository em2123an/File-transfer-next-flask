"use client"
import React from 'react'
import axios from 'axios'
import Image from 'next/image'
import folderImg from '../public/Folder_img.svg'
import fileDownImg from '../public/file_down_img.svg'
import { File } from 'buffer'

interface Fofile {
    filename : string,
    filepath : string,
    isfolder : boolean
}

interface Props {
    fofile:Fofile, 
    setFileLists:React.Dispatch<React.SetStateAction<[Fofile]>>, 
    setHoldPrev:React.Dispatch<React.SetStateAction<[[Fofile]]>>
}

const FileCard = ({fofile, setFileLists,setHoldPrev}: Props) => {
    const filename = fofile.filename
    const filepathsplit = filename.split('.')
    const filepath = fofile.filepath
    const[isLoading, setIsLoading] = React.useState(false)
    const[isError, setIsError] = React.useState(false)
    //run after every card click
    function handleFileClick(){
        setIsLoading(true)
        if(!(fofile.isfolder)){
            setIsLoading(false)
            const tempLink = document.createElement('a')
            tempLink.href = `http://192.168.1.18:8080/downloadfiles/${filepath}`
            tempLink.download = filename
            document.body.appendChild(tempLink)
            tempLink.click()
            document.body.removeChild(tempLink)
        }else{
            axios.get(`http://192.168.1.18:8080/downloadfiles/${filepath}`)
            .then((res)=>{
                if (res.status === 200){
                    console.log(res)
                    if(res.data.isFolder){
                        setIsLoading(false)
                        if(res.data.folderList.length>0){
                            setFileLists((cur)=>{
                                setHoldPrev((prev)=> {
                                    prev.push(cur)
                                    return prev
                                })
                                return res.data.folderList})
                        }else{
                            alert("Folder is empty")
                        }
                    }else{
                        
                            //    axios.get(`http://192.168.1.18:8080/downloadfiles/${filepath}`,{responseType:'blob'})
                            //    .then((response)=>{
                            //         setIsLoading(false)
                            //         //const myfileblob = new Blob([response.data])
                            //         //const myurl = window.URL.createObjectURL(myfileblob)
                            //         const tempLink = document.createElement('a')
                            //         tempLink.href = `http://192.168.1.18:8080/downloadfiles/${filepath}`
                            //         tempLink.download = filename
                            //         document.body.appendChild(tempLink)
                            //         tempLink.click()
                            //         document.body.removeChild(tempLink)
                            //         //window.URL.revokeObjectURL(myurl)
                            //    })
                            //    .catch((err)=>{
                            //         setIsError(true)
                            //         console.log(err)
                            //    }) 
                    }
                }else{throw new Error("not valid response")}
            })
            .catch((err)=>{
                setIsError(true)
                console.log(err)
            })
        }
    }
    return (
    <div className='m-2 p-2 max-w-36 flex flex-col justify-around items-center bg-gray-400 rounded' onClick={handleFileClick}>
        <Image className='m-1' src={fofile.isfolder ? folderImg : fileDownImg} alt='file_image'/>
        <p className='text-center text-base font-medium text-gray-800 overflow-hidden'>{
            filename.length >=14 ? filename.substring(0,15) + ' ...' + filepathsplit[filepathsplit.length-1] : filename
        }</p>
        {isLoading && <p className='text-center text-lg font-medium text-gray-800 overflow-hidden'>Please wait...</p>}
        {isError && <p className='text-center text-lg font-medium text-gray-800 overflow-hidden'>Can't open; please try again</p>}
    </div>
    )
}

export default FileCard