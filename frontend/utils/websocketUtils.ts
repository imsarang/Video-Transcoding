import { Socket, io } from "socket.io-client";

class WebSocketUtils {
    private socket: Socket | null = null
    private socketBaseUrl: string = process.env.REACT_APP_WEBSOCKET_BASE_URL || 'http://localhost:3001'
    private progressCallback: ((progress: number) => void) | null = null

    // initialize the socket, listen for events from the server
    initializeSocket = (channelId: string) => {
        console.log(this.socketBaseUrl)
        this.socket = io(this.socketBaseUrl)
        this.socket.on('connect', () => {
            console.log('Connected to server')
            this.emitMessage({ event: 'subscribe', data: `video-progress:${channelId}`})
        })

        this.socket.on('disconnect', () => {
            console.log('Disconnected from server')
        })

        this.socket.on('error', (error) => {
            console.error('Socket error:', error)
        })

        // this.socket.on('progress', (progress: any) => {
        //     console.log('Progress:', progress)
        // })
    }

    emitMessage = (body: any) => {
        if(!this.socket) return { success: false, message: 'Socket not connected' }
        this.socket.emit(body.event, body.data)
    }

    onProgress(callback: (progress: any) => void) {
        this.progressCallback = callback
        if(this.socket)
        {
            this.socket.on('progress', (progress: any)=>callback(progress.progress))
        }
    }
}

const webSocketUtils = new WebSocketUtils()
export default webSocketUtils