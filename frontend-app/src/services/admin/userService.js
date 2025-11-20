// frontend-app/src/services/userService.js
import api from '../../api/axios'; 


export const fetchAllUsers = async () => {
    try {
        const response = await api.get("/admin/users/all-users");
        return response.data;
    } catch (err) {
        throw err.response.data;
    }
};
export const createStaff = async (payload) => {
    try {
        const response = await api.post("/admin/users/create-staff", payload);
        return response.data;
    } catch (err) {
        throw err.response.data;
    }
};
export const deleteStaff = async (id) => {
    try {
        const response = await api.delete(`/admin/users/delete-staff/${id}`);
        return response.data;
    } catch (err) {
        throw err.response.data;
    }
};
