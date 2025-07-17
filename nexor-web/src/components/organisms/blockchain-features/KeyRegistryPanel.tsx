import React, { useState, useEffect } from 'react';
import { useMultiChainWallet } from '../../../hooks/useMultiChainWallet';
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
  Textarea,
  Code,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { AddIcon, DeleteIcon, CheckIcon, SearchIcon, EditIcon, CopyIcon } from '@chakra-ui/icons';

interface KeyRegistryPanelProps {
  keyRegistryContract: any;
}

interface KeyEntry {
  id: number;
  owner: string;
  keyType: string;
  publicKey: string;
  metadata: Record<string, string>;
  isRevoked: boolean;
  createdAt: number;
  updatedAt: number;
}

const KeyRegistryPanel: React.FC<KeyRegistryPanelProps> = ({ keyRegistryContract }) => {
  const toast = useToast();
  const { isConnected, activeAccount } = useMultiChainWallet();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // State
  const [keys, setKeys] = useState<KeyEntry[]>([]);
  const [selectedKey, setSelectedKey] = useState<KeyEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state - Register Key
  const [keyType, setKeyType] = useState('ed25519');
  const [publicKey, setPublicKey] = useState('');
  const [metadataName, setMetadataName] = useState('');
  const [metadataEmail, setMetadataEmail] = useState('');
  const [metadataDescription, setMetadataDescription] = useState('');
  
  // Form state - Search Keys
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<KeyEntry[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  
  // Form state - Update Metadata
  const [updateMetadataName, setUpdateMetadataName] = useState('');
  const [updateMetadataEmail, setUpdateMetadataEmail] = useState('');
  const [updateMetadataDescription, setUpdateMetadataDescription] = useState('');
  
  // Available key types
  const keyTypes = ['ed25519', 'sr25519', 'ecdsa', 'rsa'];
  
  // Load user keys
  useEffect(() => {
    if (isConnected && keyRegistryContract && activeAccount) {
      loadUserKeys();
    }
  }, [isConnected, keyRegistryContract, activeAccount]);
  
  const loadUserKeys = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!activeAccount?.address) {
        throw new Error('No active account');
      }
      
      const userKeyIds = await keyRegistryContract.getUserKeys(activeAccount.address);
      
      const keyPromises = userKeyIds.map(async (id: number) => {
        return await loadKeyInfo(id);
      });
      
      const loadedKeys = await Promise.all(keyPromises);
      setKeys(loadedKeys);
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading keys:', err);
      setError(err instanceof Error ? err.message : 'Unknown error loading keys');
      setIsLoading(false);
    }
  };
  
  const loadKeyInfo = async (id: number): Promise<KeyEntry> => {
    const keyInfo = await keyRegistryContract.getKey(id);
    return {
      id,
      owner: keyInfo[0],
      keyType: keyInfo[1],
      publicKey: keyInfo[2],
      metadata: keyInfo[3],
      isRevoked: keyInfo[4],
      createdAt: keyInfo[5],
      updatedAt: keyInfo[6],
    };
  };
  
  const handleRegisterKey = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Validate inputs
      if (!publicKey) {
        throw new Error('Public key is required');
      }
      
      // Prepare metadata
      const metadata: Record<string, string> = {};
      if (metadataName) metadata.name = metadataName;
      if (metadataEmail) metadata.email = metadataEmail;
      if (metadataDescription) metadata.description = metadataDescription;
      
      // Register key
      const keyId = await keyRegistryContract.registerKey(
        keyType,
        publicKey,
        metadata
      );
      
      toast({
        title: 'Key registered',
        description: `Key registered with ID: ${keyId}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form
      setKeyType('ed25519');
      setPublicKey('');
      setMetadataName('');
      setMetadataEmail('');
      setMetadataDescription('');
      
      // Reload keys
      await loadUserKeys();
      setIsLoading(false);
    } catch (err) {
      console.error('Error registering key:', err);
      setError(err instanceof Error ? err.message : 'Unknown error registering key');
      setIsLoading(false);
      
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Unknown error registering key',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleRevokeKey = async () => {
    try {
      if (!selectedKey) {
        throw new Error('No key selected');
      }
      
      setIsLoading(true);
      setError(null);
      
      await keyRegistryContract.revokeKey(selectedKey.id);
      
      toast({
        title: 'Key revoked',
        description: `Key #${selectedKey.id} has been revoked successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Reload keys
      await loadUserKeys();
      setIsLoading(false);
      onClose();
    } catch (err) {
      console.error('Error revoking key:', err);
      setError(err instanceof Error ? err.message : 'Unknown error revoking key');
      setIsLoading(false);
      
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Unknown error revoking key',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleUpdateMetadata = async () => {
    try {
      if (!selectedKey) {
        throw new Error('No key selected');
      }
      
      setIsLoading(true);
      setError(null);
      
      // Prepare updated metadata
      const metadata: Record<string, string> = { ...selectedKey.metadata };
      if (updateMetadataName) metadata.name = updateMetadataName;
      if (updateMetadataEmail) metadata.email = updateMetadataEmail;
      if (updateMetadataDescription) metadata.description = updateMetadataDescription;
      
      await keyRegistryContract.updateMetadata(selectedKey.id, metadata);
      
      toast({
        title: 'Metadata updated',
        description: `Key #${selectedKey.id} metadata has been updated successfully`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Reload keys
      await loadUserKeys();
      setIsLoading(false);
      onClose();
    } catch (err) {
      console.error('Error updating metadata:', err);
      setError(err instanceof Error ? err.message : 'Unknown error updating metadata');
      setIsLoading(false);
      
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Unknown error updating metadata',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleSearchKeys = async () => {
    try {
      if (!searchQuery) {
        throw new Error('Search query is required');
      }
      
      setIsSearching(true);
      setError(null);
      
      // Search keys by metadata
      const keyIds = await keyRegistryContract.lookupKeysByMetadata(searchQuery);
      
      const keyPromises = keyIds.map(async (id: number) => {
        return await loadKeyInfo(id);
      });
      
      const foundKeys = await Promise.all(keyPromises);
      setSearchResults(foundKeys);
      setIsSearching(false);
    } catch (err) {
      console.error('Error searching keys:', err);
      setError(err instanceof Error ? err.message : 'Unknown error searching keys');
      setIsSearching(false);
      
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Unknown error searching keys',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleVerifyKey = async (keyId: number) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const isValid = await keyRegistryContract.verifyKey(keyId);
      
      toast({
        title: 'Key verification',
        description: isValid 
          ? `Key #${keyId} is valid and not revoked` 
          : `Key #${keyId} is invalid or has been revoked`,
        status: isValid ? 'success' : 'warning',
        duration: 5000,
        isClosable: true,
      });
      
      setIsLoading(false);
    } catch (err) {
      console.error('Error verifying key:', err);
      setError(err instanceof Error ? err.message : 'Unknown error verifying key');
      setIsLoading(false);
      
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Unknown error verifying key',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const openKeyModal = (key: KeyEntry) => {
    setSelectedKey(key);
    // Initialize update form with current values
    setUpdateMetadataName(key.metadata.name || '');
    setUpdateMetadataEmail(key.metadata.email || '');
    setUpdateMetadataDescription(key.metadata.description || '');
    onOpen();
  };
  
  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };
  
  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleString();
  };
  
  const formatPublicKey = (key: string) => {
    return `${key.slice(0, 10)}...${key.slice(-6)}`;
  };
  
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied',
      description: 'Copied to clipboard',
      status: 'info',
      duration: 2000,
      isClosable: true,
    });
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
          <Tab>Your Keys</Tab>
          <Tab>Register New Key</Tab>
          <Tab>Search Keys</Tab>
        </TabList>
        
        <TabPanels>
          {/* Your Keys Tab */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="md">Your Registered Keys</Heading>
              </CardHeader>
              <CardBody>
                {isLoading ? (
                  <Flex justify="center" p={4}>
                    <Spinner />
                  </Flex>
                ) : keys.length === 0 ? (
                  <Text color="gray.500">You don't have any registered keys yet</Text>
                ) : (
                  <Table variant="simple">
                    <Thead>
                      <Tr>
                        <Th>ID</Th>
                        <Th>Type</Th>
                        <Th>Public Key</Th>
                        <Th>Name</Th>
                        <Th>Status</Th>
                        <Th>Created</Th>
                        <Th>Actions</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {keys.map((key) => (
                        <Tr key={key.id} opacity={key.isRevoked ? 0.6 : 1}>
                          <Td>{key.id}</Td>
                          <Td>{key.keyType}</Td>
                          <Td>
                            <Flex align="center">
                              {formatPublicKey(key.publicKey)}
                              <IconButton
                                aria-label="Copy public key"
                                icon={<CopyIcon />}
                                size="xs"
                                ml={2}
                                onClick={() => copyToClipboard(key.publicKey)}
                              />
                            </Flex>
                          </Td>
                          <Td>{key.metadata.name || '-'}</Td>
                          <Td>
                            <Badge colorScheme={key.isRevoked ? 'red' : 'green'}>
                              {key.isRevoked ? 'Revoked' : 'Active'}
                            </Badge>
                          </Td>
                          <Td>{formatDate(key.createdAt)}</Td>
                          <Td>
                            <Flex gap={2}>
                              <Button 
                                size="sm" 
                                colorScheme="blue"
                                onClick={() => openKeyModal(key)}
                              >
                                Manage
                              </Button>
                              <IconButton
                                aria-label="Verify key"
                                icon={<CheckIcon />}
                                size="sm"
                                colorScheme="green"
                                onClick={() => handleVerifyKey(key.id)}
                              />
                            </Flex>
                          </Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                )}
              </CardBody>
            </Card>
          </TabPanel>
          
          {/* Register New Key Tab */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="md">Register New Key</Heading>
              </CardHeader>
              <CardBody>
                <Stack spacing={4}>
                  <FormControl>
                    <FormLabel>Key Type</FormLabel>
                    <Select 
                      value={keyType}
                      onChange={(e) => setKeyType(e.target.value)}
                    >
                      {keyTypes.map((type) => (
                        <option key={type} value={type}>{type}</option>
                      ))}
                    </Select>
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Public Key</FormLabel>
                    <Textarea 
                      value={publicKey}
                      onChange={(e) => setPublicKey(e.target.value)}
                      placeholder="Enter your public key..."
                      rows={3}
                    />
                  </FormControl>
                  
                  <Divider />
                  <Heading size="sm">Metadata (Optional)</Heading>
                  
                  <FormControl>
                    <FormLabel>Name</FormLabel>
                    <Input 
                      value={metadataName}
                      onChange={(e) => setMetadataName(e.target.value)}
                      placeholder="e.g., Primary Key, Work Key, etc."
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Email</FormLabel>
                    <Input 
                      value={metadataEmail}
                      onChange={(e) => setMetadataEmail(e.target.value)}
                      placeholder="email@example.com"
                    />
                  </FormControl>
                  
                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea 
                      value={metadataDescription}
                      onChange={(e) => setMetadataDescription(e.target.value)}
                      placeholder="Additional information about this key..."
                      rows={3}
                    />
                  </FormControl>
                </Stack>
              </CardBody>
              <CardFooter>
                <Button 
                  leftIcon={<AddIcon />}
                  colorScheme="blue" 
                  onClick={handleRegisterKey}
                  isLoading={isLoading}
                  isDisabled={!isConnected || !publicKey}
                >
                  Register Key
                </Button>
              </CardFooter>
            </Card>
          </TabPanel>
          
          {/* Search Keys Tab */}
          <TabPanel>
            <Card>
              <CardHeader>
                <Heading size="md">Search Keys by Metadata</Heading>
              </CardHeader>
              <CardBody>
                <Stack spacing={4}>
                  <FormControl>
                    <FormLabel>Search Query</FormLabel>
                    <Flex>
                      <Input 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Enter name, email, or other metadata..."
                        mr={2}
                      />
                      <Button 
                        leftIcon={<SearchIcon />}
                        colorScheme="blue" 
                        onClick={handleSearchKeys}
                        isLoading={isSearching}
                        isDisabled={!searchQuery}
                      >
                        Search
                      </Button>
                    </Flex>
                  </FormControl>
                  
                  {isSearching ? (
                    <Flex justify="center" p={4}>
                      <Spinner />
                    </Flex>
                  ) : searchResults.length > 0 ? (
                    <Box mt={4}>
                      <Heading size="sm" mb={2}>Search Results</Heading>
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>ID</Th>
                            <Th>Owner</Th>
                            <Th>Type</Th>
                            <Th>Name</Th>
                            <Th>Status</Th>
                            <Th>Actions</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {searchResults.map((key) => (
                            <Tr key={key.id} opacity={key.isRevoked ? 0.6 : 1}>
                              <Td>{key.id}</Td>
                              <Td>{formatAddress(key.owner)}</Td>
                              <Td>{key.keyType}</Td>
                              <Td>{key.metadata.name || '-'}</Td>
                              <Td>
                                <Badge colorScheme={key.isRevoked ? 'red' : 'green'}>
                                  {key.isRevoked ? 'Revoked' : 'Active'}
                                </Badge>
                              </Td>
                              <Td>
                                <IconButton
                                  aria-label="Verify key"
                                  icon={<CheckIcon />}
                                  size="sm"
                                  colorScheme="green"
                                  onClick={() => handleVerifyKey(key.id)}
                                />
                              </Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  ) : searchQuery && !isSearching ? (
                    <Alert status="info">
                      <AlertIcon />
                      No keys found matching your search criteria
                    </Alert>
                  ) : null}
                </Stack>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </Tabs>
      
      {/* Key Management Modal */}
      {selectedKey && (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Key #{selectedKey.id}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box mb={4}>
                <Heading size="sm" mb={2}>Key Details</Heading>
                <Text><strong>Owner:</strong> {formatAddress(selectedKey.owner)}</Text>
                <Text><strong>Type:</strong> {selectedKey.keyType}</Text>
                <Text><strong>Status:</strong> 
                  <Badge ml={2} colorScheme={selectedKey.isRevoked ? 'red' : 'green'}>
                    {selectedKey.isRevoked ? 'Revoked' : 'Active'}
                  </Badge>
                </Text>
                <Text><strong>Created:</strong> {formatDate(selectedKey.createdAt)}</Text>
                <Text><strong>Last Updated:</strong> {formatDate(selectedKey.updatedAt)}</Text>
                <Text><strong>Public Key:</strong></Text>
                <Flex align="center" mt={1}>
                  <Code p={2} borderRadius="md" fontSize="sm" width="100%" overflow="auto">
                    {selectedKey.publicKey}
                  </Code>
                  <IconButton
                    aria-label="Copy public key"
                    icon={<CopyIcon />}
                    size="sm"
                    ml={2}
                    onClick={() => copyToClipboard(selectedKey.publicKey)}
                  />
                </Flex>
              </Box>
              
              <Divider my={4} />
              
              <Box mb={4}>
                <Heading size="sm" mb={2}>Current Metadata</Heading>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Field</Th>
                      <Th>Value</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {Object.entries(selectedKey.metadata).map(([key, value]) => (
                      <Tr key={key}>
                        <Td fontWeight="bold">{key}</Td>
                        <Td>{value}</Td>
                      </Tr>
                    ))}
                    {Object.keys(selectedKey.metadata).length === 0 && (
                      <Tr>
                        <Td colSpan={2} textAlign="center">No metadata</Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
              </Box>
              
              {!selectedKey.isRevoked && (
                <>
                  <Divider my={4} />
                  
                  <Box mb={4}>
                    <Heading size="sm" mb={2}>Update Metadata</Heading>
                    <Stack spacing={4}>
                      <FormControl>
                        <FormLabel>Name</FormLabel>
                        <Input 
                          value={updateMetadataName}
                          onChange={(e) => setUpdateMetadataName(e.target.value)}
                          placeholder="e.g., Primary Key, Work Key, etc."
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Email</FormLabel>
                        <Input 
                          value={updateMetadataEmail}
                          onChange={(e) => setUpdateMetadataEmail(e.target.value)}
                          placeholder="email@example.com"
                        />
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Description</FormLabel>
                        <Textarea 
                          value={updateMetadataDescription}
                          onChange={(e) => setUpdateMetadataDescription(e.target.value)}
                          placeholder="Additional information about this key..."
                          rows={3}
                        />
                      </FormControl>
                      
                      <Button
                        leftIcon={<EditIcon />}
                        colorScheme="blue"
                        onClick={handleUpdateMetadata}
                        isLoading={isLoading}
                      >
                        Update Metadata
                      </Button>
                    </Stack>
                  </Box>
                  
                  <Divider my={4} />
                  
                  <Box>
                    <Heading size="sm" mb={2}>Revoke Key</Heading>
                    <Text mb={4}>
                      Revoking a key will mark it as invalid. This action cannot be undone.
                    </Text>
                    <Button
                      leftIcon={<DeleteIcon />}
                      colorScheme="red"
                      onClick={handleRevokeKey}
                      isLoading={isLoading}
                    >
                      Revoke Key
                    </Button>
                  </Box>
                </>
              )}
              
              {selectedKey.isRevoked && (
                <Alert status="warning" mt={4}>
                  <AlertIcon />
                  This key has been revoked and cannot be modified.
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

export default KeyRegistryPanel;
