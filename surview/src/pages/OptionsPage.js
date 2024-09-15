import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function OptionsPage() {
  const history = useNavigate();
  const location = useLocation();
  const handleCreateInterview = async() => {
    history('/create-interview', { state:location.state });
  };

  return (
    <div>
      <h1>Options</h1>
      <button onClick={handleCreateInterview}>Create an Interview</button>
      <button onClick={() => history('/give-interview', { email })}>Give an Interview</button>
    </div>
  );
}

export default OptionsPage;
