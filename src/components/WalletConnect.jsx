import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/contract';

// L'adresse de l'administrateur (celle qui a déployé le contrat)
const ADMIN_ADDRESS = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

/**
 * Composant pour la connexion au portefeuille MetaMask
 * @param {Object} props - Les propriétés du composant
 * @param {Function} props.onConnect - Fonction appelée lorsque le portefeuille est connecté
 */
const WalletConnect = ({ onConnect }) => {
  const [account, setAccount] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);
  const [provider, setProvider] = useState(null);
  const [error, setError] = useState('');

  // Vérifier si MetaMask est installé et se connecter au changement de compte
  useEffect(() => {
    const checkMetaMask = async () => {
      try {
        // Vérifier si window.ethereum existe (MetaMask ou autre portefeuille compatible)
        if (window.ethereum) {
          // Créer un fournisseur ethers avec window.ethereum
          const ethersProvider = new ethers.BrowserProvider(window.ethereum);
          setProvider(ethersProvider);

          // Écouter les changements de compte
          window.ethereum.on('accountsChanged', handleAccountsChanged);
          
          // Vérifier si déjà connecté
          const accounts = await ethersProvider.listAccounts();
          if (accounts.length > 0) {
            handleAccountsChanged(accounts);
          }
        } else {
          setError('Veuillez installer MetaMask pour utiliser cette application');
        }
      } catch (err) {
        console.error('Erreur lors de la vérification de MetaMask:', err);
        setError('Erreur lors de la connexion à MetaMask');
      }
    };

    checkMetaMask();

    // Nettoyer les écouteurs d'événements
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  // Vérifier si le compte est un administrateur
  const checkIfAdmin = async (account) => {
    try {
      if (account) {
        // Comparer directement l'adresse du compte avec l'adresse de l'administrateur (insensible à la casse)
        const isAdmin = account.toLowerCase() === ADMIN_ADDRESS.toLowerCase();
        console.log('Vérification du statut admin - Compte:', account, 'Est admin:', isAdmin);
        setIsAdmin(isAdmin);
        return isAdmin;
      }
      return false;
    } catch (err) {
      console.error('Erreur lors de la vérification du statut d\'administrateur:', err);
      return false;
    }
  };

  // Gérer le changement de compte
  const handleAccountsChanged = async (accounts) => {
    console.log('Changement de compte détecté:', accounts);
    
    if (accounts.length === 0) {
      // Déconnexion détectée
      setAccount('');
      setIsAdmin(false);
      setError('Veuillez vous connecter à MetaMask');
      
      // Réinitialiser l'état global
      if (onConnect) {
        onConnect(null, null);
      }
    } else {
      // Normaliser le format du compte (certaines versions de MetaMask renvoient un objet, d'autres une chaîne)
      const currentAccount = typeof accounts[0] === 'object' && accounts[0].address 
        ? accounts[0].address 
        : accounts[0];
      
      console.log('Compte actuel:', currentAccount);
      
      // Mettre à jour l'état local
      setAccount(currentAccount);
      setError('');
      
      // Recréer le provider pour s'assurer qu'il est à jour avec le compte actuel
      try {
        const ethersProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(ethersProvider);
        
        // Vérifier si le compte est un administrateur
        await checkIfAdmin(currentAccount);
        
        // Appeler la fonction de callback avec le compte et le fournisseur
        if (onConnect) {
          onConnect(currentAccount, ethersProvider);
        }
      } catch (err) {
        console.error('Erreur lors de la mise à jour du provider:', err);
        setError('Erreur lors du changement de compte');
      }
    }
  };

  // Fonction pour se connecter à MetaMask
  const connectWallet = async () => {
    try {
      if (!window.ethereum) {
        setError('Veuillez installer MetaMask pour utiliser cette application');
        return;
      }

      setError('');
      
      // Réinitialiser le provider pour s'assurer d'avoir une connexion propre
      const ethersProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(ethersProvider);
      
      // Demander l'accès aux comptes
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      console.log('Comptes obtenus lors de la connexion:', accounts);
      
      // Gérer le changement de compte
      if (accounts && accounts.length > 0) {
        handleAccountsChanged(accounts);
      } else {
        setError('Aucun compte disponible dans MetaMask');
      }
    } catch (err) {
      console.error('Erreur lors de la connexion au portefeuille:', err);
      if (err.code === 4001) {
        // L'utilisateur a refusé la connexion
        setError("Connexion refusée par l'utilisateur");
      } else {
        setError('Erreur lors de la connexion au portefeuille');
      }
    }
  };
  
  // Fonction pour se déconnecter
  const disconnectWallet = () => {
    setAccount('');
    setIsAdmin(false);
    
    // Réinitialiser l'état global
    if (onConnect) {
      onConnect(null, null);
    }
  };

  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-100">
      {!account ? (
        <div className="flex flex-col items-center space-y-4">
          <button 
            onClick={connectWallet} 
            className="btn btn-primary flex items-center justify-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M17.778 8.222c-4.296-4.296-11.26-4.296-15.556 0A1 1 0 01.808 6.808c5.076-5.077 13.308-5.077 18.384 0a1 1 0 01-1.414 1.414zM14.95 11.05a7 7 0 00-9.9 0 1 1 0 01-1.414-1.414 9 9 0 0112.728 0 1 1 0 01-1.414 1.414zM12.12 13.88a3 3 0 00-4.242 0 1 1 0 01-1.415-1.415 5 5 0 017.072 0 1 1 0 01-1.415 1.415zM9 16a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
            </svg>
            Connecter avec MetaMask
          </button>
          {error && (
            <p className="text-red-600 text-sm bg-red-50 p-3 rounded-md w-full text-center">
              {error}
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
              {account.substring(2, 4)}
            </div>
            <div>
              <p className="text-gray-700 font-medium text-sm">Compte connecté</p>
              <p className="text-gray-500 text-xs font-mono">
                {account.substring(0, 6)}...{account.substring(account.length - 4)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isAdmin && (
              <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-800 text-xs font-semibold rounded-full mr-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span>Administrateur</span>
              </div>
            )}
            <button 
              onClick={disconnectWallet}
              className="px-3 py-1 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium rounded-md transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Déconnecter
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletConnect;
