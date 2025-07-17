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
  Progress,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
} from '@chakra-ui/react';
import { AddIcon, RepeatIcon, TimeIcon, DownloadIcon } from '@chakra-ui/icons';

interface StreamingPaymentsPanelProps {
  streamingPaymentsContract: any;
}

interface Stream {
  id: number;
  sender: string;
  recipient: string;
  totalAmount: string;
  token: string;
  startTime: number;
  endTime: number;
  lastWithdrawalTime: number;
  withdrawnAmount: string;
  status: string;
}

const StreamingPaymentsPanel: React.FC<StreamingPaymentsPanelProps> = ({ streamingPaymentsContract }) => {
  const toast = useToast();
  const { isConnected, activeAccount } = useMultiChainWallet();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // State
  const [outgoingStreams, setOutgoingStreams] = useState<Stream[]>([]);
  const [incomingStreams, setIncomingStreams] = useState<Stream[]>([]);
  const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [availableAmounts, setAvailableAmounts] = useState<Record<number, string>>({});
  
  // Form state - Create Stream
  const [recipientAddress, setRecipientAddress] = useState('');
  const [streamAmount, setStreamAmount] = useState('');
  const [streamToken, setStreamToken] = useState('DOT');
  const [streamDuration, setStreamDuration] = useState('');
  const [streamDurationUnit, setStreamDurationUnit] = useState('days');
  
  // Available tokens
  const availableTokens = ['DOT', 'KSM', 'ASTR', 'GLMR', 'ACA'];
  
  // Duration units
  const durationUnits = [
    { label: 'Minutes', value: 'minutes', multiplier: 60 * 1000 },
    { label: 'Hours', value: 'hours', multiplier: 60 * 60 * 1000 },
    { label: 'Days', value: 'days', multiplier: 24 * 60 * 60 * 1000 },
    { label: 'Weeks', value: 'weeks', multiplier: 7 * 24 * 60 * 60 * 1000 },
    { label: 'Months', value: 'months', multiplier: 30 * 24 * 60 * 60 * 1000 },
  ];
  
  // Status badge colors
  const statusColors: Record<string, string> = {
    'Active': 'green',
    'Completed': 'blue',
    'Canceled': 'red',
  };
  
  // Load user streams
  useEffect(() => {
    if (isConnected && streamingPaymentsContract && activeAccount) {
      loadUserStreams();
    }
  }, [isConnected, streamingPaymentsContract, activeAccount]);
  
  // Update available amounts periodically for active streams
  useEffect(() => {
    if (isConnected && streamingPaymentsContract) {
      const updateAvailableAmounts = async () => {
        const allStreams = [...incomingStreams, ...outgoingStreams];
        const activeStreams = allStreams.filter(stream => stream.status === 'Active');
        
        const amounts: Record<number, string> = {};
        
        for (const stream of activeStreams) {
          try {
            const available = await streamingPaymentsContract.getAvailableAmount(stream.id);
            amounts[stream.id] = formatTokenAmount(available, stream.token);
          } catch (err) {
            console.error(`Error getting available amount for stream ${stream.id}:`, err);
          }
        }
        
        setAvailableAmounts(amounts);
      };
      
      updateAvailableAmounts();
      const interval = setInterval(updateAvailableAmounts, 10000); // Update every 10 seconds
      
      return () => clearInterval(interval);
    }
  }, [isConnected, streamingPaymentsContract, incomingStreams, outgoingStreams]);
  
  const loadUserStreams = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!activeAccount?.address) {
        throw new Error('No active account');
      }
      
      // Load outgoing streams
      const outgoingStreamIds = await streamingPaymentsContract.getUserStreamsAsSender(activeAccount.address);
      const outgoingStreamPromises = outgoingStreamIds.map(async (id: number) => {
        return await loadStreamInfo(id);
      });
      
      // Load incoming streams
      const incomingStreamIds = await streamingPaymentsContract.getUserStreamsAsRecipient(activeAccount.address);
      const incomingStreamPromises = incomingStreamIds.map(async (id: number) => {
        return await loadStreamInfo(id);
      });
      
      const loadedOutgoingStreams = await Promise.all(outgoingStreamPromises);
      const loadedIncomingStreams = await Promise.all(incomingStreamPromises);
      
      setOutgoingStreams(loadedOutgoingStreams);
      setIncomingStreams(loadedIncomingStreams);
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading streams:', err);
      setError(err instanceof Error ? err.message : 'Unknown error loading streams');
      setIsLoading(false);
    }
  };
  
  const loadStreamInfo = async (id: number): Promise<Stream> => {
    const streamInfo = await streamingPaymentsContract.getStream(id);
    return {
      id,
      sender: streamInfo[0],
      recipient: streamInfo[1],
      totalAmount: formatTokenAmount(streamInfo[2], streamInfo[3]),
      token: streamInfo[3],
      startTime: streamInfo[4],
      endTime: streamInfo[5],
      lastWithdrawalTime: streamInfo[6],
      withdrawnAmount: formatTokenAmount(streamInfo[7], streamInfo[3]),
      status: streamInfo[8],
    };
  };
  
  const handleCreateStream = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Validate inputs
      if (!recipientAddress) {
        throw new Error('Recipient address is required');
      }
      
      const amount = parseFloat(streamAmount);
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount');
      }
      
      const duration = parseFloat(streamDuration);
      if (isNaN(duration) || duration <= 0) {
        throw new Error('Invalid duration');
      }
      
      // Calculate duration in milliseconds
      const durationUnit = durationUnits.find(unit => unit.value === streamDurationUnit);
      if (!durationUnit) {
        throw new Error('Invalid duration unit');
      }
      
      const durationMs = duration * durationUnit.multiplier;
      
      // Create stream
      const streamId = await streamingPaymentsContract.createStream(
        recipientAddress,
        amount,
        streamToken,
        durationMs
      );
      
      toast({
        title: 'Stream created',
        description: `Stream created with ID: ${streamId}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form
      setRecipientAddress('');
      setStreamAmount('');
      setStreamToken('DOT');
      setStreamDuration('');
      setStreamDurationUnit('days');
      
      // Reload streams
      await loadUserStreams();
      setIsLoading(false);
    } catch (err) {
      console.error('Error creating stream:', err);
      setError(err instanceof Error ? err.message : 'Unknown error creating stream');
      setIsLoading(false);
      
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Unknown error creating stream',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleWithdraw = async () => {
    try {
      if (!selectedStream) {
        throw new Error('No stream selected');
      }
      
      setIsLoading(true);
      setError(null);
      
      const withdrawnAmount = await streamingPaymentsContract.withdraw(selectedStream.id);
      
      toast({
        title: 'Withdrawal successful',
        description: `Withdrawn ${formatTokenAmount(withdrawnAmount, selectedStream.token)} ${selectedStream.token}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Reload streams
      await loadUserStreams();
      setIsLoading(false);
      onClose();
    } catch (err) {
      console.error('Error withdrawing from stream:', err);
      setError(err instanceof Error ? err.message : 'Unknown error withdrawing from stream');
      setIsLoading(false);
      
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Unknown error withdrawing from stream',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleCancelStream = async () => {
    try {
      if (!selectedStream) {
        throw new Error('No stream selected');
      }
      
      setIsLoading(true);
      setError(null);
      
      const [available, refunded] = await streamingPaymentsContract.cancelStream(selectedStream.id);
      
      toast({
        title: 'Stream canceled',
        description: `Stream #${selectedStream.id} has been canceled. ${formatTokenAmount(available, selectedStream.token)} ${selectedStream.token} available for withdrawal, ${formatTokenAmount(refunded, selectedStream.token)} ${selectedStream.token} refunded.`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Reload streams
      await loadUserStreams();
      setIsLoading(false);
      onClose();
    } catch (err) {
      console.error('Error canceling stream:', err);
      setError(err instanceof Error ? err.message : 'Unknown error canceling stream');
      setIsLoading(false);
      
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Unknown error canceling stream',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const openStreamModal = (stream: Stream) => {
    setSelectedStream(stream);
    onOpen();
  };
  
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  const calculateProgress = (stream: Stream) => {
    const now = Date.now();
    const total = stream.endTime - stream.startTime;
    const elapsed = now - stream.startTime;
    
    if (stream.status !== 'Active') {
      return 100;
    }
    
    if (now >= stream.endTime) {
      return 100;
    }
    
    return Math.min(100, Math.max(0, (elapsed / total) * 100));
  };
  
  const isSender = (stream: Stream) => {
    return activeAccount?.address === stream.sender;
  };
  
  const isRecipient = (stream: Stream) => {
    return activeAccount?.address === stream.recipient;
  };
  
  const getRemainingTime = (stream: Stream) => {
    if (stream.status !== 'Active') {
      return 'Completed';
    }
    
    const now = Date.now();
    if (now >= stream.endTime) {
      return 'Ended';
    }
    
    const remainingMs = stream.endTime - now;
    const days = Math.floor(remainingMs / (24 * 60 * 60 * 1000));
    const hours = Math.floor((remainingMs % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
    const minutes = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
    
    if (days > 0) {
      return `${days}d ${hours}h remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m remaining`;
    } else {
      return `${minutes}m remaining`;
    }
  };
  
  return (
    <Box>
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      {/* Create Stream Form */}
      <Card mb={6}>
        <CardHeader>
          <Heading size="md">Create New Stream</Heading>
        </CardHeader>
        <CardBody>
          <Stack spacing={4}>
            <FormControl>
              <FormLabel>Recipient Address</FormLabel>
              <Input 
                value={recipientAddress}
                onChange={(e) => setRecipientAddress(e.target.value)}
                placeholder="5GrwvaEF5..."
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Total Amount</FormLabel>
              <NumberInput>
                <NumberInputField 
                  value={streamAmount}
                  onChange={(e) => setStreamAmount(e.target.value)}
                  placeholder="0.0"
                />
              </NumberInput>
            </FormControl>
            
            <FormControl>
              <FormLabel>Token</FormLabel>
              <Select 
                value={streamToken}
                onChange={(e) => setStreamToken(e.target.value)}
              >
                {availableTokens.map((token) => (
                  <option key={token} value={token}>{token}</option>
                ))}
              </Select>
            </FormControl>
            
            <Flex gap={4}>
              <FormControl flex="1">
                <FormLabel>Duration</FormLabel>
                <NumberInput>
                  <NumberInputField 
                    value={streamDuration}
                    onChange={(e) => setStreamDuration(e.target.value)}
                    placeholder="1"
                  />
                </NumberInput>
              </FormControl>
              
              <FormControl flex="1">
                <FormLabel>Unit</FormLabel>
                <Select 
                  value={streamDurationUnit}
                  onChange={(e) => setStreamDurationUnit(e.target.value)}
                >
                  {durationUnits.map((unit) => (
                    <option key={unit.value} value={unit.value}>{unit.label}</option>
                  ))}
                </Select>
              </FormControl>
            </Flex>
          </Stack>
        </CardBody>
        <CardFooter>
          <Button 
            leftIcon={<AddIcon />}
            colorScheme="blue" 
            onClick={handleCreateStream}
            isLoading={isLoading}
            isDisabled={!isConnected}
          >
            Create Stream
          </Button>
        </CardFooter>
      </Card>
      
      {/* Streams List */}
      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6}>
        {/* Outgoing Streams */}
        <Card>
          <CardHeader>
            <Heading size="md">Outgoing Streams</Heading>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <Flex justify="center" p={4}>
                <Spinner />
              </Flex>
            ) : outgoingStreams.length === 0 ? (
              <Text color="gray.500">You don't have any outgoing streams</Text>
            ) : (
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Recipient</Th>
                    <Th>Amount</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {outgoingStreams.map((stream) => (
                    <Tr key={stream.id}>
                      <Td>{formatAddress(stream.recipient)}</Td>
                      <Td>{stream.totalAmount} {stream.token}</Td>
                      <Td>
                        <Badge colorScheme={statusColors[stream.status] || 'gray'}>
                          {stream.status}
                        </Badge>
                      </Td>
                      <Td>
                        <Button 
                          size="sm" 
                          colorScheme="blue"
                          onClick={() => openStreamModal(stream)}
                        >
                          Details
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </CardBody>
        </Card>
        
        {/* Incoming Streams */}
        <Card>
          <CardHeader>
            <Heading size="md">Incoming Streams</Heading>
          </CardHeader>
          <CardBody>
            {isLoading ? (
              <Flex justify="center" p={4}>
                <Spinner />
              </Flex>
            ) : incomingStreams.length === 0 ? (
              <Text color="gray.500">You don't have any incoming streams</Text>
            ) : (
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Sender</Th>
                    <Th>Amount</Th>
                    <Th>Status</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {incomingStreams.map((stream) => (
                    <Tr key={stream.id}>
                      <Td>{formatAddress(stream.sender)}</Td>
                      <Td>{stream.totalAmount} {stream.token}</Td>
                      <Td>
                        <Badge colorScheme={statusColors[stream.status] || 'gray'}>
                          {stream.status}
                        </Badge>
                      </Td>
                      <Td>
                        <Button 
                          size="sm" 
                          colorScheme="blue"
                          onClick={() => openStreamModal(stream)}
                        >
                          Details
                        </Button>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            )}
          </CardBody>
        </Card>
      </SimpleGrid>
      
      {/* Stream Management Modal */}
      {selectedStream && (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Stream #{selectedStream.id}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box mb={4}>
                <Heading size="sm" mb={2}>Stream Details</Heading>
                <Text><strong>Sender:</strong> {formatAddress(selectedStream.sender)}</Text>
                <Text><strong>Recipient:</strong> {formatAddress(selectedStream.recipient)}</Text>
                <Text><strong>Total Amount:</strong> {selectedStream.totalAmount} {selectedStream.token}</Text>
                <Text><strong>Withdrawn:</strong> {selectedStream.withdrawnAmount} {selectedStream.token}</Text>
                <Text><strong>Status:</strong> 
                  <Badge ml={2} colorScheme={statusColors[selectedStream.status] || 'gray'}>
                    {selectedStream.status}
                  </Badge>
                </Text>
                <Text><strong>Start Time:</strong> {formatDate(selectedStream.startTime)}</Text>
                <Text><strong>End Time:</strong> {formatDate(selectedStream.endTime)}</Text>
                <Text><strong>Last Withdrawal:</strong> {formatDate(selectedStream.lastWithdrawalTime)}</Text>
              </Box>
              
              {selectedStream.status === 'Active' && (
                <Box mb={4}>
                  <Heading size="sm" mb={2}>Progress</Heading>
                  <Progress 
                    value={calculateProgress(selectedStream)} 
                    colorScheme="blue" 
                    size="sm" 
                    borderRadius="md"
                    mb={2}
                  />
                  <Flex justify="space-between">
                    <Text fontSize="sm">{formatDate(selectedStream.startTime)}</Text>
                    <Text fontSize="sm" fontWeight="bold">{getRemainingTime(selectedStream)}</Text>
                    <Text fontSize="sm">{formatDate(selectedStream.endTime)}</Text>
                  </Flex>
                </Box>
              )}
              
              <Divider my={4} />
              
              {selectedStream.status === 'Active' && (
                <SimpleGrid columns={2} spacing={4} mb={4}>
                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>Available to Withdraw</StatLabel>
                        <StatNumber>
                          {availableAmounts[selectedStream.id] || '0'} {selectedStream.token}
                        </StatNumber>
                        <StatHelpText>
                          {isRecipient(selectedStream) ? 'Click withdraw to claim' : 'Claimable by recipient'}
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                  
                  <Card>
                    <CardBody>
                      <Stat>
                        <StatLabel>Remaining</StatLabel>
                        <StatNumber>
                          {/* Calculate remaining amount by subtracting withdrawn and available */}
                          {/* This is a simplified calculation */}
                          {parseFloat(selectedStream.totalAmount) - parseFloat(selectedStream.withdrawnAmount) - parseFloat(availableAmounts[selectedStream.id] || '0')} {selectedStream.token}
                        </StatNumber>
                        <StatHelpText>
                          To be streamed
                        </StatHelpText>
                      </Stat>
                    </CardBody>
                  </Card>
                </SimpleGrid>
              )}
              
              {selectedStream.status === 'Active' && (
                <Stack spacing={4} direction="row">
                  {isRecipient(selectedStream) && (
                    <Button
                      leftIcon={<DownloadIcon />}
                      colorScheme="green"
                      onClick={handleWithdraw}
                      isLoading={isLoading}
                      flex="1"
                      isDisabled={!availableAmounts[selectedStream.id] || parseFloat(availableAmounts[selectedStream.id]) <= 0}
                    >
                      Withdraw
                    </Button>
                  )}
                  
                  {(isSender(selectedStream) || isRecipient(selectedStream)) && (
                    <Button
                      leftIcon={<TimeIcon />}
                      colorScheme="red"
                      onClick={handleCancelStream}
                      isLoading={isLoading}
                      flex="1"
                    >
                      Cancel Stream
                    </Button>
                  )}
                </Stack>
              )}
              
              {selectedStream.status !== 'Active' && (
                <Alert status="info">
                  <AlertIcon />
                  This stream is {selectedStream.status.toLowerCase()} and cannot be modified.
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

export default StreamingPaymentsPanel;
