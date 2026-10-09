
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import "./Login.css";

function Login() {

    const navigate = useNavigate();

    const [user, setUser] = useState({
        email: "",
        password: ""
    });


    const handleLogin = async () => {

    try {

        const response = await API.post(
            "/auth/login",
            user
        );


        console.log(
            "LOGIN RESPONSE:",
            response.data
        );


        const loggedInUser = response.data;

        if (!loggedInUser?.id) {

            throw new Error("Login response did not include user details");

        }


        localStorage.setItem(
            "userId",
            loggedInUser.id
        );


        localStorage.setItem(
            "user",
            JSON.stringify(loggedInUser)
        );


        console.log(
            "SAVED ID:",
            loggedInUser.id
        );


        alert("Login Successful");


        navigate("/dashboard");


    }
    catch(error){

        console.log(error);

        alert("Invalid login");

    }

};


    return (

        <div className="auth-page">

            <div className="auth-container">

                <Link to="/" className="auth-brand">
                    AI Career Navigator
                </Link>


                <div className="auth-card">

                    <div className="auth-header">

                        <h1>Welcome back.</h1>

                        <p>
                            Sign in to continue your career journey.
                        </p>

                    </div>


                    <div className="input-group">

                        <label>Email</label>

                        <input
                            type="email"
                            placeholder="Enter your email"
                            value={user.email}
                            onChange={(e) =>
                                setUser({
                                    ...user,
                                    email: e.target.value
                                })
                            }
                        />

                    </div>


                    <div className="input-group">

                        <label>Password</label>

                        <input
                            type="password"
                            placeholder="Enter your password"
                            value={user.password}
                            onChange={(e) =>
                                setUser({
                                    ...user,
                                    password: e.target.value
                                })
                            }
                        />

                    </div>


                    <button
                        className="auth-button"
                        onClick={handleLogin}
                    >
                        Sign in
                    </button>


                    <p className="auth-switch">

                        Don't have an account?

                        <Link to="/register">
                            Create one
                        </Link>

                    </p>

                </div>

            </div>

        </div>

    );
}

export default Login;
