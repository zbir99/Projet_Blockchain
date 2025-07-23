/**
 * Service IPFS pour IPFS Desktop
 * Optimisé pour fonctionner avec votre configuration
 */
import { create } from 'ipfs-http-client';

class IPFSService {
  constructor() {
    this.client = null;
    this.isConnected = false;
    this.serviceName = 'IPFS Desktop';
    this.initialize();
  }

  /**
   * Initialise la connexion IPFS Desktop
   */
  async initialize() {
    try {
      // Configuration pour IPFS Desktop
      this.client = create({
        host: 'localhost',
        port: 5001,
        protocol: 'http'
      });

      // Tester la connexion
      const version = await this.client.version();
      this.isConnected = true;
      
      console.log('✅ IPFS Desktop connecté avec succès!');
      console.log('📦 Version IPFS:', version.version);
      console.log('🔍 Service:', this.serviceName);
      
    } catch (error) {
      console.error('❌ Connexion échouée à IPFS Desktop:', error.message);
      console.log('🔧 Solutions possibles:');
      console.log('1. Vérifiez que IPFS Desktop est démarré');
      console.log('2. Vérifiez la configuration CORS dans les paramètres de IPFS Desktop');
      console.log('3. Redémarrez IPFS Desktop');
      
      this.isConnected = false;
    }
  }

  /**
   * Vérifie la connexion à IPFS Desktop
   */
  async checkConnection() {
    try {
      if (!this.client) {
        await this.initialize();
      }

      const version = await this.client.version();
      this.isConnected = true;
      return true;
      
    } catch (error) {
      console.error('❌ IPFS Desktop non accessible:', error.message);
      this.isConnected = false;
      return false;
    }
  }

  /**
   * Upload un fichier sur IPFS Desktop
   * @param {File} file - Le fichier à uploader
   * @returns {Promise<string>} - Le hash IPFS
   */
  async uploadFile(file) {
    if (!file) {
      throw new Error('Aucun fichier fourni');
    }

    console.log('📤 Upload sur IPFS Desktop...');
    console.log('📄 Fichier:', file.name);
    console.log('📊 Taille:', (file.size / 1024 / 1024).toFixed(2), 'MB');

    // Vérifier la connexion
    const isConnected = await this.checkConnection();
    if (!isConnected) {
      throw new Error('IPFS Desktop non disponible. Vérifiez qu\'il est bien démarré.');
    }

    try {
      // Convertir le fichier en ArrayBuffer puis Uint8Array
      const arrayBuffer = await file.arrayBuffer();
      const fileContent = new Uint8Array(arrayBuffer);

      console.log('⏳ Upload en cours...');

      // Upload sur IPFS avec gestion du progrès
      const result = await this.client.add({
        path: file.name,
        content: fileContent
      }, {
        pin: true, // Épingler pour éviter la suppression
        progress: (bytes) => {
          const percent = ((bytes / file.size) * 100).toFixed(1);
          console.log(`📊 Progression: ${percent}% (${bytes}/${file.size} bytes)`);
        }
      });

      const ipfsHash = result.cid.toString();
      
      console.log('✅ Upload réussi sur IPFS Desktop!');
      console.log('🔗 Hash IPFS:', ipfsHash);
      console.log('🌐 URL:', this.getGatewayURL(ipfsHash));

      // Vérifier que le fichier est accessible
      setTimeout(async () => {
        try {
          const isAccessible = await this.verifyFileAccess(ipfsHash);
          console.log(isAccessible ? '✅ Fichier accessible via gateway' : '⚠️ Fichier pas encore accessible');
        } catch (error) {
          console.warn('⚠️ Vérification d\'accès échouée:', error.message);
        }
      }, 1000);

      return ipfsHash;

    } catch (error) {
      console.error('❌ Erreur upload sur IPFS Desktop:', error);
      
      // Messages d'erreur spécifiques
      if (error.code === 'ECONNREFUSED') {
        throw new Error('IPFS Desktop non accessible. Vérifiez qu\'il est bien démarré.');
      } else if (error.message.includes('fetch') || error.message.includes('CORS')) {
        throw new Error('Erreur CORS. Vérifiez la configuration CORS dans les paramètres de IPFS Desktop.');
      } else {
        throw new Error(`Erreur upload: ${error.message}`);
      }
    }
  }

