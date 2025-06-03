import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  
  const handleVoteClick = () => {
    navigate('/vote');
  };

  return (
    <header className="App-header">
      <h1>Welcome to the Vote App</h1>
      <p>
        This is the voting app. The result are not rigged, i promise!
        Okay, maybe a little bit.
      </p>
      <button onClick={handleVoteClick}>Vote Now</button>
    </header>
  );
}

export default Home;
