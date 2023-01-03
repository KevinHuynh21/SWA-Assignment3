import axios from "axios";
import {getAuthHeader} from "../utils/auth-header";

const API_URL = "http://localhost:9090/";

const createAccount = (username: string, password: string) => {
  return axios.post(API_URL + "users", {
    username,
    password,
  });
};

const login = async (username: string, password: string) => {
    return axios
      .post(API_URL + "login", {
        username,
        password,
      })
      .then((response: any) => {
        if (response.data.token) {
          localStorage.setItem("user", JSON.stringify(response.data));
        }
        return response.data;
      });
  };

export async function updateUser(id: number, body: any) {
  return axios.patch(API_URL + `users/${id}`, {
    ...body,
  }, {
    params: {
      ...getAuthHeader()
    }
  }).then((response: any) => {
    return response.data;
  });
}

export async function getUser(id: number) {
  return axios.get(API_URL + `users/${id}`, {
    params: {
      ...getAuthHeader()
    }
  }).then((response) => {
    return response.data;
  })
}

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("currentGameId");
  };
  
  export default {
    createAccount,
    login,
    getUser,
    logout,
    updateUser
  };