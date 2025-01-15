// =================================================================================
// 1. IMPORTS & DEPENDENCIES
// =================================================================================
import React, { useState, useEffect } from "react";
import { useAccount, useReadContract } from "wagmi";
import { publicClient } from "../../../utils/client";
import { I4TKTokenAddress, I4TKTokenABI } from "../../../constants";
import { parseBase64DataURL } from "../../../utils/utilis";
import Piechart from "./Piechart";

// =================================================================================
// 2. COMPONENT DEFINITION
// =================================================================================
const I4TDashboard = () => {
  // -----------------------------------------------------------------------------
  // 2.1 State Management
  // -----------------------------------------------------------------------------
  const { address } = useAccount();
  const [balances, setBalances] = useState([]);
  const [ownedTokens, setOwnedTokens] = useState(new Set());
  const [myTotalBalance, setMyTotalBalance] = useState(0);
  const [networkTotalBalance, setNetworkTotalBalance] = useState(0);

  // -----------------------------------------------------------------------------
  // 2.2 Contract Reads
  // -----------------------------------------------------------------------------
  const { data: lastTokenId, isSuccess: isLastTokenIdSuccess } = useReadContract({
    address: I4TKTokenAddress,
    abi: I4TKTokenABI,
    functionName: "lastTokenId",
  });

  const { data: totalSupply, isSuccess: totalSupplySuccess } = useReadContract({
    address: I4TKTokenAddress,
    abi: I4TKTokenABI,
    functionName: "totalSupply",
  });

  // =================================================================================
  // 3. DATA FETCHING FUNCTIONS
  // =================================================================================
  const getBalance = async (_address, _lastTokenId) => {
    try {
      const addressArray = Array(Number(_lastTokenId) + 1).fill(_address);
      const tokenIdArray = Array.from({ length: Number(_lastTokenId) + 1 }, (_, i) => i);

      console.log("BalanceOfBatch request:", { addresses: addressArray, tokenIds: tokenIdArray });

      const data = await publicClient.readContract({
        address: I4TKTokenAddress,
        abi: I4TKTokenABI,
        functionName: "balanceOfBatch",
        args: [addressArray, tokenIdArray],
      });

      console.log("Balances received:", data.map((b, i) => ({
        tokenId: i,
        balance: b.toString()
      })).filter(b => b.balance !== '0'));

      setBalances(data);
    } catch (error) {
      console.error("Error in getBalance:", error);
    }
  };

  const getTokenTotalSupply = async (tokenId) => {
    return await publicClient.readContract({
      address: I4TKTokenAddress,
      abi: I4TKTokenABI,
      functionName: "totalSupply",
      args: [BigInt(tokenId)],
    });
  };

  const getTokenUri = async (_balances, _lastTokenId) => {
    setOwnedTokens(new Set()); // Reset owned tokens
    console.log("Starting to fetch URIs for balances:", _balances);

    for (let i = 0; i < Number(_lastTokenId) + 1; i++) {
      if (_balances[i] !== BigInt(0)) {
        try {
          console.log(`Processing token ${i} with balance ${_balances[i]}`);
          const URI = await publicClient.readContract({
            address: I4TKTokenAddress,
            abi: I4TKTokenABI,
            functionName: "uri",
            args: [BigInt(i)],
          });

          console.log(`Raw URI received for token ${i}:`, URI);

          let tokenURIJson;

          if (URI.startsWith('data:application/json;base64,')) {
            tokenURIJson = parseBase64DataURL(URI);
          } else if (URI.startsWith('Qm') || URI.startsWith('bafy')) {
            const response = await fetch(`https://ipfs.io/ipfs/${URI}`);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              tokenURIJson = await response.json();
            } else {
              throw new Error(`Unexpected content type: ${contentType}`);
            }
          } else {
            throw new Error(`Unsupported URI format: ${URI}`);
          }

          console.log(`Token ${i}: Parsed metadata:`, tokenURIJson);

          if (!tokenURIJson.name || !tokenURIJson.properties) {
            throw new Error('Invalid metadata structure');
          }

          const tokenTotalSupply = await getTokenTotalSupply(i);
          const ownershipPercentage = (Number(_balances[i]) / Number(tokenTotalSupply)) * 100;

          setOwnedTokens((prev) => new Set([...prev, { 
            tokenId: i, 
            balance: _balances[i], 
            tokenURIJson,
            ownershipPercentage
          }]));

        } catch (error) {
          console.error(`Error processing token ${i}:`, error);
          const defaultMetadata = {
            name: `I4TK Token #${i}`,
            properties: {
              title: `Document #${i}`,
              description: `Metadata not available: ${error.message}`
            }
          };
          setOwnedTokens((prev) => new Set([...prev, { 
            tokenId: i, 
            balance: _balances[i], 
            tokenURIJson: defaultMetadata,
            ownershipPercentage: 0
          }]));
        }
      }
    }
  };

  // =================================================================================
  // 4. EFFECTS & DATA PROCESSING
  // =================================================================================

  // 4.1 Fetch balances when lastTokenId is available
  useEffect(() => {
    const getAllbalance = async () => {
      if (address !== "undefined" && lastTokenId !== undefined) {
        console.log("Fetching balances for:", {
          address,
          lastTokenId: lastTokenId.toString(),
        });
        await getBalance(address, lastTokenId);
      }
    };
    getAllbalance();
  }, [lastTokenId, address]);

  // 4.2 Update network total balance
  useEffect(() => {
    if (address !== "undefined" && totalSupply !== undefined) {
      setNetworkTotalBalance(Number(totalSupply));
    }
  }, [totalSupplySuccess, address, totalSupply]);

  // 4.3 Fetch token URIs when balances update
  useEffect(() => {
    const getOwnToken = async () => {
      if (balances?.length > 0 && balances.some(b => b !== BigInt(0)) && ownedTokens.size === 0) {
        await getTokenUri(balances, lastTokenId);
      }
    };
    getOwnToken();
  }, [balances, lastTokenId, ownedTokens.size]);

  // 4.4 Calculate total balance
  useEffect(() => {
    if (ownedTokens.size > 0) {
      const totalBalance = Array.from(ownedTokens).reduce((acc, token) => {
        return acc + Number(token.balance);
      }, 0);
      setMyTotalBalance(totalBalance);
    }
  }, [ownedTokens]);

  // =================================================================================
  // 5. RENDER
  // =================================================================================
  return (
    <div className="bg-white">
      {/* Main Title */}
      <div className="mx-auto max-w-2xl px-0 py-4 sm:px-6 sm:py-4 lg:max-w-7xl lg:px-2">
        <h1 className="text-4xl font-serif tracking-tight text-gray-900 mb-8">

        </h1>
      </div>

      {/* Statistics Section */}
      <div className="mx-auto max-w-2xl px-0 py-0 sm:px-6 sm:py-2 lg:max-w-7xl lg:px-2">
        <h2 className="text-2xl font-serif tracking-tight text-gray-900">Statistics</h2>
        <h3 className="text-lg font-serif text-gray-600 mt-2">
          Network total IP value: {networkTotalBalance}
        </h3>
        <div className="mt-4">
          <Piechart myBalance={myTotalBalance} totalSupply={networkTotalBalance} />
        </div>
      </div>

      {/* NFTs Grid */}
      <div className="mx-auto max-w-2xl px-2 py-4 sm:px-6 sm:py-4 lg:max-w-7xl lg:px-2">
        <h2 className="text-2xl font-serif tracking-tight text-gray-900">My IP NFTs</h2>

        <div className="mt-6 grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
          {Array.from(ownedTokens).map((token, index) => (
            <div key={index} className="group relative">
              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-md bg-gray-200 lg:aspect-none group-hover:opacity-75 lg:h-80">
                <img
                  src="/assets/logos/I4T token.jpeg"
                  className="h-full w-full object-contain object-center lg:h-full lg:w-full"
                  alt={token.tokenURIJson.name}
                />
              </div>
              <div className="mt-4 flex justify-between">
                <div>
                  <h3 className="text-sm text-gray-700">
                    <a href="#">
                      <span aria-hidden="true" className="absolute inset-0" />
                      {token.tokenURIJson.name}
                    </a>
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {token.tokenURIJson.properties.title}
                  </p>
                </div>
                <p className="text-sm font-medium text-gray-900">
                  ownership: {token.ownershipPercentage.toFixed(2)}%
                </p>
              </div>
            </div>
          ))}
        </div>

        {(ownedTokens.size === 0) && (
          <div className="text-center text-gray-500 py-8">
            No documents found for this address
          </div>
        )}
      </div>
    </div>
  );
};

export default I4TDashboard;
