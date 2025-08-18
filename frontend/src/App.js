import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";


import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import InterviewPage from "./pages/InterviewPage";


const LoadingScreen = () => (
  <div
    style={{
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "100vh",
      fontSize: "1.2rem",
      color: "#666",
    }}
  >
    Loading...
  </div>
);


const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return isAuthenticated ? children : <Navigate to="/login" />;
};


const PublicRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return !isAuthenticated ? children : <Navigate to="/dashboard" />;
};


const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />

      {/* Protected routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/interview"
        element={
          <ProtectedRoute>
            <InterviewPage />
          </ProtectedRoute>
        }
      />

      {/* Default redirect */}
      <Route path="/" element={<Navigate to="/dashboard" />} />

      {/* 404 fallback */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
};


const App = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <AppRoutes />

          {}
          <style jsx global>{`
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }

            body {
              font-family: -apple-system, BlinkMacSystemFont, "Segoe UI",
                "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans",
                "Droid Sans", "Helvetica Neue", sans-serif;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              background-color: #f8f9fa;
              color: #333;
              line-height: 1.6;
            }

            code {
              font-family: source-code-pro, Menlo, Monaco, Consolas,
                "Courier New", monospace;
            }

            button {
              font-family: inherit;
              font-size: inherit;
            }

            input,
            textarea,
            select {
              font-family: inherit;
              font-size: inherit;
            }

            /* Scrollbar styling */
            ::-webkit-scrollbar {
              width: 8px;
            }

            ::-webkit-scrollbar-track {
              background: #f1f1f1;
            }

            ::-webkit-scrollbar-thumb {
              background: #c1c1c1;
              border-radius: 4px;
            }

            ::-webkit-scrollbar-thumb:hover {
              background: #a8a8a8;
            }

            /* Focus styles for accessibility */
            button:focus-visible,
            input:focus-visible,
            textarea:focus-visible,
            select:focus-visible {
              outline: 2px solid #007bff;
              outline-offset: 2px;
            }

            /* Utility classes */
            .text-center {
              text-align: center;
            }

            .text-left {
              text-align: left;
            }

            .text-right {
              text-align: right;
            }

            .mb-0 {
              margin-bottom: 0;
            }
            .mb-1 {
              margin-bottom: 0.5rem;
            }
            .mb-2 {
              margin-bottom: 1rem;
            }
            .mb-3 {
              margin-bottom: 1.5rem;
            }
            .mb-4 {
              margin-bottom: 2rem;
            }

            .mt-0 {
              margin-top: 0;
            }
            .mt-1 {
              margin-top: 0.5rem;
            }
            .mt-2 {
              margin-top: 1rem;
            }
            .mt-3 {
              margin-top: 1.5rem;
            }
            .mt-4 {
              margin-top: 2rem;
            }

            .p-0 {
              padding: 0;
            }
            .p-1 {
              padding: 0.5rem;
            }
            .p-2 {
              padding: 1rem;
            }
            .p-3 {
              padding: 1.5rem;
            }
            .p-4 {
              padding: 2rem;
            }

            .d-none {
              display: none;
            }
            .d-block {
              display: block;
            }
            .d-flex {
              display: flex;
            }
            .d-grid {
              display: grid;
            }

            .justify-center {
              justify-content: center;
            }
            .justify-between {
              justify-content: space-between;
            }
            .justify-around {
              justify-content: space-around;
            }

            .align-center {
              align-items: center;
            }
            .align-start {
              align-items: flex-start;
            }
            .align-end {
              align-items: flex-end;
            }

            .flex-1 {
              flex: 1;
            }
            .flex-wrap {
              flex-wrap: wrap;
            }
            .flex-nowrap {
              flex-wrap: nowrap;
            }

            .w-full {
              width: 100%;
            }
            .h-full {
              height: 100%;
            }

            /* Responsive breakpoints */
            @media (max-width: 576px) {
              .container {
                padding: 0 1rem;
              }
            }

            @media (max-width: 768px) {
              .hide-mobile {
                display: none;
              }
            }

            @media (max-width: 992px) {
              .hide-tablet {
                display: none;
              }
            }

            @media (max-width: 1200px) {
              .hide-desktop {
                display: none;
              }
            }
          `}</style>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App;
