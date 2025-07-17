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
  HStack,
  VStack,
  Icon,
  Tooltip,
  Code,
} from '@chakra-ui/react';
import { AddIcon, RepeatIcon, LockIcon, UnlockIcon, InfoIcon, CheckIcon, CloseIcon } from '@chakra-ui/icons';
import { FaExchangeAlt } from 'react-icons/fa';

interface CrossChainSwapPanelProps {
  crossChainSwapContract: any;
}

interface Swap {
  id: number;
  initiator: string;
  participant: string;
  initiatorChain: string;
  participantChain: string;
  initiatorAmount: string;
  initiatorToken: string;
  participantAmount: string;
  participantToken: string;
  secretHash: string;
  secret: string | null;
  expiration: number;
  status: string;
}

const CrossChainSwapPanel: React.FC<CrossChainSwapPanelProps> = ({ crossChainSwapContract }) => {
  const toast = useToast();
  const { isConnected, activeAccount, activeChain, switchChain } = useMultiChainWallet();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // State
  const [swaps, setSwaps] = useState<Swap[]>([]);
  const [selectedSwap, setSelectedSwap] = useState<Swap | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state - Create Swap
  const [participantAddress, setParticipantAddress] = useState('');
  const [initiatorChain, setInitiatorChain] = useState('');
  const [participantChain, setParticipantChain] = useState('');
  const [initiatorAmount, setInitiatorAmount] = useState('');
  const [initiatorToken, setInitiatorToken] = useState('DOT');
  const [participantAmount, setParticipantAmount] = useState('');
  const [participantToken, setParticipantToken] = useState('KSM');
  const [expirationHours, setExpirationHours] = useState('24');
  
  // Form state - Participate in Swap
  const [swapId, setSwapId] = useState('');
  const [secretToReveal, setSecretToReveal] = useState('');
  
  // Available chains and tokens
  const availableChains = ['Polkadot', 'Kusama', 'Astar', 'Moonbeam', 'Acala'];
  const chainTokens: Record<string, string[]> = {
    'Polkadot': ['DOT'],
    'Kusama': ['KSM'],
    'Astar': ['ASTR'],
    'Moonbeam': ['GLMR'],
    'Acala': ['ACA', 'LDOT', 'AUSD'],
  };
  
  // Status badge colors
  const statusColors: Record<string, string> = {
    'Initiated': 'yellow',
    'Locked': 'blue',
    'Completed': 'green',
    'Refunded': 'red',
    'Expired': 'gray',
  };
  
  // Load user swaps
  useEffect(() => {
    if (isConnected && crossChainSwapContract && activeAccount) {
      loadUserSwaps();
    }
  }, [isConnected, crossChainSwapContract, activeAccount]);
  
  const loadUserSwaps = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!activeAccount?.address) {
        throw new Error('No active account');
      }
      
      const userSwapIds = await crossChainSwapContract.getUserSwaps(activeAccount.address);
      
      const swapPromises = userSwapIds.map(async (id: number) => {
        const swapInfo = await crossChainSwapContract.getSwap(id);
        return {
          id,
          initiator: swapInfo[0],
          participant: swapInfo[1],
          initiatorChain: swapInfo[2],
          participantChain: swapInfo[3],
          initiatorAmount: formatTokenAmount(swapInfo[4], swapInfo[5]),
          initiatorToken: swapInfo[5],
          participantAmount: formatTokenAmount(swapInfo[6], swapInfo[7]),
          participantToken: swapInfo[7],
          secretHash: swapInfo[8],
          secret: swapInfo[9] || null,
          expiration: swapInfo[10],
          status: swapInfo[11],
        };
      });
      
      const loadedSwaps = await Promise.all(swapPromises);
      setSwaps(loadedSwaps);
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading swaps:', err);
      setError(err instanceof Error ? err.message : 'Unknown error loading swaps');
      setIsLoading(false);
    }
  };
  
  const generateSecret = () => {
    // Generate a random 32-byte secret
    const array = new Uint8Array(32);
    window.crypto.getRandomValues(array);
    return Array.from(array)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
  };
  
  const calculateSecretHash = (secret: string) => {
    // In a real implementation, this would use a proper hashing function
    // For demo purposes, we'll just return a mock hash
    return `0x${secret.slice(0, 16)}...`;
  };
  
  const handleInitiateSwap = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Validate inputs
      if (!participantAddress) {
        throw new Error('Participant address is required');
      }
      
      if (!initiatorChain || !participantChain) {
        throw new Error('Both chains must be selected');
      }
      
      const initAmount = parseFloat(initiatorAmount);
      if (isNaN(initAmount) || initAmount <= 0) {
        throw new Error('Invalid initiator amount');
      }
      
      const partAmount = parseFloat(participantAmount);
      if (isNaN(partAmount) || partAmount <= 0) {
        throw new Error('Invalid participant amount');
      }
      
      const expiration = parseFloat(expirationHours);
      if (isNaN(expiration) || expiration <= 0) {
        throw new Error('Invalid expiration time');
      }
      
      // Generate secret and hash
      const secret = generateSecret();
      const secretHash = calculateSecretHash(secret);
      
      // Ensure we're on the initiator chain
      if (activeChain !== initiatorChain) {
        await switchChain(initiatorChain);
      }
      
      // Initiate swap
      const swapId = await crossChainSwapContract.initiateSwap(
        participantAddress,
        initiatorChain,
        participantChain,
        initAmount,
        initiatorToken,
        partAmount,
        participantToken,
        secretHash,
        expiration * 60 * 60 * 1000 // Convert hours to milliseconds
      );
      
      toast({
        title: 'Swap initiated',
        description: (
          <VStack align="start">
            <Text>Swap ID: {swapId}</Text>
            <Text>Secret: {secret}</Text>
            <Text fontWeight="bold">Save this secret! You'll need it to complete the swap.</Text>
          </VStack>
        ),
        status: 'success',
        duration: 10000,
        isClosable: true,
      });
      
      // Reset form
      setParticipantAddress('');
      setInitiatorChain('');
      setParticipantChain('');
      setInitiatorAmount('');
      setInitiatorToken('DOT');
      setParticipantAmount('');
      setParticipantToken('KSM');
      setExpirationHours('24');
      
      // Reload swaps
      await loadUserSwaps();
      setIsLoading(false);
    } catch (err) {
      console.error('Error initiating swap:', err);
      setError(err instanceof Error ? err.message : 'Unknown error initiating swap');
      setIsLoading(false);
      
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Unknown error initiating swap',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleParticipateInSwap = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Validate inputs
      const id = parseInt(swapId);
      if (isNaN(id) || id < 0) {
        throw new Error('Invalid swap ID');
      }
      
      // Get swap details
      const swapInfo = await crossChainSwapContract.getSwap(id);
      const participantChain = swapInfo[3];
      
      // Ensure we're on the participant chain
      if (activeChain !== participantChain) {
        await switchChain(participantChain);
      }
      
      // Participate in swap
      await crossChainSwapContract.participateInSwap(id);
      
      toast({
        title: 'Participated in swap',
        description: `Successfully locked funds for swap #${id}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form
      setSwapId('');
      
      // Reload swaps
      await loadUserSwaps();
      setIsLoading(false);
    } catch (err) {
      console.error('Error participating in swap:', err);
      setError(err instanceof Error ? err.message : 'Unknown error participating in swap');
      setIsLoading(false);
      
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Unknown error participating in swap',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleCompleteSwap = async () => {
    try {
      if (!selectedSwap) {
        throw new Error('No swap selected');
      }
      
      if (!secretToReveal) {
        throw new Error('Secret is required to complete the swap');
      }
      
      setIsLoading(true);
      setError(null);
      
      // Ensure we're on the participant chain
      if (activeChain !== selectedSwap.participantChain) {
        await switchChain(selectedSwap.participantChain);
      }
      
      // Complete swap
      await crossChainSwapContract.completeSwap(selectedSwap.id, secretToReveal);
      
      toast({
        title: 'Swap completed',
        description: `Successfully completed swap #${selectedSwap.id}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form
      setSecretToReveal('');
      
      // Reload swaps
      await loadUserSwaps();
      setIsLoading(false);
      onClose();
    } catch (err) {
      console.error('Error completing swap:', err);
      setError(err instanceof Error ? err.message : 'Unknown error completing swap');
      setIsLoading(false);
      
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Unknown error completing swap',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleRefundSwap = async () => {
    try {
      if (!selectedSwap) {
        throw new Error('No swap selected');
      }
      
      setIsLoading(true);
      setError(null);
      
      // Ensure we're on the initiator chain
      if (activeChain !== selectedSwap.initiatorChain) {
        await switchChain(selectedSwap.initiatorChain);
      }
      
      // Refund swap
      await crossChainSwapContract.refundSwap(selectedSwap.id);
      
      toast({
        title: 'Swap refunded',
        description: `Successfully refunded swap #${selectedSwap.id}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Reload swaps
      await loadUserSwaps();
      setIsLoading(false);
      onClose();
    } catch (err) {
      console.error('Error refunding swap:', err);
      setError(err instanceof Error ? err.message : 'Unknown error refunding swap');
      setIsLoading(false);
      
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Unknown error refunding swap',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const openSwapModal = (swap: Swap) => {
    setSelectedSwap(swap);
    setSecretToReveal('');
    onOpen();
  };
  
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  const isInitiator = (swap: Swap) => {
    return activeAccount?.address === swap.initiator;
  };
  
  const isParticipant = (swap: Swap) => {
    return activeAccount?.address === swap.participant;
  };
  
  const isExpired = (swap: Swap) => {
    return Date.now() > swap.expiration;
  };
  
  const handleInitiatorChainChange = (chain: string) => {
    setInitiatorChain(chain);
    setInitiatorToken(chainTokens[chain][0]);
  };
  
  const handleParticipantChainChange = (chain: string) => {
    setParticipantChain(chain);
    setParticipantToken(chainTokens[chain][0]);
  };
  
  return (
    <Box>
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      <Tabs variant="enclosed">
        <TabList>
          <Tab>Initiate Swap</Tab>
          <Tab>Participate in Swap</Tab>
          <Tab>Your Swaps</Tab>
        </TabList>
        
        <TabPanels>
          {/* Initiate Swap Tab */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="md">Initiate Cross-Chain Swap</Heading>
              </CardHeader>
              <CardBody>
                <Stack spacing={4}>
                  <FormControl>
                    <FormLabel>Participant Address</FormLabel>
                    <Input 
                      value={participantAddress}
                      onChange={(e) => setParticipantAddress(e.target.value)}
                      placeholder="5GrwvaEF5..."
                    />
                  </FormControl>
                  
                  <HStack spacing={4}>
                    <FormControl flex="1">
                      <FormLabel>Your Chain</FormLabel>
                      <Select 
                        value={initiatorChain}
                        onChange={(e) => handleInitiatorChainChange(e.target.value)}
                        placeholder="Select chain"
                      >
                        {availableChains.map((chain) => (
                          <option key={chain} value={chain}>{chain}</option>
                        ))}
                      </Select>
                    </FormControl>
                    
                    <FormControl flex="1">
                      <FormLabel>Participant Chain</FormLabel>
                      <Select 
                        value={participantChain}
                        onChange={(e) => handleParticipantChainChange(e.target.value)}
                        placeholder="Select chain"
                      >
                        {availableChains.map((chain) => (
                          <option key={chain} value={chain}>{chain}</option>
                        ))}
                      </Select>
                    </FormControl>
                  </HStack>
                  
                  <HStack spacing={4}>
                    <FormControl flex="1">
                      <FormLabel>You Send</FormLabel>
                      <NumberInput>
                        <NumberInputField 
                          value={initiatorAmount}
                          onChange={(e) => setInitiatorAmount(e.target.value)}
                          placeholder="0.0"
                        />
                      </NumberInput>
                    </FormControl>
                    
                    <FormControl flex="1">
                      <FormLabel>Token</FormLabel>
                      <Select 
                        value={initiatorToken}
                        onChange={(e) => setInitiatorToken(e.target.value)}
                        isDisabled={!initiatorChain}
                      >
                        {initiatorChain && chainTokens[initiatorChain].map((token) => (
                          <option key={token} value={token}>{token}</option>
                        ))}
                      </Select>
                    </FormControl>
                  </HStack>
                  
                  <HStack spacing={4}>
                    <FormControl flex="1">
                      <FormLabel>You Receive</FormLabel>
                      <NumberInput>
                        <NumberInputField 
                          value={participantAmount}
                          onChange={(e) => setParticipantAmount(e.target.value)}
                          placeholder="0.0"
                        />
                      </NumberInput>
                    </FormControl>
                    
                    <FormControl flex="1">
                      <FormLabel>Token</FormLabel>
                      <Select 
                        value={participantToken}
                        onChange={(e) => setParticipantToken(e.target.value)}
                        isDisabled={!participantChain}
                      >
                        {participantChain && chainTokens[participantChain].map((token) => (
                          <option key={token} value={token}>{token}</option>
                        ))}
                      </Select>
                    </FormControl>
                  </HStack>
                  
                  <FormControl>
                    <FormLabel>Expiration (hours)</FormLabel>
                    <NumberInput>
                      <NumberInputField 
                        value={expirationHours}
                        onChange={(e) => setExpirationHours(e.target.value)}
                        placeholder="24"
                      />
                    </NumberInput>
                  </FormControl>
                </Stack>
              </CardBody>
              <CardFooter>
                <Button 
                  leftIcon={<Icon as={FaExchangeAlt} />}
                  colorScheme="blue" 
                  onClick={handleInitiateSwap}
                  isLoading={isLoading}
                  isDisabled={!isConnected}
                >
                  Initiate Swap
                </Button>
              </CardFooter>
            </Card>
          </TabPanel>
          
          {/* Participate in Swap Tab */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="md">Participate in Swap</Heading>
              </CardHeader>
              <CardBody>
                <Stack spacing={4}>
                  <FormControl>
                    <FormLabel>Swap ID</FormLabel>
                    <NumberInput>
                      <NumberInputField 
                        value={swapId}
                        onChange={(e) => setSwapId(e.target.value)}
                        placeholder="Enter swap ID"
                      />
                    </NumberInput>
                  </FormControl>
                  
                  <Alert status="info">
                    <AlertIcon />
                    <Box>
                      <Text>
                        By participating, you'll lock your funds in the swap contract. The initiator will need to reveal the secret to claim your funds, and you'll use the same secret to claim theirs.
                      </Text>
                    </Box>
                  </Alert>
                </Stack>
              </CardBody>
              <CardFooter>
                <Button 
                  leftIcon={<LockIcon />}
                  colorScheme="blue" 
                  onClick={handleParticipateInSwap}
                  isLoading={isLoading}
                  isDisabled={!isConnected || !swapId}
                >
                  Participate in Swap
                </Button>
              </CardFooter>
            </Card>
          </TabPanel>
          
          {/* Your Swaps Tab */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="md">Your Swaps</Heading>
              </CardHeader>
              <CardBody>
                {isLoading ? (
                  <Flex justify="center" p={4}>
                    <Spinner />
                  </Flex>
                ) : swaps.length === 0 ? (
                  <Text color="gray.500">You don't have any swaps yet</Text>
                ) : (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>ID</Th>
                        <Th>Role</Th>
                        <Th>Exchange</Th>
                        <Th>Status</Th>
                        <Th>Expiration</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {swaps.map((swap) => (
                        <Tr key={swap.id}>
                          <Td>{swap.id}</Td>
                          <Td>
                            {isInitiator(swap) ? (
                              <Badge colorScheme="purple">Initiator</Badge>
                            ) : isParticipant(swap) ? (
                              <Badge colorScheme="teal">Participant</Badge>
                            ) : (
                              <Badge>Observer</Badge>
                            )}
                          </Td>
                          <Td>
                            <Tooltip label={`${swap.initiatorAmount} ${swap.initiatorToken} (${swap.initiatorChain}) ↔ ${swap.participantAmount} ${swap.participantToken} (${swap.participantChain})`}>
                              <Text>
                                {swap.initiatorAmount} {swap.initiatorToken} ↔ {swap.participantAmount} {swap.participantToken}
                              </Text>
                            </Tooltip>
                          </Td>
                          <Td>
                            <Badge colorScheme={statusColors[swap.status] || 'gray'}>
                              {swap.status}
                            </Badge>
                          </Td>
                          <Td>
                            {isExpired(swap) ? (
                              <Text color="red.500">Expired</Text>
                            ) : (
                              formatDate(swap.expiration)
                            )}
                          </Td>
                          <Td>
                            <Button 
                              size="sm" 
                              colorScheme="blue"
                              onClick={() => openSwapModal(swap)}
                            >
                              Manage
                            </Button>
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
      
      {/* Swap Management Modal */}
      {selectedSwap && (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Swap #{selectedSwap.id}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box mb={4}>
                <Heading size="sm" mb={2}>Swap Details</Heading>
                <Text><strong>Initiator:</strong> {formatAddress(selectedSwap.initiator)}</Text>
                <Text><strong>Participant:</strong> {selectedSwap.participant ? formatAddress(selectedSwap.participant) : 'Not yet participated'}</Text>
                <Text><strong>Status:</strong> 
                  <Badge ml={2} colorScheme={statusColors[selectedSwap.status] || 'gray'}>
                    {selectedSwap.status}
                  </Badge>
                </Text>
                <Text><strong>Expiration:</strong> {formatDate(selectedSwap.expiration)}</Text>
                <Text><strong>Secret Hash:</strong> <Code fontSize="sm">{selectedSwap.secretHash}</Code></Text>
                {selectedSwap.secret && (
                  <Text><strong>Secret:</strong> <Code fontSize="sm">{selectedSwap.secret}</Code></Text>
                )}
              </Box>
              
              <Divider my={4} />
              
              <Box mb={4}>
                <Heading size="sm" mb={2}>Exchange Details</Heading>
                <HStack spacing={4} align="center" justify="center" my={4}>
                  <VStack>
                    <Text fontWeight="bold">{selectedSwap.initiatorAmount} {selectedSwap.initiatorToken}</Text>
                    <Text color="gray.500">{selectedSwap.initiatorChain}</Text>
                  </VStack>
                  <Icon as={FaExchangeAlt} boxSize={6} />
                  <VStack>
                    <Text fontWeight="bold">{selectedSwap.participantAmount} {selectedSwap.participantToken}</Text>
                    <Text color="gray.500">{selectedSwap.participantChain}</Text>
                  </VStack>
                </HStack>
              </Box>
              
              <Divider my={4} />
              
              {selectedSwap.status === 'Initiated' && isParticipant(selectedSwap) && (
                <Box mb={4}>
                  <Heading size="sm" mb={2}>Participate</Heading>
                  <Text mb={4}>
                    Lock your funds to participate in this swap. You'll be able to claim the initiator's funds once they reveal the secret.
                  </Text>
                  <Button
                    leftIcon={<LockIcon />}
                    colorScheme="blue"
                    onClick={() => handleParticipateInSwap()}
                    isLoading={isLoading}
                    width="full"
                  >
                    Lock Funds
                  </Button>
                </Box>
              )}
              
              {selectedSwap.status === 'Locked' && isInitiator(selectedSwap) && (
                <Box mb={4}>
                  <Heading size="sm" mb={2}>Complete Swap</Heading>
                  <Text mb={4}>
                    Reveal your secret to claim the participant's funds. The participant will then be able to claim your funds using the same secret.
                  </Text>
                  <FormControl mb={4}>
                    <FormLabel>Secret</FormLabel>
                    <Input
                      value={secretToReveal}
                      onChange={(e) => setSecretToReveal(e.target.value)}
                      placeholder="Enter the secret you generated when initiating the swap"
                    />
                  </FormControl>
                  <Button
                    leftIcon={<UnlockIcon />}
                    colorScheme="green"
                    onClick={handleCompleteSwap}
                    isLoading={isLoading}
                    width="full"
                    isDisabled={!secretToReveal}
                  >
                    Reveal Secret & Complete
                  </Button>
                </Box>
              )}
              
              {selectedSwap.status === 'Locked' && isParticipant(selectedSwap) && selectedSwap.secret && (
                <Box mb={4}>
                  <Heading size="sm" mb={2}>Claim Funds</Heading>
                  <Text mb={4}>
                    The initiator has revealed the secret. You can now claim their funds.
                  </Text>
                  <FormControl mb={4}>
                    <FormLabel>Secret</FormLabel>
                    <Input
                      value={selectedSwap.secret}
                      isReadOnly
                    />
                  </FormControl>
                  <Button
                    leftIcon={<UnlockIcon />}
                    colorScheme="green"
                    onClick={handleCompleteSwap}
                    isLoading={isLoading}
                    width="full"
                  >
                    Claim Funds
                  </Button>
                </Box>
              )}
              
              {(selectedSwap.status === 'Initiated' || selectedSwap.status === 'Locked') && 
               isInitiator(selectedSwap) && isExpired(selectedSwap) && (
                <Box mb={4}>
                  <Heading size="sm" mb={2}>Refund</Heading>
                  <Text mb={4}>
                    This swap has expired. You can claim a refund of your locked funds.
                  </Text>
                  <Button
                    leftIcon={<CloseIcon />}
                    colorScheme="red"
                    onClick={handleRefundSwap}
                    isLoading={isLoading}
                    width="full"
                  >
                    Refund
                  </Button>
                </Box>
              )}
              
              {(selectedSwap.status === 'Completed' || selectedSwap.status === 'Refunded' || selectedSwap.status === 'Expired') && (
                <Alert status="info">
                  <AlertIcon />
                  This swap is {selectedSwap.status.toLowerCase()} and cannot be modified.
                </Alert>
              )}
            </ModalBody>
            
            <ModalFooter>
              <Button variant="ghost" onClick={onClose}>Close</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Box>
  );
};

export default CrossChainSwapPanel;
