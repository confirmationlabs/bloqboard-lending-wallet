import { BigNumber } from 'bignumber.js';
import { ECDSASignature } from './ECDSASignature';

export interface DebtOrderData {
    kernelVersion?: string;
    issuanceVersion?: string;
    principalAmount?: BigNumber;
    principalToken?: string;
    debtor?: string;
    debtorFee?: BigNumber;
    creditor?: string;
    creditorFee?: BigNumber;
    relayer?: string;
    relayerFee?: BigNumber;
    underwriter?: string;
    underwriterFee?: BigNumber;
    underwriterRiskRating?: BigNumber;
    termsContract?: string;
    termsContractParameters?: string;
    expirationTimestampInSec?: BigNumber;
    salt?: BigNumber;
    // Signatures
    debtorSignature?: ECDSASignature;
    creditorSignature?: ECDSASignature;
    underwriterSignature?: ECDSASignature;
}
