import { ethers } from 'ethers';

const keccak256 = ethers.utils.keccak256;

/**
 * Format the payload proofs as required by the rkvst-event-tokens contract
 * @param {object} payload json formated string payload of an rkvst receipt
 */
export function receiptTokenProofs(payload) {
    // see https://github.com/lidofinance/curve-merkle-oracle/blob/1033b3e84142317ffd8f366b52e489d5eb49c73f/offchain/state_proof.py
    // for reference to the translation from eip 1186
		//
		// also note *all* accountProofs and *all* storageHash's in each named_proof
		// are guaranteed the same (there is redundancy in the format due to its
		// alignment with EIP1186)

		const firstProof = payload.named_proofs[0].proof;
    const accountProof = firstProof.accountProof.map((node) =>
      ethers.utils.RLP.decode(node)
    );
		const storageHash = firstProof.storageHash;

    const rlpAccountProof = ethers.utils.RLP.encode(accountProof);

		const storageProofs = []
		for (const namedProof of payload.named_proofs) {
    	const slotKeyHashes = [];
    	const rlpStorageProofs = [];
	
    	for (const proof of namedProof.proof.storageProof) {
    	  slotKeyHashes.push(keccak256(proof.key));
    	  const decodedProof = proof.proof.map((node) =>
    	    ethers.utils.RLP.decode(node)
    	  );
    	  rlpStorageProofs.push(ethers.utils.RLP.encode(decodedProof));
    	}
			storageProofs.push({ storageHash, slotKeyHashes, rlpStorageProofs });
		}

    return {
			// The caller needs to add eventIdentity, tokenURL and account & worldRoot
			rlpAccountProof,
			storageProofs
		};
}