export const validateUsername = (username: string) => {
    if(username.length < 3) {
        return false
    }
    return true
}

export const validatePassword = (password: string, confirmPassword: string) => {
    if(password.length < 6) {
        return false
    }
    if(password !== confirmPassword) {
        return false
    }
    return true
}