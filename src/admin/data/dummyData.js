// Dummy Data Arrays - TODO: Replace with Firebase collections
export const dummyUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john.doe@example.com",
    username: "johndoe",
    status: "Active",
    role: "Admin",
    joinedDate: "2024-01-15",
    lastActive: "2024-09-23",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=40&h=40&fit=crop&crop=face",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane.smith@example.com",
    username: "janesmith",
    status: "Active",
    role: "User",
    joinedDate: "2024-02-20",
    lastActive: "2024-09-22",
    avatar:
      "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=40&h=40&fit=crop&crop=face",
  },
  {
    id: 3,
    name: "Mike Johnson",
    email: "mike.johnson@example.com",
    username: "mikej",
    status: "Suspended",
    role: "User",
    joinedDate: "2024-03-10",
    lastActive: "2024-09-20",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=40&h=40&fit=crop&crop=face",
  },
  {
    id: 4,
    name: "Sarah Wilson",
    email: "sarah.wilson@example.com",
    username: "sarahw",
    status: "Inactive",
    role: "Moderator",
    joinedDate: "2024-01-05",
    lastActive: "2024-09-15",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=40&h=40&fit=crop&crop=face",
  },
  {
    id: 5,
    name: "Robert Brown",
    email: "robert.brown@example.com",
    username: "robbrown",
    status: "Banned",
    role: "User",
    joinedDate: "2024-04-12",
    lastActive: "2024-08-30",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=40&h=40&fit=crop&crop=face",
  },
];

export const dummyReports = [
  {
    id: "RPT-001",
    user: "John Doe",
    description: "Inappropriate content reported in post #123",
    status: "Pending",
    date: "2024-09-23",
    priority: "High",
  },
  {
    id: "RPT-002",
    user: "Jane Smith",
    description: "Spam messages in chat",
    status: "Completed",
    date: "2024-09-22",
    priority: "Medium",
  },
  {
    id: "RPT-003",
    user: "Mike Johnson",
    description: "User harassment complaint",
    status: "Pending",
    date: "2024-09-21",
    priority: "High",
  },
  {
    id: "RPT-004",
    user: "Sarah Wilson",
    description: "Copyright violation report",
    status: "Completed",
    date: "2024-09-20",
    priority: "Low",
  },
];

export const dummyNotifications = [
  {
    id: 1,
    message: "New user registration: Alice Cooper",
    timestamp: "2024-09-23 14:30",
    type: "info",
  },
  {
    id: 2,
    message: "System maintenance scheduled for tonight",
    timestamp: "2024-09-23 12:15",
    type: "warning",
  },
  {
    id: 3,
    message: "High priority report submitted",
    timestamp: "2024-09-23 10:45",
    type: "alert",
  },
  {
    id: 4,
    message: "Monthly backup completed successfully",
    timestamp: "2024-09-23 09:20",
    type: "success",
  },
  {
    id: 5,
    message: "User limit reached: 95% capacity",
    timestamp: "2024-09-23 08:00",
    type: "warning",
  },
];
