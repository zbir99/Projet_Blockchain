// Script de déploiement du contrat Diploma
const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  console.log("Déploiement du contrat Diploma...");

  // Déploiement du contrat
  const Diploma = await hre.ethers.getContractFactory("Diploma");
  const diploma = await Diploma.deploy();

  await diploma.waitForDeployment();

  const contractAddress = await diploma.getAddress();
  console.log(`Contrat Diploma déployé à l'adresse: ${contractAddress}`);

  // Création du fichier .env avec l'adresse du contrat
  const envContent = `REACT_APP_CONTRACT_ADDRESS=${contractAddress}\n`;
  
  // Chemin vers le fichier .env dans le répertoire racine du projet
  const envPath = path.join(__dirname, "..", ".env");
  
  // Écriture du fichier .env
  fs.writeFileSync(envPath, envContent);
  console.log(`Adresse du contrat enregistrée dans le fichier .env`);
  
  // Création du fichier de configuration pour le frontend
  const configContent = `
export const CONTRACT_ADDRESS = "${contractAddress}";
export const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "studentAddress",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "studentName",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "specialization",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "date",
        "type": "uint256"
      }
    ],
    "name": "CertificateAdded",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "studentAddress",
        "type": "address"
      },
      {
        "internalType": "string",
        "name": "studentName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "specialization",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "date",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "ipfsHash",
        "type": "string"
      }
    ],
    "name": "addCertificate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "studentAddress",
        "type": "address"
      }
    ],
    "name": "getCertificate",
    "outputs": [
      {
        "internalType": "string",
        "name": "studentName",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "specialization",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "date",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "ipfsHash",
        "type": "string"
      },
      {
        "internalType": "bool",
        "name": "exists",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "isAdmin",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
];
  `;
  
  // Création du répertoire src/utils s'il n'existe pas
  const configDir = path.join(__dirname, "..", "src", "utils");
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  // Chemin vers le fichier de configuration
  const configPath = path.join(configDir, "contract.js");
  
  // Écriture du fichier de configuration
  fs.writeFileSync(configPath, configContent);
  console.log(`Configuration du contrat enregistrée dans ${configPath}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
