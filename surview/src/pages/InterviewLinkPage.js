import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
function InterviewLinkPage() {
  const location = useLocation();
  const navigate= useNavigate();
  const [agent, setAgent] = useState(false);
  const formattedQuestions = location.state.questions
  .map((question, index) => {
    // Only map questions at even indexes
    if (index % 2 === 0) {
      return { questionText: question.questionText || question };
    }
    return null; // Return null for odd indexes to filter them out later
  })
  .filter(question => question !== null); // Remove null values
  console.log(formattedQuestions)
  const [questions, setQuestions] = useState(formattedQuestions);
  console.log(questions);

  // Function to handle input change for each question
  const handleQuestionChange = (index, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index] = value;
    setQuestions(updatedQuestions);
  };

  const createLLM=(async()=>{
    const response=await axios.post('http://localhost:5000/create-llm', {
      questions,
    });
    console.log(response.data.agent_id);
    const response1= await axios.post(`http://localhost:5000/user/${location.state.email}/projects`,{
      projectName: location.state.projectName,
      questions: questions

    })
    const agent=response.data.agent_id
    const handleNavigateToShowLink = (agentId) => {
      navigate('/show-link', { state: { agentId } });
    };
    handleNavigateToShowLink(agent);
  
    

  })
  return (
    <div style={styles.container}>
      <div style={styles.title2}><h3>Customize your questions below:</h3></div>
      <div  style={styles.container2}>
      {questions.map((question, index) => (
        <div key={index} >
          <label>Question {index + 1}:</label>
          <input style={styles.inputt}
            type="text"
            value={question.questionText}
            onChange={(e) => handleQuestionChange(index, e.target.value)}
          />
        </div>
      ))}
      <button onClick={createLLM} style={styles.button}>CREATE AGENT</button>
      </div>
     
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
      fontSize: '22px',
      fontWeight: 'bold',
      color:'white',
      display:'flex',
      flexDirection:'column',
      margin:'10px 10px auto',
      marginLeft:'20px',  
      padding: '0px 20px',
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
    padding: '16px 20px',
    display:'block',
    margin: '13px auto',
    boxSizing: 'border-box',
    borderRadius: '20px'
  },
  button: {
    'backgroundColor':'black',
    'borderRadius':'10px',
    'height':'40px', 
    'width':'150px',
    'cursor':'pointer',
    color:'white',
    display:'block',
    margin:'4px auto',
    border: '3px solid white',

  },
  button2: {
      background:'none',
      border:'none',
      'height':'50px', 
      'width':'50px',
      'cursor':'pointer',
      color:'white',
      display:'block',
      margin:'auto 8px',
  
    }
}

export default InterviewLinkPage;

