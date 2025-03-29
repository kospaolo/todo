# ✅ Full-Stack Todo App

A full-featured Todo app with user authentication, filters, drag & drop reordering, profile management, and MongoDB persistence. Built with **Angular**, **Node.js**, **Express**, and **MongoDB**.

---

## 🧱 Tech Stack

### 🔹 Frontend
- Angular 19+
- Angular Signals & Standalone Components
- Drag & Drop with `@angular/cdk`
- SCSS Styling & Responsive Design

### 🔹 Backend
- Node.js + Express
- MongoDB with Mongoose
- JWT Authentication (access tokens)
- Bcrypt Password Hashing

---

## ✨ Features

- 🔐 Register & Login with JWT
- ✅ Add, edit, delete todos
- 📅 Due date & overdue highlighting
- 📥 Drag & drop to reorder tasks
- 🔍 Filter by status or due date
- 👤 Profile page (change username, password, delete account)
- 🧠 Smart UI with feedback & animations
- 📱 Responsive on all devices

---

## 🚀 Getting Started

### 🔧 Backend Setup

```bash
cd server
npm install
```

Create `.env` file:

```
MONGODB_URI=your_mongo_connection_string
JWT_SECRET=your_secret
```

Start the backend:

```bash
node index.js
```

---

### 🖥️ Frontend Setup

```bash
cd client
npm install
ng serve
```

## 🙋‍♂️ Author

Made with ❤️ by [Paolo Kos](https:/paolokos.com)

---

## 📄 License

This project is licensed under the MIT License.
