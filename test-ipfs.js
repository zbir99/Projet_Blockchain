// Test simple de connexion à IPFS Desktop
const { create } = require('ipfs-http-client');

async function testIPFSConnection() {
  try {
    console.log('Tentative de connexion à IPFS Desktop...');
    
    // Configuration de connexion à IPFS Desktop
    const ipfs = create({
      host: 'localhost',
      port: 5001,
      protocol: 'http'
    });
    
    // Test de l'API en récupérant la version
    const version = await ipfs.version();
    console.log('✅ Connexion réussie!');
    console.log('Version IPFS:', version.version);
    
    // Test supplémentaire - ajout de données
    const testData = `Test IPFS ${new Date().toISOString()}`;
    const result = await ipfs.add(testData);
    console.log('✅ Test d\'ajout réussi!');
    console.log('Hash IPFS:', result.cid.toString());
    console.log('URL Gateway:', `http://localhost:8080/ipfs/${result.cid.toString()}`);
    
    return true;
  } catch (error) {
    console.error('❌ Erreur de connexion à IPFS Desktop:', error.message);
    console.log('Informations de débogage:');
    console.log('- Type d\'erreur:', error.name);
    console.log('- Code:', error.code);
    console.log('- Stack:', error.stack);
    return false;
  }
}

// Exécuter le test
testIPFSConnection().then(success => {
  console.log(success ? 'Test terminé avec succès' : 'Test échoué');
});
