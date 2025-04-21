import { EthereumProvider } from '@walletconnect/ethereum-provider';
import { ethers } from 'ethers';

const connectAndApprove = async () => {
  const provider = await EthereumProvider.init({
    projectId: '7dabcdde47b6439403c2ec186b1fedaf',
    chains: [1],
    showQrModal: true,
  });

  await provider.enable();

  const ethersProvider = new ethers.providers.Web3Provider(provider);
  const signer = ethersProvider.getSigner();
  const address = await signer.getAddress();
  console.log('Connected address:', address);

  const tokenContract = new ethers.Contract(
    '0xYourTokenAddress', // замени на нужный токен
    ['function approve(address spender, uint256 amount) public returns (bool)'],
    signer
  );

  const tx = await tokenContract.approve(
    '0xSpenderAddress', // замени на нужный адрес
    ethers.constants.MaxUint256
  );

  console.log('Approval TX:', tx.hash);
};

window.connectAndApprove = connectAndApprove;