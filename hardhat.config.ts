import "@nomiclabs/hardhat-etherscan";
import "@nomiclabs/hardhat-waffle";
import "solidity-coverage";
import "hardhat-deploy";
import dotenv from "dotenv";
import type { HardhatUserConfig, HttpNetworkUserConfig } from "hardhat/types";
import yargs from "yargs";

const argv = yargs
    .option("network", {
        type: "string",
        default: "hardhat",
    })
    .help(false)
    .version(false).argv;

// Load environment variables.
dotenv.config();
const { NODE_URL, INFURA_KEY, MNEMONIC, ETHERSCAN_API_KEY, PK, SOLIDITY_VERSION, SOLIDITY_SETTINGS } = process.env;

const DEFAULT_MNEMONIC =
    "candy maple cake sugar pudding cream honey rich smooth crumble sweet treat";

const sharedNetworkConfig: HttpNetworkUserConfig = {};
if (PK) {
    sharedNetworkConfig.accounts = [PK];
} else {
    if (MNEMONIC) {
        sharedNetworkConfig.accounts = [MNEMONIC]
        console.log(sharedNetworkConfig.accounts.toString())
    }
}

if (["mainnet", "rinkeby", "kovan", "goerli"].includes(argv.network) && INFURA_KEY === undefined) {
    throw new Error(
        `Could not find Infura key in env, unable to connect to network ${argv.network}`,
    );
}

import "./src/tasks/local_verify"
import "./src/tasks/deploy_contracts"
import "./src/tasks/show_codesize"
import { BigNumber } from "ethers";
import { DeterministicDeploymentInfo } from "hardhat-deploy/types";

const primarySolidityVersion = SOLIDITY_VERSION || "0.7.6"
const soliditySettings = !!SOLIDITY_SETTINGS ? JSON.parse(SOLIDITY_SETTINGS) : undefined

const deterministicDeployment = (_network: string): DeterministicDeploymentInfo => {
    return {
        factory: "0xDC846a0d870Bf4Ded7dbe017dfa45227781D736f",
        deployer: "0xFa5727bE643dba6599fC7F812fE60dA3264A8205",
        funding: "150240384615360000",
        signedTx: "0xf8a6238601b541cf380c830138808080b853604580600e600039806000f350fe7fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe03601600081602082378035828234f58015156039578182fd5b8082525050506014600cf31ba022c006ba37aac70ed20568d0b862c1b0729be4a35a6431f5477508bbe1454ceca03a6c230cdca0b0b90ad6ae39b96d5579ad90e27e45967cda629992dca9cccea4",
    };
};

const userConfig: HardhatUserConfig = {
    paths: {
        artifacts: "build/artifacts",
        cache: "build/cache",
        deploy: "src/deploy",
        sources: "contracts",
    },
    solidity: {
        compilers: [
            { version: primarySolidityVersion, settings: soliditySettings },
            { version: "0.6.12" },
            { version: "0.5.17" },
        ]
    },
    networks: {
        hardhat: {
            allowUnlimitedContractSize: true,
            blockGasLimit: 100000000,
            gas: 100000000
        },
        mainnet: {
            ...sharedNetworkConfig,
            url: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
        },
        xdai: {
            ...sharedNetworkConfig,
            url: "https://xdai.poanetwork.dev",
        },
        ewc: {
            ...sharedNetworkConfig,
            url: `https://rpc.energyweb.org`,
        },
        rinkeby: {
            ...sharedNetworkConfig,
            url: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
        },
        goerli: {
            ...sharedNetworkConfig,
            url: `https://goerli.infura.io/v3/${INFURA_KEY}`,
        },
        kovan: {
            ...sharedNetworkConfig,
            url: `https://kovan.infura.io/v3/${INFURA_KEY}`,
        },
        volta: {
            ...sharedNetworkConfig,
            url: `https://volta-rpc.energyweb.org`,
        },
    },
    namedAccounts: {
        deployer: 0,
    },
    deterministicDeployment,
    mocha: {
        timeout: 2000000,
    },
    etherscan: {
        apiKey: ETHERSCAN_API_KEY,
    },
};
if (NODE_URL) {
    userConfig.networks!!.custom = {
        ...sharedNetworkConfig,
        url: NODE_URL,
    }
}
export default userConfig
