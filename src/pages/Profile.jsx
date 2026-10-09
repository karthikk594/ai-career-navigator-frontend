import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API from "../services/api";
import "./Profile.css";


function Profile() {


    const navigate = useNavigate();


    const userId = localStorage.getItem("userId");


    const [profileExists, setProfileExists] = useState(false);



    const [profile, setProfile] = useState({

        education:"",
        college:"",
        branch:"",
        skills:"",
        github:"",
        linkedin:"",
        careerGoal:""

    });



    // CHECK PROFILE EXISTS

    useEffect(()=>{


        API.get(`/profile/${userId}`)

        .then((response)=>{


            console.log("PROFILE:", response.data);



            if(response.data){


                setProfile(response.data);

                setProfileExists(true);


            }


        })


        .catch((error)=>{

            console.log(error);

        });



    },[]);




    const handleChange=(e)=>{


        setProfile({

            ...profile,

            [e.target.name]:e.target.value

        });


    };





    const saveProfile=async()=>{


        try{


            let response;



            // UPDATE EXISTING PROFILE

            if(profileExists){


                response = await API.put(

                    `/profile/${userId}`,

                    profile

                );


                alert("Profile Updated");


            }



            // CREATE NEW PROFILE

            else{


                response = await API.post(

                    `/profile/${userId}`,

                    profile

                );


                setProfileExists(true);


                alert("Profile Created");


            }



            console.log(response.data);


            navigate("/dashboard");



        }


        catch(error){


            console.log(error);


            alert("Profile save failed");


        }


    };




    return(


        <div className="profile-page">


            <header className="profile-navbar">


                <Link 
                to="/dashboard"
                className="profile-brand">

                    AI Career Navigator

                </Link>



                <Link 
                to="/dashboard"
                className="back-dashboard">

                    ← Dashboard

                </Link>


            </header>




            <main className="profile-content">



                <div className="profile-heading">


                    <span className="profile-eyebrow">

                        YOUR PROFILE

                    </span>



                    <h1>

                        {profileExists 
                        ? "Edit your profile."
                        : "Tell us about yourself."}

                    </h1>


                    <p>

                    Complete your profile so AI Career Navigator
                    can personalize your career journey.

                    </p>



                </div>





                <div className="profile-card">





                    <div className="form-group">


                        <label>
                            Education
                        </label>


                        <input

                        name="education"

                        value={profile.education}

                        onChange={handleChange}

                        placeholder="B.Tech"

                        />


                    </div>






                    <div className="form-group">


                        <label>
                            College
                        </label>


                        <input

                        name="college"

                        value={profile.college}

                        onChange={handleChange}

                        placeholder="College name"

                        />


                    </div>






                    <div className="form-group">


                        <label>
                            Branch
                        </label>


                        <input

                        name="branch"

                        value={profile.branch}

                        onChange={handleChange}

                        placeholder="AI & ML"

                        />


                    </div>






                    <div className="form-group">


                        <label>
                            Skills
                        </label>


                        <input

                        name="skills"

                        value={profile.skills}

                        onChange={handleChange}

                        placeholder="Python, ML"

                        />


                    </div>







                    <div className="form-group">


                        <label>
                            Github
                        </label>


                        <input

                        name="github"

                        value={profile.github}

                        onChange={handleChange}

                        placeholder="github username"

                        />


                    </div>







                    <div className="form-group">


                        <label>
                            LinkedIn
                        </label>


                        <input

                        name="linkedin"

                        value={profile.linkedin}

                        onChange={handleChange}

                        placeholder="linkedin username"

                        />


                    </div>







                    <div className="form-group">


                        <label>
                            Career Goal
                        </label>


                        <textarea

                        name="careerGoal"

                        value={profile.careerGoal}

                        onChange={handleChange}

                        placeholder="AI Engineer"

                        />



                    </div>







                    <button

                    className="save-button"

                    onClick={saveProfile}

                    >


                    {
                        profileExists
                        ?
                        "Update Profile"
                        :
                        "Create Profile"
                    }


                    </button>



                </div>



            </main>



        </div>


    );


}


export default Profile;