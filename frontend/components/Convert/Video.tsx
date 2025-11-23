'use client'
import React, { HTMLInputTypeAttribute, useState } from "react"
import toast from "react-hot-toast"
import { BiUpload } from "react-icons/bi"
import { api, bff_api } from "../../utils/apiUtils"
import { useRouter } from "next/navigation"
import { uploadToS3 } from "../../utils/s3Utils"
import { TbWashDry } from "react-icons/tb"

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

    const router = useRouter()
    // custom react states
    const [file, setFile] = useState<File | null>(null)
    const [filename, setFilename] = useState<string>("")
    const [preSignedUrl, setPreSignedUrl] = useState<string>("")
    const [inputKey, setInputKey] = useState<string>("") // Store the S3 input key for tracking

    const [metadata, setMetadata] = useState({
        name: "",
        size: 0.0,
        duration: 0.0,
        type: ""
    })
    const [sourceMetadata, setSourceMetadata] = useState({
        width: 0,
        height: 0,
        frameRate: 0,
        audioSampleRate: 0,
        audioChannels: 0
    })
    const [uploadProgress, setUploadProgress] = useState(0)
    const [targetFormat, setTargetFormat] = useState("")
    const [convertedFileUrl, setConvertedUrl] = useState(null)
    const [previewFile, setPreviewFile] = useState<string| null>(null)
    const [uploadingToS3, setUploadingToS3] = useState<boolean>(false)
    
    // Video conversion settings
    const [videoResolution, setVideoResolution] = useState<string>("")
    const [videoCodec, setVideoCodec] = useState<string>("")
    const [audioCodec, setAudioCodec] = useState<string>("")
    const [noAudio, setNoAudio] = useState<boolean>(false)
    const [videoBitrate, setVideoBitrate] = useState<string>("")
    const [audioBitrate, setAudioBitrate] = useState<string>("")
    const [frameRate, setFrameRate] = useState<string>("")
    const [audioSampleRate, setAudioSampleRate] = useState<string>("")
    const [audioChannels, setAudioChannels] = useState<string>("")

    // file ui methods
    const handleVideoFileChange = async (e: any) => {
      setUploadProgress(0)
      const selectedFile = e.target.files?.[0]
      if(!selectedFile)
        return
      
      // cleanup prior url
      if(previewFile)
      {
        URL.revokeObjectURL(previewFile)
      }
      
      console.log(selectedFile);
      
      setFilename(selectedFile.name)
      setConvertedUrl(null)
      setFile(selectedFile)

      // extract metadata
      const video = document.createElement("video")
      video.preload = "metadata"
      const videoUrl = URL.createObjectURL(selectedFile)
      video.src = videoUrl
      setPreviewFile(videoUrl)
      
      video.onloadedmetadata = async () => {
        const sourceWidth = video.videoWidth
        const sourceHeight = video.videoHeight
        
        // Try to get frame rate from video tracks
        let sourceFrameRate = 30 // Default fallback
        try {
          // For some browsers, we can get frame rate from the video element's tracks
          if ('captureStream' in video || 'mozCaptureStream' in video || 'webkitCaptureStream' in video) {
            const stream = (video as any).captureStream?.() || (video as any).mozCaptureStream?.() || (video as any).webkitCaptureStream?.()
            if (stream) {
              const videoTrack = stream.getVideoTracks()[0]
              if (videoTrack && 'getSettings' in videoTrack) {
                const settings = videoTrack.getSettings()
                if (settings.frameRate) {
                  sourceFrameRate = Math.round(settings.frameRate)
                }
              }
            }
          }
        } catch (e) {
          // Fallback to default if frame rate detection fails
          console.log('Could not detect frame rate, using default:', e)
        }
        
        // Try to get audio metadata
        let sourceAudioSampleRate = 44100 // Default
        let sourceAudioChannels = 2 // Default stereo
        try {
          if ('captureStream' in video || 'mozCaptureStream' in video || 'webkitCaptureStream' in video) {
            const stream = (video as any).captureStream?.() || (video as any).mozCaptureStream?.() || (video as any).webkitCaptureStream?.()
            if (stream) {
              const audioTrack = stream.getAudioTracks()[0]
              if (audioTrack && 'getSettings' in audioTrack) {
                const settings = audioTrack.getSettings()
                if (settings.sampleRate) {
                  sourceAudioSampleRate = settings.sampleRate
                }
                if (settings.channelCount) {
                  sourceAudioChannels = settings.channelCount
                }
              }
            }
          }
        } catch (e) {
          // Fallback to defaults if audio detection fails
          console.log('Could not detect audio metadata, using defaults:', e)
        }
        
        setSourceMetadata({
          width: sourceWidth,
          height: sourceHeight,
          frameRate: sourceFrameRate,
          audioSampleRate: sourceAudioSampleRate,
          audioChannels: sourceAudioChannels
        })
        
        // Set default values to source values
        setVideoResolution(`${sourceWidth}x${sourceHeight}`)
        setFrameRate(sourceFrameRate.toString())
        setAudioSampleRate(sourceAudioSampleRate.toString())
        setAudioChannels(sourceAudioChannels.toString())
        
        setMetadata({
          name: selectedFile.name,
          size: parseFloat((selectedFile.size.toFixed(2))), //MB
          duration: parseFloat(video.duration.toFixed(2)), //seconds
          type: selectedFile.type.split("/")[1]
        })
      }
      
      video.onerror = () => {
        console.error('Error loading video metadata')
        // Set defaults even if metadata loading fails
        setSourceMetadata({
          width: 0,
          height: 0,
          frameRate: 30,
          audioSampleRate: 44100,
          audioChannels: 2
        })
      }
      setUploadProgress(100)
    }

    // file convertion
    const handleFileConvertion = async (e: any) => {
      // send api req to api-gateway
      // after getting the converted uri
      // make it downloadable on success
      e.preventDefault()
      try
      {

        // Parse resolution if it's in format "WIDTHxHEIGHT"
        let videoWidth: number | null = null
        let videoHeight: number | null = null
        if (videoResolution && videoResolution.includes('x')) {
          const resolutionParts = videoResolution.split('x')
          if (resolutionParts.length === 2) {
            videoWidth = parseInt(resolutionParts[0])
            videoHeight = parseInt(resolutionParts[1])
          }
        }

        const payload: any = {
          targetFormat,
          videoResolution: (videoWidth && videoHeight)
            ? { width: videoWidth, height: videoHeight }
            : null,
          videoCodec: videoCodec || null,
          frameRate: frameRate && !isNaN(parseInt(frameRate)) ? parseInt(frameRate) : null,
          videoBitrate: videoBitrate && !isNaN(parseInt(videoBitrate)) ? `${videoBitrate}k` : null,
          noAudio,
          audioCodec: noAudio ? null : (audioCodec || null),
          audioSampleRate: noAudio ? null : (audioSampleRate && !isNaN(parseInt(audioSampleRate)) ? parseInt(audioSampleRate) : null),
          audioChannels: noAudio ? null : (audioChannels && !isNaN(parseInt(audioChannels)) ? parseInt(audioChannels) : null),
          audioBitrate: noAudio ? null : (audioBitrate && !isNaN(parseInt(audioBitrate)) ? `${audioBitrate}k` : null),
          job:"convert"
        };
        
        // remove nulls
        Object.keys(payload).forEach(key => {
          if (payload[key] === null || payload[key] === undefined || payload[key] === '') {
            delete payload[key];
          }
        });
        // Filter payload for S3 metadata (flat string/number/boolean, or flat objects only)
        const s3Meta: Record<string, string> = {};
        Object.entries(payload).forEach(([key, value]) => {
          if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
            s3Meta[key] = String(value);
          } else if (value && typeof value === 'object' && !Array.isArray(value)) {
            const flat = Object.entries(value).every(([_, v]) => typeof v === 'string' || typeof v === 'number');
            if (flat) {
              s3Meta[key] = JSON.stringify(value);
            } else {
              if (process.env.NODE_ENV !== 'production') {
                console.warn(`Not sending to S3 meta:`, key, value);
              }
            }
          }
        });
        if (process.env.NODE_ENV !== 'production') {
          console.log('Filtered s3Meta:', s3Meta);
        }
        const preSignedUrl = await getUploadPreSignedUrl(file as File, s3Meta)

        // upload the actual media file to s3 with metadata
        if (!file) throw new Error('No file selected')

        setUploadingToS3(true)
        try{
          await uploadToS3(file, preSignedUrl, s3Meta); // file from state
        } catch(err) {
          toast.error('Could not upload to s3')
        } finally {
          setUploadingToS3(false)
        }
        
        // remove the file from payload before sending metadata downstream
        delete payload.media;
        delete payload.s3Url;
      }
      catch(err)
      {
        toast.error('Could not convert video')
      }
    }

    const getUploadPreSignedUrl = async(file: File, metadata: any) => {
      try
      {
        console.log(file, metadata);
        
        const response = await api.post(`/video/upload/pre-signed-s3-url`, {
          key :file.name,
          metadata: metadata,
          contentType: file.type
        },{
          headers: {
            "Content-Type":'application/json'
          }
        }
      )
        console.log(response.data)
        
        // Response format: { success: true, data: { url: string, key: string } }
        const result = response.data.data;
        if (result.key) {
          setInputKey(result.key); // Store the input key for later reference
        }
        return result.url || result; // Return URL (backward compatible)
      }
      catch(err)
      {
        toast.error('Unable to uplaod to s3')
      }
    }

    return (
      <>
        {uploadingToS3 && (
          <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <svg className="animate-spin h-16 w-16 text-teal-400 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
              </svg>
              <span className="text-white font-bold text-2xl drop-shadow">Uploading to S3...</span>
            </div>
          </div>
        )}

        <div className={uploadingToS3 ? 'blur-sm grayscale pointer-events-none select-none' : 'w-full'}>
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
            filename && (
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
            </div>
          )}
          </div>
        
        <form
        onSubmit={handleFileConvertion}>
          <div
          className="flex flex-col mt-4">
            <label
            className="font-bold">Convert to: </label>
            <select
              value={targetFormat}
              onChange={(e) => setTargetFormat(e.target.value)}
              className="border p-2 mt-2 rounded"
            >
              <option value="">Select format</option>
              {VIDEO_FORMATS.filter((f) => f !== metadata.type).map((format) => (
                <option key={format} value={format}>
                  {format}
                </option>
              ))}
            </select>

            {/* Advanced Conversion Settings */}
            <div className="mt-6 border-t pt-4">
              <h3 className="text-lg font-bold mb-4">Advanced Settings (Optional)</h3>
              
              {/* Video Resolution */}
              <div className="mb-4">
                <label className="font-semibold block mb-2">Video Resolution:</label>
                <select
                  value={videoResolution}
                  onChange={(e) => setVideoResolution(e.target.value)}
                  className="border p-2 w-full rounded"
                  disabled={!sourceMetadata.width}
                >
                  {sourceMetadata.width > 0 && (
                    <option value={`${sourceMetadata.width}x${sourceMetadata.height}`}>
                      {sourceMetadata.width}x{sourceMetadata.height} (Source)
                    </option>
                  )}
                  <option value="854x480">480p (854x480)</option>
                  <option value="1280x720">720p (1280x720)</option>
                  <option value="1920x1080">1080p (1920x1080)</option>
                  <option value="3840x2160">4K (3840x2160)</option>
                </select>
              </div>

              {/* Video Codec */}
              <div className="mb-4">
                <label className="font-semibold block mb-2">Video Codec:</label>
                <select
                  value={videoCodec}
                  onChange={(e) => setVideoCodec(e.target.value)}
                  className="border p-2 w-full rounded"
                >
                  <option value="">Default</option>
                  <option value="h264">H.264</option>
                  <option value="h265">H.265 (HEVC)</option>
                  <option value="vp9">VP9</option>
                  <option value="av1">AV1</option>
                </select>
              </div>

              {/* Frame Rate */}
              <div className="mb-4">
                <label className="font-semibold block mb-2">Frame Rate (FPS):</label>
                <select
                  value={frameRate}
                  onChange={(e) => setFrameRate(e.target.value)}
                  className="border p-2 w-full rounded"
                  disabled={!sourceMetadata.frameRate}
                >
                  {sourceMetadata.frameRate > 0 && (
                    <option value={sourceMetadata.frameRate.toString()}>
                      {sourceMetadata.frameRate} fps (Source)
                    </option>
                  )}
                  <option value="24">24 fps</option>
                  <option value="30">30 fps</option>
                  <option value="60">60 fps</option>
                </select>
              </div>

              {/* Audio Settings */}
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="noAudio"
                    checked={noAudio}
                    onChange={(e) => {
                      setNoAudio(e.target.checked)
                      if (e.target.checked) {
                        setAudioCodec("")
                        setAudioSampleRate("")
                        setAudioChannels("")
                        setAudioBitrate("")
                      }
                    }}
                    className="mr-2"
                  />
                  <label htmlFor="noAudio" className="font-semibold">No audio</label>
                </div>
                
                {!noAudio && (
                  <>
                    <label className="font-semibold block mb-2 mt-2">Audio Codec:</label>
                    <select
                      value={audioCodec}
                      onChange={(e) => setAudioCodec(e.target.value)}
                      className="border p-2 w-full rounded mb-4"
                    >
                      <option value="">Default</option>
                      <option value="aac">AAC</option>
                      <option value="mp3">MP3</option>
                      <option value="opus">Opus</option>
                      <option value="ac3">AC3</option>
                    </select>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="font-semibold block mb-2">Sample Rate:</label>
                        <select
                          value={audioSampleRate}
                          onChange={(e) => setAudioSampleRate(e.target.value)}
                          className="border p-2 w-full rounded"
                          disabled={!sourceMetadata.audioSampleRate}
                        >
                          {sourceMetadata.audioSampleRate > 0 && (
                            <option value={sourceMetadata.audioSampleRate.toString()}>
                              {sourceMetadata.audioSampleRate >= 1000 
                                ? `${(sourceMetadata.audioSampleRate / 1000).toFixed(1)}` 
                                : sourceMetadata.audioSampleRate.toString()} kHz (Source)
                            </option>
                          )}
                          <option value="44100">44.1 kHz</option>
                          <option value="48000">48 kHz</option>
                        </select>
                      </div>
                      <div>
                        <label className="font-semibold block mb-2">Channels:</label>
                        <select
                          value={audioChannels}
                          onChange={(e) => setAudioChannels(e.target.value)}
                          className="border p-2 w-full rounded"
                          disabled={!sourceMetadata.audioChannels}
                        >
                          {sourceMetadata.audioChannels > 0 && (
                            <option value={sourceMetadata.audioChannels.toString()}>
                              {sourceMetadata.audioChannels === 1 ? 'Mono' : 
                               sourceMetadata.audioChannels === 2 ? 'Stereo' : 
                               `${sourceMetadata.audioChannels} channels`} (Source)
                            </option>
                          )}
                          <option value="1">Mono</option>
                          <option value="2">Stereo</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Bitrate Settings */}
              <div className="mb-4">
                <label className="font-semibold block mb-2">Video Bitrate (kbps):</label>
                <input
                  type="number"
                  value={videoBitrate}
                  onChange={(e) => setVideoBitrate(e.target.value)}
                  placeholder="e.g., 2000"
                  className="border p-2 w-full rounded"
                  min="0"
                />
                {videoBitrate && <p className="text-sm text-gray-500 mt-1">Video bitrate: {videoBitrate} kbps</p>}
              </div>

              {!noAudio && (
                <div className="mb-4">
                  <label className="font-semibold block mb-2">Audio Bitrate (kbps):</label>
                  <input
                    type="number"
                    value={audioBitrate}
                    onChange={(e) => setAudioBitrate(e.target.value)}
                    placeholder="e.g., 128"
                    className="border p-2 w-full rounded"
                    min="0"
                  />
                  {audioBitrate && <p className="text-sm text-gray-500 mt-1">Audio bitrate: {audioBitrate} kbps</p>}
                </div>
              )}
            </div>

            <button 
            type="submit"
            disabled={!targetFormat}
            className="mt-4 bg-blue-200 p-2 rounded-xl hover:scale-105 duration-500 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Convert
            </button>
          </div>
        </form>
        
          
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
    </>
  )
}   