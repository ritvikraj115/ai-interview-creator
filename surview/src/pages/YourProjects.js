import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaPlus } from "react-icons/fa";
import { FaEdit } from "react-icons/fa";

function YourProjects() {
  const location = useLocation();
  const history = useNavigate();

  // Access the user from the location state
  const { user } = location.state || {};

  // Handle the Edit Questions button click
  const handleEditQuestions = (projectId, email, name) => {
    // Navigate to the Edit Questions page with the project ID
    history(`/edit-questions/${projectId}`, { state: { projectId, email, name} });
  };

  const createInterview = (email)=>{
    history("/create-interview", {state: {email}})
  }

  return (
    <div style={styles.container}>
      <div style={styles.title2}><h2>Your Projects</h2>
      <button style={styles.button2} onClick={()=> createInterview(user.email)}><FaPlus style={{color:'white', height:'30px'}} /></button>
       </div>
      {user.projects && user.projects.length > 0 ? (
        <ul style={styles.container2}>
          {user.projects.map((project) => (
            <li key={project._id} style={styles.title}>
              <h3 style={{textAlign:'center'}}>{project.projectName.toUpperCase()}</h3>
              <button style={styles.button} onClick={() => handleEditQuestions(project._id, user.email, project.projectName)}>
                 <FaEdit size={25}/>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p></p>
      )}
    </div>
  );
}

const styles ={
    title: {
      height:'350px',
      width:'350px',
      fontWeight: 'bold',
      color:'white',
      display:'flex',
      flexDirection:'column',
      justifyContent:'center',
      alignItems:'center',
      margin:'75px 75px',
      padding: '2px auto',
      backgroundColor: 'rgba(0, 0, 0, 0.7)', /* 50% opacity black background */
      color: 'white',
      borderRadius:'30px 2px',
      border: '4px solid white'
    },
    title2: {
        fontSize: '12px',
        fontWeight: 'bold',
        color:'white',
        display:'flex',
        margin:'20px 20px auto',
        marginLeft:'20px',  
        padding: '0px 15px',
        backgroundColor:'black',
        borderRadius:'40px',
        border: '4px solid white'
      },
    container: {
      fontFamily: 'Arial, sans-serif',
      display:'flex',
      flexDirection:'column',
      padding:'0px 20px',
      alignItems:'center',
      background: `url('https://img.freepik.com/free-vector/sound-wave-gray-digital-background-entertainment-technology_53876-119613.jpg') no-repeat center center fixed`, // Background image
      backgroundSize: 'cover', // Ensures the image covers the entire background
      color: 'black', // Text   color to ensure readability over the background
      minHeight: '100vh',
      minWidth: '100vh'
      // Ensures the container takes up the full viewport height
    },
    container2: {
        margin:'20px auto',
       
        fontFamily: 'Arial, sans-serif',
        display:'flex',
        flexWrap: 'wrap',
        flexDirection:'row',
        padding:'0px 20px',
        alignItems:'center',
        color: 'black', // Text   color to ensure readability over the background
      },
    
    inputt :{
      width: '105%',
      padding: '12px 20px',
      display:'block',
      margin: '13px auto',
      boxSizing: 'border-box'
    },
    button: {
      'backgroundColor':'black',
      'borderRadius':'10px',
      'height':'40px', 
      'width':'90px',
      'cursor':'pointer',
      color:'white',
      display:'block',
      margin:'4px auto',
      border: '3px solid white'
  
    },
    button2: {
        'backgroundColor':'black',
        'borderRadius':'30px',
        'height':'40px', 
        'width':'40px',
        'cursor':'pointer',
        color:'white',
        display:'block',
        margin:'4px 4px 0px 8px',
        border: '5px solid white'
    
      }
  }


export default YourProjects;
