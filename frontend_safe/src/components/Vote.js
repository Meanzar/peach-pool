import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ethers } from "ethers";
import { getVotePoolContract } from "../votePoolContract";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';

// Set to true to use mock data instead of connecting to the blockchain
const DEBUG_MODE = true;

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Mock data for testing the UI without blockchain connection
const MOCK_DATA = {
    account: "0x1234567890123456789012345678901234567890",
    isVotingOpen: true,
    proposals: [
        { name: "Proposal 1", voteCount: "5" },
        { name: "Proposal 2", voteCount: "3" },
        { name: "Proposal 3", voteCount: "7" },
        { name: "Proposal 4", voteCount: "2" }
    ]
};

function Vote() {
    const navigate = useNavigate();
    const [contract, setContract] = useState(null);
    const [proposals, setProposals] = useState([]);
    const [account, setAccount] = useState("");
    const [isVotingOpen, setIsVotingOpen] = useState(true);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showChart, setShowChart] = useState(false);
    
    // Prepare chart data from proposals
    const getChartData = () => {
        return {
            labels: proposals.map(p => p.name),
            datasets: [
                {
                    label: 'Votes',
                    data: proposals.map(p => parseInt(p.voteCount)),
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.6)',
                        'rgba(54, 162, 235, 0.6)',
                        'rgba(255, 206, 86, 0.6)',
                        'rgba(75, 192, 192, 0.6)',
                        'rgba(153, 102, 255, 0.6)',
                        'rgba(255, 159, 64, 0.6)',
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
                        'rgba(255, 206, 86, 1)',
                        'rgba(75, 192, 192, 1)',
                        'rgba(153, 102, 255, 1)',
                        'rgba(255, 159, 64, 1)',
                    ],
                    borderWidth: 1,
                },
            ],
        };
    };
    
    const handleBackClick = () => {
        navigate('/');
    };

    useEffect(() => {
        const init = async () => {
            try {
                setIsLoading(true);
                
                // Use mock data if DEBUG_MODE is enabled
                if (DEBUG_MODE) {
                    console.log("Debug mode enabled: Using mock data");
                    setAccount(MOCK_DATA.account);
                    setIsVotingOpen(MOCK_DATA.isVotingOpen);
                    setProposals(MOCK_DATA.proposals);
                    setIsLoading(false);
                    return;
                }
                
                if (window.ethereum) {
                    // Request account access
                    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
                    setAccount(accounts[0]);
                    
                    const provider = new ethers.BrowserProvider(window.ethereum);
                    const signer = await provider.getSigner();
                    const votePool = getVotePoolContract(signer);
                    setContract(votePool);
                    
                    // Check if voting is open
                    const votingOpenStatus = await votePool.votingOpen();
                    setIsVotingOpen(votingOpenStatus);
                    
                    // Get all proposals
                    const proposalCount = await votePool.getProposalCount();
                    const proposalsArray = [];
                    
                    for (let i = 0; i < proposalCount; i++) {
                        const proposal = await votePool.getProposal(i);
                        proposalsArray.push({
                            name: proposal.name,
                            voteCount: proposal.voteCount.toString()
                        });
                    }
                    
                    setProposals(proposalsArray);
                    setIsLoading(false);
                } 
                else {
                    setError("Please install MetaMask to use this application");
                    setIsLoading(false);
                }
            } catch (err) {
                console.error("Initialization error:", err);
                setError("Failed to connect to the blockchain. " + err.message);
                setIsLoading(false);
            }
        };

        init();
    }, []);

    const vote = async (index) => {
        try {
            setIsLoading(true);
            
            // Handle voting in debug mode
            if (DEBUG_MODE) {
                // Create a copy of proposals and increment the vote count
                const updatedProposals = [...proposals];
                const currentCount = parseInt(updatedProposals[index].voteCount);
                updatedProposals[index].voteCount = (currentCount + 1).toString();
                
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                setProposals(updatedProposals);
                setIsLoading(false);
                alert("Vote cast successfully!");
                return;
            }
            
            if (!contract) return;
            
            const tx = await contract.vote(index);
            await tx.wait();
            
            // Refresh proposals after vote
            const proposalCount = await contract.getProposalCount();
            const proposalsArray = [];
            
            for (let i = 0; i < proposalCount; i++) {
                const proposal = await contract.getProposal(i);
                proposalsArray.push({
                    name: proposal.name,
                    voteCount: proposal.voteCount.toString()
                });
            }
            
            setProposals(proposalsArray);
            setIsLoading(false);
            alert("Vote cast successfully!");
        } catch (error) {
            console.error("Voting error:", error);
            setIsLoading(false);
            alert("Error voting: " + (error.message || "Unknown error"));
        }
    };

    const cancelVote = async () => {
        try {
            setIsLoading(true);
            
            // Handle cancellation in debug mode
            if (DEBUG_MODE) {
                // Simulate network delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // In debug mode, just reset to the original mock data
                setProposals([...MOCK_DATA.proposals]);
                setIsLoading(false);
                alert("Vote cancelled successfully!");
                return;
            }
            
            if (!contract) return;
            
            const tx = await contract.cancelVote();
            await tx.wait();
            
            // Refresh proposals after cancellation
            const proposalCount = await contract.getProposalCount();
            const proposalsArray = [];
            
            for (let i = 0; i < proposalCount; i++) {
                const proposal = await contract.getProposal(i);
                proposalsArray.push({
                    name: proposal.name,
                    voteCount: proposal.voteCount.toString()
                });
            }
            
            setProposals(proposalsArray);
            setIsLoading(false);
            alert("Vote cancelled successfully!");
        } catch (error) {
            console.error("Cancellation error:", error);
            setIsLoading(false);
            alert("Error cancelling vote: " + (error.message || "Unknown error"));
        }
    };

    return (
        <div className="App-header">
            <h1>VotePool DApp</h1>
            
            {error && (
                <div className="error-message">
                    <p>{error}</p>
                </div>
            )}
            
            {account && (
                <p className="account-info">Connected: {account.substring(0, 6)}...{account.substring(account.length - 4)}</p>
            )}
            
            {!isVotingOpen && (
                <div className="voting-closed">
                    <p>Voting is closed!</p>
                </div>
            )}
            
            {isLoading ? (
                <div className="loading">
                    <p>Loading...</p>
                </div>
            ) : (
                <div className="proposals-container">
                    <h2>Proposals</h2>
                    <ul className="proposals-list">
                        {proposals.map((proposal, index) => (
                            <li key={index} className="proposal-item">
                                <div className="proposal-info">
                                    <span className="proposal-name">{proposal.name}</span>
                                    <span className="proposal-votes">{proposal.voteCount} votes</span>
                                </div>
                                {isVotingOpen && (
                                    <button 
                                        onClick={() => vote(index)}
                                        className="vote-button"
                                    >
                                        Vote
                                    </button>
                                )}
                            </li>
                        ))}
                    </ul>
                    
                    {isVotingOpen && (
                        <button 
                            onClick={cancelVote}
                            className="cancel-vote-button"
                        >
                            Cancel Vote
                        </button>
                    )}
                    
                    <button 
                        onClick={() => setShowChart(!showChart)}
                        className="chart-button"
                    >
                        {showChart ? "Hide Results" : "Show Results"}
                    </button>
                    
                    {showChart && proposals.length > 0 && (
                        <div className="chart-container">
                            <h3>Voting Results Chart</h3>
                            <Pie data={getChartData()} options={{
                                plugins: {
                                    legend: {
                                        labels: {
                                            color: 'white' 
                                        }
                                    },
                                    tooltip: {
                                        callbacks: {
                                            label: function(context) {
                                                const label = context.label || '';
                                                const value = context.raw || 0;
                                                const total = context.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                                const percentage = Math.round((value / total) * 100);
                                                return `${label}: ${value} votes (${percentage}%)`;
                                            }
                                        }
                                    },
                                    datalabels: {
                                        formatter: (value, ctx) => {
                                            const total = ctx.chart.data.datasets[0].data.reduce((a, b) => a + b, 0);
                                            const percentage = Math.round((value / total) * 100);
                                            return percentage + '%';
                                        },
                                        color: '#ffffff',
                                        font: {
                                            weight: 'bold',
                                            size: 16
                                        }
                                    }
                                }
                            }} />
                        </div>
                    )}
                </div>
            )}
            
            <button onClick={handleBackClick} className="back-button">
                Back to Home
            </button>
        </div>
    );
}

export default Vote;
