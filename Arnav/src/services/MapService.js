import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";

// OpenRouteService API key - get yours at https://openrouteservice.org/dev/#/signup
const ORS_API_KEY = "5b3ce3597851110001cf6248bc994625149042288262e3b2f3910532"; // Replace with your own key

// Alternative API key in case the first one has reached its limit
const BACKUP_ORS_API_KEY = ""; // Add a backup key if you have one

/**
 * Initialize a MapLibre GL map
 * @param {string} containerId - ID of the container element
 * @param {Object} options - Map options
 * @returns {Object} - MapLibre GL map instance
 */
function initMap(containerId, options = {}) {
  const defaultOptions = {
    container: containerId,
    style: "https://demotiles.maplibre.org/style.json", // Free demo style
    center: [0, 0],
    zoom: 15,
  };

  const map = new maplibregl.Map({
    ...defaultOptions,
    ...options,
  });

  // Add navigation controls
  map.addControl(new maplibregl.NavigationControl());

  return map;
}

/**
 * Get a route between two points
 * @param {Array} start - [longitude, latitude] of start point
 * @param {Array} end - [longitude, latitude] of end point
 * @returns {Promise<Object>} - Route data
 */
async function getRoute(start, end) {
  // Validate input coordinates
  if (!isValidCoordinate(start) || !isValidCoordinate(end)) {
    throw new Error("Invalid coordinates provided");
  }

  // Calculate straight-line distance to check if points are too far apart
  const straightLineDistance = calculateDistance(start, end);
  console.log(
    `Straight-line distance between points: ${straightLineDistance.toFixed(
      2
    )} meters`
  );

  // If points are extremely far apart (>100km), warn the user
  if (straightLineDistance > 100000) {
    console.warn(
      "Warning: Points are very far apart (>100km). API may reject this request."
    );
  }

  try {
    // Try with primary API key
    const data = await fetchRoute(start, end, ORS_API_KEY);
    return data;
  } catch (error) {
    console.error("Error with primary API key:", error);

    // If we have a backup key, try that
    if (BACKUP_ORS_API_KEY) {
      try {
        console.log("Trying backup API key...");
        const data = await fetchRoute(start, end, BACKUP_ORS_API_KEY);
        return data;
      } catch (backupError) {
        console.error("Error with backup API key:", backupError);
        throw backupError;
      }
    } else {
      // If no backup key, try a fallback approach - direct line
      console.log(
        "No backup API key available. Creating a simple direct route."
      );
      return createDirectRoute(start, end);
    }
  }
}

/**
 * Fetch route from OpenRouteService API
 * @param {Array} start - [longitude, latitude] of start point
 * @param {Array} end - [longitude, latitude] of end point
 * @param {string} apiKey - API key to use
 * @returns {Promise<Object>} - Route data
 */
