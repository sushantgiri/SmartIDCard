// Web3 Configuration
import configData from './../static/config.json'

export function fetchWeb3() {
    const Web3 = require('web3')
    return new Web3(configData.SERVER_URL)
}

export const contractAddress = '0x76A2dd4228ed65129C4455769a0f09eA8E4EA9Ae';
export const signUpContractAddress = '0x3CF0CB3cD457b959F6027676dF79200C8EF19907';
export const VCREQ_SVP_VCsend_Address = '0x3CF0CB3cD457b959F6027676dF79200C8EF19907';

export const VCREQ_VCsend_Address = '0x3CF0CB3cD457b959F6027676dF79200C8EF19907';

export const VERIFICATION_SCREEN_ADDRESS = '0x76A2dd4228ed65129C4455769a0f09eA8E4EA9Ae';

export const VPREQ_SIGN_NULL_SEND_ADDRESS = '0x3CF0CB3cD457b959F6027676dF79200C8EF19907';

export const VPREQ_SIGN_VC_SEND_ADDRESS = '0x3CF0CB3cD457b959F6027676dF79200C8EF19907';

export const VPREQ_SVP_SIGN_NULL_SEND_ADDRESS = '0x3CF0CB3cD457b959F6027676dF79200C8EF19907';

export const VPREQ_SVP_SIGN_VCSEND_ADDRESS = '0x76A2dd4228ed65129C4455769a0f09eA8E4EA9Ae';

export const VPREQ_SVP_SIGN_VCSEND_ADDRESS_CREATE = '0x3CF0CB3cD457b959F6027676dF79200C8EF19907'

export const VPREQ_SVP_VCSEND_ADDRESS = '0x76A2dd4228ed65129C4455769a0f09eA8E4EA9Ae';

export const VPREQ_VCSEND_ADDRESS = '0x76A2dd4228ed65129C4455769a0f09eA8E4EA9Ae';


export const issuerName = 'Issuer(change later)';
export const serviceEndPoint = 'Dualauth.com(change later)';

