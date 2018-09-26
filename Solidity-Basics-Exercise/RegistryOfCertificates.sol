pragma solidity ^0.4.25;

contract RegistryOfCertificates{
    address private owner = msg.sender;
    mapping(string => uint) private certificateHashes;
    
    function addCertificate(string certificateHash) public {
        require(owner == msg.sender);
        certificateHashes[certificateHash] = 1;
    }
    
    function verifyCertificate(string certificateHash) view public returns (bool){
        return certificateHashes[certificateHash] != 0;
    }
}