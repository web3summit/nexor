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
  Textarea,
  Switch,
} from '@chakra-ui/react';
import { AddIcon, CheckIcon, CloseIcon, TimeIcon } from '@chakra-ui/icons';

interface EscrowPanelProps {
  escrowContract: any;
}

interface Escrow {
  id: number;
  seller: string;
  buyer: string;
  amount: string;
  token: string;
  status: string;
  releaseTime: number | null;
  disputeReason: string | null;
  createdAt: number;
}

const EscrowPanel: React.FC<EscrowPanelProps> = ({ escrowContract }) => {
  const toast = useToast();
  const { isConnected, activeAccount } = useMultiChainWallet();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // State
  const [escrows, setEscrows] = useState<Escrow[]>([]);
  const [selectedEscrow, setSelectedEscrow] = useState<Escrow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state - Create Escrow
  const [sellerAddress, setSellerAddress] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [escrowAmount, setEscrowAmount] = useState('');
  const [escrowToken, setEscrowToken] = useState('DOT');
  const [useReleaseTime, setUseReleaseTime] = useState(false);
  const [releaseTime, setReleaseTime] = useState('');
  
  // Form state - Dispute
  const [disputeReason, setDisputeReason] = useState('');
  
  // Available tokens
  const availableTokens = ['DOT', 'KSM', 'ASTR', 'GLMR', 'ACA'];
  
  // Status badge colors
  const statusColors: Record<string, string> = {
    'Active': 'green',
    'Released': 'blue',
    'Refunded': 'orange',
    'Disputed': 'red',
  };
  
  // Load user escrows
  useEffect(() => {
    if (isConnected && escrowContract && activeAccount) {
      loadUserEscrows();
    }
  }, [isConnected, escrowContract, activeAccount]);
  
  const loadUserEscrows = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!activeAccount?.address) {
        throw new Error('No active account');
      }
      
      const userEscrowIds = await escrowContract.getUserEscrows(activeAccount.address);
      
      const escrowPromises = userEscrowIds.map(async (id: number) => {
        const escrowInfo = await escrowContract.getEscrow(id);
        return {
          id,
          seller: escrowInfo[0],
          buyer: escrowInfo[1],
          amount: formatTokenAmount(escrowInfo[2], escrowInfo[3]),
          token: escrowInfo[3],
          status: escrowInfo[4],
          releaseTime: escrowInfo[5] || null,
          disputeReason: escrowInfo[6] || null,
          createdAt: escrowInfo[7],
        };
      });
      
      const loadedEscrows = await Promise.all(escrowPromises);
      setEscrows(loadedEscrows);
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading escrows:', err);
      setError(err instanceof Error ? err.message : 'Unknown error loading escrows');
      setIsLoading(false);
    }
  };
  
  const handleCreateEscrow = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Validate inputs
      if (!sellerAddress) {
        throw new Error('Seller address is required');
      }
      
      if (!buyerAddress) {
        throw new Error('Buyer address is required');
      }
      
      const amount = parseFloat(escrowAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount');
      }
      
      // Calculate release time if enabled
      let releaseTimeValue = null;
      if (useReleaseTime) {
        const releaseDate = new Date(releaseTime);
        if (isNaN(releaseDate.getTime())) {
          throw new Error('Invalid release time');
        }
        releaseTimeValue = Math.floor(releaseDate.getTime());
      }
      
      // Create escrow
      const escrowId = await escrowContract.createEscrow(
        sellerAddress,
        buyerAddress,
        amount,
        escrowToken,
        releaseTimeValue
      );
      
      toast({
        title: 'Escrow created',
        description: `Escrow created with ID: ${escrowId}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form
      setSellerAddress('');
      setBuyerAddress('');
      setEscrowAmount('');
      setEscrowToken('DOT');
      setUseReleaseTime(false);
      setReleaseTime('');
      
      // Reload escrows
      await loadUserEscrows();
      setIsLoading(false);
    } catch (err) {
      console.error('Error creating escrow:', err);
      setError(err instanceof Error ? err.message : 'Unknown error creating escrow');
      setIsLoading(false);
      
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Unknown error creating escrow',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleReleaseEscrow = async () => {
    try {
      if (!selectedEscrow) {
        throw new Error('No escrow selected');
      }
      
      setIsLoading(true);
      setError(null);
      
      await escrowContract.release(selectedEscrow.id);
      
      toast({
        title: 'Escrow released',
        description: `Escrow #${selectedEscrow.id} has been released successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Reload escrows
      await loadUserEscrows();
      setIsLoading(false);
      onClose();
    } catch (err) {
      console.error('Error releasing escrow:', err);
      setError(err instanceof Error ? err.message : 'Unknown error releasing escrow');
      setIsLoading(false);
      
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Unknown error releasing escrow',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleRefundEscrow = async () => {
    try {
      if (!selectedEscrow) {
        throw new Error('No escrow selected');
      }
      
      setIsLoading(true);
      setError(null);
      
      await escrowContract.refund(selectedEscrow.id);
      
      toast({
        title: 'Escrow refunded',
        description: `Escrow #${selectedEscrow.id} has been refunded successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Reload escrows
      await loadUserEscrows();
      setIsLoading(false);
      onClose();
    } catch (err) {
      console.error('Error refunding escrow:', err);
      setError(err instanceof Error ? err.message : 'Unknown error refunding escrow');
      setIsLoading(false);
      
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Unknown error refunding escrow',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleDisputeEscrow = async () => {
    try {
      if (!selectedEscrow) {
        throw new Error('No escrow selected');
      }
      
      if (!disputeReason) {
        throw new Error('Dispute reason is required');
      }
      
      setIsLoading(true);
      setError(null);
      
      await escrowContract.dispute(selectedEscrow.id, disputeReason);
      
      toast({
        title: 'Escrow disputed',
        description: `Escrow #${selectedEscrow.id} has been disputed successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form
      setDisputeReason('');
      
      // Reload escrows
      await loadUserEscrows();
      setIsLoading(false);
      onClose();
    } catch (err) {
      console.error('Error disputing escrow:', err);
      setError(err instanceof Error ? err.message : 'Unknown error disputing escrow');
      setIsLoading(false);
      
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Unknown error disputing escrow',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const openEscrowModal = (escrow: Escrow) => {
    setSelectedEscrow(escrow);
    setDisputeReason('');
    onOpen();
  };
  
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  const isSeller = (escrow: Escrow) => {
    return activeAccount?.address === escrow.seller;
  };
  
  const isBuyer = (escrow: Escrow) => {
    return activeAccount?.address === escrow.buyer;
  };
  
  return (
    <Box>
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      {/* Create Escrow Form */}
      <Card mb={6}>
        <CardHeader>
          <Heading size="md">Create New Escrow</Heading>
        </CardHeader>
        <CardBody>
          <Stack spacing={4}>
            <FormControl>
              <FormLabel>Seller Address</FormLabel>
              <Input 
                value={sellerAddress}
                onChange={(e) => setSellerAddress(e.target.value)}
                placeholder="5GrwvaEF5..."
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Buyer Address</FormLabel>
              <Input 
                value={buyerAddress}
                onChange={(e) => setBuyerAddress(e.target.value)}
                placeholder="5FHneW46..."
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Amount</FormLabel>
              <NumberInput>
                <NumberInputField 
                  value={escrowAmount}
                  onChange={(e) => setEscrowAmount(e.target.value)}
                  placeholder="0.0"
                />
              </NumberInput>
            </FormControl>
            
            <FormControl>
              <FormLabel>Token</FormLabel>
              <Select 
                value={escrowToken}
                onChange={(e) => setEscrowToken(e.target.value)}
              >
                {availableTokens.map((token) => (
                  <option key={token} value={token}>{token}</option>
                ))}
              </Select>
            </FormControl>
            
            <FormControl display="flex" alignItems="center">
              <FormLabel mb="0">
                Use Release Time
              </FormLabel>
              <Switch 
                isChecked={useReleaseTime}
                onChange={(e) => setUseReleaseTime(e.target.checked)}
              />
            </FormControl>
            
            {useReleaseTime && (
              <FormControl>
                <FormLabel>Release Time</FormLabel>
                <Input 
                  type="datetime-local"
                  value={releaseTime}
                  onChange={(e) => setReleaseTime(e.target.value)}
                />
              </FormControl>
            )}
          </Stack>
        </CardBody>
        <CardFooter>
          <Button 
            leftIcon={<AddIcon />}
            colorScheme="blue" 
            onClick={handleCreateEscrow}
            isLoading={isLoading}
            isDisabled={!isConnected}
          >
            Create Escrow
          </Button>
        </CardFooter>
      </Card>
      
      {/* Escrows List */}
      <Card>
        <CardHeader>
          <Heading size="md">Your Escrows</Heading>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <Flex justify="center" p={4}>
              <Spinner />
            </Flex>
          ) : escrows.length === 0 ? (
            <Text color="gray.500">You don't have any escrows yet</Text>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>Role</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                  <Th>Created</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {escrows.map((escrow) => (
                  <Tr key={escrow.id}>
                    <Td>{escrow.id}</Td>
                    <Td>
                      {isSeller(escrow) ? (
                        <Badge colorScheme="purple">Seller</Badge>
                      ) : isBuyer(escrow) ? (
                        <Badge colorScheme="teal">Buyer</Badge>
                      ) : (
                        <Badge>Observer</Badge>
                      )}
                    </Td>
                    <Td>{escrow.amount} {escrow.token}</Td>
                    <Td>
                      <Badge colorScheme={statusColors[escrow.status] || 'gray'}>
                        {escrow.status}
                      </Badge>
                    </Td>
                    <Td>{formatDate(escrow.createdAt)}</Td>
                    <Td>
                      <Button 
                        size="sm" 
                        colorScheme="blue"
                        onClick={() => openEscrowModal(escrow)}
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
      
      {/* Escrow Management Modal */}
      {selectedEscrow && (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Escrow #{selectedEscrow.id}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box mb={4}>
                <Heading size="sm" mb={2}>Escrow Details</Heading>
                <Text><strong>Seller:</strong> {formatAddress(selectedEscrow.seller)}</Text>
                <Text><strong>Buyer:</strong> {formatAddress(selectedEscrow.buyer)}</Text>
                <Text><strong>Amount:</strong> {selectedEscrow.amount} {selectedEscrow.token}</Text>
                <Text><strong>Status:</strong> 
                  <Badge ml={2} colorScheme={statusColors[selectedEscrow.status] || 'gray'}>
                    {selectedEscrow.status}
                  </Badge>
                </Text>
                <Text><strong>Created:</strong> {formatDate(selectedEscrow.createdAt)}</Text>
                
                {selectedEscrow.releaseTime && (
                  <Text><strong>Release Time:</strong> {formatDate(selectedEscrow.releaseTime)}</Text>
                )}
                
                {selectedEscrow.disputeReason && (
                  <Text><strong>Dispute Reason:</strong> {selectedEscrow.disputeReason}</Text>
                )}
              </Box>
              
              <Divider my={4} />
              
              {selectedEscrow.status === 'Active' && (
                <Tabs>
                  <TabList>
                    <Tab>Release</Tab>
                    <Tab>Refund</Tab>
                    <Tab>Dispute</Tab>
                  </TabList>
                  
                  <TabPanels>
                    <TabPanel>
                      <Box>
                        <Text mb={4}>
                          Release the funds to the seller. This action can be performed by the buyer
                          or automatically when the release time is reached.
                        </Text>
                        <Button
                          leftIcon={<CheckIcon />}
                          colorScheme="green"
                          onClick={handleReleaseEscrow}
                          isLoading={isLoading}
                          isDisabled={!isBuyer(selectedEscrow) && !selectedEscrow.releaseTime}
                          width="full"
                        >
                          Release Funds
                        </Button>
                      </Box>
                    </TabPanel>
                    
                    <TabPanel>
                      <Box>
                        <Text mb={4}>
                          Refund the funds to the buyer. This action can only be performed by the seller.
                        </Text>
                        <Button
                          leftIcon={<CloseIcon />}
                          colorScheme="orange"
                          onClick={handleRefundEscrow}
                          isLoading={isLoading}
                          isDisabled={!isSeller(selectedEscrow)}
                          width="full"
                        >
                          Refund Funds
                        </Button>
                      </Box>
                    </TabPanel>
                    
                    <TabPanel>
                      <Stack spacing={4}>
                        <FormControl>
                          <FormLabel>Dispute Reason</FormLabel>
                          <Textarea
                            value={disputeReason}
                            onChange={(e) => setDisputeReason(e.target.value)}
                            placeholder="Explain the reason for the dispute..."
                          />
                        </FormControl>
                        
                        <Button
                          leftIcon={<TimeIcon />}
                          colorScheme="red"
                          onClick={handleDisputeEscrow}
                          isLoading={isLoading}
                          isDisabled={!(isSeller(selectedEscrow) || isBuyer(selectedEscrow))}
                        >
                          Raise Dispute
                        </Button>
                      </Stack>
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              )}
              
              {selectedEscrow.status !== 'Active' && (
                <Alert status="info">
                  <AlertIcon />
                  This escrow is already {selectedEscrow.status.toLowerCase()} and cannot be modified.
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

export default EscrowPanel;
