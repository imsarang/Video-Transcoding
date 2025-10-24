'use client'
import React, { HTMLInputTypeAttribute, useState } from "react"
import { BiUpload } from "react-icons/bi"

const VIDEO_FORMATS = ["mp4", "webm", "avi", "mov", "mkv"]

function formatDuration(seconds: number): string{
  if(isNaN(seconds) || seconds <= 0) return "00:00:00"

  const hrs = Math.floor(seconds/3600)
  const mins = Math.floor((seconds%3600)/60)
  const secs = Math.floor(seconds%60)

  const pad = (n: number) => n.toString().padStart(2, "0")
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`
}

function formatSize(bytes: number): string {
  if(bytes === 0) return "0 B"

  const sizes = ["B", "KB", "MB", "GB", "TB"]
  const i = Math.floor(Math.log(bytes) / Math.log(1024))
  const value = bytes/ Math.pow(1024, i)
  return `${value.toFixed(2)} ${sizes[i]}`
}

export const ConvertVideo = () => {

    // custom react states
    const [file, setFile] = useState(null)
    const [metadata, setMetadata] = useState({
        name: "",
        size: 0.0,
        duration: 0.0,
        type: ""
    })
    const [uploadProgress, setUploadProgress] = useState(0)
    const [targetFormat, setTargetFormat] = useState("")
    const [convertedFileUrl, setConvertedUrl] = useState(null)
    const [previewFile, setPreviewFile] = useState<string| null>(null)

    // file ui methods
    const handleVideoFileChange = (e: any) => {
      const selectedFile = e.target.files?.[0]
      if(!selectedFile)
        return
      
      // cleanup prior url
      if(previewFile)
      {
        URL.revokeObjectURL(previewFile)
      }
      
      setFile(selectedFile)
      setConvertedUrl(null)

      // extract metadata
      const video = document.createElement("video")
      video.preload = "metadata"
      video.onloadedmetadata = () => {
        URL.revokeObjectURL(video.src)
        setMetadata({
          name: selectedFile.name,
          size: parseFloat((selectedFile.size.toFixed(2))), //MB
          duration: parseFloat(video.duration.toFixed(2)), //seconds
          type: selectedFile.type.split("/")[1]
        })
      }
      video.src = URL.createObjectURL(selectedFile)
      setPreviewFile(video.src)
      
      // file upload
      // upload file to s3 bucket, via api-gateway
      // get presigned uri
      
      // after success, make the progress to 100, else make it step by step till it happens
      setUploadProgress(100)
    }

    // file convertion
    const handleFileConvertion = async () => {
      // send api req to api-gateway

      // after getting the converted uri

      // make it downloadable on success
    }

    return <div
    className="m-4 rounded-xl p-4 bg-white w-full">

        {/* upload video */}
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-blue-400 transition">
          <label className="cursor-pointer flex flex-col items-center">
            <BiUpload className="w-10 h-10 text-blue-500 mb-2" />
            <span className="text-gray-600">Choose a video file</span>
            <input
              type="file"
              accept="video/*"
              onChange={handleVideoFileChange}
              className="hidden"
            />
          </label>
        </div>

        {/* upload progress */}
        {
          file && (
            <>
            <div
            className="w-full bg-gray-200 rounded-full h-3 mt-4">
              <div
              className="bg-blue-500 h-3 rounded-full transition-all"
              style={{width: `${uploadProgress}%`}}
              />
            </div>
            <p 
            className="text-sm text-gray-600"
            >
              {uploadProgress}% uploaded
            </p>
            </>
          )
        }

        <div
        className="flex flex-row w-full">
          {/* video preview */}
        {
          previewFile && (
            <>
            <div
            className="mt-4 rounded-lg overflow-hidden shadow border w-1/2 h-1/2">
              <video
              src={previewFile}
              controls
              className="w-full rounded-lg"
              />
            </div>
            </>
          )
        }
        {/* video metadata */}
        {metadata && (
          <div
          className="mt-4 ml-4 sm:text-sm lg:text-lg">
            <h4
            className="text-xl mb-2">Metadata:</h4>
            <p>
              <label
              className="font-bold">Name: </label>{metadata?.name}</p>
            <p>
              <label
              className="font-bold">Size: </label>{formatSize(metadata?.size)}</p>
            <p>
              <label
              className="font-bold">Duration: </label>{formatDuration(metadata?.duration)}</p>
            <p><label
            className="font-bold">Type: </label>{metadata?.type}</p>

            <div
            className="flex flex-col">
              <label
              className="font-bold">Convert to: </label>
              <select
                value={targetFormat}
                onChange={(e) => setTargetFormat(e.target.value)}
                className="border p-2 mt-2"
              >
                <option value="">Select format</option>
                {VIDEO_FORMATS.filter((f) => f !== metadata.type).map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>
              <button 
              onClick={handleFileConvertion} 
              disabled={!targetFormat}
              className="mt-4 bg-blue-200 p-2 rounded-xl hover:scale-105 duration-500 cursor-pointer"
              >
                Convert
              </button>
            </div>
          </div>
        )}
        </div>
        
        {/* video converted url */}
        {convertedFileUrl && (
        <div style={{ marginTop: "20px" }}>
          <h4>Converted Video:</h4>
          <a href={convertedFileUrl} target="_blank" rel="noopener noreferrer">
            Download
          </a>
          <video
            src={convertedFileUrl}
            controls
            style={{ display: "block", marginTop: "10px", maxWidth: "100%" }}
          />
        </div>
      )}
    </div>
}   