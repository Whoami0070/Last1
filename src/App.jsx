import React, { useState } from 'react';
import { Web3ReactProvider, useWeb3React } from '@web3-react/core';
import { InjectedConnector } from '@web3-react/injected-connector';
import Web3 from 'web3'; // Импорт Web3
import WalletConnectProvider from '@walletconnect/client';

const injected = new InjectedConnector({ supportedChainIds: [1, 3, 4, 5, 42] });

// Функция для получения Web3
const getLibrary = (provider) => {
  return new Web3(provider); // Создаем Web3 с провайдером
};

function App() {
  const { activate, deactivate, account, library, chainId } = useWeb3React();
  const [connected, setConnected] = useState(false);

  // Функция для подключения через кошелек
  const connectWallet = async () => {
    try {
      await activate(injected);
      setConnected(true);
    } catch (error) {
      console.error("Error connecting to wallet:", error);
    }
  };

  // Функция для disconnect
  const disconnectWallet = () => {
    deactivate();
    setConnected(false);
  };

  // Функция для approve токенов (это заглушка)
  const approveTokens = async () => {
    if (!account) {
      console.error('Wallet is not connected!');
      return;
    }

    try {
      // Здесь можно добавить логику для approve токенов через контракт.
      console.log('Approve tokens for:', account);

      // Пример для вызова approve через смарт-контракт (подставь свой контракт)
      // const contract = new library.eth.Contract(ABI, tokenAddress);
      // await contract.methods.approve(spenderAddress, amount).send({ from: account });

      alert('Tokens approved!');
    } catch (error) {
      console.error('Error approving tokens:', error);
    }
  };

  return (
    <div>
      {!connected ? (
        <button onClick={connectWallet}>Connect Wallet</button>
      ) : (
        <div>
          <p>Connected with {account}</p>
          <button onClick={approveTokens}>Approve Tokens</button>
          <button onClick={disconnectWallet}>Disconnect</button>
        </div>
      )}
    </div>
  );
}

export default function AppWrapper() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <App />
    </Web3ReactProvider>
  );
}