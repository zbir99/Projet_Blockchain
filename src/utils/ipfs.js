/**
 * Client IPFS simple pour IPFS Desktop
 * Basé sur notre script de test qui fonctionne
 */
import { create } from 'ipfs-http-client';

// Créer une instance du client IPFS
const ipfs = create({
  host: 'localhost',
  port: 5001,
  protocol: 'http'
});

// Test de la connexion immédiatement
const testConnection = async () => {
  try {
    const version = await ipfs.version();
    console.log('✅ IPFS Desktop connecté, version:', version.version);
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à IPFS Desktop:', error.message);
    console.log('🔧 Solutions:');
    console.log('1. Vérifiez que IPFS Desktop est démarré');
    console.log('2. Vérifiez CORS dans les paramètres');
    return false;
  }
};

// Exécuter le test immédiatement
testConnection();

/**
 * Upload un fichier sur IPFS
 * @param {File} file - Le fichier à uploader
 * @returns {Promise<string>} - Le CID (hash) du fichier
 */
export const uploadToIPFS = async (file) => {
  if (!file) {
    throw new Error('Aucun fichier fourni');
  }

  console.log('📤 Upload sur IPFS Desktop...');
  console.log('📄 Fichier:', file.name, '(' + (file.size / 1024).toFixed(2) + ' KB)');

  try {
    // Convertir en Uint8Array (nécessaire pour ipfs.add)
    const arrayBuffer = await file.arrayBuffer();
    const content = new Uint8Array(arrayBuffer);

    // Upload du fichier
    const result = await ipfs.add({
      path: file.name, 
      content: content
    });
    
    const hash = result.cid.toString();
    console.log('✅ Upload réussi:', hash);
    return hash;
    
  } catch (error) {
    console.error('❌ Erreur upload:', error.message);
    throw new Error(`Erreur upload IPFS: ${error.message}`);
  }
};

/**
 * Génère l'URL pour accéder au fichier sur IPFS
 * @param {string} ipfsHash - Le hash IPFS
 * @returns {string} - L'URL complète
 */
export const getIPFSGatewayURL = (ipfsHash) => {
  if (!ipfsHash) return '';
  return `http://localhost:8080/ipfs/${ipfsHash}`;
};

export default {
  uploadToIPFS,
  getIPFSGatewayURL
};
