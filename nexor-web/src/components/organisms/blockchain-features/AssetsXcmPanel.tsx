import React, { useState, useEffect } from 'react';
import { useMultiChainWallet } from '../../../hooks/useMultiChainWallet';
import { formatTokenAmount } from '../../../utils/tokens';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardFooter,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  Input,
  NumberInput,
  NumberInputField,
  Select,
  Stack,
  Text,
  useToast,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Spinner,
  Alert,
  AlertIcon,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Image,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Progress,
  HStack,
  VStack,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { ArrowForwardIcon, RepeatIcon, InfoIcon, ExternalLinkIcon } from '@chakra-ui/icons';

interface AssetsXcmPanelProps {
  assetsXcmHook: any;
}

interface Asset {
  id: number;
  name: string;
  symbol: string;
  decimals: number;
  balance: string;
  formattedBalance: string;
  icon?: string;
  isNative: boolean;
  isFrozen: boolean;
  isSufficient: boolean;
  chainId: string;
}

interface XcmTransfer {
  id: string;
  sourceChain: string;
  destinationChain: string;
  asset: string;
  amount: string;
  sender: string;
  recipient: string;
  status: string;
  timestamp: number;
  blockHash?: string;
  extrinsicHash?: string;
}

const AssetsXcmPanel: React.FC<AssetsXcmPanelProps> = ({ assetsXcmHook }) => {
  const toast = useToast();
  const { isConnected, activeAccount, activeChain, switchChain, supportedChains } = useMultiChainWallet();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // Get functions from the hook
  const {
    getAssets,
    getAssetBalance,
    transferAssetLocal,
    transferAssetXcm,
    getXcmTransfers,
    isLoading: hookLoading,
    error: hookError,
  } = assetsXcmHook;
  
  // State
  const [assets, setAssets] = useState<Record<string, Asset[]>>({});
  const [transfers, setTransfers] = useState<XcmTransfer[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state - Transfer
  const [transferType, setTransferType] = useState('local');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [transferAmount, setTransferAmount] = useState('');
  const [destinationChain, setDestinationChain] = useState('');
  
  // Chain colors for visual identification
  const chainColors: Record<string, string> = {
    'Polkadot': 'pink.500',
    'Kusama': 'purple.500',
    'Astar': 'blue.500',
    'Moonbeam': 'teal.500',
    'Acala': 'orange.500',
  };
  
  // Status badge colors
  const statusColors: Record<string, string> = {
    'Completed': 'green',
    'Pending': 'yellow',
    'Failed': 'red',
  };
  
  // Load assets for all chains
  useEffect(() => {
    if (isConnected && activeAccount) {
      loadAllChainAssets();
      loadTransfers();
    }
  }, [isConnected, activeAccount]);
  
  const loadAllChainAssets = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!activeAccount?.address) {
        throw new Error('No active account');
      }
      
      const allAssets: Record<string, Asset[]> = {};
      
      for (const chain of supportedChains) {
        // Switch to the chain to get assets
        await switchChain(chain);
        
        // Get assets for this chain
        const chainAssets = await getAssets();
        
        // Get balances for each asset
        const assetsWithBalances = await Promise.all(
          chainAssets.map(async (asset: any) => {
            const balance = await getAssetBalance(asset.id);
            const formattedBalance = formatTokenAmount(balance, asset.symbol, asset.decimals);
            
            return {
              ...asset,
              balance,
              formattedBalance,
              chainId: chain,
            };
          })
        );
        
        allAssets[chain] = assetsWithBalances;
      }
      
      // Switch back to the original chain
      if (activeChain) {
        await switchChain(activeChain);
      }
      
      setAssets(allAssets);
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading assets:', err);
      setError(err instanceof Error ? err.message : 'Unknown error loading assets');
      setIsLoading(false);
    }
  };
  
  const loadTransfers = async () => {
    try {
      if (!activeAccount?.address) {
        throw new Error('No active account');
      }
      
      const userTransfers = await getXcmTransfers(activeAccount.address);
      setTransfers(userTransfers);
    } catch (err) {
      console.error('Error loading transfers:', err);
      // Don't set error state here to avoid blocking the UI
    }
  };
  
  const handleTransfer = async () => {
    try {
      if (!selectedAsset) {
        throw new Error('No asset selected');
      }
      
      setIsLoading(true);
      setError(null);
      
      // Validate inputs
      if (!recipientAddress) {
        throw new Error('Recipient address is required');
      }
      
      const amount = parseFloat(transferAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount');
      }
      
      // Ensure we're on the correct chain for the selected asset
      if (activeChain !== selectedAsset.chainId) {
        await switchChain(selectedAsset.chainId);
      }
      
      // Perform transfer
      if (transferType === 'local') {
        // Local transfer on the same chain
        await transferAssetLocal(
          selectedAsset.id,
          recipientAddress,
          amount
        );
        
        toast({
          title: 'Transfer successful',
          description: `Transferred ${transferAmount} ${selectedAsset.symbol} to ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      } else {
        // XCM transfer to another chain
        if (!destinationChain) {
          throw new Error('Destination chain is required');
        }
        
        await transferAssetXcm(
          selectedAsset.id,
          recipientAddress,
          amount,
          destinationChain
        );
        
        toast({
          title: 'XCM transfer initiated',
          description: `Initiated transfer of ${transferAmount} ${selectedAsset.symbol} to ${recipientAddress.slice(0, 6)}...${recipientAddress.slice(-4)} on ${destinationChain}`,
          status: 'success',
          duration: 5000,
          isClosable: true,
        });
      }
      
      // Reset form
      setRecipientAddress('');
      setTransferAmount('');
      setDestinationChain('');
      
      // Reload assets and transfers
      await loadAllChainAssets();
      await loadTransfers();
      
      setIsLoading(false);
      onClose();
    } catch (err) {
      console.error('Error transferring asset:', err);
      setError(err instanceof Error ? err.message : 'Unknown error transferring asset');
      setIsLoading(false);
      
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Unknown error transferring asset',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const openTransferModal = (asset: Asset) => {
    setSelectedAsset(asset);
    setTransferType('local');
    setRecipientAddress('');
    setTransferAmount('');
    setDestinationChain('');
    onOpen();
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  const getExplorerUrl = (chain: string, hash: string | undefined) => {
    if (!hash) return '#';
    
    // This is a simplified version - in a real app, you'd have proper explorer URLs for each chain
    const explorers: Record<string, string> = {
      'Polkadot': 'https://polkadot.subscan.io/extrinsic/',
      'Kusama': 'https://kusama.subscan.io/extrinsic/',
      'Astar': 'https://astar.subscan.io/extrinsic/',
      'Moonbeam': 'https://moonbeam.subscan.io/extrinsic/',
      'Acala': 'https://acala.subscan.io/extrinsic/',
    };
    
    const baseUrl = explorers[chain] || '#';
    return `${baseUrl}${hash}`;
  };
  
  return (
    <Box>
      {(error || hookError) && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error || hookError}
        </Alert>
      )}
      
      <Tabs variant="enclosed">
        <TabList>
          <Tab>Your Assets</Tab>
          <Tab>Transfer History</Tab>
        </TabList>
        
        <TabPanels>
          {/* Assets Tab */}
          <TabPanel>
            {isLoading || hookLoading ? (
              <Flex justify="center" p={8}>
                <Spinner size="xl" />
              </Flex>
            ) : (
              <Stack spacing={6}>
                {Object.entries(assets).map(([chain, chainAssets]) => (
                  <Card key={chain} borderColor={chainColors[chain]} borderWidth={1}>
                    <CardHeader bg={chainColors[chain]} color="white">
                      <Heading size="md">{chain} Assets</Heading>
                    </CardHeader>
                    <CardBody>
                      {chainAssets.length === 0 ? (
                        <Text color="gray.500">No assets found on {chain}</Text>
                      ) : (
                        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
                          {chainAssets.map((asset) => (
                            <Card key={`${chain}-${asset.id}`} variant="outline">
                              <CardBody>
                                <Flex align="center" mb={2}>
                                  {asset.icon ? (
                                    <Image 
                                      src={asset.icon} 
                                      boxSize="32px" 
                                      borderRadius="full" 
                                      mr={2}
                                      alt={asset.symbol}
                                    />
                                  ) : (
                                    <Box 
                                      boxSize="32px" 
                                      borderRadius="full" 
                                      bg="gray.200" 
                                      mr={2} 
                                      display="flex" 
                                      alignItems="center" 
                                      justifyContent="center"
                                    >
                                      <Text fontWeight="bold">{asset.symbol.slice(0, 2)}</Text>
                                    </Box>
                                  )}
                                  <Box>
                                    <Text fontWeight="bold">{asset.name}</Text>
                                    <Text fontSize="sm" color="gray.500">{asset.symbol}</Text>
                                  </Box>
                                </Flex>
                                
                                <Stat mt={2}>
                                  <StatLabel>Balance</StatLabel>
                                  <StatNumber>{asset.formattedBalance}</StatNumber>
                                  <StatHelpText>
                                    {asset.isNative ? 'Native Token' : 'Asset'}
                                    {asset.isFrozen && ' • Frozen'}
                                  </StatHelpText>
                                </Stat>
                                
                                <Button 
                                  mt={4} 
                                  colorScheme="blue" 
                                  size="sm" 
                                  width="full"
                                  leftIcon={<ArrowForwardIcon />}
                                  onClick={() => openTransferModal(asset)}
                                  isDisabled={asset.isFrozen || parseFloat(asset.formattedBalance) <= 0}
                                >
                                  Transfer
                                </Button>
                              </CardBody>
                            </Card>
                          ))}
                        </SimpleGrid>
                      )}
                    </CardBody>
                  </Card>
                ))}
                
                <Button 
                  leftIcon={<RepeatIcon />} 
                  colorScheme="blue" 
                  onClick={loadAllChainAssets}
                  isLoading={isLoading || hookLoading}
                >
                  Refresh Assets
                </Button>
              </Stack>
            )}
          </TabPanel>
          
          {/* Transfer History Tab */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="md">XCM Transfer History</Heading>
              </CardHeader>
              <CardBody>
                {isLoading || hookLoading ? (
                  <Flex justify="center" p={4}>
                    <Spinner />
                  </Flex>
                ) : transfers.length === 0 ? (
                  <Text color="gray.500">No transfer history found</Text>
                ) : (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Asset</Th>
                        <Th>Amount</Th>
                        <Th>From</Th>
                        <Th>To</Th>
                        <Th>Status</Th>
                        <Th>Date</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {transfers.map((transfer) => (
                        <Tr key={transfer.id}>
                          <Td>{transfer.asset}</Td>
                          <Td>{transfer.amount}</Td>
                          <Td>
                            <HStack>
                              <Badge colorScheme={chainColors[transfer.sourceChain] ? 'blue' : 'gray'}>
                                {transfer.sourceChain}
                              </Badge>
                              <Text fontSize="sm">{formatAddress(transfer.sender)}</Text>
                            </HStack>
                          </Td>
                          <Td>
                            <HStack>
                              <Badge colorScheme={chainColors[transfer.destinationChain] ? 'green' : 'gray'}>
                                {transfer.destinationChain}
                              </Badge>
                              <Text fontSize="sm">{formatAddress(transfer.recipient)}</Text>
                            </HStack>
                          </Td>
                          <Td>
                            <Badge colorScheme={statusColors[transfer.status] || 'gray'}>
                              {transfer.status}
                            </Badge>
                          </Td>
                          <Td>{formatDate(transfer.timestamp)}</Td>
                          <Td>
                            {transfer.extrinsicHash && (
                              <Tooltip label="View on explorer">
                                <IconButton
                                  as="a"
                                  href={getExplorerUrl(transfer.sourceChain, transfer.extrinsicHash)}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  aria-label="View on explorer"
                                  icon={<ExternalLinkIcon />}
                                  size="sm"
                                />
                              </Tooltip>
                            )}
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      {/* Transfer Modal */}
      {selectedAsset && (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Transfer {selectedAsset.symbol}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box mb={4}>
                <Heading size="sm" mb={2}>Asset Details</Heading>
                <Flex align="center">
                  {selectedAsset.icon ? (
                    <Image 
                      src={selectedAsset.icon} 
                      boxSize="40px" 
                      borderRadius="full" 
                      mr={3}
                      alt={selectedAsset.symbol}
                    />
                  ) : (
                    <Box 
                      boxSize="40px" 
                      borderRadius="full" 
                      bg="gray.200" 
                      mr={3} 
                      display="flex" 
                      alignItems="center" 
                      justifyContent="center"
                    >
                      <Text fontWeight="bold">{selectedAsset.symbol.slice(0, 2)}</Text>
                    </Box>
                  )}
                  <Box>
                    <Text fontWeight="bold">{selectedAsset.name}</Text>
                    <Text fontSize="sm" color="gray.500">
                      {selectedAsset.symbol} • {selectedAsset.chainId}
                    </Text>
                  </Box>
                </Flex>
                
                <Stat mt={3}>
                  <StatLabel>Available Balance</StatLabel>
                  <StatNumber>{selectedAsset.formattedBalance}</StatNumber>
                </Stat>
              </Box>
              
              <Divider my={4} />
              
              <Stack spacing={4}>
                <FormControl>
                  <FormLabel>Transfer Type</FormLabel>
                  <Select 
                    value={transferType}
                    onChange={(e) => setTransferType(e.target.value)}
                  >
                    <option value="local">Local (Same Chain)</option>
                    <option value="xcm">XCM (Cross-Chain)</option>
                  </Select>
                </FormControl>
                
                <FormControl>
                  <FormLabel>Recipient Address</FormLabel>
                  <Input 
                    value={recipientAddress}
                    onChange={(e) => setRecipientAddress(e.target.value)}
                    placeholder="5GrwvaEF5..."
                  />
                </FormControl>
                
                <FormControl>
                  <FormLabel>Amount</FormLabel>
                  <NumberInput max={parseFloat(selectedAsset.formattedBalance)}>
                    <NumberInputField 
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      placeholder="0.0"
                    />
                  </NumberInput>
                  <Text fontSize="sm" color="gray.500" mt={1}>
                    Max: {selectedAsset.formattedBalance}
                  </Text>
                </FormControl>
                
                {transferType === 'xcm' && (
                  <FormControl>
                    <FormLabel>Destination Chain</FormLabel>
                    <Select 
                      value={destinationChain}
                      onChange={(e) => setDestinationChain(e.target.value)}
                      placeholder="Select destination chain"
                    >
                      {supportedChains
                        .filter(chain => chain !== selectedAsset.chainId)
                        .map((chain) => (
                          <option key={chain} value={chain}>{chain}</option>
                        ))}
                    </Select>
                  </FormControl>
                )}
                
                {transferType === 'xcm' && (
                  <Alert status="info" borderRadius="md">
                    <AlertIcon />
                    <Box fontSize="sm">
                      <Text fontWeight="bold">XCM Transfer Information</Text>
                      <Text>
                        Cross-chain transfers may take several minutes to complete and require 
                        sufficient fees on both chains.
                      </Text>
                    </Box>
                  </Alert>
                )}
              </Stack>
            </ModalBody>
            
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button 
                colorScheme="blue" 
                leftIcon={<ArrowForwardIcon />}
                onClick={handleTransfer}
                isLoading={isLoading || hookLoading}
                isDisabled={
                  !recipientAddress || 
                  !transferAmount || 
                  (transferType === 'xcm' && !destinationChain)
                }
              >
                Transfer
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default AssetsXcmPanel;
