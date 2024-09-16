import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function HomePage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const history = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter a valid email.');
      return;
    }

    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/check-email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.status === 200 || response.status === 201) {
        // If user exists or was created successfully, navigate to the options page
        console.log('User:', data.user);
        history('/your-projects', { state: { user: data.user } });
      } else {
        setError('Error checking email.');
      }
    } catch (error) {
      setError('Error connecting to the server.');
      console.error('Error:', error);
    }
  };

  return (
    <div style={styles.container}>
      <h3 style={styles.title}>Enter your Email</h3>
      <form onSubmit={handleSubmit} style={styles.container2}>
        <input
          style={styles.inputt}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <button type="submit" style={styles.button}>Next</button>
      </form>
    </div>
  );
}

const styles ={
  title: {
    fontSize: '25px',
    fontWeight: 'bold',
    color:'white',
    padding: '10px 20px',
    'backgroundColor':'black',
    'borderRadius':'20px 2px',
    border: '3px solid white'
  },
  container: {
    fontFamily: 'Arial, sans-serif',
    display:'flex',
    flexDirection:'column',
    padding:'80px',
    alignItems:'center',
    background: `url('https://img.freepik.com/free-vector/sound-wave-gray-digital-background-entertainment-technology_53876-119613.jpg') no-repeat center center fixed`, // Background image
    backgroundSize: 'cover', // Ensures the image covers the entire background
    color: 'black', // Text   color to ensure readability over the background
    minHeight: '100vh',
    minWidth:'100vh' // Ensures the container takes up the full viewport height
  },

  container2: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)', /* 50% opacity black background */
    color: 'white', /* Text color remains fully opaque */
    padding: '20px',
    margin:'30px auto',
    fontFamily: 'Arial, sans-serif',
    display:'flex',
    flexDirection:'column',
    alignItems:'center',
    border: '4px solid white',
    borderRadius:'40px 2px'

    },
  
  inputt :{
    width: '40vh',
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
    margin:'40px auto',
    border: '3px solid white'

  }
}

export default HomePage;

