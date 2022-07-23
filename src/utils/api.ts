import ky from "ky";
import { getAuth } from "./token";

const api = ky.extend({
  prefixUrl: "https://aware-backend.herokuapp.com/api",
  // prefixUrl: "http://127.0.0.1:8000/api",
  hooks: {
    beforeRequest: [
      async (request, options) => {
        const auth = await getAuth();
        if (auth == null) return;
        request.headers.set("Authorization", "Bearer " + auth);
        request.headers.set("Accept", "application/json");
      },
    ],
    afterResponse: [
      async (request, options, response) => {
        // if (response.status === 400) {
        //   const body = await response.json();
        //   .error(JSON.stringify(body));
        // }
      },
    ],
  },
});

export default api;
