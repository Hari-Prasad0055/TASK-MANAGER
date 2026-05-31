# Task Manager

This project has been restructured to cleanly separate the **Frontend** and the **Backend** into their own dedicated directories: `client/` and `server/`.

## Directory Structure

```
Task-manager/
├── client/          # Frontend React + Vite app
└── server/          # Backend Express + MongoDB API & Vercel serverless configurations
```

---

## 💻 Local Development

### 1. Backend Setup
1. Open a terminal and navigate to the `server/` directory:
   ```bash
   cd server
   ```
2. Install the backend dependencies:
   ```bash
   npm install
   ```
3. Create a `.env` file in the `server/` folder and configure your environment variables:
   ```env
   PORT=5000
   MONGODB_URI=your_mongodb_connection_uri
   JWT_SECRET=your_jwt_secret_key
   ```
4. Start the development server (runs on `http://localhost:5000`):
   ```bash
   npm run dev
   ```

### 2. Frontend Setup
1. Open a new terminal and navigate to the `client/` directory:
   ```bash
   cd client
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server (runs on `http://localhost:5173` and proxies `/api` to `http://localhost:5000`):
   ```bash
   npm run dev
   ```

---

## 🚀 Vercel Deployment

For the cleanest setup, we recommend deploying the **Frontend** and **Backend** as two separate projects in Vercel.

### 1. Backend API Deployment
1. Import the repository in Vercel.
2. In the configuration settings, set the **Root Directory** to `server`.
3. Add your environment variables (`MONGODB_URI`, `JWT_SECRET`) under the Vercel **Environment Variables** section.
4. Click **Deploy**. Vercel will build and host your API at `<your-backend-url>.vercel.app`.

### 2. Frontend React Deployment
1. Import the repository in Vercel.
2. In the configuration settings, set the **Root Directory** to `client`.
3. In the Vercel **Environment Variables** section, add:
   * `VITE_API_URL`: Set this to your deployed backend API URL (e.g., `https://<your-backend-url>.vercel.app`).
4. Click **Deploy**.
