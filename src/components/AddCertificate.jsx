import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ADDRESS, CONTRACT_ABI } from '../utils/contract';
import { uploadToIPFS } from '../utils/ipfs';

/**
 * Composant pour ajouter un nouveau certificat de diplôme
 * @param {Object} props - Les propriétés du composant
 * @param {string} props.account - L'adresse du compte connecté
 * @param {Object} props.provider - Le fournisseur ethers.js
 */
const AddCertificate = ({ account, provider }) => {
  const [studentName, setStudentName] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [graduationDate, setGraduationDate] = useState('');
  const [studentAddress, setStudentAddress] = useState('');
  const [file, setFile] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [contract, setContract] = useState(null);
  const [accountType, setAccountType] = useState(''); // 'admin' ou 'student'

  // Initialiser le contrat et vérifier si l'utilisateur est administrateur
  useEffect(() => {
    const initContract = async () => {
      if (provider && account) {
        try {
          const signer = await provider.getSigner();
          const diplomaContract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
          setContract(diplomaContract);
          
          // Vérifier si l'utilisateur est administrateur
          const adminStatus = await diplomaContract.isAdmin();
          setIsAdmin(adminStatus);
          
          // Définir le type de compte
          if (adminStatus) {
            setAccountType('admin');
          } else {
            // Vérifier si l'adresse a un certificat
            const cert = await diplomaContract.getCertificate(account);
            if (cert[4]) { // cert[4] est le booléen 'exists'
              setAccountType('student');
            } else {
              setAccountType('unknown');
            }
          }
        } catch (err) {
          console.error('Erreur lors de l\'initialisation du contrat:', err);
          setError('Erreur lors de la connexion au contrat intelligent');
        }
      }
    };

    initContract();
  }, [provider, account]);

  // Gérer le changement de fichier
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      // Vérifier le type de fichier (PDF ou image)
      if (selectedFile.type.startsWith('application/pdf') || 
          selectedFile.type.startsWith('image/')) {
        setFile(selectedFile);
        setError('');
      } else {
        setFile(null);
        setError('Veuillez sélectionner un fichier PDF ou une image');
      }
    }
  };

  // Vérifier si une adresse a déjà un certificat
  const checkAddressHasCertificate = async (address) => {
    try {
      const cert = await contract.getCertificate(address);
      return cert[4]; // cert[4] est le booléen 'exists'
    } catch (err) {
      console.error('Erreur lors de la vérification du certificat:', err);
      return false;
    }
  };

  // Soumettre le formulaire pour ajouter un certificat
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Réinitialiser les messages
    setError('');
    setSuccess('');
    
    // Vérifier que tous les champs sont remplis
    if (!studentName || !specialization || !graduationDate || !studentAddress || !file) {
      setError('Veuillez remplir tous les champs et sélectionner un fichier');
      return;
    }
    
    // Vérifier que l'adresse Ethereum est valide
    if (!ethers.isAddress(studentAddress)) {
      setError('Adresse Ethereum invalide');
      return;
    }
    
    // Vérifier que l'utilisateur est administrateur
    if (!isAdmin) {
      setError('Vous devez être administrateur pour ajouter un certificat');
      return;
    }
    
    // Vérifier si l'adresse a déjà un certificat
    const hasCertificate = await checkAddressHasCertificate(studentAddress);
    if (hasCertificate) {
      setError('Un certificat existe déjà pour cette adresse. Impossible d\'ajouter un nouveau certificat.');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Convertir la date en timestamp Unix
      const dateTimestamp = Math.floor(new Date(graduationDate).getTime() / 1000);
      
      // Télécharger le fichier sur IPFS
      const ipfsHash = await uploadToIPFS(file);
      console.log('Fichier téléchargé sur IPFS avec le hash:', ipfsHash);
      
      // Ajouter le certificat au contrat
      const tx = await contract.addCertificate(
        studentAddress,
        studentName,
        specialization,
        dateTimestamp,
        ipfsHash
      );
      
      // Attendre la confirmation de la transaction
      await tx.wait();
      
      // Réinitialiser le formulaire
      setStudentName('');
      setSpecialization('');
      setGraduationDate('');
      setStudentAddress('');
      setFile(null);
      
      setSuccess('Certificat ajouté avec succès !');
    } catch (err) {
      console.error('Erreur lors de l\'ajout du certificat:', err);
      
      // Gérer spécifiquement l'erreur d'adresse existante
      if (err.message && err.message.includes('Un certificat existe deja pour cette adresse')) {
        setError('Un certificat existe déjà pour cette adresse. Impossible d\'ajouter un nouveau certificat.');
      } else {
        setError('Erreur lors de l\'ajout du certificat: ' + (err.message || err));
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Si l'utilisateur n'est pas connecté, afficher un message
  if (!account) {
    return (
      <div className="card max-w-2xl mx-auto my-8 bg-gray-50">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ajouter un Certificat de Diplôme</h2>
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <p className="text-gray-600 mb-6">Veuillez vous connecter avec MetaMask pour ajouter un certificat.</p>
          <button className="btn btn-primary" disabled>
            Connectez-vous d'abord
          </button>
        </div>
      </div>
    );
  }

  // Si l'utilisateur n'est pas administrateur, afficher un message
  if (account && !isAdmin) {
    return (
      <div className="card max-w-2xl mx-auto my-8 bg-gray-50">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Ajouter un Certificat de Diplôme</h2>
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          </div>
          <p className="text-gray-600 mb-2">Accès restreint</p>
          <p className="text-gray-500 text-sm mb-6">Seul l'administrateur peut ajouter des certificats.</p>
          
          {/* Afficher le type de compte */}
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-700">
              <strong>Type de compte :</strong> {accountType === 'student' ? 'Étudiant' : 'Non enregistré'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto my-8">
      <div className="card">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Ajouter un Certificat de Diplôme</h2>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          </div>
        )}
        
        {success && (
          <div className="bg-green-50 text-green-600 p-4 rounded-lg mb-6">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="studentName" className="block text-sm font-medium text-gray-700">Nom de l'étudiant</label>
              <input
                type="text"
                id="studentName"
                className="block w-full p-2 pl-10 text-sm text-gray-700 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">Spécialité</label>
              <input
                type="text"
                id="specialization"
                className="block w-full p-2 pl-10 text-sm text-gray-700 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary"
                value={specialization}
                onChange={(e) => setSpecialization(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="graduationDate" className="block text-sm font-medium text-gray-700">Date d'obtention</label>
              <input
                type="date"
                id="graduationDate"
                className="block w-full p-2 pl-10 text-sm text-gray-700 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary"
                value={graduationDate}
                onChange={(e) => setGraduationDate(e.target.value)}
                required
              />
            </div>
            
            <div>
              <label htmlFor="studentAddress" className="block text-sm font-medium text-gray-700">Adresse Ethereum de l'étudiant</label>
              <input
                type="text"
                id="studentAddress"
                className="block w-full p-2 pl-10 text-sm text-gray-700 rounded-lg border border-gray-300 focus:ring-primary focus:border-primary"
                value={studentAddress}
                onChange={(e) => setStudentAddress(e.target.value)}
                placeholder="0x..."
                required
              />
            </div>
          </div>
          
          <div>
            <label htmlFor="certificateFile" className="block text-sm font-medium text-gray-700">Fichier du diplôme (PDF ou image)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md hover:border-primary transition-colors duration-200">
              <div className="space-y-1 text-center">
                {file ? (
                  <div className="flex flex-col items-center">
                    <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-sm text-gray-600 mt-2">{file.name} ({(file.size / 1024).toFixed(2)} KB)</p>
                    <button 
                      type="button" 
                      className="text-xs text-red-500 mt-2"
                      onClick={() => setFile(null)}
                    >
                      Supprimer
                    </button>
                  </div>
                ) : (
                  <>
                    <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <div className="flex text-sm text-gray-600">
                      <label htmlFor="certificateFile" className="relative cursor-pointer bg-white rounded-md font-medium text-primary hover:text-primary-dark focus-within:outline-none">
                        <span>Choisir un fichier</span>
                        <input id="certificateFile" type="file" className="sr-only" onChange={handleFileChange} accept=".pdf,image/*" required />
                      </label>
                      <p className="pl-1">ou glisser-déposer</p>
                    </div>
                    <p className="text-xs text-gray-500">PDF ou images jusqu'à 10MB</p>
                  </>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex justify-center pt-4">
            <button 
              type="submit" 
              disabled={isLoading} 
              className={`btn btn-primary py-3 px-8 flex items-center gap-2 ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Traitement en cours...
                </>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Ajouter le Certificat
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddCertificate;
