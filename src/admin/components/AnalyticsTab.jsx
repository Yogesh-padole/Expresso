"use client";

import { useState, useEffect } from "react";
import {
  Users,
  FileText,
  AlertTriangle,
  Star,
  TrendingUp,
  Activity,
  BarChart3,
  PieChart,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  PieChart as RechartsPieChart,
  Pie, // ✅ needed
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import "../../index.css";
import {
  subscribeToPendingReportSize,
  subscribeToSize,
} from "../utils/firestoreHelpers";

const LoadingSpinner = ({ size = "medium", className = "" }) => {
  return (
    <div className={`loading-spinner ${className}`}>
      <div className={`spinner ${size}`} />
    </div>
  );
};

const MetricCard = ({
  title,
  value,
  icon: Icon,
  trend,
  isLoading = false,
  color = "blue",
}) => {
  const formatValue = (val) => {
    if (typeof val === "number") {
      if (val >= 1000000) {
        return `${(val / 1000000).toFixed(1)}M`;
      } else if (val >= 1000) {
        return `${(val / 1000).toFixed(1)}K`;
      }
      return val.toLocaleString();
    }
    return val;
  };

  const getTrendClass = () => {
    if (trend > 0) return "positive";
    if (trend < 0) return "negative";
    return "neutral";
  };

  return (
    <div className="analytics-card metric-card">
      <div className="metric-header">
        <div className="metric-content">
          <p className="metric-title">{title}</p>
          {isLoading ? (
            <div
              style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}
            >
              <LoadingSpinner size="small" />
              <div
                className="loading-skeleton"
                style={{ height: "2rem", width: "5rem" }}
              />
            </div>
          ) : (
            <>
              <p className="metric-value">{formatValue(value)}</p>
              {trend !== undefined && (
                <div className={`metric-trend ${getTrendClass()}`}>
                  {trend > 0 ? (
                    <ArrowUpRight size={16} />
                  ) : trend < 0 ? (
                    <ArrowDownRight size={16} />
                  ) : null}
                  <span>
                    {trend > 0 ? "+" : ""}
                    {trend}% vs last month
                  </span>
                </div>
              )}
            </>
          )}
        </div>

        <div className={`metric-icon ${color}`}>
          <Icon size={24} />
        </div>
      </div>
    </div>
  );
};

const ChartComponent = ({
  type,
  data,
  title,
  isLoading = false,
  height = 300,
}) => {
  if (isLoading) {
    return (
      <div className="analytics-card">
        <div className="chart-header">
          <h3 className="chart-title">{title}</h3>
          <div
            className="loading-skeleton"
            style={{ width: "1rem", height: "1rem" }}
          />
        </div>
        <div className="chart-loading" style={{ height: `${height}px` }}>
          <LoadingSpinner size="large" />
          <p className="chart-loading-text">Loading chart data...</p>
        </div>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="custom-tooltip">
          <p className="tooltip-label">{label}</p>
          {payload.map((entry, index) => (
            <p
              key={index}
              className="tooltip-item"
              style={{ color: entry.color }}
            >
              {entry.name}: {entry.value?.toLocaleString()}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <LineChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="lineGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.1} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#3B82F6", strokeWidth: 2 }}
                fill="url(#lineGradient)"
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case "pie":
        const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];
        return (
          <ResponsiveContainer width="100%" height={height}>
            <RechartsPieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={2}
                dataKey="value"
              >
                {data?.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ paddingTop: "20px" }} iconType="circle" />
            </RechartsPieChart>
          </ResponsiveContainer>
        );

      case "bar":
        return (
          <ResponsiveContainer width="100%" height={height}>
            <BarChart
              data={data}
              margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.6} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis
                dataKey="name"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#64748b", fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey="value"
                fill="url(#barGradient)"
                radius={[6, 6, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        );

      default:
        return (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              color: "#6b7280",
            }}
          >
            Chart type not supported
          </div>
        );
    }
  };

  return (
    <div className="analytics-card chart-container">
      <div className="chart-header">
        <h3 className="chart-title">{title}</h3>
        <div className="chart-status" />
      </div>
      {renderChart()}
    </div>
  );
};

