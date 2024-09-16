import React from 'react';
import { useLocation } from 'react-router-dom';
import { MdContentCopy } from "react-icons/md";

function ShowLink() {
  const location = useLocation();
  const { agentId } = location.state || {};
  
  if (!agentId) {
    return <div>No agent ID provided.</div>;
  }

  const link = `https://ai-interview-2.vercel.app/${agentId}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(link).then(
      () => alert('Link copied to clipboard!'),
      (err) => alert('Failed to copy link: ', err)
    );
  };

  const openInNewWindow = () => {
    window.open(link, '_blank');
  };

  return (
    <div style={styles.container}>
      <div style={styles.title2}><h1>Your Agent link is ready:</h1></div>
      <div style={styles.container2}>
        <p>Don't forget to copy your link. You won't be able to retrieve it later.</p>
      <a style={styles.inputt} href={link} target="_blank" rel="noopener noreferrer">
        {link}
        <button style={styles.button2} onClick={copyToClipboard}><MdContentCopy size={30}/></button>
      </a>
      <div>
        <button style={styles.button}onClick={openInNewWindow}>Open in New Window</button>
      </div>
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
        fontSize: '10px',
        fontWeight: 'bold',
        color:'white',
        display:'flex',
        flexDirection:'column',
        margin:'30px 10px auto',
        marginLeft:'20px',  
        padding: '0px 10px',
        backgroundColor:'black',
        borderRadius:'40px',
        border: '2px solid white'
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
      minWidth:'100vh' // Ensures the container takes up the full viewport height
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
      fontSize:'20px',
      width: '90vh',
      display:'flex',
      justifyContent:'center',
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
        margin:'-10px 0px 8px 0px',
    
      }
  }
export default ShowLink;
