import React, { useState } from 'react';
import './App.css';
import WalletConnect from './components/WalletConnect';
import AddCertificate from './components/AddCertificate';
import ViewCertificate from './components/ViewCertificate';

function App() {
  const [account, setAccount] = useState('');
  const [provider, setProvider] = useState(null);
  const [activeTab, setActiveTab] = useState('view'); // 'view' ou 'add'

  // Fonction appelée lorsque le portefeuille est connecté
  const handleConnect = (connectedAccount, ethersProvider) => {
    setAccount(connectedAccount);
    setProvider(ethersProvider);
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Certification de Diplômes</h1>
        <WalletConnect onConnect={handleConnect} />
      </header>

      <main className="App-main">
        <div className="tabs">
          <button 
            className={`tab-button ${activeTab === 'view' ? 'active' : ''}`}
            onClick={() => setActiveTab('view')}
          >
            Consulter un Diplôme
          </button>
          <button 
            className={`tab-button ${activeTab === 'add' ? 'active' : ''}`}
            onClick={() => setActiveTab('add')}
          >
            Ajouter un Diplôme
          </button>
        </div>

        <div className="tab-content">
          {activeTab === 'view' ? (
            <ViewCertificate provider={provider} />
          ) : (
            <AddCertificate account={account} provider={provider} />
          )}
        </div>
      </main>

      <footer className="App-footer">
        <p>Certification de Diplômes &copy; {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

export default App;
