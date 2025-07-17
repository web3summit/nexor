import React, { useState, useEffect } from 'react';
import { useMultiChainWallet } from '../../hooks/useMultiChainWallet';
import { useInkContracts } from '../../hooks/useInkContracts';
import { useAssetsAndXcm } from '../../hooks/useAssetsAndXcm';
import { useHyperbridge } from '../../hooks/useHyperbridge';

// UI Components
import {
  Box,
  Flex,
  Heading,
  Text,
  Button,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Alert,
  AlertIcon,
  Spinner,
  Divider,
  useToast,
} from '@chakra-ui/react';

// Feature panels
import VaultPanel from './blockchain-features/VaultPanel';
import EscrowPanel from './blockchain-features/EscrowPanel';
import StreamingPaymentsPanel from './blockchain-features/StreamingPaymentsPanel';
import CrossChainSwapPanel from './blockchain-features/CrossChainSwapPanel';
import KeyRegistryPanel from './blockchain-features/KeyRegistryPanel';
import AssetsXcmPanel from './blockchain-features/AssetsXcmPanel';
import HyperbridgePanel from './blockchain-features/HyperbridgePanel';

// Types
interface FeatureTab {
  id: string;
  name: string;
  description: string;
  component: React.ReactNode;
}

interface MultiChainWallet {
  isConnected: boolean;
  activeChain?: string;
  activeAccount?: {
    address: string;
    name?: string;
  };
  supportedChains: string[];
  connect: () => Promise<void>;
  disconnect: () => void;
  switchChain: (chain: string) => Promise<void>;
}

interface InkContracts {
  vaultContract: any;
  escrowContract: any;
  streamingPaymentsContract: any;
  crossChainSwapContract: any;
  keyRegistryContract: any;
  isLoading: boolean;
  error: string | null;
}

const BlockchainFeaturesDashboard: React.FC = () => {
  const toast = useToast();
  const { 
    isConnected, 
    activeChain, 
    activeAccount, 
    connect, 
    disconnect,
    switchChain,
    supportedChains
  } = useMultiChainWallet() as MultiChainWallet;
  
  const { 
    vaultContract, 
    escrowContract, 
    streamingPaymentsContract, 
    crossChainSwapContract, 
    keyRegistryContract,
    isLoading: contractsLoading,
    error: contractsError
  } = useInkContracts() as InkContracts;
  
  const {
    isLoading: assetsLoading,
    error: assetsError,
    ...assetsXcmHook
  } = useAssetsAndXcm();
  
  const {
    isLoading: hyperbridgeLoading,
    error: hyperbridgeError
  } = useHyperbridge();
  
  // Feature tabs configuration
  const featureTabs: FeatureTab[] = [
    {
      id: 'vaults',
      name: 'Vaults',
      description: 'Create and manage secure token vaults with multi-signature capabilities',
      component: <VaultPanel vaultContract={vaultContract} />
    },
    {
      id: 'escrow',
      name: 'Escrow',
      description: 'Secure peer-to-peer transactions with escrow services',
      component: <EscrowPanel escrowContract={escrowContract} />
    },
    {
      id: 'streaming',
      name: 'Streaming Payments',
      description: 'Set up streaming salaries and subscription payments',
      component: <StreamingPaymentsPanel streamingPaymentsContract={streamingPaymentsContract} />
    },
    {
      id: 'swaps',
      name: 'Cross-Chain Swaps',
      description: 'Swap tokens across different blockchain networks',
      component: <CrossChainSwapPanel crossChainSwapContract={crossChainSwapContract} />
    },
    {
      id: 'keys',
      name: 'Key Registry',
      description: 'Manage your on-chain identity and cryptographic keys',
      component: <KeyRegistryPanel keyRegistryContract={keyRegistryContract} />
    },
    {
      id: 'assets',
      name: 'Assets & XCM',
      description: 'Manage assets and perform cross-chain transfers',
      component: <AssetsXcmPanel assetsXcmHook={assetsXcmHook} />
    },
    {
      id: 'hyperbridge',
      name: 'Hyperbridge',
      description: 'Trustless cross-chain storage queries and verification',
      component: <HyperbridgePanel />
    }
  ];
  
  // State for active tab
  const [activeTabIndex, setActiveTabIndex] = useState(0);
  
  // Check if wallet is connected and contracts are loaded
  const isReady = isConnected && !contractsLoading;
  
  // Handle errors
  useEffect(() => {
    const errors = [contractsError, assetsError, hyperbridgeError].filter(Boolean);
    
    if (errors.length > 0) {
      errors.forEach(error => {
        if (error) {
          toast({
            title: 'Error',
            description: error,
            status: 'error',
            duration: 5000,
            isClosable: true,
          });
        }
      });
    }
  }, [contractsError, assetsError, hyperbridgeError, toast]);
  
  // Loading state
  const isLoading = contractsLoading || assetsLoading || hyperbridgeLoading;
  
  return (
    <Box p={4} maxW="1200px" mx="auto">
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Box>
          <Heading size="lg">Nexor Blockchain Features</Heading>
          <Text color="gray.500">Access advanced multi-chain smart contract features</Text>
        </Box>
        
        {/* Wallet Connection */}
        <Box>
          {isConnected ? (
            <Flex alignItems="center" gap={4}>
              <Box>
                <Text fontWeight="bold">{activeAccount?.name || activeAccount?.address?.slice(0, 6) + '...' + activeAccount?.address?.slice(-4)}</Text>
                <Text fontSize="sm" color="gray.500">{activeChain?.name}</Text>
              </Box>
              <Button colorScheme="red" variant="outline" onClick={disconnect}>
                Disconnect
              </Button>
            </Flex>
          ) : (
            <Button colorScheme="blue" onClick={connect}>
              Connect Wallet
            </Button>
          )}
        </Box>
      </Flex>
      
      {/* Connection Status Alert */}
      {!isConnected && (
        <Alert status="warning" mb={6} borderRadius="md">
          <AlertIcon />
          Please connect your wallet to access all blockchain features
        </Alert>
      )}
      
      {/* Loading Indicator */}
      {isLoading && (
        <Flex justify="center" align="center" my={8}>
          <Spinner size="xl" color="blue.500" mr={4} />
          <Text fontSize="lg">Loading blockchain features...</Text>
        </Flex>
      )}
      
      {/* Feature Tabs */}
      {isReady && !isLoading && (
        <Tabs 
          variant="enclosed" 
          colorScheme="blue" 
          onChange={(index: number) => setActiveTabIndex(index)}
          isLazy
        >
          <TabList>
            {featureTabs.map((tab) => (
              <Tab key={tab.id}>{tab.name}</Tab>
            ))}
          </TabList>
          
          <TabPanels>
            {featureTabs.map((tab) => (
              <TabPanel key={tab.id} p={4}>
                <Box mb={4}>
                  <Heading size="md">{tab.name}</Heading>
                  <Text color="gray.600">{tab.description}</Text>
                </Box>
                <Divider mb={6} />
                {tab.component}
              </TabPanel>
            ))}
          </TabPanels>
        </Tabs>
      )}
    </Box>
  );
};

export default BlockchainFeaturesDashboard;
