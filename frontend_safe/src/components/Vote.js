import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { getContract } from "../contract";

function Vote() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [winner, setWinner] = useState("");
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchProposals();
    // eslint-disable-next-line
  }, []);

  async function fetchProposals() {
    setLoading(true);
    setError("");
    try {
    console.log("Fetching proposals...");
      const contract = await getContract();
      console.log("Fetching proposals from contract:", contract);
      const count = await contract.getProposalCount();
      setCount(Number(count));
      const data = [];
      for (let i = 0; i < count; i++) {
        const [name, votes] = await contract.getProposal(i);
        data.push({ name, votes: Number(votes) });
      }
      setProposals(data);
      const win = await contract.getWinningProposal();
      setWinner(win);
    } catch (e) {
      setError("Erreur lors de la récupération des propositions.");
    }
    setLoading(false);
  }

  async function vote(index) {
    setLoading(true);
    setError("");
    try {
      const contract = await getContract();
      const tx = await contract.vote(index);
      await tx.wait();
      await fetchProposals();
    } catch (e) {
      setError("Erreur lors du vote.");
    }
    setLoading(false);
  }

  async function cancelVote() {
    setLoading(true);
    setError("");
    try {
      const contract = await getContract();
      const tx = await contract.cancelVote();
      await tx.wait();
      await fetchProposals();
    } catch (e) {
      setError("Erreur lors de l'annulation du vote.");
    }
    setLoading(false);
  }

  return (
    <div className="App-header">
      <h1>Vote Pool</h1>
      {error && <div className="error-message">{error}</div>}
      {loading ? (
        <p>Chargement...</p>
      ) : (
        <>
          <p>Nombre de propositions : {count}</p>
          <ul className="proposals-list">
            {proposals.map((p, i) => (
              <li key={i} className="proposal-item">
                <span className="proposal-name">{p.name}</span> — <span className="proposal-votes">{p.votes} votes</span>
                <button onClick={() => vote(i)} className="vote-button" style={{ marginLeft: 10 }}>Voter</button>
              </li>
            ))}
          </ul>
          <button onClick={cancelVote} className="cancel-vote-button">Annuler mon vote</button>
          <p>🏆 Gagnant actuel : <strong>{winner}</strong></p>
        </>
      )}
      <button onClick={() => navigate('/')} className="back-button" style={{marginTop: 20}}>Retour à l'accueil</button>
    </div>
  );
}

export default Vote;
