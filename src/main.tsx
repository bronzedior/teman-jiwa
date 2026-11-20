import { StrictMode, Suspense, lazy } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import Layout from "./components/Layout.tsx";
import RouteMiddleware from "./middleware/RouteMiddleware.tsx";

// Each page is its own chunk, so the first load only downloads the page it opens.
const HomePage = lazy(() => import("./pages/HomePage.tsx"));
const LoginPage = lazy(() => import("./pages/LoginPage.tsx"));
const RegisterPage = lazy(() => import("./pages/RegisterPage.tsx"));
const FaqPage = lazy(() => import("./pages/FaqPage.tsx"));
const AppointmentPage = lazy(() => import("./pages/AppointmentPage.tsx"));
const ForumPage = lazy(() => import("./pages/ForumPage.tsx"));
const ForumDetailPage = lazy(() => import("./pages/ForumDetail.tsx"));
const ProfilePage = lazy(() => import("./pages/ProfilePage.tsx"));

createRoot(document.getElementById("root")!).render(
    <StrictMode>
        <BrowserRouter>
            <Suspense>
                <Routes>
                    <Route path="/" element={<Layout />}>
                        <Route
                            index
                            element={
                                <RouteMiddleware access="public">
                                    <HomePage />
                                </RouteMiddleware>
                            }
                        />
                        <Route
                            path="/faq"
                            element={
                                <RouteMiddleware access="public">
                                    <FaqPage />
                                </RouteMiddleware>
                            }
                        />
                        <Route
                            path="/appointments"
                            element={
                                <RouteMiddleware access="auth">
                                    <AppointmentPage />
                                </RouteMiddleware>
                            }
                        />
                        <Route
                            path="/forum"
                            element={
                                <RouteMiddleware access="auth">
                                    <ForumPage />
                                </RouteMiddleware>
                            }
                        />
                        <Route
                            path="/forum/:id"
                            element={
                                <RouteMiddleware access="auth">
                                    <ForumDetailPage />
                                </RouteMiddleware>
                            }
                        />
                        <Route
                            path="/profile"
                            element={
                                <RouteMiddleware access="auth">
                                    <ProfilePage />
                                </RouteMiddleware>
                            }
                        />
                    </Route>
                    <Route
                        path="/login"
                        element={
                            <RouteMiddleware access="guest">
                                <LoginPage />
                            </RouteMiddleware>
                        }
                    />
                    <Route
                        path="/register"
                        element={
                            <RouteMiddleware access="guest">
                                <RegisterPage />
                            </RouteMiddleware>
                        }
                    />
                </Routes>
            </Suspense>
        </BrowserRouter>
    </StrictMode>
);
