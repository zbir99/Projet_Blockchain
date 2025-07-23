// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title Diploma
 * @dev Contrat pour la certification de diplômes sur la blockchain
 */
contract Diploma {
    // Structure pour stocker les informations du diplôme
    struct Certificate {
        string studentName;
        string specialization;
        uint256 date;
        string ipfsHash;
        bool exists;
    }

    // Mapping pour stocker les diplômes par adresse Ethereum de l'étudiant
    mapping(address => Certificate) private certificates;
    
    // Adresse de l'administrateur (université)
    address private admin;
    
    // Événements
    event CertificateAdded(address indexed studentAddress, string studentName, string specialization, uint256 date);
    
    // Modificateur pour restreindre l'accès à l'administrateur uniquement
    modifier onlyAdmin() {
        require(msg.sender == admin, "Seul l\'administrateur peut effectuer cette action");
        _;
    }
    
    // Constructeur
    constructor() {
        admin = msg.sender;
    }
    
    /**
     * @dev Ajoute un nouveau certificat de diplôme
     * @param studentAddress Adresse Ethereum de l'étudiant
     * @param studentName Nom de l'étudiant
     * @param specialization Spécialité du diplôme
     * @param date Date d'obtention du diplôme (timestamp Unix)
     * @param ipfsHash Hash IPFS du document de diplôme
     */
    function addCertificate(
        address studentAddress,
        string memory studentName,
        string memory specialization,
        uint256 date,
        string memory ipfsHash
    ) external onlyAdmin {
        require(studentAddress != address(0), "Adresse de l\'etudiant invalide");
        require(bytes(studentName).length > 0, "Le nom de l\'etudiant ne peut pas etre vide");
        require(bytes(specialization).length > 0, "La specialite ne peut pas etre vide");
        require(bytes(ipfsHash).length > 0, "Le hash IPFS ne peut pas etre vide");
        require(!certificates[studentAddress].exists, "Un certificat existe deja pour cette adresse");
        
        certificates[studentAddress] = Certificate({
            studentName: studentName,
            specialization: specialization,
            date: date,
            ipfsHash: ipfsHash,
            exists: true
        });
        
        emit CertificateAdded(studentAddress, studentName, specialization, date);
    }
    
    /**
     * @dev Récupère les informations d'un certificat de diplôme
     * @param studentAddress Adresse Ethereum de l'étudiant
     * @return studentName Nom de l'étudiant
     * @return specialization Spécialité du diplôme
     * @return date Date d'obtention du diplôme
     * @return ipfsHash Hash IPFS du document de diplôme
     * @return exists Indique si le certificat existe
     */
    function getCertificate(address studentAddress) external view returns (
        string memory studentName,
        string memory specialization,
        uint256 date,
        string memory ipfsHash,
        bool exists
    ) {
        Certificate memory cert = certificates[studentAddress];
        return (
            cert.studentName,
            cert.specialization,
            cert.date,
            cert.ipfsHash,
            cert.exists
        );
    }
    
    /**
     * @dev Vérifie si l'appelant est l'administrateur
     * @return bool Vrai si l'appelant est l'administrateur
     */
    function isAdmin() external view returns (bool) {
        return msg.sender == admin;
    }
}
