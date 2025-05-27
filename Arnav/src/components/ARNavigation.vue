<template>
  <div class="ar-container">
    <div id="ar-viewport"></div>
    <div class="navigation-info">
      <div class="compass">Heading: {{ heading }}°</div>
      <div class="coordinates">
        Lat: {{ latitude }}°<br />
        Lon: {{ longitude }}°
      </div>
      <div class="distance" v-if="distanceToDestination">
        Distance: {{ distanceToDestination }}m
      </div>
    </div>
  </div>
</template>

<script>
import * as THREE from "three";
import { ARButton } from "three/examples/jsm/webxr/ARButton.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

export default {
  name: "ARNavigation",
  props: {
    navigationPath: {
      type: Array,
      required: true,
    },
    currentLocation: {
      type: Object,
      required: true,
    },
    selectedDestination: {
      type: Object,
      required: true,
    },
  },
  data() {
    return {
      heading: 0,
      latitude: 0,
      longitude: 0,
      watchId: null,
      compassWatchId: null,
      reticle: null,
      arSession: null,
      isARActive: false,
      arrow: null,
      destinationMarker: null,
      distanceToDestination: null,
    };
  },
  created() {
    this.scene = null;
    this.camera = null;
    this.renderer = null;
  },
  watch: {
    currentLocation: {
      handler(newLocation) {
        if (newLocation) {
          this.latitude = newLocation.latitude;
          this.longitude = newLocation.longitude;
          this.heading = newLocation.heading || 0;
          this.updateNavigation();
        }
      },
      immediate: true,
    },
    selectedDestination: {
      handler(newDestination) {
        if (newDestination) {
          this.updateNavigation();
        }
      },
      immediate: true,
    },
  },
  mounted() {
    this.initAR();
  },
  beforeUnmount() {
    if (this.watchId) {
      navigator.geolocation.clearWatch(this.watchId);
    }
    if (this.compassWatchId) {
      window.removeEventListener("deviceorientation", this.handleOrientation);
    }
    if (this.arSession) {
      this.arSession.end();
    }
  },
  methods: {
    initAR() {
      try {
        // Initialize Three.js scene
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(
          75,
          window.innerWidth / window.innerHeight,
          0.1,
          1000
        );

        // Initialize renderer
        this.renderer = new THREE.WebGLRenderer({
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.xr.enabled = true;

        // Add renderer to DOM
        document
          .getElementById("ar-viewport")
          .appendChild(this.renderer.domElement);

        // Create AR button
        const arButton = ARButton.createButton(this.renderer, {
          onSessionStart: this.onARSessionStart,
          onSessionEnd: this.onARSessionEnd,
        });
        document.body.appendChild(arButton);

        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(0, 10, 0);
        this.scene.add(directionalLight);

        // Create navigation elements
        this.createNavigationArrow();
        this.createDestinationMarker();

        // Start animation loop
        this.renderer.setAnimationLoop(() => {
          this.renderer.render(this.scene, this.camera);
        });

        // Handle window resize
        window.addEventListener("resize", this.onWindowResize);
      } catch (error) {
        console.error("Error initializing AR:", error);
      }
    },

    createNavigationArrow() {
      try {
        // Create arrow group
        const arrowGroup = new THREE.Group();

        // Create arrow shaft
        const shaftGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8);
        const shaftMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        const shaft = new THREE.Mesh(shaftGeometry, shaftMaterial);
        shaft.position.y = 0.25;
        arrowGroup.add(shaft);

        // Create arrow head
        const headGeometry = new THREE.ConeGeometry(0.1, 0.2, 8);
        const headMaterial = new THREE.MeshPhongMaterial({ color: 0xff0000 });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.y = 0.6;
        head.rotation.x = Math.PI;
        arrowGroup.add(head);

        // Position arrow in front of camera
        arrowGroup.position.set(0, 0, -1);
        this.scene.add(arrowGroup);
        this.arrow = arrowGroup;
      } catch (error) {
        console.error("Error creating navigation arrow:", error);
      }
    },

    createDestinationMarker() {
      try {
        // Create marker group
        const markerGroup = new THREE.Group();

        // Create marker base
        const baseGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.05, 8);
        const baseMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });
        const base = new THREE.Mesh(baseGeometry, baseMaterial);
        markerGroup.add(base);

        // Create marker pole
        const poleGeometry = new THREE.CylinderGeometry(0.02, 0.02, 0.5, 8);
        const poleMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });
        const pole = new THREE.Mesh(poleGeometry, poleMaterial);
        pole.position.y = 0.25;
        markerGroup.add(pole);

        // Create marker top
        const topGeometry = new THREE.SphereGeometry(0.1, 8, 8);
        const topMaterial = new THREE.MeshPhongMaterial({ color: 0x0000ff });
        const top = new THREE.Mesh(topGeometry, topMaterial);
        top.position.y = 0.5;
        markerGroup.add(top);

        this.scene.add(markerGroup);
        this.destinationMarker = markerGroup;
      } catch (error) {
        console.error("Error creating destination marker:", error);
      }
    },

    onARSessionStart(session) {
      try {
        this.arSession = session;
        this.isARActive = true;

        // Add hit testing
        session.addEventListener("hit-test", this.onHitTest);
      } catch (error) {
        console.error("Error starting AR session:", error);
      }
    },

    onARSessionEnd() {
      this.isARActive = false;
      this.arSession = null;
    },

    onHitTest(event) {
      if (!this.isARActive) return;

      try {
        const hitTestResults = event.getHitTestResults();
        if (hitTestResults.length > 0) {
          const hit = hitTestResults[0];
          const pose = hit.getPose(this.reticle.matrix);

          if (pose) {
            this.updateArrowPosition(pose);
          }
        }
      } catch (error) {
        console.error("Error in hit test:", error);
      }
    },

    updateArrowPosition(pose) {
      if (this.arrow) {
        // Calculate direction to destination
        const direction = this.calculateDirection();

        // Update arrow position
        this.arrow.position.setFromMatrixPosition(pose.transform.matrix);

        // Update arrow rotation to point towards destination
        this.arrow.lookAt(direction);
      }
    },

    calculateDirection() {
      if (!this.selectedDestination) return new THREE.Vector3(0, 0, -1);

      // Calculate direction vector to destination
      const dx = this.selectedDestination.longitude - this.longitude;
      const dy = this.selectedDestination.latitude - this.latitude;

      // Convert to 3D space
      const direction = new THREE.Vector3(dx, 0, dy).normalize();
      return direction;
    },

    calculateDistance() {
      if (!this.selectedDestination) return 0;

      const R = 6371e3; // Earth's radius in meters
      const φ1 = (this.latitude * Math.PI) / 180;
      const φ2 = (this.selectedDestination.latitude * Math.PI) / 180;
      const Δφ =
        ((this.selectedDestination.latitude - this.latitude) * Math.PI) / 180;
      const Δλ =
        ((this.selectedDestination.longitude - this.longitude) * Math.PI) / 180;

      const a =
        Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
        Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

      return R * c; // Distance in meters
    },

    updateNavigation() {
      try {
        if (!this.selectedDestination) return;

        // Calculate distance to destination
        this.distanceToDestination = Math.round(this.calculateDistance());

        // Update arrow and marker positions
        if (this.arrow && this.destinationMarker) {
          // Update arrow direction
          const direction = this.calculateDirection();
          this.arrow.lookAt(direction);

          // Update destination marker position
          const markerPosition = direction.multiplyScalar(
            this.distanceToDestination / 1000
          );
          this.destinationMarker.position.copy(markerPosition);
        }
      } catch (error) {
        console.error("Error updating navigation:", error);
      }
    },

    onWindowResize() {
      if (this.camera && this.renderer) {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
      }
    },
  },
};
</script>

<style scoped>
.ar-container {
  position: relative;
  width: 100vw;
  height: 100vh;
}

#ar-viewport {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.navigation-info {
  position: absolute;
  top: 20px;
  left: 20px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
  z-index: 1000;
}

.compass,
.coordinates,
.distance {
  margin: 5px 0;
}
</style>
