
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../services/api";
import "./Register.css";

function Register() {

    const navigate = useNavigate();

    const [user, setUser] = useState({
        name: "",
        email: "",
        password: "",
        role: "STUDENT"
    });


    const handleRegister = async () => {

        try {

            const response = await API.post(
                "/auth/register",
                user
            );

            console.log(response.data);

            const registeredUser = response.data;

            if (!registeredUser?.id) {

                throw new Error("Registration response did not include user details");

            }

            localStorage.setItem(
                "userId",
                registeredUser.id
            );

            localStorage.setItem(
                "user",
                JSON.stringify(registeredUser)
            );

            alert("Registration Successful");

            navigate("/dashboard");

        }
        catch (error) {

            console.log(error);

            alert("Registration Failed");

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

                        <h1>Create your account.</h1>

                        <p>
                            Start building your personalized career path.
                        </p>

                    </div>


                    <div className="input-group">

                        <label>Name</label>

                        <input
                            placeholder="Enter your name"
                            onChange={(e) =>
                                setUser({
                                    ...user,
                                    name: e.target.value
                                })
                            }
                        />

                    </div>


                    <div className="input-group">

                        <label>Email</label>

                        <input
                            type="email"
                            placeholder="Enter your email"
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
                            placeholder="Create a password"
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
                        onClick={handleRegister}
                    >
                        Create account
                    </button>


                    <p className="auth-switch">

                        Already have an account?

                        <Link to="/login">
                            Sign in
                        </Link>

                    </p>

                </div>

            </div>

        </div>

    );
}

export default Register;
