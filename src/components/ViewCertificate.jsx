import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/contract';
import { getIPFSGatewayURL } from '../utils/ipfs';

/**
 * Composant pour consulter un certificat de diplôme
 * @param {Object} props - Les propriétés du composant
 * @param {Object} props.provider - Le fournisseur ethers.js
 */
const ViewCertificate = ({ provider }) => {
  const [studentAddress, setStudentAddress] = useState('');
  const [certificate, setCertificate] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [contract, setContract] = useState(null);
  const [accountType, setAccountType] = useState(''); // 'admin' ou 'student'

  // Initialiser le contrat
  useEffect(() => {
    const initContract = async () => {
      if (provider) {
        try {
          const diplomaContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
          setContract(diplomaContract);
        } catch (err) {
          console.error('Erreur lors de l\'initialisation du contrat:', err);
          setError('Erreur lors de la connexion au contrat intelligent');
        }
      }
    };

    initContract();
  }, [provider]);

  // Formater la date depuis un timestamp Unix
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    // Convertir explicitement BigInt en Number pour éviter l'erreur de mélange de types
    const timestampNumber = typeof timestamp === 'bigint' ? Number(timestamp) : timestamp;
    const date = new Date(timestampNumber * 1000);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Déterminer le type de compte
  const determineAccountType = async (address) => {
    try {
      // Vérifier si l'adresse est un administrateur
      const isAdminAccount = await contract.isAdmin({ from: address });
      if (isAdminAccount) {
        return 'admin';
      }
      
      // Vérifier si l'adresse a un certificat
      const cert = await contract.getCertificate(address);
      if (cert[4]) { // cert[4] est le booléen 'exists'
        return 'student';
      }
      
      return 'unknown';
    } catch (err) {
      console.error('Erreur lors de la détermination du type de compte:', err);
      return 'unknown';
    }
  };

  // Rechercher un certificat
  const searchCertificate = async (e) => {
    e.preventDefault();
    
    // Réinitialiser les états
    setError('');
    setCertificate(null);
    setAccountType('');
    
    // Vérifier que l'adresse est valide
    if (!ethers.isAddress(studentAddress)) {
      setError('Adresse Ethereum invalide');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Déterminer le type de compte
      const type = await determineAccountType(studentAddress);
      setAccountType(type);
      
      // Appeler le contrat pour obtenir les informations du certificat
      const result = await contract.getCertificate(studentAddress);
      
      // Vérifier si le certificat existe
      if (!result[4]) { // Le 5ème élément (index 4) est le booléen 'exists'
        setError('Aucun certificat trouvé pour cette adresse');
        setCertificate(null);
      } else {
        // Formater les données du certificat
        setCertificate({
          studentName: result[0],
          specialization: result[1],
          date: result[2],
          ipfsHash: result[3],
          exists: result[4]
        });
      }
    } catch (err) {
      console.error('Erreur lors de la recherche du certificat:', err);
      setError('Erreur lors de la recherche du certificat: ' + (err.message || err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="view-certificate">
      <h2>Consulter un Certificat de Diplôme</h2>
      
      <form onSubmit={searchCertificate}>
        <div className="form-group">
          <label htmlFor="searchAddress">Adresse Ethereum de l'étudiant:</label>
          <input
            type="text"
            id="searchAddress"
            value={studentAddress}
            onChange={(e) => setStudentAddress(e.target.value)}
            placeholder="0x..."
            required
          />
        </div>
        
        <button type="submit" disabled={isLoading || !contract} className="search-button">
          {isLoading ? 'Recherche en cours...' : 'Rechercher'}
        </button>
      </form>
      
      {error && <div className="error-message">{error}</div>}
      
      {certificate && (
        <div className="certificate-details">
          <h3>Certificat trouvé</h3>
          
          <div className="certificate-info">
            <p><strong>Nom de l'étudiant:</strong> {certificate.studentName}</p>
            <p><strong>Spécialité:</strong> {certificate.specialization}</p>
            <p><strong>Date d'obtention:</strong> {formatDate(certificate.date)}</p>
            <p><strong>Type de compte:</strong> 
              <span className={`${accountType === 'admin' ? 'text-red-600 font-bold' : 'text-green-600'}`}>
                {accountType === 'admin' ? 'Administrateur' : accountType === 'student' ? 'Étudiant' : 'Non enregistré'}
              </span>
            </p>
            
            <div className="certificate-document">
              <p><strong>Document du diplôme:</strong></p>
              {certificate.ipfsHash && (
                <div>
                  {/* Utiliser un bouton qui ouvre le document dans une nouvelle fenêtre */}
                  <button 
                    onClick={() => {
                      const url = getIPFSGatewayURL(certificate.ipfsHash);
                      if (url) {
                        // Ouvrir dans une nouvelle fenêtre
                        window.open(url, '_blank');
                      } else {
                        alert('Le document n\'est pas disponible.');
                      }
                    }} 
                    className="document-link"
                  >
                    Voir le document
                  </button>
                  <p className="ipfs-hash">
                    <small>Identifiant du document: {certificate.ipfsHash}</small>
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ViewCertificate;
