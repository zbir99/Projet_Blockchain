# 🎓 Certification de Diplômes sur Blockchain

## 📋 Description du Projet

Cette application décentralisée (DApp) révolutionne la certification et la vérification des diplômes en utilisant la technologie blockchain. Elle permet aux institutions éducatives d'émettre des certificats numériques infalsifiables et aux employeurs de vérifier instantanément l'authenticité des diplômes.

### 🎯 Problématique Résolue

- **Fraude documentaire** : Élimination des faux diplômes grâce à l'immutabilité de la blockchain
- **Processus de vérification lents** : Vérification instantanée des certificats
- **Centralisation des données** : Système décentralisé résistant aux pannes
- **Coûts de vérification** : Réduction drastique des coûts administratifs

## 🏗️ Architecture et Stack Technologique

### Frontend
- **React 19.1.0** : Interface utilisateur moderne et réactive
- **Ethers.js 6.0** : Interaction avec la blockchain Ethereum
- **Tailwind CSS** : Framework CSS utilitaire pour le design
- **MetaMask** : Gestion des portefeuilles et signature des transactions

### Backend/Blockchain
- **Solidity 0.8.20** : Langage de programmation pour les smart contracts
- **Hardhat 2.24.1** : Environnement de développement Ethereum
- **Ethereum** : Blockchain pour l'exécution des smart contracts

### Stockage Décentralisé
- **IPFS (InterPlanetary File System)** : Stockage décentralisé des fichiers de diplômes
- **IPFS Desktop** : Interface locale pour interagir avec IPFS

### Outils de Développement
- **Node.js** : Environnement d'exécution JavaScript
- **npm** : Gestionnaire de paquets
- **dotenv** : Gestion des variables d'environnement

## 🔧 Fonctionnalités Principales

### Pour les Administrateurs (Universités)
- ✅ Connexion sécurisée via MetaMask
- ✅ Ajout de nouveaux certificats avec upload de fichiers
- ✅ Gestion des informations étudiants (nom, spécialisation, date)
- ✅ Interface dédiée avec badge administrateur
- ✅ Prévention des doublons (un certificat par adresse)

### Pour les Utilisateurs (Étudiants/Employeurs)
- ✅ Consultation publique des certificats (sans connexion requise)
- ✅ Vérification par adresse Ethereum
- ✅ Accès direct aux fichiers de diplômes via IPFS
- ✅ Affichage des détails complets du certificat

### Sécurité et Intégrité
- ✅ Smart contract avec modificateurs de sécurité
- ✅ Stockage immutable sur la blockchain
- ✅ Hachage cryptographique des fichiers (IPFS CID)
- ✅ Gestion des rôles (admin vs utilisateur)

## 🚀 Installation et Configuration

### Prérequis

1. **Node.js** (version 16 ou supérieure)
   ```bash
   node --version
   npm --version
   ```

