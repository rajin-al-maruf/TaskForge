import axiosInstance from "./axiosInstance";

const registerUser = async (userData) => {
    const res = await axiosInstance.post('/users/register', userData)
    return res.data;
}

const loginUser = async (userData) => {
    const res = await axiosInstance.post('/users/login', userData)
    return res.data;
}

export {registerUser, loginUser}