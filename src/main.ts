import { createApp } from "vue";
import router from "./router";
import store from "./store";
import naive from "./naive";
import App from "./app.vue";

//@ts-ignore
import VueSignaturePad from "vue-signature-pad";
import VueApexCharts from "vue3-apexcharts";

const app = createApp(App);

app.use(router);
app.use(store);
app.use(naive);

app.use(VueSignaturePad);
app.use(VueApexCharts);

app.mount("#app");
