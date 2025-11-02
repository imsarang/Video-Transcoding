import { createSlice } from "@reduxjs/toolkit"

export interface User {
    email: string,
    firstname: string,
    lastname: string,
    uuid: string,
    phoneNumber?: string,
    profileImage?: string,
    isLoggedIn: boolean
}

interface UserState {
    user: User | null
}

const initialState: UserState = {
    user : null
}

export const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        clearUser: (state) => {
            state.user = null
        },

        userLogin: (state, action) => {
            state.user = action.payload
            if(state.user?.isLoggedIn)
                state.user.isLoggedIn = true
        },

        userLogout: (state) => {
            if(state.user?.isLoggedIn)
                state.user.isLoggedIn = false
            state.user = null
        },
    }
})

export const { clearUser, userLogin, userLogout } = userSlice.actions
export const selectUser = (state: { user: UserState }) => state.user.user
export default userSlice.reducer