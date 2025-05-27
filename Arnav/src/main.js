import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import * as THREE from "three";
import { ARButton } from "three/examples/jsm/webxr/ARButton.js";
import { auth } from "./firebase/config";

// Create Vue app
const app = createApp(App);

// Use router
app.use(router);

// Mount app
app.mount("#app");
