import { useState, useEffect } from 'react';
import axios from 'axios';
import './index.css';

const BACKEND_URL = 'http://localhost:3000';

function App() {
  const [repoLink, setRepoLink] = useState('');
  const [status, setStatus] = useState('Deploy');
  const [isDeploying, setIsDeploying] = useState(false);
  const [projectId, setProjectId] = useState(null);
  const [deployedUrl, setDeployedUrl] = useState('');

  useEffect(() => {
    let intervalId;
    
    if (isDeploying && projectId) {
      intervalId = setInterval(async () => {
        try {
          const response = await axios.get(`${BACKEND_URL}/status?id=${projectId}`);
          
          if (response.data && response.data.status) {
            setStatus(response.data.status);
            
            if (response.data.status.toLowerCase() === 'deployed') {
              setIsDeploying(false);
              setDeployedUrl(`http://${projectId}.localhost:3001`);
              clearInterval(intervalId);
            } else if (response.data.status.toLowerCase() === 'failed') {
              setIsDeploying(false);
              clearInterval(intervalId);
            }
          }
        } catch (error) {
          console.error("Error fetching status:", error);
          setStatus("Error");
          setIsDeploying(false);
          clearInterval(intervalId);
        }
      }, 2500);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isDeploying, projectId]);

  const handleDeploy = async (e) => {
    e.preventDefault();
    if (!repoLink) return;
    
    setIsDeploying(true);
    setStatus('Initializing');
    setProjectId(null);
    setDeployedUrl('');
    
    try {
      const response = await axios.post(`${BACKEND_URL}/deploy`, { 
        repoUrl: repoLink 
      });
      
      if (response.data && response.data.id) {
         setProjectId(response.data.id);
         setStatus('Deploying'); 
      } else {
         setStatus('Deploy Requested');
         setIsDeploying(false); 
      }
    } catch (error) {
      console.error("Error during deployment request:", error);
      setStatus("Failed");
      setIsDeploying(false);
    }
  };

  return (
    <div className="container">
      {/* First Card: Deployment Form */}
      <div className="card">
        <h1 className="title">Deploy your GitHub Repository</h1>
        <p className="subtitle">Enter the URL of your GitHub repository to deploy it</p>
        
        <form onSubmit={handleDeploy} className="deploy-form">
          <div className="input-group">
            <label className="input-label">GitHub Repository URL</label>
            <input 
              type="url" 
              value={repoLink}
              onChange={(e) => setRepoLink(e.target.value)}
              placeholder="https://github.com/username/repo"
              className="repo-input"
              required
              disabled={isDeploying}
            />
          </div>
          
          <button 
            type="submit" 
            className="deploy-button"
            disabled={isDeploying || !repoLink}
          >
            {isDeploying && projectId ? `${status} (${projectId})` : status}
          </button>
        </form>
      </div>

      {/* Second Card: Deployment Status (Only shows when deployed) */}
      {deployedUrl && (
        <div className="card mt-4">
          <h1 className="title">Deployment Status</h1>
          <p className="subtitle">Your website is successfully deployed!</p>
          
          <div className="input-group">
            <label className="input-label">Deployed URL</label>
            <input 
              type="text" 
              value={deployedUrl}
              readOnly
              className="url-input"
            />
          </div>
          
          <a href={deployedUrl} target="_blank" rel="noopener noreferrer" className="visit-button">
            Visit Website
          </a>
        </div>
      )}
    </div>
  );
}

export default App;
