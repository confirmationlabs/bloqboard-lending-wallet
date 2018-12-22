import { Inject, Injectable } from '@nestjs/common';
import { Contract } from 'ethers';
import { BigNumber } from 'bignumber.js';
import { RelayerDebtOrder } from './models/RelayerDebtOrder';
import { DebtOrderData } from './models/DebtOrderData';
import { ECDSASignature } from './models/ECDSASignature';

type AmortizationUnit = 'hours' | 'days' | 'weeks' | 'months' | 'years';

enum AmortizationUnitCode {
    HOURS,
    DAYS,
    WEEKS,
    MONTHS,
    YEARS,
}

interface SimpleInterestLoanOrder extends DebtOrderData {
    // Required Debt Order Parameters
    principalAmount: BigNumber;
    principalTokenSymbol: string;
    principalTokenAddress: string;
    principalTokenIndex: BigNumber;

    // Parameters for Terms Contract
    interestRate: BigNumber;
    amortizationUnit: AmortizationUnit;
    termLength: BigNumber;
}

interface SimpleInterestTermsContractParameters {
    principalAmount: BigNumber;
    interestRate: BigNumber;
    amortizationUnit: AmortizationUnit;
    termLength: BigNumber;
    principalTokenIndex: BigNumber;
}

// Extend order to include parameters necessary for a collateralized terms contract.
export interface CollateralizedSimpleInterestLoanOrder extends SimpleInterestLoanOrder {
    collateralTokenSymbol: string;
    collateralTokenAddress: string;
    collateralTokenIndex: BigNumber;
    collateralAmount: BigNumber;
    gracePeriodInDays: BigNumber;
}

interface CollateralizedTermsContractParameters {
    collateralTokenIndex: BigNumber;
    collateralAmount: BigNumber;
    gracePeriodInDays: BigNumber;
}

interface CollateralizedSimpleInterestTermsContractParameters
    extends SimpleInterestTermsContractParameters,
    CollateralizedTermsContractParameters { }

@Injectable()
export class CollateralizedSimpleInterestLoanAdapter {

    public constructor(
        @Inject('dharma-token-registry-contract') private readonly dharmaTokenRegistry: Contract,
    ) { }

    async fromRelayerDebtOrder(order: RelayerDebtOrder): Promise<CollateralizedSimpleInterestLoanOrder> {
        const debtOrderData: DebtOrderData = {
            kernelVersion: order.kernelAddress,
            issuanceVersion: order.repaymentRouterAddress,
            principalAmount: new BigNumber(order.principalAmount || 0),
            principalToken: order.principalTokenAddress,
            debtor: order.debtorAddress,
            debtorFee: new BigNumber(order.debtorFee || 0),
            termsContract: order.termsContractAddress,
            termsContractParameters: order.termsContractParameters,
            expirationTimestampInSec: new BigNumber(new Date(order.expirationTime).getTime() / 1000),
            salt: new BigNumber(order.salt || 0),
            debtorSignature: this.parseSignature(order.debtorSignature),
            relayer: order.relayerAddress,
            relayerFee: new BigNumber(order.relayerFee || 0),
            underwriter: order.underwriterAddress,
            underwriterRiskRating: new BigNumber(order.underwriterRiskRating || 0),
            underwriterFee: new BigNumber(order.underwriterFee || 0),
            underwriterSignature: this.parseSignature(order.underwriterSignature),
            creditor: order.creditorAddress,
            creditorSignature: this.parseSignature(order.creditorSignature),
            creditorFee: new BigNumber(order.creditorFee || 0),
        };

        const { principalTokenIndex, collateralTokenIndex, ...params } = this.unpackParameters(
            debtOrderData.termsContractParameters,
        );

        const principalTokenSymbol = await this.dharmaTokenRegistry.getTokenSymbolByIndex(
            principalTokenIndex.toNumber(),
        );

        const principalTokenAddress = await this.dharmaTokenRegistry.getTokenAddressByIndex(
            principalTokenIndex.toNumber(),
        );

        const collateralTokenSymbol = await this.dharmaTokenRegistry.getTokenSymbolByIndex(
            collateralTokenIndex.toNumber(),
        );

        const collateralTokenAddress = await this.dharmaTokenRegistry.getTokenAddressByIndex(
            collateralTokenIndex.toNumber(),
        );

        return {
            ...debtOrderData,
            principalTokenSymbol,
            principalTokenAddress,
            principalTokenIndex,
            collateralTokenSymbol,
            collateralTokenAddress,
            collateralTokenIndex,
            ...params,
        };
    }

    private unpackParameters(
        termsContractParameters: string,
    ): CollateralizedSimpleInterestTermsContractParameters {
        const simpleInterestParams = this.unpackSimpleInterestParameters(
            termsContractParameters,
        );

        const collateralizedParams = this.unpackCollateralizedParameters(
            termsContractParameters,
        );

        return {
            ...simpleInterestParams,
            ...collateralizedParams,
        };
    }

    private unpackSimpleInterestParameters(
        termsContractParametersPacked: string,
    ): SimpleInterestTermsContractParameters {
        const MAX_INTEREST_RATE_PRECISION = 4;
        const FIXED_POINT_SCALING_FACTOR = 10 ** MAX_INTEREST_RATE_PRECISION;

        const principalTokenIndexHex = termsContractParametersPacked.substr(0, 4);
        const principalAmountHex = `0x${termsContractParametersPacked.substr(4, 24)}`;
        const interestRateFixedPointHex = `0x${termsContractParametersPacked.substr(28, 6)}`;
        const amortizationUnitTypeHex = `0x${termsContractParametersPacked.substr(34, 1)}`;
        const termLengthHex = `0x${termsContractParametersPacked.substr(35, 4)}`;

        const principalTokenIndex = new BigNumber(principalTokenIndexHex);
        const principalAmount = new BigNumber(principalAmountHex);
        const interestRateFixedPoint = new BigNumber(interestRateFixedPointHex);
        const termLength = new BigNumber(termLengthHex);

        // Given that our fixed point representation of the interest rate
        // is scaled up by our chosen scaling factor, we scale it down
        // for computations.
        const interestRate = interestRateFixedPoint.div(FIXED_POINT_SCALING_FACTOR);

        // Since the amortization unit type is stored in 1 byte, it can't exceed
        // a value of 255.  As such, we're not concerned about using BigNumber's
        // to represent amortization units.
        const unitCode = parseInt(amortizationUnitTypeHex, 16);

        const amortizationUnit = AmortizationUnitCode[unitCode].toLowerCase() as AmortizationUnit;

        return {
            principalTokenIndex,
            principalAmount,
            interestRate,
            termLength,
            amortizationUnit,
        };
    }

    private unpackCollateralizedParameters(packedParams: string): CollateralizedTermsContractParameters {
        const collateralTokenIndexHex = `0x${packedParams.substr(39, 2)}`;
        const collateralAmountHex = `0x${packedParams.substr(41, 23)}`;
        const gracePeriodInDaysHex = `0x${packedParams.substr(64, 2)}`;

        return {
            collateralTokenIndex: new BigNumber(collateralTokenIndexHex),
            collateralAmount: new BigNumber(collateralAmountHex),
            gracePeriodInDays: new BigNumber(gracePeriodInDaysHex),
        };
    }

    private parseSignature(serializedSignature: string) {
        const sign: ECDSASignature = serializedSignature && JSON.parse(serializedSignature);

        if (sign && sign.r) {
            return sign;
        }

        return ECDSASignature.NULL_SIGNATURE;
    }
}