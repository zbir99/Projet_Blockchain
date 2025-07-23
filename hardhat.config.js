/** @type import('hardhat/config').HardhatUserConfig */
require('@nomicfoundation/hardhat-toolbox');

// Configuration pour le développement local et le déploiement
module.exports = {
  solidity: "0.8.20",
  networks: {
    // Configuration du réseau local Hardhat
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,
    },
  },
  paths: {
    artifacts: './src/artifacts',
  },
};
