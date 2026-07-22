"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

import "./login.css";

import {
    ShieldCheck,
    Mail,
    Lock,
    Eye,
    EyeOff,
    LogIn,
    ShieldAlert,
    LoaderCircle,
} from "lucide-react";

export default function LoginPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const [showPassword, setShowPassword] = useState(false);

    const [loading, setLoading] = useState(false);

    const [error, setError] = useState("");
const handleLogin = async (e) => {
  e.preventDefault();

  setLoading(true);
  setError("");

  try {
    const response = await api.post("/auth/login", {
      email,
      password,
    });

    const { token, user } = response.data;

    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(user));

    router.push("/dashboard");
  } catch (err) {
    setError(
      err.response?.data?.message || "Login failed"
    );
  } finally {
    setLoading(false);
  }
};

    return (
        <div className="login-page">

            {/* Background */}

            <div className="background-overlay"></div>

            {/* Login Container */}

            <main className="login-container">

                {/* Logo */}

                <div className="brand-section">

                    <div className="logo-box">
                        <ShieldCheck size={32} />
                    </div>

                    <h1>AdminPanel</h1>

                    <p>Enterprise Management Suite</p>

                </div>

                {/* Login Card */}

                <div className="login-card">

                    <form onSubmit={handleLogin}>

                        {/* Email */}

                        <div className="form-group">

                            <label>Email Address</label>

                            <div className="input-box">

                                <Mail size={18} />

                                <input
                                    type="email"
                                    placeholder="ceo@adminpanel.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                />

                            </div>

                        </div>

                        {/* Password */}

                        <div className="form-group">

                            <div className="password-header">

                                <label>Password</label>

                                <a href="#">
                                    Forgot password?
                                </a>

                            </div>

                            <div className="input-box">

                                <Lock size={18} />

                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                />

                                <button
                                    type="button"
                                    className="eye-btn"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>

                            </div>

                        </div>

                        {/* Login Button */}

                        <button
                            className="login-btn"
                            type="submit"
                            disabled={loading}
                        >

                            {
                                loading ?

                                    <>

                                        <LoaderCircle
                                            size={18}
                                            className="spinner"
                                        />

                                        Signing In...

                                    </>

                                    :

                                    <>

                                        Login to Dashboard

                                        <LogIn size={18} />

                                    </>

                            }

                        </button>
                        {
                            error &&

                            <p className="error-message">

                                {error}

                            </p>

                        }

                    </form>
                    <div className="login-footer">

                        <div className="admin-note">

                            <ShieldAlert size={18} />

                            <p>
                                Admin / CEO Access Only
                            </p>

                        </div>



                    </div>

                </div>

            </main>

        </div>
    );
}