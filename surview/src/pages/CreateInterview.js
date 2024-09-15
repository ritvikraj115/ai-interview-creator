import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

function CreateInterview() {
  const [projectName, setProjectName] = useState('');
  const [projectOffering, setProjectOffering] = useState('');
  const [feedbackDesired, setFeedbackDesired] = useState('');
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const { email } = location.state;
  const history = useNavigate();
  console.log(email)
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Call OpenAI to generate interview questions
      console.log(projectName);
      const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/generate-questions`, {
        projectName,
        projectOffering,
        feedbackDesired,
      });

      const { questions } = response.data;
      console.log(questions)

      // Save project and questions to the user schema via API
     
      // Redirect to the interview link page
      history('/interview-link', { state: {questions, email, projectName} });
    } catch (error) {
      console.error('Error creating interview:', error);
    }

    setLoading(false);
  };

  return (
    <div style={styles.container}>
      <div style={styles.title2}><h1>Create Interview</h1></div>
      <form onSubmit={handleSubmit} style={styles.container2}>
        <input
          type="text"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          placeholder="Project Name- What is the name of your product or service" style={styles.inputt}
        />
        <input
          type="text"
          value={projectOffering}
          onChange={(e) => setProjectOffering(e.target.value)}
          placeholder="Project Offering- What does your product or service do. Please be specific" style={styles.inputt}
        />
        <input
          type="text"
          value={feedbackDesired}
          onChange={(e) => setFeedbackDesired(e.target.value)}
          placeholder="Feedback Desired- What feedback are you looking for" style={styles.inputt}
        />
        <button type="submit" disabled={loading} style={styles.button}>
          {loading ? 'Generating Questions...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}


const styles ={
  title: {
    height:'250px',
    width:'200px',
    fontWeight: 'bold',
    color:'white',
    display:'flex',
    flexDirection:'column',
    justifyContent:'center',
    alignItems:'center',
    margin:'2px 10px',
    padding: '2px auto',
    backgroundColor:'black',
    borderRadius:'20px',
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
      position:'fixed',
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
    minHeight: '100vh', // Ensures the container takes up the full viewport height
  },
  container2: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)', /* 50% opacity black background */
    color: 'white', /* Text color remains fully opaque */
    padding: '20px',
    margin:'auto auto',
    fontFamily: 'Arial, sans-serif',
    display:'flex',
    flexDirection:'column',
    alignItems:'center',
    border: '4px solid white',
    borderRadius:'40px 2px'

    },
  
  inputt :{
    width: '100vh',
    padding: '22px 30px',
    display:'block',
    margin: '13px auto',
    boxSizing: 'border-box',
    borderRadius: '20px'
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
    border: '3px solid white',

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

export default CreateInterview;
