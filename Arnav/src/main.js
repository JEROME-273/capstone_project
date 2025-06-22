import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import * as THREE from "three";
import { ARButton } from "three/examples/jsm/webxr/ARButton.js";
import { auth } from "./firebase/config";
import Toast from "vue-toastification";
import "vue-toastification/dist/index.css";

// Create Vue app
const app = createApp(App);

// Use router
app.use(router);

app.use(Toast, {
  // Optional global options
  position: "top-right",
  timeout: 3000,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  showCloseButtonOnHover: false,
  hideProgressBar: false,
  closeButton: "button",
  icon: true,
  rtl: false,
});

// Mount app
app.mount("#app");
