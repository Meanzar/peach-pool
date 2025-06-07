import React from 'react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <header className="App-header">
      <h1>Vote Pool</h1>
      <p>Bienvenue sur l'application de vote décentralisée !</p>
      <button onClick={() => navigate('/vote')}>Accéder au vote</button>
    </header>
  );
}

export default Home;