async function fetchRoute(start, end, apiKey) {
  const url =
    `https://api.openrouteservice.org/v2/directions/foot-walking?` +
    `api_key=${apiKey}&` +
    `start=${start[0]},${start[1]}&` +
    `end=${end[0]},${end[1]}&` +
    `instructions=true&` +
    `instruction_format=text&` +
    `language=en&` +
    `units=m&` +
    `geometry_format=geojson`;

  console.log("Fetching route with URL:", url);

  const response = await fetch(url, {
    headers: {
      Accept: "application/json, application/geo+json, application/gpx+xml",
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API Error Response:", errorText);
    throw new Error(
      `HTTP error! status: ${response.status}, message: ${errorText}`
    );
  }

  const data = await response.json();
  console.log("API Response:", data);

  // Check if the response is a FeatureCollection (different format)
  if (
    data.type === "FeatureCollection" &&
    data.features &&
    data.features.length > 0
  ) {
    console.log("Converting FeatureCollection response to expected format");

    // Extract the route feature
    const routeFeature = data.features[0];

    // Check if it has geometry
    if (!routeFeature.geometry) {
      console.error("Route feature has no geometry:", routeFeature);
      throw new Error("Invalid route data: missing geometry");
    }

    // Create a compatible route object
    return {
      routes: [
        {
          summary: {
            distance:
              routeFeature.properties?.summary?.distance ||
              calculateDistance(start, end),
            duration:
              routeFeature.properties?.summary?.duration ||
              calculateDistance(start, end) / 1.4,
          },
          geometry: routeFeature.geometry,
          segments: routeFeature.properties?.segments || [
            {
              distance: calculateDistance(start, end),
              duration: calculateDistance(start, end) / 1.4,
              steps: [
                {
                  distance: calculateDistance(start, end),
                  duration: calculateDistance(start, end) / 1.4,
                  instruction: "Go to your destination",
                  way_points: [0, routeFeature.geometry.coordinates.length - 1],
                },
              ],
            },
          ],
        },
      ],
    };
  }

  // Check for the standard format
  if (!data || !data.routes || !data.routes.length) {
    console.error("Invalid route data received:", data);
    throw new Error("Invalid route data received from API");
  }

  return data;
}

/**
 * Create a simple direct route between two points when API fails
 * @param {Array} start - [longitude, latitude] of start point
 * @param {Array} end - [longitude, latitude] of end point
 * @returns {Object} - Simple route data
 */
function createDirectRoute(start, end) {
  const distance = calculateDistance(start, end);
  const duration = distance / 1.4; // Assuming 1.4 m/s walking speed

  // Create a simple GeoJSON LineString between the two points
  const geometry = {
    type: "LineString",
    coordinates: [start, end],
  };

  // Create a simple instruction
  const instruction = `Walk ${formatDistance(distance)} to your destination`;

  // Create a simplified route data structure similar to OpenRouteService
  return {
    routes: [
      {
        summary: {
          distance: distance,
          duration: duration,
        },
        geometry: geometry,
        segments: [
          {
            distance: distance,
            duration: duration,
            steps: [
              {
                distance: distance,
                duration: duration,
                instruction: instruction,
                way_points: [0, 1],
              },
            ],
          },
        ],
      },
    ],
  };
}

/**
 * Format distance for display
 * @param {number} distance - Distance in meters
 * @returns {string} - Formatted distance
 */
function formatDistance(distance) {
  if (distance < 1000) {
    return `${Math.round(distance)} m`;
  } else {
    return `${(distance / 1000).toFixed(1)} km`;
  }
}

/**
 * Check if coordinate is valid
 * @param {Array} coord - [longitude, latitude]
 * @returns {boolean} - Whether coordinate is valid
 */
function isValidCoordinate(coord) {
  if (!Array.isArray(coord) || coord.length !== 2) {
    return false;
  }

  const [lon, lat] = coord;

  // Check if values are numbers and within valid ranges
  return (
    typeof lon === "number" &&
    !isNaN(lon) &&
    typeof lat === "number" &&
    !isNaN(lat) &&
    lon >= -180 &&
    lon <= 180 &&
    lat >= -90 &&
    lat <= 90
  );
}

/**
 * Search for places
 * @param {string} query - Search query
 * @param {Array} proximity - [longitude, latitude] for biasing results
 * @returns {Promise<Array>} - Search results
 */
async function searchPlaces(query, proximity) {
  try {
    const response = await fetch(
      `https://api.openrouteservice.org/geocode/search?` +
        `api_key=${ORS_API_KEY}&` +
        `text=${encodeURIComponent(query)}&` +
        (proximity
          ? `focus.point.lon=${proximity[0]}&focus.point.lat=${proximity[1]}&`
          : "") +
        `size=5`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("API Error Response:", errorText);
      throw new Error(
        `HTTP error! status: ${response.status}, message: ${errorText}`
      );
    }

    const data = await response.json();
    console.log("Search API Response:", data);

    if (!data || !data.features) {
      return [];
    }

    // Format results to a standard structure
    return data.features.map((feature) => ({
      id: feature.properties.id || Math.random().toString(36).substring(2, 15),
      name: feature.properties.name || feature.properties.label,
      address: feature.properties.label,
      latitude: feature.geometry.coordinates[1],
      longitude: feature.geometry.coordinates[0],
      category: feature.properties.category || "place",
    }));
  } catch (error) {
    console.error("Error searching places:", error);
    return [];
  }
}

/**
 * Add a marker to the map
 * @param {Object} map - MapLibre GL map instance
 * @param {Array} coordinates - [longitude, latitude]
 * @param {Object} options - Marker options
 * @returns {Object} - Marker instance
 */
function addMarker(map, coordinates, options = {}) {
  const marker = new maplibregl.Marker(options)
    .setLngLat(coordinates)
    .addTo(map);

  return marker;
}

/**
 * Add a popup to a marker
 * @param {Object} marker - Marker instance
 * @param {string} html - Popup HTML content
 * @param {Object} options - Popup options
 * @returns {Object} - Popup instance
 */
function addPopup(marker, html, options = {}) {
  const popup = new maplibregl.Popup(options).setHTML(html);

  marker.setPopup(popup);

  return popup;
}

/**
 * Add a route to the map
 * @param {Object} map - MapLibre GL map instance
 * @param {Object} routeData - Route data from getRoute()
 * @param {Object} options - Line options
 * @returns {Object} - Added source and layer IDs
 */
function addRouteToMap(map, routeData, options = {}) {
  const sourceId = options.sourceId || "route";
  const layerId = options.layerId || "route-line";

  // Validate route data
  if (!routeData || !routeData.routes || !routeData.routes.length) {
    console.error("Invalid route data:", routeData);
    throw new Error("Invalid route data");
  }

  // Get route geometry
  const route = routeData.routes[0];

  if (!route.geometry) {
    console.error("Route geometry is missing:", route);
    throw new Error("Route geometry is missing");
  }

  const routeGeometry = route.geometry;

  // Add source if it doesn't exist
  if (!map.getSource(sourceId)) {
    map.addSource(sourceId, {
      type: "geojson",
      data: {
        type: "Feature",
        properties: {},
        geometry: routeGeometry,
      },
    });
  } else {
    // Update existing source
    map.getSource(sourceId).setData({
      type: "Feature",
      properties: {},
      geometry: routeGeometry,
    });
  }

  // Add layer if it doesn't exist
  if (!map.getLayer(layerId)) {
    map.addLayer({
      id: layerId,
      type: "line",
      source: sourceId,
      layout: {
        "line-join": "round",
        "line-cap": "round",
      },
      paint: {
        "line-color": options.color || "#FF5733",
        "line-width": options.width || 5,
        "line-opacity": options.opacity || 0.75,
      },
    });
  }

  return { sourceId, layerId };
}

/**
 * Fit map to show the entire route
 * @param {Object} map - MapLibre GL map instance
 * @param {Object} routeData - Route data from getRoute()
 * @param {Object} options - Padding options
 */
function fitMapToRoute(map, routeData, options = {}) {
  // Validate route data
  if (!routeData || !routeData.routes || !routeData.routes.length) {
    console.error("Invalid route data for fitting map:", routeData);
    return;
  }

  const route = routeData.routes[0];

  if (
    !route.geometry ||
    !route.geometry.coordinates ||
    !route.geometry.coordinates.length
  ) {
    console.error("Invalid route geometry for fitting map:", route);
    return;
  }

  const coordinates = route.geometry.coordinates;

  // Create a 'LngLatBounds' with the first coordinate
  const bounds = new maplibregl.LngLatBounds(coordinates[0], coordinates[0]);

  // Extend the 'LngLatBounds' to include every coordinate
  coordinates.forEach((coord) => {
    bounds.extend(coord);
  });

  map.fitBounds(bounds, {
    padding: options.padding || 50,
    maxZoom: options.maxZoom || 15,
    duration: options.duration || 1000,
  });
}

/**
 * Process route instructions for voice guidance
 * @param {Object} routeData - Route data from getRoute()
 * @returns {Array} - Processed instructions
 */
function processRouteInstructions(routeData) {
  if (
    !routeData ||
    !routeData.routes ||
    !routeData.routes[0] ||
    !routeData.routes[0].segments
  ) {
    return [];
  }

  const route = routeData.routes[0];
  const instructions = [];

  route.segments.forEach((segment) => {
    segment.steps.forEach((step) => {
      instructions.push({
        text: step.instruction,
        distance: step.distance,
        duration: step.duration,
        type: getManeuverType(step.instruction),
        coordinates: step.way_points.map(
          (index) => route.geometry.coordinates[index]
        ),
      });
    });
  });

  return instructions;
}

/**
 * Get maneuver type from instruction text
 * @param {string} instruction - Instruction text
 * @returns {string} - Maneuver type
 */
function getManeuverType(instruction) {
  const lowerInstruction = instruction.toLowerCase();

  if (lowerInstruction.includes("turn left")) {
    return "turn-left";
  } else if (lowerInstruction.includes("turn right")) {
    return "turn-right";
  } else if (lowerInstruction.includes("slight left")) {
    return "turn-slight-left";
  } else if (lowerInstruction.includes("slight right")) {
    return "turn-slight-right";
  } else if (lowerInstruction.includes("sharp left")) {
    return "turn-sharp-left";
  } else if (lowerInstruction.includes("sharp right")) {
    return "turn-sharp-right";
  } else if (lowerInstruction.includes("u-turn")) {
    return "u-turn";
  } else if (lowerInstruction.includes("roundabout")) {
    return "roundabout";
  } else if (lowerInstruction.includes("continue")) {
    return "continue";
  } else if (lowerInstruction.includes("arrive")) {
    return "arrive";
  } else {
    return "unknown";
  }
}

/**
 * Calculate distance between two points
 * @param {Array} point1 - [longitude, latitude] of first point
 * @param {Array} point2 - [longitude, latitude] of second point
 * @returns {number} - Distance in meters
 */
function calculateDistance(point1, point2) {
  const [lon1, lat1] = point1;
  const [lon2, lat2] = point2;

  const R = 6371e3; // Earth radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export default {
  initMap,
  getRoute,
  searchPlaces,
  addMarker,
  addPopup,
  addRouteToMap,
  fitMapToRoute,
  processRouteInstructions,
  calculateDistance,
};
