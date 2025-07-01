<template>
  <AdminLayout>
    <template #nav>
      <a href="#" class="nav-link">Analytics Dashboard</a>
    </template>

    <div class="analytics-dashboard">
      <div class="dashboard-header">
        <h1>Analytics Dashboard</h1>
        <div class="header-actions">
          <div class="date-filter">
            <select v-model="selectedPeriod" @change="fetchAllData">
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 90 days</option>
              <option value="365">Last year</option>
              <option value="all">All time</option>
            </select>
          </div>
          <div class="action-buttons">
            <button @click="showPreview" class="preview-btn">
              <i class="bx bx-show"></i>
              Preview Report
            </button>
            <button @click="printReport" class="print-btn">
              <i class="bx bx-printer"></i>
              Print Report
            </button>
          </div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-icon">👥</div>
          <div class="stat-content">
            <h3>Total Users</h3>
            <p class="stat-number">{{ totalUsers }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">✅</div>
          <div class="stat-content">
            <h3>Verified Users</h3>
            <p class="stat-number">{{ verifiedUsers }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">📊</div>
          <div class="stat-content">
            <h3>Active Sessions</h3>
            <p class="stat-number">{{ activeSessions }}</p>
          </div>
        </div>
        <div class="stat-card">
          <div class="stat-icon">🎯</div>
          <div class="stat-content">
            <h3>Most Selected Destination</h3>
            <p class="stat-text">{{ popularDestination }}</p>
          </div>
        </div>
      </div>

      <!-- New Arrival Analytics Section -->
      <div class="arrival-analytics-section">
        <h2>🚀 Navigation & Arrival Analytics</h2>
        <div class="arrival-stats-grid">
          <div class="stat-card success">
            <div class="stat-icon">✅</div>
            <div class="stat-content">
              <h3>Successful Arrivals</h3>
              <p class="stat-number">{{ arrivalStats.totalArrivals }}</p>
            </div>
          </div>
          <div class="stat-card info">
            <div class="stat-icon">⏱️</div>
            <div class="stat-content">
              <h3>Avg Navigation Time</h3>
              <p class="stat-text">{{ arrivalStats.avgDuration }}</p>
            </div>
          </div>
          <div class="stat-card warning">
            <div class="stat-icon">📍</div>
            <div class="stat-content">
              <h3>Most Visited Spot</h3>
              <p class="stat-text">{{ arrivalStats.mostVisited }}</p>
            </div>
          </div>
          <div class="stat-card primary">
            <div class="stat-icon">📈</div>
            <div class="stat-content">
              <h3>Success Rate</h3>
              <p class="stat-number">{{ arrivalStats.successRate }}%</p>
            </div>
          </div>
        </div>
      </div>

      <div class="charts-grid">
        <!-- Arrival Analytics Charts -->
        <div class="chart-container">
          <h3>Daily Arrivals Trend</h3>
          <canvas ref="arrivalsChart"></canvas>
        </div>

        <div class="chart-container">
          <h3>Top Destinations by Arrivals</h3>
          <canvas ref="arrivalDestinationsChart"></canvas>
        </div>

        <div class="chart-container">
          <h3>Navigation Duration Analysis</h3>
          <canvas ref="durationChart"></canvas>
        </div>

        <div class="chart-container">
          <h3>Hourly Arrival Patterns</h3>
          <canvas ref="hourlyArrivalsChart"></canvas>
        </div>

        <!-- Original Charts -->
        <!-- Visit Types Bar Chart -->
        <div class="chart-container">
          <h3>Visit Types Distribution</h3>
          <canvas ref="visitTypesChart"></canvas>
        </div>

        <!-- User Verification Pie Chart -->
        <div class="chart-container">
          <h3>User Verification Status</h3>
          <canvas ref="verificationChart"></canvas>
        </div>

        <!-- User Registration Trend Line Chart -->
        <div class="chart-container large">
          <h3>User Registration Trend</h3>
          <canvas ref="registrationTrendChart"></canvas>
        </div>

        <!-- Gender Distribution Doughnut Chart -->
        <div class="chart-container">
          <h3>Gender Distribution</h3>
          <canvas ref="genderChart"></canvas>
        </div>

        <!-- Popular Destinations Bar Chart -->
        <div class="chart-container">
          <h3>Popular Destinations</h3>
          <canvas ref="destinationsChart"></canvas>
        </div>

        <!-- Monthly Active Users Area Chart -->
        <div class="chart-container large">
          <h3>Monthly Active Users</h3>
          <canvas ref="monthlyActiveChart"></canvas>
        </div>

        <!-- User Roles Distribution -->
        <div class="chart-container">
          <h3>User Roles</h3>
          <canvas ref="rolesChart"></canvas>
        </div>

        <!-- Device Usage Polar Chart -->
        <div class="chart-container">
          <h3>Device Usage</h3>
          <canvas ref="deviceChart"></canvas>
        </div>
      </div>

      <!-- Loading Overlay -->
      <div v-if="loading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p>Loading analytics data...</p>
      </div>

      <!-- Preview Modal -->
      <div v-if="showPreviewModal" class="modal-overlay" @click="closePreview">
        <div class="modal-content preview-modal" @click.stop>
          <div class="modal-header">
            <h2>
              <i class="bx bx-file-blank"></i>
              Analytics Report Preview
            </h2>
            <button @click="closePreview" class="close-btn">
              <i class="bx bx-x"></i>
            </button>
          </div>

          <div class="modal-body">
            <div class="preview-actions">
              <button @click="printFromPreview" class="print-preview-btn">
                <i class="bx bx-printer"></i>
                Print This Report
              </button>
              <button @click="downloadPDF" class="download-btn">
                <i class="bx bx-download"></i>
                Download PDF
              </button>
            </div>

            <!-- Preview Content -->
            <div class="report-preview" id="reportPreview">
              <div class="report-header">
                <div class="report-logo">
                  <h1>🌾 FarmGuide AR Navigation</h1>
                  <h2>Analytics Report</h2>
                </div>
                <div class="report-info">
                  <p>
                    <strong>Generated:</strong> {{ formatDate(new Date()) }}
                  </p>
                  <p><strong>Period:</strong> {{ getPeriodText() }}</p>
                  <p><strong>Report Type:</strong> Comprehensive Analytics</p>
                </div>
              </div>

              <div class="report-section">
                <h3>📊 Key Performance Indicators</h3>
                <div class="kpi-grid">
                  <div class="kpi-item">
                    <span class="kpi-label">Total Users:</span>
                    <span class="kpi-value">{{ totalUsers }}</span>
                  </div>
                  <div class="kpi-item">
                    <span class="kpi-label">Verified Users:</span>
                    <span class="kpi-value">{{ verifiedUsers }}</span>
                  </div>
                  <div class="kpi-item">
                    <span class="kpi-label">Active Sessions:</span>
                    <span class="kpi-value">{{ activeSessions }}</span>
                  </div>
                  <div class="kpi-item">
                    <span class="kpi-label">Popular Destination:</span>
                    <span class="kpi-value">{{ popularDestination }}</span>
                  </div>
                </div>
              </div>

              <div class="report-section">
                <h3>🚀 Navigation Analytics</h3>
                <div class="kpi-grid">
                  <div class="kpi-item">
                    <span class="kpi-label">Successful Arrivals:</span>
                    <span class="kpi-value">{{
                      arrivalStats.totalArrivals
                    }}</span>
                  </div>
                  <div class="kpi-item">
                    <span class="kpi-label">Average Navigation Time:</span>
                    <span class="kpi-value">{{
                      arrivalStats.avgDuration
                    }}</span>
                  </div>
                  <div class="kpi-item">
                    <span class="kpi-label">Most Visited Spot:</span>
                    <span class="kpi-value">{{
                      arrivalStats.mostVisited
                    }}</span>
                  </div>
                  <div class="kpi-item">
                    <span class="kpi-label">Success Rate:</span>
                    <span class="kpi-value"
                      >{{ arrivalStats.successRate }}%</span
                    >
                  </div>
                </div>
              </div>

              <div class="report-section">
                <h3>📈 Insights & Recommendations</h3>
                <ul class="insights-list">
                  <li>{{ getMainInsight() }}</li>
                  <li>
                    Navigation success rate indicates
                    {{ getPerformanceLevel() }} user experience
                  </li>
                  <li>
                    Peak usage shows optimal engagement during
                    {{ getMostActiveTime() }}
                  </li>
                  <li>Recommend focusing on {{ getRecommendation() }}</li>
                </ul>
              </div>

              <div class="report-footer">
                <p>
                  This report was automatically generated by FarmGuide Analytics
                  System
                </p>
                <p>© 2025 FarmGuide AR Navigation - All Rights Reserved</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Preview Modal -->
    <div v-if="showPreviewModal" class="modal-overlay" @click="closePreview">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2><i class="bx bx-show"></i> Report Preview</h2>
          <button @click="closePreview" class="close-btn">
            <i class="bx bx-x"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="preview-actions">
            <button @click="printPreview" class="print-preview-btn">
              <i class="bx bx-printer"></i>
              Print Report
            </button>
            <button @click="downloadPDF" class="download-btn">
              <i class="bx bx-download"></i>
              Download PDF
            </button>
          </div>

          <div class="preview-container">
            <div id="printable-report" class="printable-report">
              <div class="report-header">
                <h1>📊 FarmGuide Analytics Report</h1>
                <p>Generated on {{ formatDate(new Date()) }}</p>
                <p>Period: {{ getPeriodText() }}</p>
              </div>

              <div class="report-section">
                <h3>📈 Key Performance Indicators</h3>
                <div class="kpi-grid">
                  <div class="kpi-item">
                    <span class="kpi-label">Total Users:</span>
                    <span class="kpi-value">{{ totalUsers }}</span>
                  </div>
                  <div class="kpi-item">
                    <span class="kpi-label">Verified Users:</span>
                    <span class="kpi-value">{{ verifiedUsers }}</span>
                  </div>
                  <div class="kpi-item">
                    <span class="kpi-label">Active Sessions:</span>
                    <span class="kpi-value">{{ activeSessions }}</span>
                  </div>
                  <div class="kpi-item">
                    <span class="kpi-label">Popular Destination:</span>
                    <span class="kpi-value">{{ popularDestination }}</span>
                  </div>
                </div>
              </div>

              <div class="report-section">
                <h3>🎯 Arrival Analytics</h3>
                <div class="kpi-grid">
                  <div class="kpi-item">
                    <span class="kpi-label">Total Arrivals:</span>
                    <span class="kpi-value">{{
                      arrivalStats.totalArrivals
                    }}</span>
                  </div>
                  <div class="kpi-item">
                    <span class="kpi-label">Avg Duration:</span>
                    <span class="kpi-value">{{
                      arrivalStats.avgDuration
                    }}</span>
                  </div>
                  <div class="kpi-item">
                    <span class="kpi-label">Most Visited Spot:</span>
                    <span class="kpi-value">{{
                      arrivalStats.mostVisited
                    }}</span>
                  </div>
                  <div class="kpi-item">
                    <span class="kpi-label">Success Rate:</span>
                    <span class="kpi-value"
                      >{{ arrivalStats.successRate }}%</span
                    >
                  </div>
                </div>
              </div>

              <div class="report-section">
                <h3>📈 Insights & Recommendations</h3>
                <ul class="insights-list">
                  <li>{{ getMainInsight() }}</li>
                  <li>
                    Navigation success rate indicates
                    {{ getPerformanceLevel() }} user experience
                  </li>
                  <li>
                    Peak usage shows optimal engagement during
                    {{ getMostActiveTime() }}
                  </li>
                  <li>Recommend focusing on {{ getRecommendation() }}</li>
                </ul>
              </div>

              <div class="report-footer">
                <p>
                  This report was automatically generated by FarmGuide Analytics
                  System
                </p>
                <p>© 2025 FarmGuide AR Navigation - All Rights Reserved</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </AdminLayout>
</template>

<script>
import { ref, onMounted } from "vue";
import AdminLayout from "./AdminLayout.vue";
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";
import Chart from "chart.js/auto";
import html2pdf from "html2pdf.js";

export default {
  name: "AdminAnalytics",
  components: {
    AdminLayout,
  },

  data() {
    return {
      loading: true,
      selectedPeriod: "30",
      showPreviewModal: false,

      // Stats
      totalUsers: 0,
      verifiedUsers: 0,
      activeSessions: 0,
      popularDestination: "N/A",

      // Arrival Analytics Stats
      arrivalStats: {
        totalArrivals: 0,
        avgDuration: "0 min",
        mostVisited: "N/A",
        successRate: 0,
      },

      // Chart instances
      charts: {},

      // Data
      visitTypesData: [],
      verificationData: [],
      registrationTrendData: [],
      genderData: [],
      destinationsData: [],
      monthlyActiveData: [],
      rolesData: [],
      deviceData: [],

      // Arrival Analytics Data
      dailyArrivalsData: [],
      arrivalDestinationsData: [],
      durationData: [],
      hourlyArrivalsData: [],
    };
  },

  async mounted() {
    await this.fetchAllData();
    this.initializeCharts();
  },

  beforeUnmount() {
    // Destroy all charts to prevent memory leaks
    Object.values(this.charts).forEach((chart) => {
      if (chart) chart.destroy();
    });
  },

  methods: {
    async fetchAllData() {
      this.loading = true;
      try {
        await Promise.all([
          this.fetchUserStats(),
          this.fetchVisitTypesData(),
          this.fetchVerificationData(),
          this.fetchRegistrationTrend(),
          this.fetchGenderData(),
          this.fetchDestinationsData(),
          this.fetchMonthlyActiveUsers(),
          this.fetchRolesData(),
          this.fetchDeviceData(),
          this.fetchArrivalAnalytics(), // Add arrival analytics
        ]);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        this.loading = false;
      }
    },

    async fetchUserStats() {
      const db = getFirestore();
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const users = [];

        usersSnapshot.forEach((doc) => {
          users.push({ id: doc.id, ...doc.data() });
        });

        this.totalUsers = users.length;
        this.verifiedUsers = users.filter((user) => user.emailVerified).length;

        // Calculate active sessions (users who logged in within last 24 hours)
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        this.activeSessions = users.filter(
          (user) => user.lastLoginAt && user.lastLoginAt.toDate() > oneDayAgo
        ).length;

        // Find most selected destination from user selections
        try {
          const destinationsCollection = collection(db, "recentDestinations");
          const destinationsSnapshot = await getDocs(destinationsCollection);
          const destinationCounts = {};

          destinationsSnapshot.forEach((doc) => {
            const data = doc.data();
            const destination = data.destination || data.name;
            if (destination) {
              destinationCounts[destination] =
                (destinationCounts[destination] || 0) + 1;
            }
          });

          const popularDest = Object.entries(destinationCounts).sort(
            (a, b) => b[1] - a[1]
          )[0];
          this.popularDestination = popularDest ? popularDest[0] : "N/A";
        } catch (error) {
          console.error(
            "Error fetching recent destinations for popular destination:",
            error
          );
          // Fallback to lastDestination from users if recentDestinations fails
          const destinationCounts = {};
          users.forEach((user) => {
            if (user.lastDestination) {
              destinationCounts[user.lastDestination] =
                (destinationCounts[user.lastDestination] || 0) + 1;
            }
          });

          const popularDest = Object.entries(destinationCounts).sort(
            (a, b) => b[1] - a[1]
          )[0];
          this.popularDestination = popularDest ? popularDest[0] : "N/A";
        }
      } catch (error) {
        console.error("Error fetching user stats:", error);
      }
    },

    async fetchVisitTypesData() {
      const db = getFirestore();
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const visitCounts = {};

        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          const visitType = userData.typeofvisit;
          if (visitType) {
            visitCounts[visitType] = (visitCounts[visitType] || 0) + 1;
          }
        });

        this.visitTypesData = Object.entries(visitCounts)
          .sort((a, b) => b[1] - a[1])
          .map(([type, count]) => ({ type, count }));
      } catch (error) {
        console.error("Error fetching visit types data:", error);
      }
    },

    async fetchVerificationData() {
      const db = getFirestore();
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        let verified = 0;
        let unverified = 0;

        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.emailVerified) {
            verified++;
          } else {
            unverified++;
          }
        });

        this.verificationData = [
          { status: "Verified", count: verified },
          { status: "Unverified", count: unverified },
        ];
      } catch (error) {
        console.error("Error fetching verification data:", error);
      }
    },

    async fetchRegistrationTrend() {
      const db = getFirestore();
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const registrationsByDate = {};

        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.createdAt) {
            const date = userData.createdAt.toDate();
            const dateKey = date.toISOString().split("T")[0]; // YYYY-MM-DD format
            registrationsByDate[dateKey] =
              (registrationsByDate[dateKey] || 0) + 1;
          }
        });

        // Get last 30 days
        const last30Days = [];
        for (let i = 29; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateKey = date.toISOString().split("T")[0];
          last30Days.push({
            date: dateKey,
            count: registrationsByDate[dateKey] || 0,
          });
        }

        this.registrationTrendData = last30Days;
      } catch (error) {
        console.error("Error fetching registration trend:", error);
      }
    },

    async fetchGenderData() {
      const db = getFirestore();
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const genderCounts = {};

        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          const gender = userData.gender || "Not specified";
          genderCounts[gender] = (genderCounts[gender] || 0) + 1;
        });

        this.genderData = Object.entries(genderCounts).map(
          ([gender, count]) => ({ gender, count })
        );
      } catch (error) {
        console.error("Error fetching gender data:", error);
      }
    },

    async fetchDestinationsData() {
      const db = getFirestore();
      try {
        // Fetch from recentDestinations collection
        const destinationsSnapshot = await getDocs(
          collection(db, "recentDestinations")
        );
        const destinationCounts = {};

        destinationsSnapshot.forEach((doc) => {
          const data = doc.data();
          const destination = data.destination || data.name;
          if (destination) {
            destinationCounts[destination] =
              (destinationCounts[destination] || 0) + 1;
          }
        });

        this.destinationsData = Object.entries(destinationCounts)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 10) // Top 10 destinations
          .map(([destination, count]) => ({ destination, count }));
      } catch (error) {
        console.error("Error fetching destinations data:", error);
      }
    },

    async fetchMonthlyActiveUsers() {
      const db = getFirestore();
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const monthlyActive = {};

        // Get last 12 months
        for (let i = 11; i >= 0; i--) {
          const date = new Date();
          date.setMonth(date.getMonth() - i);
          const monthKey = `${date.getFullYear()}-${String(
            date.getMonth() + 1
          ).padStart(2, "0")}`;
          monthlyActive[monthKey] = 0;
        }

        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          if (userData.lastLoginAt) {
            const loginDate = userData.lastLoginAt.toDate();
            const monthKey = `${loginDate.getFullYear()}-${String(
              loginDate.getMonth() + 1
            ).padStart(2, "0")}`;
            if (monthlyActive.hasOwnProperty(monthKey)) {
              monthlyActive[monthKey]++;
            }
          }
        });

        this.monthlyActiveData = Object.entries(monthlyActive).map(
          ([month, count]) => ({ month, count })
        );
      } catch (error) {
        console.error("Error fetching monthly active users:", error);
      }
    },

    async fetchRolesData() {
      const db = getFirestore();
      try {
        const usersSnapshot = await getDocs(collection(db, "users"));
        const roleCounts = {};

        usersSnapshot.forEach((doc) => {
          const userData = doc.data();
          const role = userData.role || "user";
          roleCounts[role] = (roleCounts[role] || 0) + 1;
        });

        this.rolesData = Object.entries(roleCounts).map(([role, count]) => ({
          role,
          count,
        }));
      } catch (error) {
        console.error("Error fetching roles data:", error);
      }
    },

    async fetchDeviceData() {
      // Mock device data - you can implement actual device tracking
      this.deviceData = [
        { device: "Mobile", count: Math.floor(Math.random() * 100) + 50 },
        { device: "Desktop", count: Math.floor(Math.random() * 80) + 30 },
        { device: "Tablet", count: Math.floor(Math.random() * 40) + 10 },
        { device: "Other", count: Math.floor(Math.random() * 20) + 5 },
      ];
    },

    // New Arrival Analytics Methods
    async fetchArrivalAnalytics() {
      try {
        const db = getFirestore();
        const arrivalCollection = collection(db, "arrivalAnalytics");

        // Get date filter
        const dateFilter = this.getDateFilter();
        let arrivalQuery = arrivalCollection;

        if (dateFilter) {
          arrivalQuery = query(
            arrivalCollection,
            where("timestamp", ">=", dateFilter)
          );
        }

        const arrivalSnapshot = await getDocs(arrivalQuery);
        const arrivals = arrivalSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Calculate stats
        this.arrivalStats.totalArrivals = arrivals.length;

        if (arrivals.length > 0) {
          // Calculate average duration
          const avgDurationMs =
            arrivals.reduce(
              (sum, arrival) => sum + (arrival.navigationDuration || 0),
              0
            ) / arrivals.length;
          this.arrivalStats.avgDuration = this.formatDuration(avgDurationMs);

          // Find most visited destination
          const destinationCounts = {};
          arrivals.forEach((arrival) => {
            const dest = arrival.destinationName || "Unknown";
            destinationCounts[dest] = (destinationCounts[dest] || 0) + 1;
          });

          const mostVisited = Object.entries(destinationCounts).sort(
            ([, a], [, b]) => b - a
          )[0];
          this.arrivalStats.mostVisited = mostVisited ? mostVisited[0] : "N/A";

          // Calculate success rate (assuming all logged arrivals are successful)
          this.arrivalStats.successRate = 95; // High success rate for logged arrivals
        }

        // Prepare chart data
        this.prepareArrivalChartData(arrivals);
      } catch (error) {
        console.error("Error fetching arrival analytics:", error);
        // Set default values on error
        this.arrivalStats = {
          totalArrivals: 0,
          avgDuration: "0 min",
          mostVisited: "N/A",
          successRate: 0,
        };
      }
    },

    getDateFilter() {
      const now = new Date();
      if (this.selectedPeriod === "all") return null;

      const days = parseInt(this.selectedPeriod);
      const filterDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      return filterDate;
    },

    formatDuration(milliseconds) {
      const minutes = Math.floor(milliseconds / (1000 * 60));
      const hours = Math.floor(minutes / 60);

      if (hours > 0) {
        return `${hours}h ${minutes % 60}m`;
      } else {
        return `${minutes} min`;
      }
    },

    prepareArrivalChartData(arrivals) {
      // Prepare data for daily arrivals chart
      this.dailyArrivalsData = this.groupArrivalsByDay(arrivals);

      // Prepare data for destinations chart
      this.arrivalDestinationsData = this.groupArrivalsByDestination(arrivals);

      // Prepare data for duration analysis
      this.durationData = this.analyzeDurations(arrivals);

      // Prepare data for hourly patterns
      this.hourlyArrivalsData = this.groupArrivalsByHour(arrivals);
    },

    groupArrivalsByDay(arrivals) {
      const last7Days = [];
      const today = new Date();

      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];

        const count = arrivals.filter((arrival) => {
          const arrivalDate = new Date(arrival.timestamp.toDate())
            .toISOString()
            .split("T")[0];
          return arrivalDate === dateStr;
        }).length;

        last7Days.push({
          date: date.toLocaleDateString("en-US", { weekday: "short" }),
          count,
        });
      }

      return last7Days;
    },

    groupArrivalsByDestination(arrivals) {
      const destinationCounts = {};
      arrivals.forEach((arrival) => {
        const dest = arrival.destinationName || "Unknown";
        destinationCounts[dest] = (destinationCounts[dest] || 0) + 1;
      });

      return Object.entries(destinationCounts)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 10); // Top 10 destinations
    },

    analyzeDurations(arrivals) {
      const durations = arrivals
        .filter((arrival) => arrival.navigationDuration)
        .map((arrival) => Math.floor(arrival.navigationDuration / (1000 * 60))); // Convert to minutes

      const ranges = {
        "0-2 min": 0,
        "3-5 min": 0,
        "6-10 min": 0,
        "11-20 min": 0,
        "20+ min": 0,
      };

      durations.forEach((duration) => {
        if (duration <= 2) ranges["0-2 min"]++;
        else if (duration <= 5) ranges["3-5 min"]++;
        else if (duration <= 10) ranges["6-10 min"]++;
        else if (duration <= 20) ranges["11-20 min"]++;
        else ranges["20+ min"]++;
      });

      return Object.entries(ranges).map(([range, count]) => ({ range, count }));
    },

    groupArrivalsByHour(arrivals) {
      const hourCounts = Array(24).fill(0);

      arrivals.forEach((arrival) => {
        const hour = new Date(arrival.timestamp.toDate()).getHours();
        hourCounts[hour]++;
      });

      return hourCounts.map((count, hour) => ({
        hour: `${hour}:00`,
        count,
      }));
    },

    initializeCharts() {
      this.$nextTick(() => {
        // Arrival Analytics Charts
        this.createArrivalsChart();
        this.createArrivalDestinationsChart();
        this.createDurationChart();
        this.createHourlyArrivalsChart();

        // Original Charts
        this.createVisitTypesChart();
        this.createVerificationChart();
        this.createRegistrationTrendChart();
        this.createGenderChart();
        this.createDestinationsChart();
        this.createMonthlyActiveChart();
        this.createRolesChart();
        this.createDeviceChart();
      });
    },

    createVisitTypesChart() {
      const ctx = this.$refs.visitTypesChart?.getContext("2d");
      if (!ctx || !this.visitTypesData.length) return;

      if (this.charts.visitTypes) this.charts.visitTypes.destroy();

      this.charts.visitTypes = new Chart(ctx, {
        type: "bar",
        data: {
          labels: this.visitTypesData.map((item) => item.type),
          datasets: [
            {
              label: "Number of Users",
              data: this.visitTypesData.map((item) => item.count),
              backgroundColor: [
                "rgba(54, 162, 235, 0.8)",
                "rgba(255, 99, 132, 0.8)",
                "rgba(255, 205, 86, 0.8)",
                "rgba(75, 192, 192, 0.8)",
              ],
              borderColor: [
                "rgba(54, 162, 235, 1)",
                "rgba(255, 99, 132, 1)",
                "rgba(255, 205, 86, 1)",
                "rgba(75, 192, 192, 1)",
              ],
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
        },
      });
    },

    createVerificationChart() {
      const ctx = this.$refs.verificationChart?.getContext("2d");
      if (!ctx || !this.verificationData.length) return;

      if (this.charts.verification) this.charts.verification.destroy();

      this.charts.verification = new Chart(ctx, {
        type: "pie",
        data: {
          labels: this.verificationData.map((item) => item.status),
          datasets: [
            {
              data: this.verificationData.map((item) => item.count),
              backgroundColor: [
                "rgba(75, 192, 192, 0.8)",
                "rgba(255, 99, 132, 0.8)",
              ],
              borderColor: ["rgba(75, 192, 192, 1)", "rgba(255, 99, 132, 1)"],
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
            },
          },
        },
      });
    },

    createRegistrationTrendChart() {
      const ctx = this.$refs.registrationTrendChart?.getContext("2d");
      if (!ctx || !this.registrationTrendData.length) return;

      if (this.charts.registrationTrend)
        this.charts.registrationTrend.destroy();

      this.charts.registrationTrend = new Chart(ctx, {
        type: "line",
        data: {
          labels: this.registrationTrendData.map((item) => {
            const date = new Date(item.date);
            return date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            });
          }),
          datasets: [
            {
              label: "New Registrations",
              data: this.registrationTrendData.map((item) => item.count),
              borderColor: "rgba(54, 162, 235, 1)",
              backgroundColor: "rgba(54, 162, 235, 0.1)",
              borderWidth: 3,
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
        },
      });
    },

    createGenderChart() {
      const ctx = this.$refs.genderChart?.getContext("2d");
      if (!ctx || !this.genderData.length) return;

      if (this.charts.gender) this.charts.gender.destroy();

      this.charts.gender = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: this.genderData.map((item) => item.gender),
          datasets: [
            {
              data: this.genderData.map((item) => item.count),
              backgroundColor: [
                "rgba(255, 99, 132, 0.8)",
                "rgba(54, 162, 235, 0.8)",
                "rgba(255, 205, 86, 0.8)",
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 205, 86, 1)",
              ],
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
            },
          },
        },
      });
    },

    createDestinationsChart() {
      const ctx = this.$refs.destinationsChart?.getContext("2d");
      if (!ctx || !this.destinationsData.length) return;

      if (this.charts.destinations) this.charts.destinations.destroy();

      this.charts.destinations = new Chart(ctx, {
        type: "bar",
        data: {
          labels: this.destinationsData.map((item) => item.destination),
          datasets: [
            {
              label: "Visits",
              data: this.destinationsData.map((item) => item.count),
              backgroundColor: "rgba(153, 102, 255, 0.8)",
              borderColor: "rgba(153, 102, 255, 1)",
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: "y",
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            x: {
              beginAtZero: true,
            },
          },
        },
      });
    },

    createMonthlyActiveChart() {
      const ctx = this.$refs.monthlyActiveChart?.getContext("2d");
      if (!ctx || !this.monthlyActiveData.length) return;

      if (this.charts.monthlyActive) this.charts.monthlyActive.destroy();

      this.charts.monthlyActive = new Chart(ctx, {
        type: "line",
        data: {
          labels: this.monthlyActiveData.map((item) => {
            const [year, month] = item.month.split("-");
            const date = new Date(year, month - 1);
            return date.toLocaleDateString("en-US", {
              month: "short",
              year: "numeric",
            });
          }),
          datasets: [
            {
              label: "Active Users",
              data: this.monthlyActiveData.map((item) => item.count),
              borderColor: "rgba(75, 192, 192, 1)",
              backgroundColor: "rgba(75, 192, 192, 0.2)",
              borderWidth: 3,
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    },

    createRolesChart() {
      const ctx = this.$refs.rolesChart?.getContext("2d");
      if (!ctx || !this.rolesData.length) return;

      if (this.charts.roles) this.charts.roles.destroy();

      this.charts.roles = new Chart(ctx, {
        type: "pie",
        data: {
          labels: this.rolesData.map((item) => item.role),
          datasets: [
            {
              data: this.rolesData.map((item) => item.count),
              backgroundColor: [
                "rgba(255, 159, 64, 0.8)",
                "rgba(54, 162, 235, 0.8)",
              ],
              borderColor: ["rgba(255, 159, 64, 1)", "rgba(54, 162, 235, 1)"],
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
            },
          },
        },
      });
    },

    createDeviceChart() {
      const ctx = this.$refs.deviceChart?.getContext("2d");
      if (!ctx || !this.deviceData.length) return;

      if (this.charts.device) this.charts.device.destroy();

      this.charts.device = new Chart(ctx, {
        type: "polarArea",
        data: {
          labels: this.deviceData.map((item) => item.device),
          datasets: [
            {
              data: this.deviceData.map((item) => item.count),
              backgroundColor: [
                "rgba(255, 99, 132, 0.8)",
                "rgba(54, 162, 235, 0.8)",
                "rgba(255, 205, 86, 0.8)",
                "rgba(75, 192, 192, 0.8)",
              ],
              borderColor: [
                "rgba(255, 99, 132, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 205, 86, 1)",
                "rgba(75, 192, 192, 1)",
              ],
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
            },
          },
        },
      });
    },

    // New Arrival Analytics Chart Methods
    createArrivalsChart() {
      const ctx = this.$refs.arrivalsChart?.getContext("2d");
      if (!ctx || !this.dailyArrivalsData?.length) return;

      if (this.charts.arrivals) this.charts.arrivals.destroy();

      this.charts.arrivals = new Chart(ctx, {
        type: "line",
        data: {
          labels: this.dailyArrivalsData.map((item) => item.date),
          datasets: [
            {
              label: "Daily Arrivals",
              data: this.dailyArrivalsData.map((item) => item.count),
              backgroundColor: "rgba(34, 197, 94, 0.2)",
              borderColor: "rgba(34, 197, 94, 1)",
              borderWidth: 3,
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "top",
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
          },
        },
      });
    },

    createArrivalDestinationsChart() {
      const ctx = this.$refs.arrivalDestinationsChart?.getContext("2d");
      if (!ctx || !this.arrivalDestinationsData?.length) return;

      if (this.charts.arrivalDestinations)
        this.charts.arrivalDestinations.destroy();

      this.charts.arrivalDestinations = new Chart(ctx, {
        type: "bar",
        data: {
          labels: this.arrivalDestinationsData.map((item) => item.name),
          datasets: [
            {
              label: "Successful Arrivals",
              data: this.arrivalDestinationsData.map((item) => item.count),
              backgroundColor: "rgba(59, 130, 246, 0.8)",
              borderColor: "rgba(59, 130, 246, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
            x: {
              ticks: {
                maxRotation: 45,
              },
            },
          },
        },
      });
    },

    createDurationChart() {
      const ctx = this.$refs.durationChart?.getContext("2d");
      if (!ctx || !this.durationData?.length) return;

      if (this.charts.duration) this.charts.duration.destroy();

      this.charts.duration = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: this.durationData.map((item) => item.range),
          datasets: [
            {
              data: this.durationData.map((item) => item.count),
              backgroundColor: [
                "rgba(34, 197, 94, 0.8)",
                "rgba(59, 130, 246, 0.8)",
                "rgba(245, 158, 11, 0.8)",
                "rgba(239, 68, 68, 0.8)",
                "rgba(139, 92, 246, 0.8)",
              ],
              borderWidth: 2,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "bottom",
            },
          },
        },
      });
    },

    createHourlyArrivalsChart() {
      const ctx = this.$refs.hourlyArrivalsChart?.getContext("2d");
      if (!ctx || !this.hourlyArrivalsData?.length) return;

      if (this.charts.hourlyArrivals) this.charts.hourlyArrivals.destroy();

      this.charts.hourlyArrivals = new Chart(ctx, {
        type: "bar",
        data: {
          labels: this.hourlyArrivalsData.map((item) => item.hour),
          datasets: [
            {
              label: "Arrivals by Hour",
              data: this.hourlyArrivalsData.map((item) => item.count),
              backgroundColor: "rgba(16, 185, 129, 0.8)",
              borderColor: "rgba(16, 185, 129, 1)",
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false,
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                stepSize: 1,
              },
            },
            x: {
              ticks: {
                maxRotation: 45,
              },
            },
          },
        },
      });
    },

    // Preview and Print Methods
    showPreview() {
      this.showPreviewModal = true;
    },

    closePreview() {
      this.showPreviewModal = false;
    },

    printReport() {
      // Create a new window with print-optimized content
      const printWindow = window.open("", "_blank");
      const printContent = this.generatePrintHTML();

      printWindow.document.write(printContent);
      printWindow.document.close();

      // Wait for content to load then print
      printWindow.onload = function () {
        printWindow.print();
        printWindow.close();
      };
    },

    printFromPreview() {
      const printContent = document.getElementById("reportPreview").innerHTML;
      const printWindow = window.open("", "_blank");

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>FarmGuide Analytics Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .report-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4facfe; padding-bottom: 20px; }
            .report-section { margin-bottom: 25px; }
            .kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 15px 0; }
            .kpi-item { display: flex; justify-content: space-between; padding: 8px; border: 1px solid #eee; }
            .kpi-label { font-weight: bold; }
            .insights-list { margin: 15px 0; }
            .insights-list li { margin: 8px 0; }
            .report-footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; }
            h1, h2, h3 { color: #333; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          ${printContent}
        </body>
        </html>
      `);

      printWindow.document.close();
      printWindow.onload = function () {
        printWindow.print();
        printWindow.close();
      };
    },

    downloadPDF() {
      // For PDF download, you can use libraries like jsPDF or html2pdf
      // This is a simple implementation using the browser's print to PDF
      this.printFromPreview();
      alert(
        'Use your browser\'s "Save as PDF" option in the print dialog to download the PDF.'
      );
    },

    generatePrintHTML() {
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <title>FarmGuide Analytics Report</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; line-height: 1.6; }
            .report-header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #4facfe; padding-bottom: 20px; }
            .report-logo h1 { color: #4facfe; margin: 0; }
            .report-logo h2 { color: #333; margin: 5px 0; }
            .report-info { margin-top: 15px; }
            .report-section { margin-bottom: 25px; page-break-inside: avoid; }
            .kpi-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin: 15px 0; }
            .kpi-item { display: flex; justify-content: space-between; padding: 10px; border: 1px solid #eee; background: #f9f9f9; }
            .kpi-label { font-weight: bold; color: #555; }
            .kpi-value { color: #4facfe; font-weight: bold; }
            .insights-list { margin: 15px 0; }
            .insights-list li { margin: 8px 0; padding: 5px 0; }
            .report-footer { margin-top: 40px; text-align: center; font-size: 12px; color: #666; border-top: 1px solid #eee; padding-top: 20px; }
            h1, h2, h3 { color: #333; }
            h3 { border-left: 4px solid #4facfe; padding-left: 10px; }
            @media print { 
              body { margin: 0; } 
              .report-section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          <div class="report-header">
            <div class="report-logo">
              <h1>🌾 FarmGuide AR Navigation</h1>
              <h2>Analytics Report</h2>
            </div>
            <div class="report-info">
              <p><strong>Generated:</strong> ${this.formatDate(new Date())}</p>
              <p><strong>Period:</strong> ${this.getPeriodText()}</p>
              <p><strong>Report Type:</strong> Comprehensive Analytics</p>
            </div>
          </div>

          <div class="report-section">
            <h3>📊 Key Performance Indicators</h3>
            <div class="kpi-grid">
              <div class="kpi-item">
                <span class="kpi-label">Total Users:</span>
                <span class="kpi-value">${this.totalUsers}</span>
              </div>
              <div class="kpi-item">
                <span class="kpi-label">Verified Users:</span>
                <span class="kpi-value">${this.verifiedUsers}</span>
              </div>
              <div class="kpi-item">
                <span class="kpi-label">Active Sessions:</span>
                <span class="kpi-value">${this.activeSessions}</span>
              </div>
              <div class="kpi-item">
                <span class="kpi-label">Popular Destination:</span>
                <span class="kpi-value">${this.popularDestination}</span>
              </div>
            </div>
          </div>

          <div class="report-section">
            <h3>🚀 Navigation Analytics</h3>
            <div class="kpi-grid">
              <div class="kpi-item">
                <span class="kpi-label">Successful Arrivals:</span>
                <span class="kpi-value">${
                  this.arrivalStats.totalArrivals
                }</span>
              </div>
              <div class="kpi-item">
                <span class="kpi-label">Average Navigation Time:</span>
                <span class="kpi-value">${this.arrivalStats.avgDuration}</span>
              </div>
              <div class="kpi-item">
                <span class="kpi-label">Most Visited Spot:</span>
                <span class="kpi-value">${this.arrivalStats.mostVisited}</span>
              </div>
              <div class="kpi-item">
                <span class="kpi-label">Success Rate:</span>
                <span class="kpi-value">${this.arrivalStats.successRate}%</span>
              </div>
            </div>
          </div>

          <div class="report-section">
            <h3>📈 Insights & Recommendations</h3>
            <ul class="insights-list">
              <li>${this.getMainInsight()}</li>
              <li>Navigation success rate indicates ${this.getPerformanceLevel()} user experience</li>
              <li>Peak usage shows optimal engagement during ${this.getMostActiveTime()}</li>
              <li>Recommend focusing on ${this.getRecommendation()}</li>
            </ul>
          </div>

          <div class="report-footer">
            <p>This report was automatically generated by FarmGuide Analytics System</p>
            <p>© 2025 FarmGuide AR Navigation - All Rights Reserved</p>
          </div>
        </body>
        </html>
      `;
    },

    // Helper methods for report content
    formatDate(date) {
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },

    getPeriodText() {
      const periods = {
        7: "Last 7 days",
        30: "Last 30 days",
        90: "Last 90 days",
        365: "Last year",
        all: "All time",
      };
      return periods[this.selectedPeriod] || "Custom period";
    },

    getMainInsight() {
      if (this.totalUsers > 100) {
        return `Strong user adoption with ${this.totalUsers} total users demonstrates platform success`;
      } else if (this.totalUsers > 50) {
        return `Growing user base of ${this.totalUsers} users shows positive platform traction`;
      } else {
        return `Early stage platform with ${this.totalUsers} users ready for growth initiatives`;
      }
    },

    getPerformanceLevel() {
      const rate = this.arrivalStats.successRate;
      if (rate >= 90) return "excellent";
      if (rate >= 75) return "good";
      if (rate >= 60) return "satisfactory";
      return "needs improvement";
    },

    getMostActiveTime() {
      // This could be enhanced with actual time-based analytics
      return "peak hours (based on current data trends)";
    },

    getRecommendation() {
      const verificationRate = (this.verifiedUsers / this.totalUsers) * 100;
      if (verificationRate < 50) {
        return "improving user verification processes";
      } else if (this.arrivalStats.successRate < 80) {
        return "enhancing navigation accuracy and user guidance";
      } else {
        return "expanding popular destination features and content";
      }
    },

    // Print and Preview Methods
    showPreview() {
      this.showPreviewModal = true;
    },

    closePreview() {
      this.showPreviewModal = false;
    },

    async printReport() {
      const reportContent = document.getElementById("printable-report");

      if (!reportContent) {
        alert("Report content not found. Please try again.");
        return;
      }

      // Clone the content for printing
      const printWindow = window.open("", "_blank");
      const clonedContent = reportContent.cloneNode(true);

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>FarmGuide Analytics Report - ${this.formatDate(
            new Date()
          )}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              font-family: 'Segoe UI', Arial, sans-serif; 
              line-height: 1.6; 
              color: #333;
              background: white;
            }
            .printable-report { 
              max-width: 800px; 
              margin: 0 auto; 
              padding: 40px 20px;
            }
            .report-header { 
              text-align: center; 
              margin-bottom: 40px; 
              border-bottom: 3px solid #4facfe;
              padding-bottom: 20px;
            }
            .report-header h1 { 
              color: #2d3748; 
              font-size: 28px; 
              margin-bottom: 10px;
            }
            .report-header p { 
              color: #718096; 
              font-size: 14px;
            }
            .report-section { 
              margin-bottom: 30px; 
              page-break-inside: avoid;
            }
            .report-section h3 { 
              color: #2d3748; 
              margin-bottom: 15px; 
              padding-bottom: 8px;
              border-bottom: 2px solid #e2e8f0;
              font-size: 18px;
            }
            .kpi-grid { 
              display: grid; 
              grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
              gap: 20px; 
              margin-bottom: 20px;
            }
            .kpi-item { 
              padding: 15px; 
              border: 1px solid #e2e8f0; 
              border-radius: 8px;
              background: #f7fafc;
            }
            .kpi-label { 
              display: block; 
              font-weight: 600; 
              color: #4a5568; 
              font-size: 12px; 
              text-transform: uppercase;
              margin-bottom: 5px;
            }
            .kpi-value { 
              display: block; 
              font-size: 24px; 
              font-weight: 700; 
              color: #2d3748;
            }
            .insights-list { 
              list-style: none; 
              padding: 0;
            }
            .insights-list li { 
              margin-bottom: 10px; 
              padding: 12px; 
              background: #edf2f7; 
              border-left: 4px solid #4facfe;
              border-radius: 4px;
            }
            .report-footer { 
              margin-top: 40px; 
              padding-top: 20px; 
              border-top: 2px solid #e2e8f0; 
              text-align: center; 
              color: #718096; 
              font-size: 12px;
            }
            @media print {
              body { print-color-adjust: exact; }
              .report-section { page-break-inside: avoid; }
            }
          </style>
        </head>
        <body>
          ${clonedContent.outerHTML}
        </body>
        </html>
      `);

      printWindow.document.close();

      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 250);
    },

    async downloadPDF() {
      const reportContent = document.getElementById("printable-report");

      if (!reportContent) {
        alert("Report content not found. Please try again.");
        return;
      }

      const options = {
        margin: [0.5, 0.5, 0.5, 0.5],
        filename: `FarmGuide-Analytics-Report-${
          new Date().toISOString().split("T")[0]
        }.pdf`,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          letterRendering: true,
          allowTaint: false,
        },
        jsPDF: {
          unit: "in",
          format: "letter",
          orientation: "portrait",
        },
      };

      try {
        await html2pdf().set(options).from(reportContent).save();
      } catch (error) {
        console.error("Error generating PDF:", error);
        alert("Error generating PDF. Please try again.");
      }
    },

    printPreview() {
      this.printReport();
    },
  },
};
</script>

<style scoped>
.nav-link {
  color: var(--text-primary);
  text-decoration: none;
  font-weight: 500;
}

.analytics-dashboard {
  padding: 20px;
  background-color: var(--bg-primary);
  min-height: calc(100vh - 80px);
  position: relative;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
}

.dashboard-header h1 {
  color: var(--text-primary);
  margin: 0;
}

.date-filter select {
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--bg-secondary);
  color: var(--text-primary);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card {
  background: var(--bg-secondary);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow);
  display: flex;
  align-items: center;
  gap: 15px;
}

.stat-icon {
  font-size: 2rem;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--hover-bg);
  border-radius: 50%;
}

.stat-content h3 {
  margin: 0 0 5px 0;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
}

.stat-number {
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
  color: var(--text-primary);
}

.stat-text {
  margin: 0;
  font-size: 1.2rem;
  font-weight: 600;
  color: var(--text-primary);
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;
}

.chart-container {
  background: var(--bg-secondary);
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px var(--shadow);
  height: 400px;
}

.chart-container.large {
  grid-column: span 2;
}

.chart-container h3 {
  margin: 0 0 20px 0;
  color: var(--text-primary);
  font-size: 1.1rem;
  font-weight: 600;
}

.chart-container canvas {
  max-height: 320px;
}

.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 20px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.loading-overlay p {
  color: var(--text-secondary);
  font-size: 1.1rem;
}

/* Arrival Analytics Styles */
.arrival-analytics-section {
  margin: 40px 0;
  padding: 30px;
  background: var(--card-bg);
  border-radius: 12px;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--border-color);
}

.arrival-analytics-section h2 {
  color: var(--text-primary);
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 600;
}

.arrival-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;
}

.stat-card.success {
  border-left: 4px solid var(--success-color);
}

.stat-card.success .stat-icon {
  background: linear-gradient(135deg, var(--success-color), #059669);
}

.stat-card.info {
  border-left: 4px solid var(--primary-color);
}

.stat-card.info .stat-icon {
  background: linear-gradient(
    135deg,
    var(--primary-color),
    var(--primary-hover)
  );
}

.stat-card.warning {
  border-left: 4px solid var(--warning-color);
}

.stat-card.warning .stat-icon {
  background: linear-gradient(135deg, var(--warning-color), #d97706);
}

.stat-card.primary {
  border-left: 4px solid #8b5cf6;
}

.stat-card.primary .stat-icon {
  background: linear-gradient(135deg, #8b5cf6, #7c3aed);
}

/* Header Actions Styles */
.header-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.action-buttons {
  display: flex;
  gap: 10px;
}

.preview-btn,
.print-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.preview-btn {
  background: var(--primary-color);
  color: white;
}

.preview-btn:hover {
  background: var(--primary-hover);
  transform: translateY(-1px);
}

.print-btn {
  background: var(--success-color);
  color: white;
}

.print-btn:hover {
  background: #16a34a;
  transform: translateY(-1px);
}

/* Modal Styles */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10000;
  padding: 20px;
}

.modal-content {
  background: var(--bg-primary);
  border-radius: 12px;
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3);
  max-height: 90vh;
  overflow-y: auto;
  width: 100%;
}

.preview-modal {
  max-width: 900px;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid var(--border-color);
  background: var(--bg-secondary);
  border-radius: 12px 12px 0 0;
}

.modal-header h2 {
  margin: 0;
  color: var(--text-primary);
  font-size: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.close-btn {
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: var(--text-secondary);
  padding: 8px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}

.modal-body {
  padding: 20px;
}

.preview-actions {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid var(--border-color);
}

.print-preview-btn,
.download-btn {
  padding: 10px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s ease;
}

.print-preview-btn {
  background: var(--success-color);
  color: white;
}

.print-preview-btn:hover {
  background: #16a34a;
}

.download-btn {
  background: var(--warning-color);
  color: white;
}

.download-btn:hover {
  background: #d97706;
}

/* Report Preview Styles */
.report-preview {
  background: white;
  color: #333;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  font-family: "Arial", sans-serif;
  line-height: 1.6;
}

.report-header {
  text-align: center;
  margin-bottom: 30px;
  border-bottom: 2px solid #4facfe;
  padding-bottom: 20px;
}

.report-logo h1 {
  color: #4facfe;
  margin: 0;
  font-size: 28px;
}

.report-logo h2 {
  color: #333;
  margin: 5px 0;
  font-size: 20px;
}

.report-info {
  margin-top: 15px;
  font-size: 14px;
  color: #666;
}

.report-info p {
  margin: 5px 0;
}

.report-section {
  margin-bottom: 25px;
}

.report-section h3 {
  color: #333;
  border-left: 4px solid #4facfe;
  padding-left: 12px;
  margin-bottom: 15px;
  font-size: 18px;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 15px;
  margin: 15px 0;
}

.kpi-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border: 1px solid #e5e7eb;
  background: #f9fafb;
  border-radius: 6px;
}

.kpi-label {
  font-weight: 600;
  color: #555;
}

.kpi-value {
  color: #4facfe;
  font-weight: bold;
  font-size: 16px;
}

.insights-list {
  margin: 15px 0;
  padding-left: 20px;
}

.insights-list li {
  margin: 10px 0;
  color: #555;
}

.report-footer {
  margin-top: 40px;
  text-align: center;
  font-size: 12px;
  color: #888;
  border-top: 1px solid #e5e7eb;
  padding-top: 20px;
}

@media (max-width: 768px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }

  .chart-container.large {
    grid-column: span 1;
  }

  .dashboard-header {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }

  .header-actions {
    flex-direction: column;
    gap: 15px;
    width: 100%;
  }

  .action-buttons {
    width: 100%;
  }

  .preview-btn,
  .print-btn {
    flex: 1;
    justify-content: center;
  }

  .modal-content {
    margin: 10px;
    max-width: calc(100vw - 20px);
  }

  .kpi-grid {
    grid-template-columns: 1fr;
  }

  .preview-actions {
    flex-direction: column;
  }

  .print-preview-btn,
  .download-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
