import axios from "axios"

const API_URL = process.env.REACT_APP_API_URL ?? 'http://localhost:3001'

let ACCESS_TOKEN : string = ""
let USER_ID: string = ""

// get the access token form memory
export function getAccessToken(){
    return ACCESS_TOKEN as string
}

// set access token in memory
export function setAccessToken(token: string){
    ACCESS_TOKEN = token
}

// fetch user id
export function getUserId(){
    return USER_ID as string
}

// set user id
export function setUserId(userId: string){
    USER_ID = userId
}

// axios instace
export const authorised_api = axios.create({
    baseURL: API_URL ?? '/',
    withCredentials: true
})

export const api = axios.create({
    baseURL: API_URL ?? '/',
    withCredentials: true
})

// Request axios interceptor
// attach tokens for authorised routes
authorised_api.interceptors.request.use(
    async (config: any) => {
        try
        {
            const token = getAccessToken()
            if(token){
                config.headers = config.headers ?? {}
                config.headers.Authorization = `Bearer ${token}`
            }
            return config
        }
        catch(err)
        {
            console.error(err);
        }
    }
)

// response interceptor for authorised apis
authorised_api.interceptors.response.use(
    (response) => {
        const maybeNewToken = response.headers?.['x-new-access-token'] || response.headers?.['X-New-Access-Token']
        if (maybeNewToken) setAccessToken(maybeNewToken)
        return response
    },
    async (error) => {
        const status = error?.response?.status
        const originalRequest = error?.config
        if((status === 401 || status === 403) && !originalRequest?._retry){
            originalRequest._retry = true
            try {
                const newToken = await refreshAccessToken()
                if (newToken) {
                    originalRequest.headers = originalRequest.headers ?? {}
                    originalRequest.headers.Authorization = `Bearer ${newToken}`
                    return api(originalRequest)
                }
            } catch (_) {}
        }
        return Promise.reject(error)
    }
)

// refresh the access token
const refreshAccessToken = async () =>{
    try
    {
        const res = await api.get('/users/access-token')

        const token = res.data.accessToken
        if(token) setAccessToken(token)
        return token || null
    }
    catch(err)
    {
        console.error(err);
        setAccessToken("")
        return null
    }
}

// custom apis
// register(signup) , login and logout apis