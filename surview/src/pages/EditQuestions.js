import axios from 'axios';
import React, { useCallback, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MdDelete } from "react-icons/md";

function EditQuestions() {
  const location = useLocation();
  const navigate= useNavigate();
  const { projectId, email, name } = location.state || {};
  console.log(location.state)
  const [questions, setQuestions] = useState([]);

  const handleQuestionChange = (index, newValue) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].questionText = newValue;
    setQuestions(updatedQuestions);
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { questionText: '' }]);
  };
  const handleDeleteQuestion = useCallback((index) => {
    // Create a new array excluding the item at the specified index
    const updatedQuestions = questions.filter((_, i) => i !== index);
    setQuestions(updatedQuestions); // Update state with the new array
    console.log(updatedQuestions); // Optional: for debugging
  }, [questions]); // Dependency array to ensure useCallback is updated with the latest questions

  const handleSaveQuestions = async () => {
    // Save the updated questions for the project
    // Use an API call to save the questions in the backend

    // Example:
    const response1=await fetch(`${process.env.REACT_APP_BACKEND_URL}/user/${email}/projects/${projectId}/questions`, {
      method: 'PUT',
      body: JSON.stringify({ questions }),
      headers: { 'Content-Type': 'application/json' },
    });

    const response=await axios.post(`${process.env.REACT_APP_BACKEND_URL}/create-llm`, {
        questions,
      });
      console.log(response.data.agent_id);
      const agent=response.data.agent_id 
      const handleNavigateToShowLink = (agentId) => {
        navigate('/show-link', { state: { agentId } });
      };
      handleNavigateToShowLink(agent);
    
    console.log('Questions saved:', questions);
  };

  useEffect(()=>{
    const fetchQuestions = async()=>{
    const response= await axios.get(`${process.env.REACT_APP_BACKEND_URL}/user/${email}/projects/${projectId}/questions`)
    
    const formattedQuestions = response.data.questions.map((question) => ({
        questionText: question.questionText
      }));

      setQuestions(formattedQuestions);}

      fetchQuestions();
  },[])

  return (
    <div style={styles.container}>
      <h3 style={styles.title2}>Edit Questions for Project: {name}</h3>

      <ul style={styles.container2}>
        {questions.map((question, index) => (
          <li key={index} style={{display:'flex'}}>
            <input style={styles.inputt}
              type="text"
              value={question.questionText}
              onChange={(e) => handleQuestionChange(index, e.target.value)}
              placeholder={`Question ${index + 1}`}
            />
            <button style={styles.button2} onClick={()=>handleDeleteQuestion(index)}><MdDelete size={30} style={{color:'black'}}/></button>
          </li>
        ))}
         <button onClick={handleAddQuestion} style={styles.button}>Add Question</button>
         <button onClick={handleSaveQuestions} style={styles.button}>Save Questions</button>
      </ul>

     
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
        fontSize: '32px',
        fontWeight: 'bold',
        color:'white',
        display:'flex',
        margin:'20px 20px auto',
        marginLeft:'20px',  
        padding: '10px 25px',
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
      width: '70vh',
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
      'width':'90px',
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

export default EditQuestions;