2. **IPFS Desktop**
   - Télécharger depuis [ipfs.io](https://ipfs.io/)
   - Installer et lancer l'application
   - Vérifier que l'API est accessible sur `http://localhost:5001`

3. **MetaMask**
   - Installer l'extension de navigateur
   - Créer ou importer un portefeuille

### Installation du Projet

1. **Cloner le repository**
   ```bash
   git clone <url-du-repo>
   cd Certification-de-Diplomes
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration de l'environnement**
   ```bash
   cp .env.example .env
   ```
   Le fichier `.env` sera automatiquement mis à jour lors du déploiement.

## 🎮 Démarrage du Projet

### Étape 1 : Lancer IPFS Desktop

1. Ouvrir l'application IPFS Desktop
2. Vérifier que le statut est "En ligne"
3. S'assurer que l'API est accessible (port 5001)

### Étape 2 : Démarrer la Blockchain Locale

**Terminal 1 - Nœud Hardhat :**
```bash
npm run node
# ou
npx hardhat node
```

Cette commande :
- Lance une blockchain Ethereum locale sur `http://127.0.0.1:8545`
- Génère 20 comptes de test avec 10,000 ETH chacun
- Affiche les adresses et clés privées des comptes

⚠️ **Important** : Gardez ce terminal ouvert pendant toute la durée d'utilisation.

### Étape 3 : Déployer le Smart Contract

**Terminal 2 - Déploiement :**
```bash
npm run deploy
# ou
npx hardhat run scripts/deploy.js --network localhost
```

Cette commande :
- Compile le contrat `Diploma.sol`
- Le déploie sur la blockchain locale
- Met à jour automatiquement :
  - Le fichier `.env` avec l'adresse du contrat
  - Le fichier `src/utils/contract.js` avec l'ABI et l'adresse

### Étape 4 : Lancer l'Interface Utilisateur

**Terminal 3 - Frontend React :**
```bash
npm start
```

L'application sera accessible sur `http://localhost:3000`

### Étape 5 : Configuration de MetaMask

1. **Ajouter le réseau Hardhat :**
   - Nom du réseau : `Hardhat Local`
   - URL RPC : `http://127.0.0.1:8545`
   - ID de chaîne : `31337`
   - Symbole : `ETH`

2. **Importer le compte administrateur :**
   - Copier la clé privée du premier compte depuis le Terminal 1
   - Dans MetaMask : Importer un compte → Coller la clé privée
   - Ce compte aura les privilèges administrateur

## 📱 Utilisation de l'Application

### Interface Administrateur

1. **Connexion**
   - Cliquer sur "Connecter avec MetaMask"
   - Sélectionner le compte administrateur
   - Un badge "Administrateur" apparaît

2. **Ajout d'un Certificat**
   - Onglet "Ajouter un Certificat"
   - Remplir les informations :
     - Nom de l'étudiant
     - Spécialisation
     - Date de graduation
     - Adresse Ethereum de l'étudiant
     - Fichier du diplôme (PDF, image, etc.)
   - Cliquer sur "Ajouter le Certificat"
   - Confirmer la transaction dans MetaMask

### Interface de Consultation

1. **Vérification d'un Diplôme**
   - Onglet "Consulter un Certificat"
   - Saisir l'adresse Ethereum de l'étudiant
   - Cliquer sur "Rechercher"
   - Consulter les détails et télécharger le fichier

## 🔍 Architecture Technique Détaillée

### Smart Contract (`contracts/Diploma.sol`)

```solidity
struct Certificate {
    string studentName;      // Nom de l'étudiant
    string specialization;   // Spécialisation
    uint256 date;           // Date de graduation (timestamp)
    string ipfsHash;        // Hash IPFS du fichier
    bool exists;            // Indicateur d'existence
}
```

**Fonctions principales :**
- `addCertificate()` : Ajouter un nouveau certificat (admin uniquement)
- `getCertificate()` : Récupérer un certificat par adresse (public)
- `isAdmin()` : Vérifier si l'appelant est administrateur

### Flux de Données

1. **Ajout d'un Certificat :**
   ```
   Frontend → Upload fichier → IPFS → Récupération CID → Smart Contract → Blockchain
   ```

2. **Consultation d'un Certificat :**
   ```
   Frontend → Smart Contract → Récupération données → IPFS (via CID) → Affichage
   ```

### Composants React

- **`WalletConnect.jsx`** : Gestion de la connexion MetaMask
- **`AddCertificate.jsx`** : Interface d'ajout de certificats
- **`ViewCertificate.jsx`** : Interface de consultation
- **`App.js`** : Composant principal avec navigation

### Utilitaires

- **`src/utils/contract.js`** : Configuration du contrat (ABI + adresse)
- **`src/utils/ipfs.js`** : Client IPFS pour upload/download
- **`src/utils/ipfs-desktop.js`** : Configuration IPFS Desktop

## 🧪 Tests et Développement

### Scripts Disponibles

```bash
# Compilation du contrat
npm run compile

# Lancement du nœud local
npm run node

# Déploiement
npm run deploy

# Démarrage du frontend
npm start

# Build de production
npm run build

# Tests React
npm test
```

### Test de Connexion IPFS

```bash
node test-ipfs.js
```

Ce script vérifie :
- La connexion à IPFS Desktop
- L'upload d'un fichier de test
- La génération d'un CID valide

## 🔒 Sécurité

### Mesures Implémentées

1. **Smart Contract :**
   - Modificateur `onlyAdmin` pour les fonctions sensibles
   - Vérification d'existence avant ajout (pas de doublons)
   - Validation des données d'entrée

2. **Frontend :**
   - Validation côté client des formulaires
   - Gestion des erreurs de transaction
   - Vérification du statut administrateur

3. **IPFS :**
   - Adressage par contenu (CID)
   - Intégrité cryptographique des fichiers
   - Décentralisation du stockage

### Bonnes Pratiques

- ✅ Clés privées jamais exposées dans le code
- ✅ Variables d'environnement pour la configuration
- ✅ Gestion d'erreurs robuste
- ✅ Logs détaillés pour le débogage

### Déploiement

```bash
npx hardhat run scripts/deploy.js --network sepolia
```

## 🛠️ Dépannage

### Problèmes Courants

1. **"IPFS Desktop non connecté"**
   - Vérifier que IPFS Desktop est lancé
   - Contrôler l'API sur `http://localhost:5001`
   - Redémarrer IPFS Desktop si nécessaire

2. **"Transaction failed"**
   - Vérifier le solde ETH du compte
   - S'assurer que le nœud Hardhat est actif
   - Contrôler la configuration réseau dans MetaMask

3. **"Contract not deployed"**
   - Relancer le script de déploiement
   - Vérifier que le fichier `.env` contient l'adresse
   - Contrôler que `src/utils/contract.js` est à jour

4. **"Certificat déjà existant"**
   - Chaque adresse Ethereum ne peut avoir qu'un seul certificat
   - Utiliser une nouvelle adresse pour tester

### Logs de Débogage

Activer les logs détaillés :
```bash
DEBUG=* npm start
```

## 🤝 Contribution

### Structure du Projet

```
Certification-de-Diplomes/
├── contracts/              # Smart contracts Solidity
│   └── Diploma.sol
├── scripts/                # Scripts de déploiement
│   └── deploy.js
├── src/
│   ├── components/         # Composants React
│   │   ├── AddCertificate.jsx
│   │   ├── ViewCertificate.jsx
│   │   └── WalletConnect.jsx
│   ├── utils/              # Utilitaires
│   │   ├── contract.js     # Configuration contrat
│   │   ├── ipfs.js         # Client IPFS
│   │   └── ipfs-desktop.js
│   ├── App.js              # Composant principal
│   └── index.js            # Point d'entrée
├── public/                 # Fichiers statiques
├── hardhat.config.js       # Configuration Hardhat
├── package.json            # Dépendances et scripts
└── README.md              # Documentation
```

## 🔗 Liens Utiles

- [Documentation Hardhat](https://hardhat.org/docs)
- [Documentation Ethers.js](https://docs.ethers.io/)
- [Documentation IPFS](https://docs.ipfs.io/)
- [Documentation React](https://reactjs.org/docs)
- [Documentation Solidity](https://docs.soliditylang.org/)

---

**🎯 Vision :** Démocratiser l'accès à la vérification de diplômes grâce à la blockchain et créer un écosystème éducatif plus transparent et sécurisé.

**📧 Contact :** [yassine99zbir@gmail.com]

---

*Dernière mise à jour : Juillet 2025*
