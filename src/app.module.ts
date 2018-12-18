import { Module } from '@nestjs/common';
import { CompoundController } from './compound/compound.controller';
import { CompoundService } from './compound/compound.service';
import { TokenService } from './token.service';
import { ethers } from 'ethers';
import { TokenMetadata } from './types';
import { KyberService } from './kyber/kyber.service';
import { KyberController } from './kyber/kyber.controller';
import * as Compound from '../resources/money-market.json';
import * as Kyber from '../resources/kyber-network-proxy.json';
import * as Account from '../resources/account.json';
import * as Tokens from '../resources/tokens.json';

const provider = ethers.getDefaultProvider('rinkeby');
const privateKey = Account.privateKey;
const wallet = new ethers.Wallet(privateKey, provider);

const moneyMarketContract = new ethers.Contract(
    Compound.networks[4].address,
    Compound.abi,
    wallet,
);
const kyberContract = new ethers.Contract(
    Kyber.networks[4].address,
    Kyber.abi,
    wallet,
);

const tokens: TokenMetadata[] = Tokens.networks[4];

@Module({
    imports: [],
    controllers: [CompoundController, KyberController],
    providers: [
        CompoundService,
        KyberService,
        TokenService,
        {
            provide: 'wallet',
            useValue: wallet,
        },
        {
            provide: 'tokens',
            useValue: tokens,
        },
        {
            provide: 'money-market-contract',
            useValue: moneyMarketContract,
        },
        {
            provide: 'kyber-contract',
            useValue: kyberContract,
        },
    ],
})
export class AppModule { }
