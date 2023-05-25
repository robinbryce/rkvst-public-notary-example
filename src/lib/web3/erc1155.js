import {ethers} from 'ethers';

export const TransferSingleSignature = 'TransferSingle(address,address,address,uint256,uint256)';
export const URISignature = "URI(string,uint256)";

export const TransferSingleTopic = ethers.utils.id(ethers.utils.EventFragment.fromString(TransferSingleSignature).format())
export const URITopic = ethers.utils.id(ethers.utils.EventFragment.fromString(URISignature).format())