//@ts-nocheck

import ky from "ky";
import { get, set, remove } from "./storage";
// import router from '../router'

interface TokenResult {
  token_type: string;
  access_token: string;
  user: Object;
}

interface Token {
  type: string;
  access: string;
}

// const prefixUrl = import.meta.env.VITE_API_BASE as string
const prefixUrl = "https://aware-backend.herokuapp.com/api";
// const prefixUrl = "http://127.0.0.1:8000/api";


export const getAuth = async (): Promise<string | undefined> => {
  const token = get<Token>("token");
  if (token == null) return;
  return token.access;
};

// authorize
export const authenticate = async (
  email: string,
  password: string
) => {
  const options = { prefixUrl, method: "post", json: { email, password } };
  // eslint-disable-next-line @typescript-eslint/naming-convention
  const { token_type, access_token, user } = await ky(
    "login",
    options
  ).json<TokenResult>();
  const token = {
    type: token_type,
    access: access_token,
  };
  if (user.role != "admin") {
    return false;
  }
  set("token", token);
  return token;
};

export const revoke = async (): Promise<void> => {
  // const token = get<Token>('token')
  // if (token?.refresh == null) return
  // await ky('login', { prefixUrl, method: 'delete', json: { token: token.refresh } })
  remove("token");
};
