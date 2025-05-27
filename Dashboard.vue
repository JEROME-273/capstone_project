<template>
  <div class="admin-dashboard">
    <section id="sidebar">
      <a href="#" class="brand">
        <i class="bx bxs-smile"></i>
        <span class="text">FarmGuide Admin</span>
      </a>
      <ul class="side-menu top">
        <li
          :class="{ active: activeSection === 'dashboard' }"
          @click="activeSection = 'dashboard'">
          <a href="#">
            <i class="bx bxs-dashboard"></i>
            <span class="text">Dashboard</span>
          </a>
        </li>
        <li
          :class="{ active: activeSection === 'map-management' }"
          @click="activeSection = 'map-management'">
          <a href="#">
            <i class="bx bxs-map"></i>
            <span class="text">Map Management</span>
          </a>
        </li>
        <li
          :class="{ active: activeSection === 'analytics' }"
          @click="activeSection = 'analytics'">
          <a href="#">
            <i class="bx bxs-bar-chart-alt-2"></i>
            <span class="text">Analytics</span>
          </a>
        </li>
        <li
          :class="{ active: activeSection === 'feedback' }"
          @click="activeSection = 'feedback'">
          <a href="#">
            <i class="bx bxs-message-dots"></i>
            <span class="text">Feedback & Reports</span>
          </a>
        </li>
      </ul>
      <ul class="side-menu">
        <li
          :class="{ active: activeSection === 'user-management' }"
          @click="activeSection = 'user-management'">
          <a href="#">
            <i class="bx bxs-group"></i>
            <span class="text">User Management</span>
          </a>
        </li>
        <li>
          <a href="#" class="logout">
            <i class="bx bxs-log-out-circle"></i>
            <span class="text">Logout</span>
          </a>
        </li>
      </ul>
    </section>

    <section id="content">
      <nav>
        <i class="bx bx-menu" @click="toggleSidebar"></i>
        <a href="#" class="nav-link">{{ getPageTitle }}</a>
        <form action="#">
          <div class="form-input">
            <input type="search" placeholder="Search..." />
            <button type="submit" class="search-btn">
              <i class="bx bx-search"></i>
            </button>
          </div>
        </form>
        <div class="theme-toggle">
          <input type="checkbox" id="switch-mode" v-model="darkMode" />
          <label for="switch-mode" class="switch-mode"></label>
        </div>
      </nav>

      <main>
        <div class="head-title">
          <div class="left">
            <h1>{{ getPageTitle }}</h1>
            <ul class="breadcrumb">
              <li><i class="bx bx-chevron-right"></i></li>
              <li>
                <a class="active" href="#">{{ getPageTitle }}</a>
              </li>
            </ul>
          </div>
          <a
            href="#"
            class="btn-download"
            v-if="
              activeSection === 'dashboard' || activeSection === 'analytics'
            ">
            <i class="bx bxs-cloud-download"></i>
            <span class="text">Download Report</span>
          </a>
        </div>

        <div v-if="activeSection === 'dashboard'" class="dashboard-overview">
          <ul class="box-info">
            <li>
              <i class="bx bxs-user"></i>
              <span class="text">
                <h3>1,245</h3>
                <p>Total Visitors Today</p>
              </span>
            </li>
            <li>
              <i class="bx bxs-map"></i>
              <span class="text">
                <h3>87%</h3>
                <p>Navigation Completion</p>
              </span>
            </li>
            <li>
              <i class="bx bxs-user-pin"></i>
              <span class="text">
                <h3>42</h3>
                <p>Active Now</p>
              </span>
            </li>
          </ul>

          <div class="table-data">
            <div class="order">
              <div class="head">
                <h3>Most Visited Areas</h3>
                <i class="bx bx-filter"></i>
              </div>
              <div class="chart-container">
                <canvas ref="visitedAreasChart"></canvas>
              </div>
            </div>
            <div class="order">
              <div class="head">
                <h3>User Activity</h3>
                <i class="bx bx-filter"></i>
              </div>
              <div class="chart-container">
                <canvas ref="userActivityChart"></canvas>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeSection === 'analytics'" class="analytics-section">
          <div class="analytics-header">
            <div class="filter-controls">
              <div class="date-range">
                <label>Date Range:</label>
                <select v-model="analyticsDateRange" class="date-select">
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                  <option value="quarter">This Quarter</option>
                  <option value="year">This Year</option>
                  <option value="custom">Custom Range</option>
                </select>
              </div>
              <button class="refresh-btn" @click="refreshAnalytics">
                <i class="bx bx-refresh"></i> Refresh Data
              </button>
            </div>
          </div>

          <div class="analytics-grid">
            <div class="analytics-card full-width">
              <div class="card-header">
                <h3>Visitor Traffic Over Time</h3>
                <div class="card-actions">
                  <select v-model="visitorChartType" class="chart-type-select">
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </div>
              </div>
              <div class="chart-container large">
                <canvas ref="visitorTrafficChart"></canvas>
              </div>
            </div>

            <div class="analytics-card">
              <div class="card-header">
                <h3>Most Visited Areas</h3>
                <div class="card-actions">
                  <button class="view-details-btn">View Details</button>
                </div>
              </div>
              <div class="chart-container">
                <canvas ref="visitedAreasPieChart"></canvas>
              </div>
            </div>

            <div class="analytics-card">
              <div class="card-header">
                <h3>Average Time Spent</h3>
                <div class="card-actions">
                  <button class="view-details-btn">View Details</button>
                </div>
              </div>
              <div class="chart-container">
                <canvas ref="timeSpentChart"></canvas>
              </div>
            </div>

            <div class="analytics-card">
              <div class="card-header">
                <h3>Visitor Demographics</h3>
                <div class="card-actions">
                  <button class="view-details-btn">View Details</button>
                </div>
              </div>
              <div class="chart-container">
                <canvas ref="demographicsChart"></canvas>
              </div>
            </div>

            <div class="analytics-card">
              <div class="card-header">
                <h3>Navigation Patterns</h3>
                <div class="card-actions">
                  <button class="view-details-btn">View Details</button>
                </div>
              </div>
              <div class="chart-container">
                <canvas ref="navigationPatternsChart"></canvas>
              </div>
            </div>
          </div>

          <div class="analytics-table">
            <div class="table-header">
              <h3>Detailed Visitor Data</h3>
              <div class="table-actions">
                <button class="export-btn">
                  <i class="bx bx-export"></i> Export
                </button>
                <div class="search-container">
                  <input
                    type="text"
                    placeholder="Search data..."
                    v-model="analyticsSearchQuery" />
                  <i class="bx bx-search"></i>
                </div>
              </div>
            </div>
            <div class="table-container">
              <table class="data-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Area</th>
                    <th>Visitors</th>
                    <th>Avg. Time</th>
                    <th>Completion Rate</th>
                    <th>Peak Time</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(item, index) in filteredAnalyticsData"
                    :key="index">
                    <td>{{ item.date }}</td>
                    <td>{{ item.area }}</td>
                    <td>{{ item.visitors }}</td>
                    <td>{{ item.avgTime }}</td>
                    <td>
                      <div class="progress-bar">
                        <div
                          class="progress"
                          :style="{ width: item.completionRate + '%' }"></div>
                      </div>
                      <span>{{ item.completionRate }}%</span>
                    </td>
                    <td>{{ item.peakTime }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div v-if="activeSection === 'map-management'" class="section-content">
          <div class="section-header">
            <button class="primary-btn">
              <i class="bx bx-plus"></i> Add New POI
            </button>
          </div>
          <div class="content-card">
            <div class="card-description">
              <p>
                Manage all points of interest on your farm map. Add, edit, or
                remove locations.
              </p>
            </div>
            <div class="map-container">
              <div class="map-preview">Map Preview Placeholder</div>
              <div class="map-controls">
                <button class="control-btn">
                  <i class="bx bx-zoom-in"></i>
                </button>
                <button class="control-btn">
                  <i class="bx bx-zoom-out"></i>
                </button>
                <button class="control-btn"><i class="bx bx-reset"></i></button>
              </div>
            </div>
            <div class="poi-container">
              <div class="poi-header">
                <h3>Points of Interest</h3>
                <div class="poi-actions">
                  <select class="poi-filter">
                    <option value="all">All Categories</option>
                    <option value="entrance">Entrances</option>
                    <option value="garden">Gardens</option>
                    <option value="facility">Facilities</option>
                  </select>
                  <input
                    type="text"
                    placeholder="Search POIs..."
                    class="poi-search" />
                </div>
              </div>
              <div class="poi-list">
                <div class="poi-item">
                  <div class="poi-icon"><i class="bx bx-door-open"></i></div>
                  <div class="poi-details">
                    <div class="poi-name">Main Entrance</div>
                    <div class="poi-category">Entrance</div>
                  </div>
                  <div class="poi-actions">
                    <button class="edit-btn"><i class="bx bx-edit"></i></button>
                    <button class="delete-btn">
                      <i class="bx bx-trash"></i>
                    </button>
                  </div>
                </div>
                <div class="poi-item">
                  <div class="poi-icon"><i class="bx bx-leaf"></i></div>
                  <div class="poi-details">
                    <div class="poi-name">Organic Vegetable Garden</div>
                    <div class="poi-category">Garden</div>
                  </div>
                  <div class="poi-actions">
                    <button class="edit-btn"><i class="bx bx-edit"></i></button>
                    <button class="delete-btn">
                      <i class="bx bx-trash"></i>
                    </button>
                  </div>
                </div>
                <div class="poi-item">
                  <div class="poi-icon"><i class="bx bx-store"></i></div>
                  <div class="poi-details">
                    <div class="poi-name">Farm Shop</div>
                    <div class="poi-category">Facility</div>
                  </div>
                  <div class="poi-actions">
                    <button class="edit-btn"><i class="bx bx-edit"></i></button>
                    <button class="delete-btn">
                      <i class="bx bx-trash"></i>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div v-if="activeSection === 'user-management'" class="section-content">
          <div class="section-header">
            <div class="header-actions">
              <button class="secondary-btn">
                <i class="bx bx-export"></i> Export Data
              </button>
              <button class="primary-btn">
                <i class="bx bx-user-plus"></i> Add User
              </button>
            </div>
          </div>
          <div class="content-card">
            <div class="user-filters">
              <div class="filter-group">
                <select class="filter-select">
                  <option value="all">All Roles</option>
                  <option value="admin">Admin</option>
                  <option value="editor">Editor</option>
                  <option value="viewer">Viewer</option>
                </select>
                <select class="filter-select">
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
              <div class="search-group">
                <input
                  type="text"
                  placeholder="Search users..."
                  class="search-input" />
                <button class="search-btn"><i class="bx bx-search"></i></button>
              </div>
            </div>
            <div class="table-container">
              <table class="users-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Last Active</th>
                    <th>Access Level</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>1001</td>
                    <td>
                      <div class="user-info">
                        <img
                          src="https://via.placeholder.com/32"
                          class="user-avatar" />
                        <span>John Smith</span>
                      </div>
                    </td>
                    <td>john@example.com</td>
                    <td>Today, 10:45</td>
                    <td><span class="badge admin">Admin</span></td>
                    <td>
                      <span class="status-indicator active"></span> Active
                    </td>
                    <td>
                      <div class="action-buttons">
                        <button class="icon-btn">
                          <i class="bx bx-edit"></i>
                        </button>
                        <button class="icon-btn">
                          <i class="bx bx-lock"></i>
                        </button>
                        <button class="icon-btn">
                          <i class="bx bx-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>1002</td>
                    <td>
                      <div class="user-info">
                        <img
                          src="https://via.placeholder.com/32"
                          class="user-avatar" />
                        <span>Sarah Johnson</span>
                      </div>
                    </td>
                    <td>sarah@example.com</td>
                    <td>Yesterday</td>
                    <td><span class="badge editor">Editor</span></td>
                    <td>
                      <span class="status-indicator active"></span> Active
                    </td>
                    <td>
                      <div class="action-buttons">
                        <button class="icon-btn">
                          <i class="bx bx-edit"></i>
                        </button>
                        <button class="icon-btn">
                          <i class="bx bx-lock"></i>
                        </button>
                        <button class="icon-btn">
                          <i class="bx bx-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>1003</td>
                    <td>
                      <div class="user-info">
                        <img
                          src="https://via.placeholder.com/32"
                          class="user-avatar" />
                        <span>Michael Brown</span>
                      </div>
                    </td>
                    <td>michael@example.com</td>
                    <td>2 days ago</td>
                    <td><span class="badge viewer">Viewer</span></td>
                    <td>
                      <span class="status-indicator inactive"></span> Inactive
                    </td>
                    <td>
                      <div class="action-buttons">
                        <button class="icon-btn">
                          <i class="bx bx-edit"></i>
                        </button>
                        <button class="icon-btn">
                          <i class="bx bx-lock"></i>
                        </button>
                        <button class="icon-btn">
                          <i class="bx bx-trash"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="pagination">
              <button class="pagination-btn" disabled>
                <i class="bx bx-chevron-left"></i>
              </button>
              <span class="pagination-info">Page 1 of 3</span>
              <button class="pagination-btn">
                <i class="bx bx-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>

        <div v-if="activeSection === 'feedback'" class="feedback-section">
          <div class="section-header">
            <div class="header-actions">
              <button class="secondary-btn">
                <i class="bx bx-export"></i> Export
              </button>
              <button class="primary-btn">
                <i class="bx bx-bar-chart-alt-2"></i> Analytics
              </button>
            </div>
          </div>

          <div class="stats-container">
            <div class="stat-card">
              <div class="stat-icon">
                <i class="bx bx-message-square-dots"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">{{ feedbackStats.total }}</div>
                <div class="stat-label">Total Feedback</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon unread"><i class="bx bx-envelope"></i></div>
              <div class="stat-content">
                <div class="stat-value">{{ feedbackStats.unread }}</div>
                <div class="stat-label">Unread</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon rating"><i class="bx bx-star"></i></div>
              <div class="stat-content">
                <div class="stat-value">{{ feedbackStats.avgRating }}/5</div>
                <div class="stat-label">Avg. Rating</div>
              </div>
            </div>
            <div class="stat-card">
              <div class="stat-icon resolved">
                <i class="bx bx-check-circle"></i>
              </div>
              <div class="stat-content">
                <div class="stat-value">85%</div>
                <div class="stat-label">Resolution Rate</div>
              </div>
            </div>
          </div>

          <div class="content-card">
            <div class="feedback-filters">
              <div class="filter-group">
                <select v-model="feedbackFilter" class="filter-select">
                  <option value="all">All Feedback</option>
                  <option value="unread">Unread Only</option>
                  <option value="reports">Reports Only</option>
                  <option value="high-priority">High Priority</option>
                </select>
                <select class="filter-select">
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                </select>
              </div>
              <div class="search-group">
                <input
                  type="text"
                  placeholder="Search feedback..."
                  class="search-input" />
                <button class="filter-btn" @click="applyFilters">
                  <i class="bx bx-filter-alt"></i> Filter
                </button>
              </div>
            </div>

            <div class="feedback-list">
              <div
                class="feedback-item"
                v-for="(item, index) in filteredFeedback"
                :key="index"
                :class="{ unread: !item.read, report: item.type === 'report' }">
                <div class="feedback-meta">
                  <div class="user-info">
                    <img
                      :src="
                        item.user.avatar || 'https://via.placeholder.com/40'
                      "
                      class="user-avatar" />
                    <div class="user-details">
                      <span class="user-name">{{ item.user.name }}</span>
                      <span class="feedback-date">{{
                        formatDate(item.date)
                      }}</span>
                    </div>
                  </div>
                  <div class="feedback-indicators">
                    <div class="feedback-rating" v-if="item.rating">
                      <i
                        class="bx bxs-star"
                        v-for="star in 5"
                        :key="star"
                        :class="{ active: star <= item.rating }"></i>
                    </div>
                    <span class="feedback-type" :class="item.type">{{
                      item.type
                    }}</span>
                  </div>
                </div>
                <div class="feedback-content">
                  <h4 class="feedback-title">{{ item.title }}</h4>
                  <p class="feedback-message">{{ item.message }}</p>
                  <div class="feedback-actions">
                    <button
                      class="action-btn reply"
                      @click="replyToFeedback(item)">
                      <i class="bx bx-reply"></i> Reply
                    </button>
                    <button
                      class="action-btn resolve"
                      @click="markAsResolved(item)">
                      <i class="bx bx-check"></i> Resolve
                    </button>
                    <button
                      class="action-btn delete"
                      @click="deleteFeedback(item)">
                      <i class="bx bx-trash"></i> Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div class="pagination">
              <button
                class="pagination-btn"
                :disabled="currentPage === 1"
                @click="prevPage">
                <i class="bx bx-chevron-left"></i>
              </button>
              <span class="pagination-info"
                >Page {{ currentPage }} of {{ totalPages }}</span
              >
              <button
                class="pagination-btn"
                :disabled="currentPage === totalPages"
                @click="nextPage">
                <i class="bx bx-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>
      </main>
    </section>

    <div v-if="showReplyModal" class="modal-overlay">
      <div class="feedback-modal">
        <div class="modal-header">
          <h3>Reply to Feedback</h3>
          <button class="close-modal" @click="showReplyModal = false">
            <i class="bx bx-x"></i>
          </button>
        </div>
        <div class="modal-body">
          <div class="original-feedback">
            <p><strong>From:</strong> {{ selectedFeedback.user.name }}</p>
            <p><strong>Message:</strong> {{ selectedFeedback.message }}</p>
          </div>
          <textarea
            v-model="replyMessage"
            placeholder="Type your reply here..."
            class="reply-textarea"></textarea>
        </div>
        <div class="modal-footer">
          <button class="cancel-btn" @click="showReplyModal = false">
            Cancel
          </button>
          <button class="send-btn" @click="sendReply">Send Reply</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Chart from "chart.js/auto";

export default {
  name: "AdminDashboard",
  data() {
    return {
      activeSection: "dashboard",
      sidebarOpen: true,
      feedbackStats: {
        total: 24,
        unread: 8,
        avgRating: 4.2,
      },
      feedbackFilter: "all",
      currentPage: 1,
      totalPages: 3,
      showReplyModal: false,
      replyMessage: "",
      selectedFeedback: {},
      filteredFeedback: [],

      analyticsDateRange: "month",
      visitorChartType: "daily",
      analyticsSearchQuery: "",
      charts: {
        visitedAreas: null,
        userActivity: null,
        visitorTraffic: null,
        visitedAreasPie: null,
        timeSpent: null,
        demographics: null,
        navigationPatterns: null,
      },

      visitedAreasData: [
        { area: "Organic Garden", visitors: 450 },
        { area: "Main Entrance", visitors: 380 },
        { area: "Farm Shop", visitors: 320 },
        { area: "Livestock Area", visitors: 280 },
        { area: "Orchard", visitors: 240 },
      ],

      userActivityData: {
        labels: ["8AM", "10AM", "12PM", "2PM", "4PM", "6PM"],
        datasets: [
          {
            label: "Active Users",
            data: [15, 28, 42, 37, 25, 18],
            borderColor: "#4CAF50",
            backgroundColor: "rgba(76, 175, 80, 0.2)",
            tension: 0.4,
            fill: true,
          },
        ],
      },

      visitorTrafficData: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
        datasets: [
          {
            label: "This Week",
            data: [120, 145, 132, 178, 190, 210, 185],
            borderColor: "#2196F3",
            backgroundColor: "rgba(33, 150, 243, 0.2)",
            tension: 0.4,
          },
          {
            label: "Last Week",
            data: [110, 135, 126, 165, 178, 195, 172],
            borderColor: "#9E9E9E",
            backgroundColor: "rgba(158, 158, 158, 0.2)",
            tension: 0.4,
          },
        ],
      },

      timeSpentData: {
        labels: ["0-5 min", "5-15 min", "15-30 min", "30-60 min", "60+ min"],
        datasets: [
          {
            label: "Visitors",
            data: [120, 250, 380, 210, 90],
            backgroundColor: [
              "rgba(255, 99, 132, 0.7)",
              "rgba(54, 162, 235, 0.7)",
              "rgba(255, 206, 86, 0.7)",
              "rgba(75, 192, 192, 0.7)",
              "rgba(153, 102, 255, 0.7)",
            ],
            borderWidth: 1,
          },
        ],
      },

      demographicsData: {
        labels: ["18-24", "25-34", "35-44", "45-54", "55-64", "65+"],
        datasets: [
          {
            label: "Age Groups",
            data: [15, 30, 25, 18, 8, 4],
            backgroundColor: [
              "rgba(255, 99, 132, 0.7)",
              "rgba(54, 162, 235, 0.7)",
              "rgba(255, 206, 86, 0.7)",
              "rgba(75, 192, 192, 0.7)",
              "rgba(153, 102, 255, 0.7)",
              "rgba(255, 159, 64, 0.7)",
            ],
            borderWidth: 1,
          },
        ],
      },

      analyticsTableData: [
        {
          date: "2023-05-01",
          area: "Organic Garden",
          visitors: 145,
          avgTime: "22m",
          completionRate: 92,
          peakTime: "2:30 PM",
        },
        {
          date: "2023-05-01",
          area: "Main Entrance",
          visitors: 380,
          avgTime: "5m",
          completionRate: 98,
          peakTime: "10:15 AM",
        },
        {
          date: "2023-05-01",
          area: "Farm Shop",
          visitors: 98,
          avgTime: "18m",
          completionRate: 85,
          peakTime: "3:45 PM",
        },
        {
          date: "2023-05-01",
          area: "Livestock Area",
          visitors: 76,
          avgTime: "28m",
          completionRate: 78,
          peakTime: "1:20 PM",
        },
        {
          date: "2023-05-01",
          area: "Orchard",
          visitors: 65,
          avgTime: "25m",
          completionRate: 82,
          peakTime: "11:30 AM",
        },
        {
          date: "2023-05-02",
          area: "Organic Garden",
          visitors: 132,
          avgTime: "24m",
          completionRate: 90,
          peakTime: "2:15 PM",
        },
        {
          date: "2023-05-02",
          area: "Main Entrance",
          visitors: 365,
          avgTime: "6m",
          completionRate: 97,
          peakTime: "10:30 AM",
        },
        {
          date: "2023-05-02",
          area: "Farm Shop",
          visitors: 105,
          avgTime: "20m",
          completionRate: 88,
          peakTime: "4:00 PM",
        },
      ],

      // Dark mode control
      darkMode: false,
      isSidebarHidden: false,
      isSearchFormShown: false,
      activeMenuItem: null,
    };
  },
  computed: {
    getPageTitle() {
      const titles = {
        dashboard: "Dashboard Overview",
        "map-management": "Map Management",
        "user-management": "User Management",
        feedback: "Feedback & Reports",
        analytics: "Visitor Analytics",
      };
      return titles[this.activeSection] || "Admin Panel";
    },
    filteredAnalyticsData() {
      if (!this.analyticsSearchQuery) {
        return this.analyticsTableData;
      }

      const query = this.analyticsSearchQuery.toLowerCase();
      return this.analyticsTableData.filter((item) => {
        return (
          item.area.toLowerCase().includes(query) ||
          item.date.includes(query) ||
          item.visitors.toString().includes(query)
        );
      });
    },
  },
  methods: {
    toggleSidebar() {
      this.isSidebarHidden = !this.isSidebarHidden;
      this.sidebarOpen = !this.sidebarOpen;
      const sidebar = document.getElementById("sidebar");
      const content = document.getElementById("content");

      if (this.sidebarOpen) {
        sidebar.classList.remove("close");
        content.classList.remove("close");
      } else {
        sidebar.classList.add("close");
        content.classList.add("close");
      }
    },

    handleMenuItemClick(item) {
      this.activeMenuItem = item;
    },

    toggleSearchForm() {
      if (window.innerWidth < 576) {
        this.isSearchFormShown = !this.isSearchFormShown;
      }
    },

    handleResize() {
      if (window.innerWidth > 576) {
        this.isSearchFormShown = false;
      }

      if (window.innerWidth < 768) {
        this.isSidebarHidden = true;
      }
    },

    toggleDarkMode() {
      if (this.darkMode) {
        document.body.classList.add("dark");
        // Additional dark mode initialization if needed
      } else {
        document.body.classList.remove("dark");
        // Additional light mode initialization if needed
      }
    },

    replyToFeedback(item) {
      this.selectedFeedback = item;
      this.showReplyModal = true;
    },

    markAsResolved(item) {
      // Implementation for marking feedback as resolved
    },

    deleteFeedback(item) {
      // Implementation for deleting feedback
    },

    sendReply() {
      this.showReplyModal = false;
    },

    applyFilters() {
      // Implementation for applying feedback filters
    },

    prevPage() {
      if (this.currentPage > 1) this.currentPage--;
    },

    nextPage() {
      if (this.currentPage < this.totalPages) this.currentPage++;
    },

    formatDate(date) {
      return date;
    },

    refreshAnalytics() {
      this.$nextTick(() => {
        this.initCharts();
      });
    },

    initCharts() {
      this.initVisitedAreasChart();
      this.initUserActivityChart();

      if (this.activeSection === "analytics") {
        this.initVisitorTrafficChart();
        this.initVisitedAreasPieChart();
        this.initTimeSpentChart();
        this.initDemographicsChart();
        this.initNavigationPatternsChart();
      }
    },

    initVisitedAreasChart() {
      const ctx = this.$refs.visitedAreasChart?.getContext("2d");
      if (!ctx) return;

      if (this.charts.visitedAreas) {
        this.charts.visitedAreas.destroy();
      }

      const labels = this.visitedAreasData.map((item) => item.area);
      const data = this.visitedAreasData.map((item) => item.visitors);

      this.charts.visitedAreas = new Chart(ctx, {
        type: "bar",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Number of Visitors",
              data: data,
              backgroundColor: [
                "rgba(75, 192, 192, 0.7)",
                "rgba(54, 162, 235, 0.7)",
                "rgba(255, 206, 86, 0.7)",
                "rgba(255, 99, 132, 0.7)",
                "rgba(153, 102, 255, 0.7)",
              ],
              borderColor: [
                "rgba(75, 192, 192, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(255, 99, 132, 1)",
                "rgba(153, 102, 255, 1)",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    },

    initUserActivityChart() {
      const ctx = this.$refs.userActivityChart?.getContext("2d");
      if (!ctx) return;

      if (this.charts.userActivity) {
        this.charts.userActivity.destroy();
      }

      this.charts.userActivity = new Chart(ctx, {
        type: "line",
        data: this.userActivityData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    },

    initVisitorTrafficChart() {
      const ctx = this.$refs.visitorTrafficChart?.getContext("2d");
      if (!ctx) return;

      if (this.charts.visitorTraffic) {
        this.charts.visitorTraffic.destroy();
      }

      this.charts.visitorTraffic = new Chart(ctx, {
        type: "line",
        data: this.visitorTrafficData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    },

    initVisitedAreasPieChart() {
      const ctx = this.$refs.visitedAreasPieChart?.getContext("2d");
      if (!ctx) return;

      if (this.charts.visitedAreasPie) {
        this.charts.visitedAreasPie.destroy();
      }

      const labels = this.visitedAreasData.map((item) => item.area);
      const data = this.visitedAreasData.map((item) => item.visitors);

      this.charts.visitedAreasPie = new Chart(ctx, {
        type: "pie",
        data: {
          labels: labels,
          datasets: [
            {
              label: "Number of Visitors",
              data: data,
              backgroundColor: [
                "rgba(75, 192, 192, 0.7)",
                "rgba(54, 162, 235, 0.7)",
                "rgba(255, 206, 86, 0.7)",
                "rgba(255, 99, 132, 0.7)",
                "rgba(153, 102, 255, 0.7)",
              ],
              borderColor: [
                "rgba(75, 192, 192, 1)",
                "rgba(54, 162, 235, 1)",
                "rgba(255, 206, 86, 1)",
                "rgba(255, 99, 132, 1)",
                "rgba(153, 102, 255, 1)",
              ],
              borderWidth: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
            },
          },
        },
      });
    },

    initTimeSpentChart() {
      const ctx = this.$refs.timeSpentChart?.getContext("2d");
      if (!ctx) return;

      if (this.charts.timeSpent) {
        this.charts.timeSpent.destroy();
      }

      this.charts.timeSpent = new Chart(ctx, {
        type: "bar",
        data: this.timeSpentData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              beginAtZero: true,
            },
          },
        },
      });
    },

    initDemographicsChart() {
      const ctx = this.$refs.demographicsChart?.getContext("2d");
      if (!ctx) return;

      if (this.charts.demographics) {
        this.charts.demographics.destroy();
      }

      this.charts.demographics = new Chart(ctx, {
        type: "doughnut",
        data: this.demographicsData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: "right",
            },
          },
        },
      });
    },

    initNavigationPatternsChart() {
      const ctx = this.$refs.navigationPatternsChart?.getContext("2d");
      if (!ctx) return;

      if (this.charts.navigationPatterns) {
        this.charts.navigationPatterns.destroy();
      }

      const data = {
        labels: [
          "Garden → Shop",
          "Entrance → Garden",
          "Shop → Livestock",
          "Livestock → Orchard",
          "Orchard → Exit",
        ],
        datasets: [
          {
            label: "Common Navigation Paths",
            data: [320, 280, 190, 150, 210],
            backgroundColor: "rgba(75, 192, 192, 0.7)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1,
          },
        ],
      };

      this.charts.navigationPatterns = new Chart(ctx, {
        type: "bar",
        data: data,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          indexAxis: "y",
          scales: {
            x: {
              beginAtZero: true,
            },
          },
        },
      });
    },
  },
  mounted() {
    // Initialize responsive behavior
    this.handleResize();

    // Add event listeners
    window.addEventListener("resize", this.handleResize);

    // Initialize charts
    this.$nextTick(() => {
      this.initCharts();
    });

    // Set initial active menu item if needed
    this.activeMenuItem = "dashboard";

    // Initialize dark mode if previously set
    if (this.darkMode) {
      document.body.classList.add("dark");
    }
  },
  beforeDestroy() {
    // Clean up event listeners
    window.removeEventListener("resize", this.handleResize);

    // Destroy all charts
    Object.values(this.charts).forEach((chart) => {
      if (chart) chart.destroy();
    });
  },
  watch: {
    darkMode(newVal) {
      this.toggleDarkMode();
    },
    activeSection(newVal) {
      if (newVal === "analytics" || newVal === "dashboard") {
        this.$nextTick(() => {
          this.initCharts();
        });
      }
    },
  },
};
</script>

<style scoped>
/* @import '@/assets/styles/globalstyle.css'; */
@import "@/assets/styles/allstyle.css";
</style>
