import React, { useState, useEffect } from 'react';
import { useMultiChainWallet } from '../../../hooks/useMultiChainWallet';
import { useHyperbridge } from '../../../hooks/useHyperbridge';
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
  Code,
  Textarea,
  IconButton,
  Tooltip,
  Switch,
  FormHelperText,
  VStack,
  HStack,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
} from '@chakra-ui/react';
import { CheckIcon, SearchIcon, RepeatIcon, InfoIcon, ExternalLinkIcon } from '@chakra-ui/icons';

interface HyperbridgePanelProps {}

const HyperbridgePanel: React.FC<HyperbridgePanelProps> = () => {
  const toast = useToast();
  const { isConnected, activeAccount, activeChain } = useMultiChainWallet();
  const { 
    isLoading: hyperbridgeLoading, 
    error: hyperbridgeError,
    supportedChains,
    queryRemoteStorage,
    verifyStorageProof,
    verifyPayment,
    verifyKeyRegistry,
    clearCachedConnections
  } = useHyperbridge();
  
  // State
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [queryResults, setQueryResults] = useState<any>(null);
  const [verificationResults, setVerificationResults] = useState<any>(null);
  
  // Form state - Query Storage
  const [sourceChain, setSourceChain] = useState('');
  const [storageKey, setStorageKey] = useState('');
  const [blockHash, setBlockHash] = useState('');
  const [useLatestBlock, setUseLatestBlock] = useState(true);
  
  // Form state - Verify Proof
  const [proofType, setProofType] = useState('storage');
  const [proofData, setProofData] = useState('');
  const [proofChain, setProofChain] = useState('');
  const [verificationParams, setVerificationParams] = useState('');
  
  // Query history
  const [queryHistory, setQueryHistory] = useState<Array<{
    id: string;
    timestamp: number;
    sourceChain: string;
    storageKey: string;
    blockHash?: string;
    result: any;
  }>>([]);
  
  // Verification history
  const [verificationHistory, setVerificationHistory] = useState<Array<{
    id: string;
    timestamp: number;
    proofType: string;
    proofChain: string;
    result: any;
    isValid: boolean;
  }>>([]);
  
  // Handle query remote storage
  const handleQueryStorage = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setQueryResults(null);
      
      // Validate inputs
      if (!sourceChain) {
        throw new Error('Source chain is required');
      }
      
      if (!storageKey) {
        throw new Error('Storage key is required');
      }
      
      if (!useLatestBlock && !blockHash) {
        throw new Error('Block hash is required when not using latest block');
      }
      
      // Query remote storage
      const result = await queryRemoteStorage(
        sourceChain,
        storageKey,
        useLatestBlock ? undefined : blockHash
      );
      
      // Update query results
      setQueryResults(result);
      
      // Add to query history
      const historyItem = {
        id: `query-${Date.now()}`,
        timestamp: Date.now(),
        sourceChain,
        storageKey,
        blockHash: useLatestBlock ? 'latest' : blockHash,
        result,
      };
      
      setQueryHistory(prev => [historyItem, ...prev].slice(0, 10)); // Keep last 10 queries
      
      toast({
        title: 'Query successful',
        description: 'Remote storage query completed successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error querying remote storage:', err);
      setError(err instanceof Error ? err.message : 'Unknown error querying remote storage');
      setIsLoading(false);
      
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Unknown error querying remote storage',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle verify proof
  const handleVerifyProof = async () => {
    try {
      setIsLoading(true);
      setError(null);
      setVerificationResults(null);
      
      // Validate inputs
      if (!proofType) {
        throw new Error('Proof type is required');
      }
      
      if (!proofChain) {
        throw new Error('Chain is required');
      }
      
      if (!proofData) {
        throw new Error('Proof data is required');
      }
      
      let result;
      let parsedProofData;
      
      try {
        parsedProofData = JSON.parse(proofData);
      } catch (e) {
        throw new Error('Invalid proof data format. Must be valid JSON.');
      }
      
      // Verify based on proof type
      switch (proofType) {
        case 'storage':
          result = await verifyStorageProof(proofChain, parsedProofData);
          break;
        case 'payment':
          const params = verificationParams ? JSON.parse(verificationParams) : {};
          result = await verifyPayment(proofChain, parsedProofData, params);
          break;
        case 'keyRegistry':
          const keyParams = verificationParams ? JSON.parse(verificationParams) : {};
          result = await verifyKeyRegistry(proofChain, parsedProofData, keyParams);
          break;
        default:
          throw new Error('Unsupported proof type');
      }
      
      // Update verification results
      setVerificationResults(result);
      
      // Add to verification history
      const historyItem = {
        id: `verify-${Date.now()}`,
        timestamp: Date.now(),
        proofType,
        proofChain,
        result,
        isValid: result.isValid,
      };
      
      setVerificationHistory(prev => [historyItem, ...prev].slice(0, 10)); // Keep last 10 verifications
      
      toast({
        title: result.isValid ? 'Verification successful' : 'Verification failed',
        description: result.isValid 
          ? 'The proof has been verified successfully' 
          : 'The proof verification failed',
        status: result.isValid ? 'success' : 'warning',
        duration: 5000,
        isClosable: true,
      });
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error verifying proof:', err);
      setError(err instanceof Error ? err.message : 'Unknown error verifying proof');
      setIsLoading(false);
      
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Unknown error verifying proof',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  // Handle clear connections cache
  const handleClearCache = () => {
    clearCachedConnections();
    toast({
      title: 'Cache cleared',
      description: 'Hyperbridge connection cache has been cleared',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };
  
  // Format date
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  // Format JSON for display
  const formatJson = (json: any) => {
    return JSON.stringify(json, null, 2);
  };
  
  // Get placeholder for storage key based on chain
  const getStorageKeyPlaceholder = () => {
    switch (sourceChain) {
      case 'Polkadot':
        return '0x26aa394eea5630e07c48ae0c9558cef7b99d880ec681799c0cf30e8886371da9';
      case 'Kusama':
        return '0x26aa394eea5630e07c48ae0c9558cef780d41e5e16056765bc8461851072c9d7';
      default:
        return '0x...';
    }
  };
  
  // Get helper text for storage key based on chain
  const getStorageKeyHelper = () => {
    switch (sourceChain) {
      case 'Polkadot':
        return 'Example: System.Number for block number';
      case 'Kusama':
        return 'Example: Balances.TotalIssuance for total issuance';
      case 'Astar':
        return 'Example: EVM.AccountCodes for EVM account code';
      case 'Moonbeam':
        return 'Example: ParachainStaking.SelectedCandidates for validators';
      case 'Acala':
        return 'Example: Oracle.Values for price feeds';
      default:
        return 'Enter a hex-encoded storage key';
    }
  };
  
  // Get verification params placeholder based on proof type
  const getVerificationParamsPlaceholder = () => {
    switch (proofType) {
      case 'payment':
        return '{\n  "paymentId": "123",\n  "amount": "1000000000000"\n}';
      case 'keyRegistry':
        return '{\n  "keyId": 5,\n  "owner": "5GrwvaEF..."\n}';
      default:
        return '';
    }
  };
  
  return (
    <Box>
      {(error || hyperbridgeError) && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error || hyperbridgeError}
        </Alert>
      )}
      
      <Tabs variant="enclosed">
        <TabList>
          <Tab>Query Remote Storage</Tab>
          <Tab>Verify Proofs</Tab>
          <Tab>Query History</Tab>
        </TabList>
        
        <TabPanels>
          {/* Query Remote Storage Tab */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="md">Query Remote Chain Storage</Heading>
              </CardHeader>
              <CardBody>
                <Stack spacing={4}>
                  <FormControl>
                    <FormLabel>Source Chain</FormLabel>
                    <Select 
                      value={sourceChain}
                      onChange={(e) => setSourceChain(e.target.value)}
                      placeholder="Select source chain"
                    >
                      {supportedChains.map((chain) => (
                        <option key={chain} value={chain}>{chain}</option>
                      ))}
                    </Select>
                    <FormHelperText>
                      Select the chain you want to query data from
                    </FormHelperText>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Storage Key</FormLabel>
                    <Input 
                      value={storageKey}
                      onChange={(e) => setStorageKey(e.target.value)}
                      placeholder={getStorageKeyPlaceholder()}
                    />
                    <FormHelperText>
                      {getStorageKeyHelper()}
                    </FormHelperText>
                  </FormControl>
                  
                  <FormControl display="flex" alignItems="center">
                    <FormLabel htmlFor="use-latest-block" mb="0">
                      Use Latest Block
                    </FormLabel>
                    <Switch 
                      id="use-latest-block"
                      isChecked={useLatestBlock}
                      onChange={(e) => setUseLatestBlock(e.target.checked)}
                    />
                  </FormControl>
                  
                  {!useLatestBlock && (
                    <FormControl>
                      <FormLabel>Block Hash</FormLabel>
                      <Input 
                        value={blockHash}
                        onChange={(e) => setBlockHash(e.target.value)}
                        placeholder="0x..."
                      />
                      <FormHelperText>
                        Specific block hash to query at
                      </FormHelperText>
                    </FormControl>
                  )}
                  
                  <Button 
                    leftIcon={<SearchIcon />}
                    colorScheme="blue" 
                    onClick={handleQueryStorage}
                    isLoading={isLoading || hyperbridgeLoading}
                    isDisabled={!isConnected || !sourceChain || !storageKey || (!useLatestBlock && !blockHash)}
                    mt={2}
                  >
                    Query Storage
                  </Button>
                </Stack>
                
                {queryResults && (
                  <Box mt={6}>
                    <Heading size="sm" mb={2}>Query Results</Heading>
                    <Card variant="outline">
                      <CardBody>
                        <Text fontWeight="bold" mb={1}>Chain: {sourceChain}</Text>
                        <Text fontWeight="bold" mb={1}>Storage Key: {storageKey}</Text>
                        <Text fontWeight="bold" mb={1}>Block: {useLatestBlock ? 'Latest' : blockHash}</Text>
                        <Divider my={3} />
                        <Text fontWeight="bold" mb={2}>Result:</Text>
                        <Box 
                          bg="gray.50" 
                          p={3} 
                          borderRadius="md" 
                          overflowX="auto"
                          maxHeight="300px"
                          overflowY="auto"
                        >
                          <Code display="block" whiteSpace="pre">
                            {formatJson(queryResults)}
                          </Code>
                        </Box>
                      </CardBody>
                    </Card>
                  </Box>
                )}
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Verify Proofs Tab */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="md">Verify Cross-Chain Proofs</Heading>
              </CardHeader>
              <CardBody>
                <Stack spacing={4}>
                  <FormControl>
                    <FormLabel>Proof Type</FormLabel>
                    <Select 
                      value={proofType}
                      onChange={(e) => setProofType(e.target.value)}
                    >
                      <option value="storage">Storage Proof</option>
                      <option value="payment">Payment Proof</option>
                      <option value="keyRegistry">Key Registry Proof</option>
                    </Select>
                    <FormHelperText>
                      Select the type of proof you want to verify
                    </FormHelperText>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Chain</FormLabel>
                    <Select 
                      value={proofChain}
                      onChange={(e) => setProofChain(e.target.value)}
                      placeholder="Select chain"
                    >
                      {supportedChains.map((chain) => (
                        <option key={chain} value={chain}>{chain}</option>
                      ))}
                    </Select>
                    <FormHelperText>
                      Select the chain the proof was generated from
                    </FormHelperText>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Proof Data</FormLabel>
                    <Textarea 
                      value={proofData}
                      onChange={(e) => setProofData(e.target.value)}
                      placeholder="Paste JSON proof data here..."
                      rows={6}
                    />
                    <FormHelperText>
                      Paste the JSON proof data obtained from the source chain
                    </FormHelperText>
                  </FormControl>
                  
                  {(proofType === 'payment' || proofType === 'keyRegistry') && (
                    <FormControl>
                      <FormLabel>Verification Parameters</FormLabel>
                      <Textarea 
                        value={verificationParams}
                        onChange={(e) => setVerificationParams(e.target.value)}
                        placeholder={getVerificationParamsPlaceholder()}
                        rows={4}
                      />
                      <FormHelperText>
                        Additional parameters required for verification (JSON format)
                      </FormHelperText>
                    </FormControl>
                  )}
                  
                  <Button 
                    leftIcon={<CheckIcon />}
                    colorScheme="blue" 
                    onClick={handleVerifyProof}
                    isLoading={isLoading || hyperbridgeLoading}
                    isDisabled={!isConnected || !proofType || !proofChain || !proofData}
                    mt={2}
                  >
                    Verify Proof
                  </Button>
                </Stack>
                
                {verificationResults && (
                  <Box mt={6}>
                    <Heading size="sm" mb={2}>Verification Results</Heading>
                    <Card 
                      variant="outline" 
                      borderColor={verificationResults.isValid ? 'green.500' : 'red.500'}
                      borderWidth={2}
                    >
                      <CardBody>
                        <Flex align="center" mb={3}>
                          <Badge 
                            colorScheme={verificationResults.isValid ? 'green' : 'red'} 
                            fontSize="md" 
                            p={2}
                            borderRadius="md"
                          >
                            {verificationResults.isValid ? 'VALID' : 'INVALID'}
                          </Badge>
                          <Text ml={3} fontWeight="bold">
                            {verificationResults.isValid 
                              ? 'Proof verified successfully' 
                              : 'Proof verification failed'}
                          </Text>
                        </Flex>
                        
                        <Text fontWeight="bold" mb={1}>Proof Type: {proofType}</Text>
                        <Text fontWeight="bold" mb={1}>Chain: {proofChain}</Text>
                        
                        <Divider my={3} />
                        
                        <Text fontWeight="bold" mb={2}>Details:</Text>
                        <Box 
                          bg="gray.50" 
                          p={3} 
                          borderRadius="md" 
                          overflowX="auto"
                          maxHeight="300px"
                          overflowY="auto"
                        >
                          <Code display="block" whiteSpace="pre">
                            {formatJson(verificationResults)}
                          </Code>
                        </Box>
                      </CardBody>
                    </Card>
                  </Box>
                )}
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Query History Tab */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Flex justify="space-between" align="center">
                  <Heading size="md">Query and Verification History</Heading>
                  <Button 
                    leftIcon={<RepeatIcon />}
                    size="sm"
                    onClick={handleClearCache}
                  >
                    Clear Cache
                  </Button>
                </Flex>
              </CardHeader>
              <CardBody>
                <Tabs variant="soft-rounded" colorScheme="blue" size="sm">
                  <TabList>
                    <Tab>Storage Queries</Tab>
                    <Tab>Verifications</Tab>
                  </TabList>
                  
                  <TabPanels>
                    {/* Storage Queries History */}
                    <TabPanel>
                      {queryHistory.length === 0 ? (
                        <Text color="gray.500">No query history yet</Text>
                      ) : (
                        <Accordion allowMultiple>
                          {queryHistory.map((item) => (
                            <AccordionItem key={item.id}>
                              <h2>
                                <AccordionButton>
                                  <Box flex="1" textAlign="left">
                                    <Text fontWeight="bold">
                                      {item.sourceChain} - {item.storageKey.slice(0, 10)}...
                                    </Text>
                                    <Text fontSize="sm" color="gray.500">
                                      {formatDate(item.timestamp)}
                                    </Text>
                                  </Box>
                                  <AccordionIcon />
                                </AccordionButton>
                              </h2>
                              <AccordionPanel pb={4}>
                                <VStack align="stretch" spacing={2}>
                                  <HStack>
                                    <Text fontWeight="bold" width="100px">Chain:</Text>
                                    <Text>{item.sourceChain}</Text>
                                  </HStack>
                                  <HStack>
                                    <Text fontWeight="bold" width="100px">Storage Key:</Text>
                                    <Text overflowWrap="break-word">{item.storageKey}</Text>
                                  </HStack>
                                  <HStack>
                                    <Text fontWeight="bold" width="100px">Block:</Text>
                                    <Text>{item.blockHash}</Text>
                                  </HStack>
                                  <Divider my={1} />
                                  <Text fontWeight="bold">Result:</Text>
                                  <Box 
                                    bg="gray.50" 
                                    p={2} 
                                    borderRadius="md" 
                                    overflowX="auto"
                                    maxHeight="200px"
                                    overflowY="auto"
                                  >
                                    <Code display="block" whiteSpace="pre" fontSize="xs">
                                      {formatJson(item.result)}
                                    </Code>
                                  </Box>
                                </VStack>
                              </AccordionPanel>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      )}
                    </TabPanel>
                    
                    {/* Verifications History */}
                    <TabPanel>
                      {verificationHistory.length === 0 ? (
                        <Text color="gray.500">No verification history yet</Text>
                      ) : (
                        <Accordion allowMultiple>
                          {verificationHistory.map((item) => (
                            <AccordionItem key={item.id}>
                              <h2>
                                <AccordionButton>
                                  <Box flex="1" textAlign="left">
                                    <HStack>
                                      <Badge colorScheme={item.isValid ? 'green' : 'red'}>
                                        {item.isValid ? 'VALID' : 'INVALID'}
                                      </Badge>
                                      <Text fontWeight="bold">
                                        {item.proofType} - {item.proofChain}
                                      </Text>
                                    </HStack>
                                    <Text fontSize="sm" color="gray.500">
                                      {formatDate(item.timestamp)}
                                    </Text>
                                  </Box>
                                  <AccordionIcon />
                                </AccordionButton>
                              </h2>
                              <AccordionPanel pb={4}>
                                <VStack align="stretch" spacing={2}>
                                  <HStack>
                                    <Text fontWeight="bold" width="100px">Proof Type:</Text>
                                    <Text>{item.proofType}</Text>
                                  </HStack>
                                  <HStack>
                                    <Text fontWeight="bold" width="100px">Chain:</Text>
                                    <Text>{item.proofChain}</Text>
                                  </HStack>
                                  <HStack>
                                    <Text fontWeight="bold" width="100px">Status:</Text>
                                    <Badge colorScheme={item.isValid ? 'green' : 'red'}>
                                      {item.isValid ? 'VALID' : 'INVALID'}
                                    </Badge>
                                  </HStack>
                                  <Divider my={1} />
                                  <Text fontWeight="bold">Result:</Text>
                                  <Box 
                                    bg="gray.50" 
                                    p={2} 
                                    borderRadius="md" 
                                    overflowX="auto"
                                    maxHeight="200px"
                                    overflowY="auto"
                                  >
                                    <Code display="block" whiteSpace="pre" fontSize="xs">
                                      {formatJson(item.result)}
                                    </Code>
                                  </Box>
                                </VStack>
                              </AccordionPanel>
                            </AccordionItem>
                          ))}
                        </Accordion>
                      )}
                    </TabPanel>
                  </TabPanels>
                </Tabs>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      <Alert status="info" mt={6}>
        <AlertIcon />
        <Box>
          <Heading size="xs" mb={1}>About Hyperbridge</Heading>
          <Text fontSize="sm">
            Hyperbridge enables trustless cross-chain storage queries and verification,
            allowing you to verify data from other chains without relying on centralized bridges.
            This technology powers cross-chain identity verification, payment verification,
            and secure data sharing between blockchains.
          </Text>
        </Box>
      </Alert>
    </Box>
  );
};

export default HyperbridgePanel;
