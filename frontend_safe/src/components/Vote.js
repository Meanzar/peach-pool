import React, { useEffect, useState } from "react";
import { useNavigate } from 'react-router-dom';
import { getContract } from "../contract";

function Vote() {
  const navigate = useNavigate();
  const [proposals, setProposals] = useState([]);
  const [winner, setWinner] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadProposals = async () => {
    setLoading(true);
    setError("");

    try {
      const contract = await getContract();
      const count = await contract.getProposalCount();
      const proposalList = [];

      for (let i = 0; i < count; i++) {
        const [name, votes] = await contract.getProposal(i);
        proposalList.push({ name, votes: Number(votes) });
      }

      setProposals(proposalList);
      const winnerName = await contract.getWinningProposal();
      setWinner(winnerName);
    } catch (err) {
      setError("Erreur lors de la récupération des propositions.");
    }

    setLoading(false);
  };

  const handleVote = async (index) => {
    setLoading(true);
    setError("");

    try {
      const contract = await getContract();
      const tx = await contract.vote(index);
      await tx.wait();
      await loadProposals();
    } catch (err) {
      setError("Erreur lors du vote.");
    }

    setLoading(false);
  };

  const handleCancelVote = async () => {
    setLoading(true);
    setError("");

    try {
      const contract = await getContract();
      const tx = await contract.cancelVote();
      await tx.wait();
      await loadProposals();
    } catch (err) {
      setError("Erreur lors de l'annulation du vote.");
    }

    setLoading(false);
  };

  useEffect(() => {
    loadProposals();
  }, []);

  return (
    <div className="App-header">
      <h1>Vote Pool</h1>

      {error && <div className="error-message">{error}</div>}

      {loading ? (
        <p>Chargement...</p>
      ) : (
        <>
          <p>Nombre de propositions : {proposals.length}</p>
          <ul className="proposals-list">
            {proposals.map((proposal, index) => (
              <li key={index} className="proposal-item">
                <span className="proposal-name">{proposal.name}</span> —{" "}
                <span className="proposal-votes">{proposal.votes} votes</span>
                <button
                  onClick={() => handleVote(index)}
                  className="vote-button"
                  style={{ marginLeft: 10 }}
                >
                  Voter
                </button>
              </li>
            ))}
          </ul>

          <button onClick={handleCancelVote} className="cancel-vote-button">
            Annuler mon vote
          </button>

          <p>🏆 Gagnant actuel : <strong>{winner}</strong></p>
        </>
      )}

      <button onClick={() => navigate('/')} className="back-button" style={{ marginTop: 20 }}>
        Retour à l'accueil
      </button>
    </div>
  );
}

export default Vote;