  /**
   * Upload des données JSON sur IPFS Desktop
   * @param {Object} data - Les données à uploader
   * @returns {Promise<string>} - Le hash IPFS
   */
  async uploadJSON(data) {
    console.log('📤 Upload JSON sur IPFS Desktop...');
    console.log('📄 Données:', data);
    
    const isConnected = await this.checkConnection();
    if (!isConnected) {
      throw new Error('IPFS Desktop non disponible');
    }

    try {
      const jsonString = JSON.stringify(data, null, 2);
      console.log('📝 JSON formaté:', jsonString.length, 'caractères');

      const result = await this.client.add(jsonString, { 
        pin: true,
        timeout: 10000 // 10 secondes de timeout
      });
      
      const ipfsHash = result.cid.toString();
      console.log('✅ JSON uploadé avec succès!');
      console.log('🔗 Hash IPFS:', ipfsHash);
      
      return ipfsHash;

    } catch (error) {
      console.error('❌ Erreur upload JSON:', error);
      throw new Error(`Erreur upload JSON sur IPFS Desktop: ${error.message}`);
    }
  }

  /**
   * Vérifie qu'un fichier est accessible via la gateway
   * @param {string} ipfsHash - Le hash IPFS
   * @returns {Promise<boolean>} - True si accessible
   */
  async verifyFileAccess(ipfsHash) {
    try {
      const url = this.getGatewayURL(ipfsHash);
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, { 
        method: 'HEAD',
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * URL de la gateway IPFS pour IPFS Desktop
   * @param {string} ipfsHash - Le hash IPFS
   * @returns {string} - L'URL complète
   */
  getGatewayURL(ipfsHash) {
    if (!ipfsHash) return '';
    return `http://localhost:8080/ipfs/${ipfsHash}`;
  }

  /**
   * Informations sur un fichier IPFS
   * @param {string} ipfsHash - Le hash IPFS
   * @returns {Promise<Object>} - Les informations du fichier
   */
  async getFileInfo(ipfsHash) {
    if (!this.isConnected) {
      throw new Error('IPFS Desktop non connecté');
    }

    try {
      // Essayer de récupérer les stats via l'API
      const stats = await this.client.object.stat(ipfsHash);
      
      return {
        hash: ipfsHash,
        size: stats.CumulativeSize || stats.DataSize || 0,
        links: stats.NumLinks || 0,
        url: this.getGatewayURL(ipfsHash),
        accessible: true,
        service: this.serviceName
      };
    } catch (error) {
      return {
        hash: ipfsHash,
        size: 0,
        links: 0,
        url: this.getGatewayURL(ipfsHash),
        accessible: false,
        error: error.message,
        service: this.serviceName
      };
    }
  }

  /**
   * Statut du service IPFS Desktop
   * @returns {Object} - Informations détaillées
   */
  getStatus() {
    return {
      connected: this.isConnected,
      service: this.serviceName,
      type: 'Desktop',
      host: 'localhost',
      apiPort: 5001,
      gatewayPort: 8080,
      protocol: 'http',
      apiUrl: 'http://localhost:5001',
      gatewayUrl: 'http://localhost:8080',
      webuiUrl: 'http://localhost:5001/webui'
    };
  }

  /**
   * Diagnostic complet de IPFS Desktop
   * @returns {Promise<Object>} - Résultats des tests
   */
  async runDiagnostics() {
    console.log('🔍 Diagnostic de IPFS Desktop...');
    const results = {
      service: this.serviceName,
      api: false,
      gateway: false,
      upload: false,
      version: null,
      errors: []
    };

    try {
      // Test API
      const version = await this.client.version();
      results.api = true;
      results.version = version.version;
      console.log('✅ API IPFS Desktop accessible');
      
    } catch (error) {
      results.errors.push(`API: ${error.message}`);
      console.error('❌ API IPFS Desktop non accessible');
    }

    try {
      // Test Gateway
      const response = await fetch('http://localhost:8080/ipfs/QmUNLLsPACCz1vLxQVkXqqLX5R1X345qqfHbsf67hvA3Nn');
      results.gateway = response.ok;
      console.log(results.gateway ? '✅ Gateway accessible' : '❌ Gateway non accessible');
      
    } catch (error) {
      results.errors.push(`Gateway: ${error.message}`);
    }

    try {
      // Test Upload
      const testData = `Test IPFS Desktop ${new Date().toISOString()}`;
      const result = await this.client.add(testData);
      results.upload = true;
      console.log('✅ Upload fonctionnel:', result.cid.toString());
      
    } catch (error) {
      results.errors.push(`Upload: ${error.message}`);
    }

    return results;
  }
}

// Instance unique du service
const ipfsService = new IPFSService();

// Exports pour compatibilité
export const uploadToIPFS = (file) => ipfsService.uploadFile(file);
export const getIPFSGatewayURL = (hash) => ipfsService.getGatewayURL(hash);

export default ipfsService;
