import { ethers } from 'ethers';

import { createERC2535Proxy } from 'rkvst-event-tokens';

import DiamondSol from 'rkvst-event-tokens/abi/Diamond.json' assert { type: 'json' };
import DiamondCutFacetSol from 'rkvst-event-tokens/abi/DiamondCutFacet.json' assert { type: 'json' };
import DiamondLoupeFacetSol from 'rkvst-event-tokens/abi/DiamondLoupeFacet.json' assert { type: 'json' };
import OwnershipFacetSol from 'rkvst-event-tokens/abi/OwnershipFacet.json' assert { type: 'json' };
import ERC1155FacetSol from 'rkvst-event-tokens/abi/ERC1155Facet.json' assert { type: 'json' };
import StateProofVerifierFacetSol from 'rkvst-event-tokens/abi/StateProofVerifierFacet.json' assert { type: 'json' };

const keccak256 = ethers.utils.keccak256;

export const facetInterfaces = {
	DiamondCutFacet: new ethers.utils.Interface(DiamondCutFacetSol.abi),
	DiamondLoupeFacet: new ethers.utils.Interface(DiamondLoupeFacetSol.abi),
	OwnershipFacet: new ethers.utils.Interface(OwnershipFacetSol.abi),
	StateProofVerifierFacet: new ethers.utils.Interface(StateProofVerifierFacetSol.abi),
	ERC1155Facet: new ethers.utils.Interface(ERC1155FacetSol.abi)
};

export const facetABIs = {
	DiamondCutFacet: DiamondCutFacetSol.abi,
	DiamondLoupeFacet: DiamondLoupeFacetSol.abi,
	OwnershipFacet: OwnershipFacetSol.abi,
	StateProofVerifierFacet: StateProofVerifierFacetSol.abi,
	ERC1155Facet: ERC1155FacetSol.abi
};

export function createProxy(diamondAddress, providerOrSigner) {
	return createERC2535Proxy(diamondAddress, DiamondSol.abi, facetABIs, providerOrSigner);
}

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
	const accountProof = firstProof.accountProof.map((node) => ethers.utils.RLP.decode(node));
	const storageHash = firstProof.storageHash;

	const rlpAccountProof = ethers.utils.RLP.encode(accountProof);

	const storageProofs = [];
	for (const namedProof of payload.named_proofs) {
		const slotKeyHashes = [];
		const rlpStorageProofs = [];

		for (const proof of namedProof.proof.storageProof) {
			slotKeyHashes.push(keccak256(proof.key));
			const decodedProof = proof.proof.map((node) => ethers.utils.RLP.decode(node));
			rlpStorageProofs.push(ethers.utils.RLP.encode(decodedProof));
		}
		storageProofs.push({
			storageHash: namedProof.proof.storageHash,
			slotKeyHashes,
			rlpStorageProofs
		});
	}

	return {
		// The caller needs to add eventIdentity, tokenURL and account & worldRoot
		rlpAccountProof,
		storageProofs
	};
}
