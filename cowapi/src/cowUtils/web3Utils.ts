import { ethers } from 'ethers';
import { Web3 } from "web3";

export function getSignerFromPK(privateKey: string): ethers.Wallet 
{
    const wallet = new ethers.Wallet(privateKey);

    // Optionally, connect to a provider (e.g., Infura, Alchemy, or a local node)
    const provider = new ethers.providers.JsonRpcProvider('https://go.getblock.io/9960acb0398b4ab8ae8a0eb77f23c06b');  // Replace with your provider
    const signer = wallet.connect(provider);

    return signer;
}

export async function generateFunctionCallData(functionName: string, paramTypes: string[], params: any[]) {

  const web3 = new Web3('https://eth.llamarpc.com');
    // encode function parameters
    const encodedParams = await web3.eth.abi.encodeParameters(paramTypes, params).substr(2);
  
    // generate function signature and calldata
    const functionSignature = await web3.eth.abi.encodeFunctionSignature(`${functionName}(${paramTypes.join(',')})`);
    const functionCallData = functionSignature + encodedParams;
  
    return functionCallData;
  }

//   const functionName = 'transfer';
//   const paramTypes = ['address','uint256'];
//   const params = ['0xdfd5293d8e347dfe59e90efd55b2956a1343963d','1000000000000000000'];