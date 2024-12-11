import React from 'react';
import {
  ConnectButton,
  RainbowKitProvider,
  darkTheme,
} from '@rainbow-me/rainbowkit';
import '@rainbow-me/rainbowkit/styles.css';
import { useAccount } from 'wagmi';

const WalletConnect = () => {
  const { address } = useAccount();

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        mounted,
      }) => {
        const ready = mounted;
        const connected = ready && account && chain;

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              style: {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <button 
                    onClick={openConnectModal}
                    className="inline-flex items-center px-4 py-2 border border-blue-300 rounded-md text-blue-500 hover:bg-silver-80 transition-colors duration-200"
                    type="button"
                  >
                    <span className="mr-2">🌈</span>
                    Connect Wallet
                  </button>
                );
              }

              return (
                <div className="flex items-center gap-3">
                  <button
                    onClick={openChainModal}
                    className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-md text-blue-500 hover:bg-silver-80 transition-colors duration-200"
                    type="button"
                  >
                    {chain.name}
                    {chain.unsupported && ' ⚠️'}
                  </button>

                  <button
                    onClick={openAccountModal}
                    className="inline-flex items-center px-3 py-2 border border-blue-300 rounded-md text-blue-500 hover:bg-silver-80 transition-colors duration-200"
                    type="button"
                  >
                    {account.displayBalance
                      ? `${account.displayBalance}`
                      : ''}
                    <span className="ml-2">
                      {account.displayName}
                    </span>
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};

export default WalletConnect;