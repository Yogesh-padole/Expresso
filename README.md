# Expresso

Expresso is a modern social expression platform that allows users to share thoughts, stories, and experiences in a safe and engaging environment. The platform supports anonymous posting, community interaction, profile management, content moderation, and administrative controls.

## 🚀 Features

### 👤 User Features

* User Authentication using Firebase Auth
* Create and manage personal profiles
* Create, edit, and delete posts
* Like and comment on posts
* Save/bookmark favorite posts
* Share posts with others
* Anonymous posting support
* Responsive and modern user interface

### 📖 Community Features

* Community feed
* Trending and latest posts
* User engagement through likes and comments
* Profile statistics
* Interactive post detail pages

### 🛡️ Moderation & Safety

* Report inappropriate content
* Admin review and report management
* Content moderation tools
* User activity monitoring

### ⚙️ Admin Panel

* Dashboard overview
* User management
* Post management
* Reports management
* Platform analytics and monitoring

---

## 🛠️ Tech Stack

### Frontend

* React.js (Vite)
* JavaScript (ES6+)
* Tailwind CSS
* Lucide React Icons

### Backend & Database

* Firebase Firestore
* Firebase Authentication
* Firebase Storage

### Development Tools

* Git & GitHub
* VS Code

---

## 📂 Project Structure

```text
src/
├── admin/
│   ├── pages/
│   └── components/
├── components/
├── pages/
├── services/
├── firebase/
├── hooks/
└── assets/
```

---

## 🔐 Authentication

Expresso uses Firebase Authentication for secure user login and account management.

Supported features:

* User Registration
* User Login
* Secure Authentication
* Session Management

---

## 📊 Core Modules

### User Module

* Profile Management
* User Statistics
* Saved Posts
* Activity Tracking

### Post Module

* Create Posts
* Edit Posts
* Delete Posts
* Like Posts
* Comment System
* Share Functionality

### Report Module

* Report Content
* Report Review Workflow
* Admin Resolution System

### Admin Module

* Dashboard
* Reports Management
* User Monitoring
* Content Management

---

## 💻 Installation

### Clone Repository

```bash
git clone https://github.com/Yogesh-padole/Expresso.git
```

### Navigate to Project

```bash
cd Expresso
```

### Install Dependencies

```bash
npm install
```

### Start Development Server

```bash
npm run dev
```

---

## 🌐 Environment Setup

Create a `.env` file and configure Firebase credentials:

```env
VITE_FIREBASE_API_KEY=YOUR_API_KEY
VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

---

## 👨‍💻 Contributors

* Yogesh Padole
* Mohit Ingale
* Harsh Gandhi

---

## 📌 Future Enhancements

* Real-time notifications
* Chat system
* AI-powered content moderation
