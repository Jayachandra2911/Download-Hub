# 🚀 Download Hub

A modern, responsive **Download Hub** built using **HTML, CSS, JavaScript, and Supabase**.
Designed with a sleek dark UI, fast performance, and a lightweight static deployment workflow.

---
## 🌐 Live Preview

<p align="center">
  <a href="https://downloadhub.netlify.app" target="_blank">
    <img src="https://img.shields.io/badge/Live-Demo-0f172a?style=for-the-badge&logo=netlify&logoColor=white">
  </a>
</p>
---

## ✨ Features

* 🌙 Modern dark-themed responsive UI
* 🔍 Instant file search functionality
* ☁️ Supabase-powered backend
* 🔐 Secure admin authentication
* 📁 Add & delete downloadable files
* 🔄 Real-time database updates
* 🎯 Google Drive direct-download URL conversion
* 📱 Mobile-friendly layout
* ⚡ Static deployment ready (Netlify/Vercel/GitHub Pages)

---

# 📂 Project Structure

```bash
Download-Hub/
│
├── index.html            # Main application shell & admin panel
├── styles.css            # Responsive dark theme styling
├── script.js             # Supabase logic & app functionality
├── supabase-setup.sql    # Database schema + RPC functions
├── netlify.toml          # Netlify deployment configuration
└── README.md
```

---

# 🛠️ Tech Stack

* **Frontend:** HTML5, CSS3, JavaScript
* **Backend:** Supabase
* **Database:** PostgreSQL (via Supabase)
* **Hosting:** Netlify / Vercel / Static Hosting

---

# ⚙️ Supabase Setup

## 1️⃣ Create a Supabase Project

Go to:

[Supabase](https://supabase.com/)

Create a new project.

---

## 2️⃣ Run Database Setup

Open:

```text
SQL Editor → New Query
```

Paste and run the contents of:

```bash
supabase-setup.sql
```

This will automatically create:

* Database tables
* Public read policies
* Secure admin RPC functions
* Realtime support

---

## 3️⃣ Get API Credentials

Navigate to:

```text
Project Settings → API
```

Copy:

* Project URL
* Anon Public Key

---

## 4️⃣ Configure `script.js`

Replace the placeholders with your credentials:

```javascript
const SUPABASE_URL = "YOUR_SUPABASE_URL";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
```

---

# 🚀 Deployment

## Netlify Deployment

Deploy instantly with:

[Netlify](https://www.netlify.com/)

### Steps

1. Upload the project folder
2. No build command required
3. Publish directory:

```text
/
```

Your site will be live instantly.

---

# 🔐 Admin Panel

Open the admin dashboard using:

```text
/#admin
```

The admin panel remains hidden until accessed directly.

### Admin Features

* Add new downloadable files
* Delete existing files
* Protected via secure Supabase RPC authentication

---

# 📸 UI Highlights

* Clean modern interface
* Fully responsive design
* Optimized dark mode
* Smooth user experience

---

# 🧩 Future Improvements

* File categories
* User authentication
* Download analytics
* File upload support
* Theme customization
* Pagination & sorting

---


# ❤️ Credits

Built with:

* [Supabase](https://supabase.com/)
* [Netlify](https://www.netlify.com/)

---

# 🌟 Support

If you like this project, consider giving it a ⭐ on GitHub.