const RecentActivity = ({ activities, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="activity-container">
        <div className="activity-header">
          <h3 className="activity-title">Recent Activity</h3>
          <Clock size={20} style={{ color: "#9ca3af" }} />
        </div>
        <div className="activity-list">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="activity-item">
              <div
                className="loading-skeleton"
                style={{
                  width: "0.5rem",
                  height: "0.5rem",
                  borderRadius: "50%",
                  marginTop: "0.5rem",
                }}
              />
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <div className="loading-skeleton" style={{ height: "1rem" }} />
                <div
                  className="loading-skeleton"
                  style={{ height: "0.75rem", width: "33%" }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="activity-container">
      <div className="activity-header">
        <h3 className="activity-title">Recent Activity</h3>
        <Clock size={20} style={{ color: "#9ca3af" }} />
      </div>

      <div className="activity-list">
        {activities?.map((activity, index) => (
          <div key={index} className="activity-item">
            <div style={{ position: "relative" }}>
              <div className="activity-dot" />
              {index < activities.length - 1 && (
                <div className="activity-line" />
              )}
            </div>
            <div className="activity-content">
              <p className="activity-text">{activity.action}</p>
              <p className="activity-time">{activity.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const AnalyticsTab = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [metrics, setMetrics] = useState({});
  const [chartData, setChartData] = useState({});
  const [recentActivity, setRecentActivity] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [totalPendingReports, setTotalPendingReports] = useState(0);

  //For Dynamic
  //   useEffect(() => {
  //     const fetchAnalyticsData = async () => {
  //       try {
  //         setIsLoading(true);

  //         // ---- USERS ----
  //         const usersSnap = await getDocs(collection(db, "users"));
  //         const totalUsers = usersSnap.size;

  //         // ---- POSTS ----
  //         const postsSnap = await getDocs(collection(db, "posts"));
  //         const totalPosts = postsSnap.size;

  //         // ---- REPORTS ----
  //         const reportsSnap = await getDocs(collection(db, "reports"));
  //         const reportsData = reportsSnap.docs.map((doc) => doc.data());
  //         const pendingReports = reportsData.filter(
  //           (r) => r.status === "pending"
  //         ).length;

  //         // ---- AVERAGE RATING (example field in users) ----
  //         const ratings = reportsData.map((r) => r.rating).filter(Boolean);
  //         const avgRating =
  //           ratings.length > 0
  //             ? ratings.reduce((a, b) => a + b, 0) / ratings.length
  //             : 0;

  //         // ---- CHART DATA (you can structure however you want) ----
  //         const userGrowth = usersSnap.docs.map((doc) => ({
  //           name: doc.data().month,
  //           value: doc.data().count,
  //         }));

  //         const reportsStatus = [
  //           {
  //             name: "Resolved",
  //             value: reportsData.filter((r) => r.status === "resolved").length,
  //           },
  //           {
  //             name: "Pending",
  //             value: reportsData.filter((r) => r.status === "pending").length,
  //           },
  //           {
  //             name: "In Review",
  //             value: reportsData.filter((r) => r.status === "review").length,
  //           },
  //           {
  //             name: "Dismissed",
  //             value: reportsData.filter((r) => r.status === "dismissed").length,
  //           },
  //         ];

  //         // Example engagement doc
  //         const engagementSnap = await getDocs(collection(db, "engagement"));
  //         const engagementData =
  //           engagementSnap.docs.map((doc) => doc.data())[0] || {};
  //         const engagement = [
  //           { name: "Likes", value: engagementData.likes || 0 },
  //           { name: "Shares", value: engagementData.shares || 0 },
  //           { name: "Bookmarks", value: engagementData.bookmarks || 0 },
  //           { name: "Comments", value: engagementData.comments || 0 },
  //         ];

  //         // ---- ACTIVITY LOG ----
  //         const activitySnap = await getDocs(collection(db, "activity"));
  //         const recentActivity = activitySnap.docs.map((doc) => doc.data());

  //         // ---- SET STATE ----
  //         setMetrics({ totalUsers, totalPosts, pendingReports, avgRating });
  //         setChartData({ userGrowth, reportsStatus, engagement });
  //         setRecentActivity(recentActivity);
  //       } catch (error) {
  //         console.error("Error fetching analytics data:", error);
  //       } finally {
  //         setIsLoading(false);
  //       }
  //     };

  //     fetchAnalyticsData();
  //   }, []);

  useEffect(() => {
    const unsubUsers = subscribeToSize("users", (size) =>
      setTotalUsers(size || 2847),
    );

    const unsubPosts = subscribeToSize("posts", (size) =>
      setTotalPosts(size || 1256),
    );

    const unsubReports = subscribeToPendingReportSize("reports", (size) =>
      setTotalPendingReports(size),
    );

    // Cleanup listeners on unmount
    return () => {
      unsubUsers();
      unsubPosts();
      unsubReports();
    };
  }, []);

  //For Static
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);

        // Simulate loading time (remove when using Firebase)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // STATIC METRICS DATA - Replace with Firebase
        const staticMetrics = {
          // totalUsers: totalUsers || 2847,
          // totalPosts: totalPosts || 1256,
          pendingReports: 23,
          avgRating: 4.7,
        };

        // STATIC CHART DATA - Replace with Firebase
        const staticChartData = {
          userGrowth: [
            { name: "Jan", value: 1200 },
            { name: "Feb", value: 1890 },
            { name: "Mar", value: 2390 },
            { name: "Apr", value: 2490 },
            { name: "May", value: 2690 },
            { name: "Jun", value: 2847 },
          ],
          reportsStatus: [
            { name: "Resolved", value: 45 },
            { name: "Pending", value: 23 },
            { name: "In Review", value: 12 },
            { name: "Dismissed", value: 8 },
          ],
          postsVsComments: [
            { name: "Posts", value: 1256 },
            { name: "Comments", value: 3429 },
            { name: "Replies", value: 1876 },
          ],
          engagement: [
            { name: "Likes", value: 12540 },
            { name: "Shares", value: 3210 },
            { name: "Bookmarks", value: 1890 },
            { name: "Comments", value: 3429 },
          ],
        };

        // STATIC ACTIVITY DATA - Replace with Firebase
        const staticActivity = [
          { action: "New user registration", time: "2 minutes ago" },
          { action: "Post reported for review", time: "5 minutes ago" },
          { action: "Comment flagged as spam", time: "12 minutes ago" },
          { action: "User profile updated", time: "18 minutes ago" },
          { action: "New feedback received", time: "25 minutes ago" },
        ];

        setMetrics(staticMetrics);
        setChartData(staticChartData);
        setRecentActivity(staticActivity);
      } catch (error) {
        console.error("Error fetching analytics data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, []);

  return (
    <div className="admin-app">
      <div className="analytics-dashboard">
        <div className="analytics-container">
          {/* <div className="analytics-header">
          <h1 className="analytics-title">Analytics Dashboard</h1>
          <p className="analytics-subtitle">
            Monitor your platform's performance and user engagement with
            real-time insights
          </p>
        </div> */}

          <div className="metrics-grid">
            <MetricCard
              title="Total Users"
              value={totalUsers}
              icon={Users}
              trend={12.5}
              isLoading={isLoading}
              color="blue"
            />
            <MetricCard
              title="Total Posts"
              value={totalPosts}
              icon={FileText}
              trend={8.2}
              isLoading={isLoading}
              color="green"
            />
            <MetricCard
              title="Pending Reports"
              value={totalPendingReports}
              icon={AlertTriangle}
              trend={-15.3}
              isLoading={isLoading}
              color="orange"
            />
            <MetricCard
              title="Avg Rating"
              value={metrics.avgRating}
              icon={Star}
              trend={2.1}
              isLoading={isLoading}
              color="purple"
            />
          </div>

          <div className="charts-grid">
            <ChartComponent
              type="line"
              data={chartData.userGrowth}
              title="User Growth Over Time"
              isLoading={isLoading}
              height={320}
            />
            <ChartComponent
              type="pie"
              data={chartData.reportsStatus}
              title="Reports Status Breakdown"
              isLoading={isLoading}
              height={320}
            />
          </div>

          <div className="charts-grid">
            <ChartComponent
              type="bar"
              data={chartData.postsVsComments}
              title="Content Distribution"
              isLoading={isLoading}
              height={320}
            />
            <ChartComponent
              type="bar"
              data={chartData.engagement}
              title="User Engagement Metrics"
              isLoading={isLoading}
              height={320}
            />
          </div>

          <div className="activity-grid">
            <RecentActivity activities={recentActivity} isLoading={isLoading} />

            <div className="performance-overview">
              <div className="performance-header">
                <h3 className="performance-title">Performance Overview</h3>
                <div className="performance-indicators">
                  <div className="performance-dot green" />
                  <div className="performance-dot blue" />
                  <div className="performance-dot purple" />
                </div>
              </div>

              <div className="performance-stats">
                <div className="performance-stat">
                  <div className="performance-stat-icon blue">
                    <Activity size={24} style={{ color: "white" }} />
                  </div>
                  <p className="performance-stat-value">89%</p>
                  <p className="performance-stat-label">Active Users</p>
                </div>

                <div className="performance-stat">
                  <div className="performance-stat-icon green">
                    <BarChart3 size={24} style={{ color: "white" }} />
                  </div>
                  <p className="performance-stat-value">127</p>
                  <p className="performance-stat-label">Daily Posts</p>
                </div>

                <div className="performance-stat">
                  <div className="performance-stat-icon purple">
                    <PieChart size={24} style={{ color: "white" }} />
                  </div>
                  <p className="performance-stat-value">94%</p>
                  <p className="performance-stat-label">Satisfaction</p>
                </div>

                <div className="performance-stat">
                  <div className="performance-stat-icon orange">
                    <TrendingUp size={24} style={{ color: "white" }} />
                  </div>
                  <p className="performance-stat-value">+23%</p>
                  <p className="performance-stat-label">Growth Rate</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnalyticsTab;
