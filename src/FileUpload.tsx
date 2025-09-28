import { useState } from "react";
import lighthouse from "@lighthouse-web3/sdk";
import Web3 from "web3";
import { useBalance } from "./BalanceContext";

// DataCoin ABI - same as your ethers implementation
const DataCoinABI = [
  {
    inputs: [
      {
        internalType: "address",
        name: "to",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "amount",
        type: "uint256",
      },
    ],
    name: "mint",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "role",
        type: "bytes32",
      },
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "hasRole",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "mintingPaused",
    outputs: [
      {
        internalType: "bool",
        name: "",
        type: "bool",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "MINTER_ROLE",
    outputs: [
      {
        internalType: "bytes32",
        name: "",
        type: "bytes32",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "totalSupply",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "name",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "symbol",
    outputs: [
      {
        internalType: "string",
        name: "",
        type: "string",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
];
import StartReclaimVerification from "./reclaimVerification";

type ResponseItem = { file: string; result: any };

export default function FileUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [responses, setResponses] = useState<ResponseItem[]>([]);
  const [account, setAccount] = useState<string | null>(null);
  const [signMessage, setSignMessage] = useState("");
  const {
    userBalance,
    totalSupply,
    tokenName,
    tokenSymbol,
    setUserBalance,
    setTotalSupply,
    setTokenName,
    setTokenSymbol,
  } = useBalance();

  // // DataCoin contract configuration
  // const dataCoinAddress = "0xa14159C1B383fBCa4A9C197aFC83E01DB4655B24";
  // const dataCoinABI = [
  //   {
  //     inputs: [
  //       {
  //         internalType: "address",
  //         name: "to",
  //         type: "address",
  //       },
  //       {
  //         internalType: "uint256",
  //         name: "amount",
  //         type: "uint256",
  //       },
  //     ],
  //     name: "mintTokens",
  //     outputs: [],
  //     stateMutability: "nonpayable",
  //     type: "function",
  //   },
  // ];

  // Function to fetch and log DaoCoin information
  const fetchDaoCoinInfo = async (userAddress: string) => {
    console.log(
      "\n🪙 [DATACOIN INFO] ==========================================="
    );
    console.log("🪙 [DATACOIN INFO] Fetching DataCoin information...");
    console.log("🪙 [DATACOIN INFO] User Address:", userAddress);

    try {
      // Setup Web3 connection (reusing the same logic as mint function)
      const sepoliaRPCs = [
        "https://ethereum-sepolia.publicnode.com",
        "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161",
        "https://rpc.sepolia.ethpandaops.io",
        "https://1rpc.io/sepolia",
      ];

      let web3;
      let workingRPC = null;

      for (const rpc of sepoliaRPCs) {
        try {
          const testWeb3 = new Web3(rpc);
          await testWeb3.eth.getBlockNumber();
          web3 = testWeb3;
          workingRPC = rpc;
          break;
        } catch (error) {
          continue;
        }
      }

      if (!web3 || !workingRPC) {
        throw new Error("Failed to connect to any Sepolia RPC endpoint");
      }

      const dataCoinAddress = "0xa14159C1B383fBCa4A9C197aFC83E01DB4655B24";
      const contract = new web3.eth.Contract(DataCoinABI, dataCoinAddress);

      console.log("🪙 [DATACOIN INFO] Connected to RPC:", workingRPC);
      console.log("🪙 [DATACOIN INFO] Contract Address:", dataCoinAddress);

      // Fetch token basic information
      const [name, symbol, totalSupply, userBalance] = await Promise.all([
        contract.methods.name().call() as Promise<string>,
        contract.methods.symbol().call() as Promise<string>,
        contract.methods.totalSupply().call() as Promise<string>,
        contract.methods.balanceOf(userAddress).call() as Promise<string>,
      ]);

      // Convert from wei to readable format
      const totalSupplyFormatted = web3.utils.fromWei(
        totalSupply.toString(),
        "ether"
      );
      const userBalanceFormatted = web3.utils.fromWei(
        userBalance.toString(),
        "ether"
      );

      // Update state
      setTokenName(name);
      setTokenSymbol(symbol);
      setTotalSupply(totalSupplyFormatted);
      setUserBalance(userBalanceFormatted);

      // Console logs with beautiful formatting
      console.log("\n🎯 [DATACOIN INFO] TOKEN INFORMATION:");
      console.log("📛 [DATACOIN INFO] Token Name:", name);
      console.log("🏷️ [DATACOIN INFO] Token Symbol:", symbol);
      console.log("📊 [DATACOIN INFO] Contract Address:", dataCoinAddress);

      console.log("\n💰 [DATACOIN INFO] SUPPLY & BALANCE:");
      console.log(
        "🌍 [DATACOIN INFO] Total Supply (Mined):",
        totalSupplyFormatted,
        symbol
      );
      console.log(
        "👤 [DATACOIN INFO] Your Balance:",
        userBalanceFormatted,
        symbol
      );
      console.log(
        "📈 [DATACOIN INFO] Your Balance (Raw Wei):",
        userBalance.toString()
      );
      console.log(
        "🌐 [DATACOIN INFO] Total Supply (Raw Wei):",
        totalSupply.toString()
      );

      console.log("\n📊 [DATACOIN INFO] STATISTICS:");
      const balancePercentage =
        BigInt(totalSupply) > 0
          ? (BigInt(userBalance) * BigInt(10000)) /
            BigInt(totalSupply) /
            BigInt(100)
          : BigInt(0);
      console.log(
        "📊 [DATACOIN INFO] Your Share of Total Supply:",
        balancePercentage.toString() + "%"
      );
      console.log(
        "🪙 [DATACOIN INFO] ==========================================="
      );

      return {
        name,
        symbol,
        totalSupply: totalSupplyFormatted,
        userBalance: userBalanceFormatted,
        contractAddress: dataCoinAddress,
      };
    } catch (error) {
      console.error("❌ [DATACOIN INFO] Error fetching DataCoin info:", error);
      return null;
    }
  };

  // Function to mint tokens after successful file upload using private key
  const mintTokensToUser = async (
    userAddress: string,
    tokenAmount: number = 10
  ) => {
    console.log("🚀 [MINT DEBUG] Starting mint process...");
    console.log("🔍 [MINT DEBUG] Target address:", userAddress);
    console.log("🔍 [MINT DEBUG] Token amount:", tokenAmount);

    try {
      // Get private key from environment variables
      console.log("🔍 [MINT DEBUG] Checking for private key...");
      const privateKey = import.meta.env.VITE_PRIVATE_KEY;
      if (!privateKey) {
        console.error(
          "❌ [MINT DEBUG] Private key not found in environment variables"
        );
        throw new Error("Private key not found in environment variables");
      }
      console.log(
        "✅ [MINT DEBUG] Private key found (length:",
        privateKey.length,
        ")"
      );

      // Setup Web3 with Sepolia RPC
      console.log("🔍 [MINT DEBUG] Setting up Web3 connection to Sepolia...");

      // Try multiple Sepolia RPC endpoints for redundancy
      const sepoliaRPCs = [
        "https://ethereum-sepolia.publicnode.com",
        "https://sepolia.infura.io/v3/9aa3d95b3bc440fa88ea12eaa4456161", // Public Infura endpoint
        "https://rpc.sepolia.ethpandaops.io",
        "https://1rpc.io/sepolia", // Original endpoint as fallback
      ];

      let web3;
      let workingRPC = null;

      for (const rpc of sepoliaRPCs) {
        try {
          console.log("🔍 [MINT DEBUG] Trying RPC:", rpc);
          const testWeb3 = new Web3(rpc);

          // Test the connection by trying to get the latest block number
          await testWeb3.eth.getBlockNumber();

          web3 = testWeb3;
          workingRPC = rpc;
          console.log("✅ [MINT DEBUG] Successfully connected to RPC:", rpc);
          break;
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : String(error);
          console.warn(
            "⚠️ [MINT DEBUG] Failed to connect to RPC:",
            rpc,
            errorMsg
          );
          continue;
        }
      }

      if (!web3 || !workingRPC) {
        throw new Error("Failed to connect to any Sepolia RPC endpoint");
      }

      console.log(
        "✅ [MINT DEBUG] Web3 instance created with RPC:",
        workingRPC
      );

      // Create account from private key
      console.log("🔍 [MINT DEBUG] Creating account from private key...");
      // Handle both prefixed (0x...) and non-prefixed private keys
      const formattedKey = privateKey.startsWith("0x")
        ? privateKey
        : `0x${privateKey}`;
      console.log(
        "🔍 [MINT DEBUG] Formatted private key length:",
        formattedKey.length
      );

      const account = web3.eth.accounts.privateKeyToAccount(formattedKey);
      web3.eth.accounts.wallet.add(account);
      console.log("✅ [MINT DEBUG] Account created:", account.address);

      // Create contract instance
      console.log("🔍 [MINT DEBUG] Creating contract instance...");

      // Use the correct contract address and ABI with the new Web3 instance
      const dataCoinAddress = "0xa14159C1B383fBCa4A9C197aFC83E01DB4655B24";
      const contract = new web3.eth.Contract(DataCoinABI, dataCoinAddress);

      console.log(
        "✅ [MINT DEBUG] Contract instance created for DataCoin contract at:",
        dataCoinAddress
      );

      // Convert token amount to wei (18 decimals)
      const amountInWei = web3.utils.toWei(tokenAmount.toString(), "ether");
      console.log("🔍 [MINT DEBUG] Amount in Wei:", amountInWei);

      console.log(
        `🎯 [MINT DEBUG] Minting ${tokenAmount} tokens to ${userAddress} from ${account.address}`
      );

      // Check account balance first
      console.log("🔍 [MINT DEBUG] Checking sender account balance...");
      const balance = await web3.eth.getBalance(account.address);
      console.log(
        "💰 [MINT DEBUG] Sender balance:",
        web3.utils.fromWei(balance, "ether"),
        "ETH"
      );

      // Check if account has MINTER_ROLE
      console.log("🔍 [MINT DEBUG] Checking MINTER_ROLE permissions...");
      try {
        const minterRole = web3.utils.keccak256("MINTER_ROLE");
        const hasMinterRole = await contract.methods
          .hasRole(minterRole, account.address)
          .call();
        console.log("� [MINT DEBUG] Has MINTER_ROLE:", hasMinterRole);

        if (!hasMinterRole) {
          throw new Error(
            `Account ${account.address} does not have MINTER_ROLE on the contract`
          );
        }
      } catch (roleError) {
        console.error("❌ [MINT DEBUG] Error checking MINTER_ROLE:", roleError);
        throw roleError;
      }

      // Check if minting is paused
      console.log("🔍 [MINT DEBUG] Checking if minting is paused...");
      try {
        const mintingPaused = await contract.methods.mintingPaused().call();
        console.log("⏸️ [MINT DEBUG] Minting paused:", mintingPaused);

        if (mintingPaused) {
          throw new Error("Token minting is currently paused on the contract");
        }
      } catch (pauseError) {
        console.error(
          "❌ [MINT DEBUG] Error checking pause status:",
          pauseError
        );
        throw pauseError;
      }

      // Estimate gas properly like ethers implementation
      console.log("🔍 [MINT DEBUG] Estimating gas...");
      const gasEstimate = await contract.methods
        .mint(userAddress, amountInWei)
        .estimateGas({ from: account.address });
      console.log("⛽ [MINT DEBUG] Gas estimate:", gasEstimate.toString());

      // Get current gas price
      console.log("🔍 [MINT DEBUG] Getting gas price...");
      const gasPrice = await web3.eth.getGasPrice();
      console.log("💸 [MINT DEBUG] Gas price:", gasPrice.toString(), "wei");

      // Calculate total gas cost
      const totalGasCost = BigInt(gasEstimate) * BigInt(gasPrice);
      console.log(
        "💰 [MINT DEBUG] Total gas cost:",
        web3.utils.fromWei(totalGasCost.toString(), "ether"),
        "ETH"
      );

      // Send transaction
      console.log("📡 [MINT DEBUG] Sending transaction...");
      const tx = await contract.methods.mint(userAddress, amountInWei).send({
        from: account.address,
        gas: gasEstimate.toString(),
        gasPrice: gasPrice.toString(),
      });

      console.log("✅ [MINT DEBUG] Transaction successful!");
      console.log("🔗 [MINT DEBUG] Transaction hash:", tx.transactionHash);
      console.log("📊 [MINT DEBUG] Gas used:", tx.gasUsed);
      console.log("🎉 [MINT DEBUG] Mint process completed successfully!");

      // Fetch and log updated DaoCoin information after minting
      console.log("\n🔄 [MINT DEBUG] Fetching updated DataCoin information...");
      const updatedTokenInfo = await fetchDaoCoinInfo(userAddress);

      // Ensure UI state is updated with fresh data
      if (updatedTokenInfo) {
        console.log(
          "🎯 [MINT DEBUG] UI state updated with fresh token information"
        );
      }

      return {
        success: true,
        txHash: tx.transactionHash,
        amount: tokenAmount,
        from: account.address,
        updatedTokenInfo: updatedTokenInfo,
      };
    } catch (error) {
      console.error("❌ [MINT DEBUG] Error in mint process:", error);
      console.error(
        "❌ [MINT DEBUG] Error details:",
        error instanceof Error ? error.message : "Unknown error"
      );
      console.error("❌ [MINT DEBUG] Full error object:", error);

      return {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        amount: tokenAmount,
      };
    }
  };

  const [showReclaimVerification, setShowReclaimVerification] = useState(false);
  const [pendingFiles, setPendingFiles] = useState<FileList | null>(null);
  const [showFlowOptions, setShowFlowOptions] = useState(false);
  const [selectedFlow, setSelectedFlow] = useState<'normal' | 'direct-reclaim' | null>(null);
  
  const connectToMetaMask = async () => {
    console.log("🔗 [WALLET DEBUG] Starting MetaMask connection...");

    if (window.ethereum) {
      console.log("✅ [WALLET DEBUG] MetaMask detected");

      try {
        console.log("🔍 [WALLET DEBUG] Requesting account access...");
        const accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });

        console.log("✅ [WALLET DEBUG] Accounts received:", accounts);
        setAccount(accounts[0]);
        console.log(
          "🔗 [WALLET DEBUG] Connected to MetaMask account:",
          accounts[0]
        );

        const currentAccount = accounts[0];
        if (!currentAccount) {
          throw new Error("No account found after connecting to MetaMask.");
        }

        console.log("🔍 [WALLET DEBUG] Getting lighthouse auth message...");
        const authMessage = await lighthouse.getAuthMessage(currentAccount);
        console.log("📝 [WALLET DEBUG] Auth message received:", authMessage);

        // ask MetaMask to sign it
        console.log("✍️ [WALLET DEBUG] Requesting message signature...");
        const signedMessage = await window.ethereum.request({
          method: "personal_sign",
          params: [authMessage.data.message, currentAccount],
        });
        console.log("✅ [WALLET DEBUG] Message signed successfully");
        console.log("🔏 [WALLET DEBUG] Signed Message:", signedMessage);
        setSignMessage(signedMessage);
        console.log(
          "🎉 [WALLET DEBUG] MetaMask connection completed successfully!"
        );

        // Fetch and display DaoCoin information after connecting
        console.log(
          "\n🔄 [WALLET DEBUG] Fetching DataCoin information for connected account..."
        );
        await fetchDaoCoinInfo(currentAccount);
        
        // After successful signing, show the flow options
        setShowFlowOptions(true);
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        console.error(
          "❌ [WALLET DEBUG] Error connecting to MetaMask:",
          errorMsg
        );
        console.error("❌ [WALLET DEBUG] Full error:", error);
        alert(`Error connecting to MetaMask: ${errorMsg}`);
      }
    } else {
      console.error("❌ [WALLET DEBUG] MetaMask not detected!");
      alert("MetaMask is not installed. Please install MetaMask!");
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const processFilesAfterVerification = (fileList: FileList) => {
    const newFiles = Array.from(fileList);
    console.log("📂 [FILE DEBUG] Processing", newFiles.length, "files");

    newFiles.forEach((file, index) => {
      console.log(
        `📄 [FILE DEBUG] File ${index + 1}:`,
        file.name,
        "(" + file.type + ")"
      );

      if (file.type === "text/plain") {
        console.log("✅ [FILE DEBUG] File type valid, reading content...");
        const reader = new FileReader();
        reader.onload = async (event) => {
          const text = event.target?.result;
          console.log("📁 [FILE DEBUG] File read successfully:", file.name);
          console.log(
            "📄 [FILE DEBUG] File content length:",
            text?.toString().length
          );

          try {
            console.log(
              "🔍 [FILE DEBUG] Sending file to encryption endpoint..."
            );
            const res = await fetch(
              "https://brfw2w2m-5500.inc1.devtunnels.ms/encrypt",
              {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  text,
                  fileName: file.name,
                  pubKey: account,
                  signMess: signMessage,
                }),
              }
            );

            console.log("📡 [FILE DEBUG] Server response status:", res.status);
            const data = await res.json();
            console.log("📊 [FILE DEBUG] Server response data:", data);

            // If upload was successful and user is connected, mint tokens
            // Check if data.data is an array and has at least one element with Hash
            if (data?.data?.[0]?.Hash && account) {
              console.log(
                "🎯 [FILE DEBUG] File uploaded successfully, starting token minting..."
              );
              console.log("🔗 [FILE DEBUG] IPFS Hash:", data.data[0].Hash);
              console.log("👤 [FILE DEBUG] User account:", account);

              const mintResult = await mintTokensToUser(account, 10);
              console.log(
                "🎉 [FILE DEBUG] Token minting completed:",
                mintResult
              );

              // Add mint result to the response
              data.mintResult = mintResult;

              // If minting was successful and we got updated token info, display success message
              if (mintResult.success && mintResult.updatedTokenInfo) {
                console.log(
                  "🎊 [FILE DEBUG] Token balance updated successfully!"
                );
                console.log(
                  "💰 [FILE DEBUG] New balance:",
                  mintResult.updatedTokenInfo.userBalance,
                  mintResult.updatedTokenInfo.symbol
                );
              }
            } else {
              console.log(
                "⚠️ [FILE DEBUG] Skipping token minting - conditions not met:"
              );
              console.log("   - Has IPFS Hash:", !!data?.data?.[0]?.Hash);
              console.log("   - Has account:", !!account);
              console.log("   - Data structure:", data?.data);
            }

            setResponses((prev) => [
              ...prev,
              { file: file.name, result: data },
            ]);
          } catch (err) {
            console.error("❌ [FILE DEBUG] Upload error for file:", file.name);
            console.error("❌ [FILE DEBUG] Error details:", err);
          }
        };
        reader.readAsText(file);
      } else {
        console.warn(
          "⚠️ [FILE DEBUG] Unsupported file type:",
          file.type,
          "for file:",
          file.name
        );
        console.warn("Only .txt files are supported.");
      }
    });

    setFiles((prev) => [...prev, ...newFiles]);
  };

  const handleFlowSelection = (flow: 'normal' | 'direct-reclaim') => {
    setSelectedFlow(flow);
    setShowFlowOptions(false);
    
    if (flow === 'direct-reclaim') {
      // Start direct reclaim verification process
      handleDirectReclaimFlow();
    }
    // For normal flow, just continue with the existing upload process
  };

  const handleDirectReclaimFlow = async () => {
    console.log("🚀 [DIRECT RECLAIM] Starting direct reclaim verification...");
    
    if (!account || !signMessage) {
      alert("Please connect MetaMask first!");
      return;
    }

    try {
      // Start reclaim verification process
      setShowReclaimVerification(true);
      console.log("🔍 [DIRECT RECLAIM] Reclaim verification started");
    } catch (error) {
      console.error("❌ [DIRECT RECLAIM] Error:", error);
      alert(`Direct reclaim flow error: ${error}`);
    }
  };

  const handleDirectReclaimComplete = async () => {
    console.log("✅ [DIRECT RECLAIM] Reclaim verification completed");
    console.log("🎯 [DIRECT RECLAIM] Processing verification result...");
    
    if (!account || !signMessage) {
      alert("MetaMask connection lost. Please reconnect.");
      return;
    }

    try {
      // For direct reclaim flow, we simulate the file upload process
      // by creating a proof-based content that gets encrypted to lighthouse
      const proofContent = {
        timestamp: new Date().toISOString(),
        account: account,
        verificationType: "direct-reclaim",
        message: "Direct reclaim verification completed successfully"
      };

      console.log("🔄 [DIRECT RECLAIM] Creating verification content:", proofContent);

      // Send proof content to encryption endpoint
      const response = await fetch("https://brfw2w2m-5500.inc1.devtunnels.ms/encrypt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: JSON.stringify(proofContent, null, 2),
          fileName: `direct_reclaim_verification_${Date.now()}.json`,
          pubKey: account,
          signMess: signMessage,
        }),
      });

      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }

      const encryptData = await response.json();
      console.log("📊 [DIRECT RECLAIM] Encryption response:", encryptData);

      // Process the encrypted result and mint tokens
      if (encryptData?.data?.[0]?.Hash && account) {
        console.log("🎯 [DIRECT RECLAIM] Verification successful, starting token minting...");
        console.log("🔗 [DIRECT RECLAIM] IPFS Hash:", encryptData.data[0].Hash);

        const mintResult = await mintTokensToUser(account, 15); // Give extra tokens for direct reclaim
        console.log("🎉 [DIRECT RECLAIM] Token minting completed:", mintResult);

        // Add to responses to show in UI
        setResponses((prev) => [
          ...prev,
          { 
            file: "🔍 Direct Reclaim Verification", 
            result: { 
              ...encryptData, 
              mintResult,
              isDirectReclaim: true
            } 
          },
        ]);

        if (mintResult.success && mintResult.updatedTokenInfo) {
          console.log("🎊 [DIRECT RECLAIM] Token balance updated successfully!");
          alert(`🎉 Direct reclaim successful! Earned ${mintResult.amount} tokens!\n\n✅ Verification proof encrypted to IPFS\n🪙 Tokens sent to your wallet\n\nTransaction: ${mintResult.txHash?.substring(0, 15)}...`);
        } else {
          throw new Error(`Token minting failed: ${mintResult.error}`);
        }
      } else {
        throw new Error("Encryption failed - no IPFS hash received");
      }
    } catch (error) {
      console.error("❌ [DIRECT RECLAIM] Error processing verification:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      alert(`❌ Direct reclaim processing failed: ${errorMessage}`);
      
      // Add error to responses for UI feedback
      setResponses((prev) => [
        ...prev,
        { 
          file: "❌ Direct Reclaim Error", 
          result: { 
            error: errorMessage,
            isDirectReclaim: true
          } 
        },
      ]);
    } finally {
      setShowReclaimVerification(false);
    }
  };

  const processFiles = (fileList: FileList) => {
    if (selectedFlow === 'normal') {
      // Normal flow - show reclaim verification before file upload
      setPendingFiles(fileList);
      setShowReclaimVerification(true);
    } else {
      // Direct to file processing without additional verification
      processFilesAfterVerification(fileList);
    }
  };

  const handleVerificationComplete = () => {
    if (pendingFiles) {
      processFilesAfterVerification(pendingFiles);
      setPendingFiles(null);
    }
    setShowReclaimVerification(false);
  };

  const handleSkipVerification = () => {
    if (pendingFiles) {
      processFilesAfterVerification(pendingFiles);
      setPendingFiles(null);
    }
    setShowReclaimVerification(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFiles(e.dataTransfer.files);
      e.dataTransfer.clearData();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) processFiles(e.target.files);
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>File Drag & Drop + Encrypt + Earn Tokens</h2>

      {/* MetaMask Connection Section - Always at the top */}
      <div style={styles.walletSection}>
        <button onClick={connectToMetaMask} style={styles.connectButton}>
          {account ? "Wallet Connected ✅" : "🦊 Connect MetaMask Wallet"}
        </button>

        {account && (
          <div style={styles.walletInfo}>
            <div>
              <strong>🔗 Connected:</strong> {account.substring(0, 6)}...
              {account.substring(account.length - 4)}
            </div>
            {tokenName && (
              <>
                <div>
                  <strong>🪙 Token:</strong> {tokenName} ({tokenSymbol})
                </div>
                <div>
                  <strong>💰 Your Balance:</strong> {userBalance} {tokenSymbol}
                </div>
                <div>
                  <strong>🌍 Total Mined:</strong> {totalSupply} {tokenSymbol}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Flow Selection Options - Show after MetaMask connection and signing */}
      {showFlowOptions && account && signMessage && (
        <div style={styles.flowOptionsContainer}>
          <h3 style={styles.flowTitle}>Choose Your Journey 🚀</h3>
          <p style={styles.flowDescription}>
            How would you like to earn your DataCoins today?
          </p>
          
          <div style={styles.flowButtons}>
            <button 
              onClick={() => handleFlowSelection('normal')} 
              style={styles.normalFlowButton}
            >
              <div style={styles.buttonHeader}>📁 Normal Flow</div>
              <div style={styles.buttonSubtext}>
                Upload files → Verify with Reclaim → Encrypt → Earn tokens
              </div>
            </button>
            
            <button 
              onClick={() => handleFlowSelection('direct-reclaim')} 
              style={styles.directReclaimButton}
            >
              <div style={styles.buttonHeader}>⚡ Direct Reclaim</div>
              <div style={styles.buttonSubtext}>
                Start verification now → Get proof → Earn tokens immediately
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Direct Reclaim Verification Modal */}
      {showReclaimVerification && selectedFlow === 'direct-reclaim' && (
        <div style={styles.verificationContainer}>
          <h3>🔍 Direct Reclaim Verification</h3>
          <p>Complete verification to earn tokens immediately!</p>
          <StartReclaimVerification
            onVerificationComplete={handleDirectReclaimComplete}
          />
          <div style={styles.buttonContainer}>
            <button 
              onClick={() => setShowReclaimVerification(false)} 
              style={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Normal Flow File Upload Verification */}
      {showReclaimVerification && selectedFlow === 'normal' && pendingFiles && (
        <div style={styles.verificationContainer}>
          <h3>Please complete verification before uploading files</h3>
          <StartReclaimVerification
            onVerificationComplete={handleVerificationComplete}
          />
          <div style={styles.buttonContainer}>
            <button onClick={handleSkipVerification} style={styles.skipButton}>
              Skip verification for now
            </button>
            <button
              onClick={() => setShowReclaimVerification(false)}
              style={styles.cancelButton}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* File Upload Area - Only show if wallet connected and flow selected */}
      {account && signMessage && !showFlowOptions && !showReclaimVerification && (
        <>
          <div
            style={{
              ...styles.dropzone,
              ...(dragActive ? styles.activeDropzone : {}),
            }}
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => document.getElementById("fileInput")?.click()}
          >
            <p style={styles.dropText}>
              {dragActive
                ? "Release to upload files"
                : "Drag & drop .txt files here"}
            </p>
            <p style={styles.dropSubText}>or click to browse</p>
            <input
              id="fileInput"
              type="file"
              multiple
              accept=".txt"
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
          </div>

          {selectedFlow === 'normal' && (
            <div style={styles.helpText}>
              💡 Files will go through verification before upload in normal flow
            </div>
          )}
        </>
      )}

      {/* Connection Prompt */}
      {!account && (
        <div style={styles.connectionPrompt}>
          <h3>🚀 Get Started</h3>
          <p>Connect your MetaMask wallet to begin earning DataCoins!</p>
          <ul style={styles.featureList}>
            <li>🔒 Secure file encryption with Lighthouse</li>
            <li>🪙 Earn DataCoins for every upload</li>
            <li>✅ Reclaim verification for extra security</li>
            <li>⚡ Choose between normal or direct verification flows</li>
          </ul>
        </div>
      )}

      {files.length > 0 && (
        <div style={styles.fileList}>
          <h3>Files Added:</h3>
          <ul>
            {files.map((file, idx) => (
              <li key={idx}>
                {file.name} ({Math.round(file.size / 1024)} KB)
              </li>
            ))}
          </ul>
        </div>
      )}

      {responses.length > 0 && (
        <div style={styles.responses}>
          <h3>Transaction Results:</h3>
          <ul>
            {responses.map((res, idx) => (
              <li key={idx} style={{ marginBottom: '15px' }}>
                <strong>{res.file}:</strong>{" "}
                {res.result?.error ? (
                  <div style={{ color: '#ff6b6b', marginTop: '5px' }}>
                    ❌ Error: {res.result.error}
                  </div>
                ) : res.result?.data?.[0]?.Hash ? (
                  <div>
                    <div style={{ color: '#51cf66' }}>
                      ✅ {res.result?.isDirectReclaim ? 'Verification Proof' : 'File'} Uploaded → CID: {res.result.data[0].Hash}
                    </div>
                    {res.result?.mintResult && (
                      <div style={{ 
                        marginLeft: "10px", 
                        fontSize: "0.9em",
                        marginTop: '8px',
                        padding: '10px',
                        background: res.result.mintResult.success 
                          ? 'rgba(34, 197, 94, 0.1)' 
                          : 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '8px',
                        border: res.result.mintResult.success 
                          ? '1px solid rgba(34, 197, 94, 0.3)' 
                          : '1px solid rgba(239, 68, 68, 0.3)'
                      }}>
                        {res.result.mintResult.success
                          ? `🪙 Earned ${res.result.mintResult.amount} ${res.result?.isDirectReclaim ? '(bonus for direct reclaim!)' : ''} DataCoins!
                             📝 TX: ${res.result.mintResult.txHash?.substring(0, 10)}... 
                             👤 From: ${res.result.mintResult.from?.substring(0, 6)}...${res.result.mintResult.from?.substring(res.result.mintResult.from.length - 4)}`
                          : `❌ Token transfer failed: ${res.result.mintResult.error}`}
                      </div>
                    )}
                    {res.result?.isDirectReclaim && (
                      <div style={{ 
                        marginTop: '8px', 
                        fontSize: '0.85em', 
                        color: '#a855f7',
                        fontStyle: 'italic'
                      }}>
                        🚀 Direct reclaim verification - no file upload required!
                      </div>
                    )}
                  </div>
                ) : (
                  `❌ Error: ${res.result?.error || "Unknown error"}`
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    fontFamily: '"Inter", "Segoe UI", "Roboto", system-ui, sans-serif',
    padding: "60px 40px",
    maxWidth: "900px",
    margin: "0 auto",
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05))",
    backdropFilter: "blur(20px)",
    WebkitBackdropFilter: "blur(20px)",
    borderRadius: "25px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    boxShadow:
      "0 25px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1) inset",
    position: "relative" as const,
    overflow: "hidden",
  },
  title: {
    textAlign: "center" as const,
    color: "white",
    marginBottom: "50px",
    fontSize: "2.5rem",
    fontWeight: "800",
    textShadow: "0 4px 20px rgba(0, 0, 0, 0.4)",
    background: "linear-gradient(135deg, #ffffff, #f0f0f0)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
  },
  dropzone: {
    border: "2px dashed rgba(255, 255, 255, 0.3)",
    padding: "80px 40px",
    textAlign: "center" as const,
    borderRadius: "20px",
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0.03))",
    backdropFilter: "blur(10px)",
    cursor: "pointer",
    transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
    position: "relative" as const,
    overflow: "hidden",
    marginBottom: "40px",
  },
  activeDropzone: {
    background:
      "linear-gradient(135deg, rgba(102, 126, 234, 0.2), rgba(118, 75, 162, 0.15))",
    borderColor: "rgba(102, 126, 234, 0.5)",
    transform: "scale(1.02)",
    boxShadow: "0 15px 40px rgba(102, 126, 234, 0.3)",
  },
  dropText: {
    fontSize: "1.5rem",
    color: "white",
    marginBottom: "15px",
    fontWeight: "600",
    textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
  },
  dropSubText: {
    fontSize: "1rem",
    color: "rgba(255, 255, 255, 0.8)",
    fontWeight: "400",
    lineHeight: "1.6",
  },
  fileList: {
    marginTop: "40px",
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06))",
    padding: "30px",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.15)",
    backdropFilter: "blur(10px)",
  },
  responses: {
    marginTop: "30px",
    background:
      "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.08))",
    padding: "30px",
    borderRadius: "20px",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    backdropFilter: "blur(10px)",
  },
  verificationContainer: {
    marginTop: "40px",
    marginBottom: "40px",
    padding: "40px",
    background:
      "linear-gradient(135deg, rgba(255, 193, 7, 0.15), rgba(255, 193, 7, 0.08))",
    borderRadius: "20px",
    textAlign: "center" as const,
    border: "1px solid rgba(255, 193, 7, 0.3)",
    backdropFilter: "blur(10px)",
  },
  buttonContainer: {
    marginTop: "30px",
    display: "flex",
    gap: "20px",
    justifyContent: "center",
    flexWrap: "wrap" as const,
  },
  skipButton: {
    padding: "15px 30px",
    background:
      "linear-gradient(135deg, rgba(108, 117, 125, 0.8), rgba(108, 117, 125, 0.6))",
    color: "white",
    border: "none",
    borderRadius: "50px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
    backdropFilter: "blur(10px)",
  },
  cancelButton: {
    padding: "15px 30px",
    background:
      "linear-gradient(135deg, rgba(220, 53, 69, 0.8), rgba(220, 53, 69, 0.6))",
    color: "white",
    border: "none",
    borderRadius: "50px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
    backdropFilter: "blur(10px)",
  },
  walletSection: {
    marginBottom: "40px",
    padding: "30px",
    background:
      "linear-gradient(135deg, rgba(255, 255, 255, 0.12), rgba(255, 255, 255, 0.06))",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    backdropFilter: "blur(10px)",
  },
  connectButton: {
    background: "linear-gradient(135deg, #667eea, #764ba2)",
    color: "white",
    border: "none",
    padding: "18px 36px",
    borderRadius: "50px",
    fontSize: "1.1rem",
    fontWeight: "600",
    cursor: "pointer",
    transition: "all 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)",
    width: "100%",
    marginBottom: "20px",
    position: "relative" as const,
    overflow: "hidden",
  },
  walletInfo: {
    background:
      "linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.08))",
    padding: "20px",
    borderRadius: "15px",
    border: "1px solid rgba(34, 197, 94, 0.3)",
    color: "white",
    fontSize: "0.95rem",
    lineHeight: "1.7",
    backdropFilter: "blur(10px)",
  },
  // New styles for flow options
  flowOptionsContainer: {
    marginTop: "40px",
    marginBottom: "40px",
    padding: "40px",
    background:
      "linear-gradient(135deg, rgba(138, 43, 226, 0.15), rgba(138, 43, 226, 0.08))",
    borderRadius: "20px",
    border: "1px solid rgba(138, 43, 226, 0.3)",
    backdropFilter: "blur(10px)",
    textAlign: "center" as const,
  },
  flowTitle: {
    color: "white",
    fontSize: "1.8rem",
    fontWeight: "700",
    marginBottom: "15px",
    textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
  },
  flowDescription: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: "1.1rem",
    marginBottom: "35px",
    lineHeight: "1.6",
  },
  flowButtons: {
    display: "flex",
    gap: "30px",
    justifyContent: "center",
    flexWrap: "wrap" as const,
  },
  normalFlowButton: {
    background: "linear-gradient(135deg, rgba(59, 130, 246, 0.8), rgba(59, 130, 246, 0.6))",
    color: "white",
    border: "none",
    padding: "25px 30px",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
    backdropFilter: "blur(10px)",
    minWidth: "280px",
    textAlign: "left" as const,
    position: "relative" as const,
    overflow: "hidden",
  },
  directReclaimButton: {
    background: "linear-gradient(135deg, rgba(236, 72, 153, 0.8), rgba(236, 72, 153, 0.6))",
    color: "white",
    border: "none",
    padding: "25px 30px",
    borderRadius: "20px",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "600",
    transition: "all 0.3s ease",
    backdropFilter: "blur(10px)",
    minWidth: "280px",
    textAlign: "left" as const,
    position: "relative" as const,
    overflow: "hidden",
  },
  buttonHeader: {
    fontSize: "1.3rem",
    fontWeight: "700",
    marginBottom: "10px",
  },
  buttonSubtext: {
    fontSize: "0.9rem",
    opacity: "0.9",
    lineHeight: "1.4",
  },
  connectionPrompt: {
    marginTop: "40px",
    padding: "40px",
    background:
      "linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.08))",
    borderRadius: "20px",
    border: "1px solid rgba(16, 185, 129, 0.3)",
    backdropFilter: "blur(10px)",
    textAlign: "center" as const,
    color: "white",
  },
  featureList: {
    textAlign: "left" as const,
    maxWidth: "400px",
    margin: "30px auto 0",
    fontSize: "1rem",
    lineHeight: "2",
    color: "rgba(255, 255, 255, 0.9)",
  },
  helpText: {
    marginTop: "20px",
    padding: "15px 25px",
    background: "rgba(59, 130, 246, 0.1)",
    border: "1px solid rgba(59, 130, 246, 0.3)",
    borderRadius: "15px",
    color: "white",
    textAlign: "center" as const,
    fontSize: "0.95rem",
    backdropFilter: "blur(10px)",
  },
};
