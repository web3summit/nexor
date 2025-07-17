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
} from '@chakra-ui/react';
import { AddIcon, LockIcon, UnlockIcon } from '@chakra-ui/icons';

interface VaultPanelProps {
  vaultContract: any;
}

interface Vault {
  id: number;
  name: string;
  beneficiaries: string[];
  threshold: number;
  creator: string;
}

const VaultPanel: React.FC<VaultPanelProps> = ({ vaultContract }) => {
  const toast = useToast();
  const { isConnected, activeAccount } = useMultiChainWallet();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  // State
  const [vaults, setVaults] = useState<Vault[]>([]);
  const [selectedVault, setSelectedVault] = useState<Vault | null>(null);
  const [vaultBalances, setVaultBalances] = useState<Record<number, Record<string, string>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Form state
  const [newVaultName, setNewVaultName] = useState('');
  const [newVaultBeneficiaries, setNewVaultBeneficiaries] = useState('');
  const [newVaultThreshold, setNewVaultThreshold] = useState(1);
  
  // Deposit form state
  const [depositAmount, setDepositAmount] = useState('');
  const [depositToken, setDepositToken] = useState('DOT');
  
  // Withdraw form state
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawToken, setWithdrawToken] = useState('DOT');
  const [withdrawDestination, setWithdrawDestination] = useState('');
  
  // Available tokens
  const availableTokens = ['DOT', 'KSM', 'ASTR', 'GLMR', 'ACA'];
  
  // Load user vaults
  useEffect(() => {
    if (isConnected && vaultContract && activeAccount) {
      loadUserVaults();
    }
  }, [isConnected, vaultContract, activeAccount]);
  
  const loadUserVaults = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!activeAccount?.address) {
        throw new Error('No active account');
      }
      
      const userVaultIds = await vaultContract.getUserVaults(activeAccount.address);
      
      const vaultPromises = userVaultIds.map(async (id: number) => {
        const vaultInfo = await vaultContract.getVault(id);
        return {
          id,
          name: vaultInfo[0],
          beneficiaries: vaultInfo[1],
          threshold: vaultInfo[2],
          creator: vaultInfo[3],
        };
      });
      
      const loadedVaults = await Promise.all(vaultPromises);
      setVaults(loadedVaults);
      
      // Load balances for each vault
      const balances: Record<number, Record<string, string>> = {};
      
      for (const vault of loadedVaults) {
        balances[vault.id] = {};
        
        for (const token of availableTokens) {
          const balance = await vaultContract.getVaultBalance(vault.id, token);
          balances[vault.id][token] = formatTokenAmount(balance, token);
        }
      }
      
      setVaultBalances(balances);
      setIsLoading(false);
    } catch (err) {
      console.error('Error loading vaults:', err);
      setError(err instanceof Error ? err.message : 'Unknown error loading vaults');
      setIsLoading(false);
    }
  };
  
  const handleCreateVault = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!newVaultName) {
        throw new Error('Vault name is required');
      }
      
      const beneficiaries = newVaultBeneficiaries
        .split(',')
        .map(addr => addr.trim())
        .filter(addr => addr);
      
      if (beneficiaries.length === 0) {
        throw new Error('At least one beneficiary is required');
      }
      
      if (newVaultThreshold <= 0 || newVaultThreshold > beneficiaries.length) {
        throw new Error('Invalid threshold value');
      }
      
      const vaultId = await vaultContract.createVault(
        newVaultName,
        beneficiaries,
        newVaultThreshold
      );
      
      toast({
        title: 'Vault created',
        description: `Vault "${newVaultName}" created with ID: ${vaultId}`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form
      setNewVaultName('');
      setNewVaultBeneficiaries('');
      setNewVaultThreshold(1);
      
      // Reload vaults
      await loadUserVaults();
      setIsLoading(false);
    } catch (err) {
      console.error('Error creating vault:', err);
      setError(err instanceof Error ? err.message : 'Unknown error creating vault');
      setIsLoading(false);
      
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Unknown error creating vault',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleDeposit = async () => {
    try {
      if (!selectedVault) {
        throw new Error('No vault selected');
      }
      
      setIsLoading(true);
      setError(null);
      
      const amount = parseFloat(depositAmount);
      
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount');
      }
      
      await vaultContract.deposit(
        selectedVault.id,
        depositToken,
        amount
      );
      
      toast({
        title: 'Deposit successful',
        description: `Deposited ${depositAmount} ${depositToken} to vault "${selectedVault.name}"`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form
      setDepositAmount('');
      
      // Reload vault balances
      await loadUserVaults();
      setIsLoading(false);
      onClose();
    } catch (err) {
      console.error('Error depositing to vault:', err);
      setError(err instanceof Error ? err.message : 'Unknown error depositing to vault');
      setIsLoading(false);
      
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Unknown error depositing to vault',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const handleWithdraw = async () => {
    try {
      if (!selectedVault) {
        throw new Error('No vault selected');
      }
      
      setIsLoading(true);
      setError(null);
      
      const amount = parseFloat(withdrawAmount);
      
      if (isNaN(amount) || amount <= 0) {
        throw new Error('Invalid amount');
      }
      
      if (!withdrawDestination) {
        throw new Error('Destination address is required');
      }
      
      await vaultContract.withdraw(
        selectedVault.id,
        withdrawToken,
        amount,
        withdrawDestination
      );
      
      toast({
        title: 'Withdrawal successful',
        description: `Withdrew ${withdrawAmount} ${withdrawToken} from vault "${selectedVault.name}"`,
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      
      // Reset form
      setWithdrawAmount('');
      setWithdrawDestination('');
      
      // Reload vault balances
      await loadUserVaults();
      setIsLoading(false);
      onClose();
    } catch (err) {
      console.error('Error withdrawing from vault:', err);
      setError(err instanceof Error ? err.message : 'Unknown error withdrawing from vault');
      setIsLoading(false);
      
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Unknown error withdrawing from vault',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };
  
  const openVaultModal = (vault: Vault) => {
    setSelectedVault(vault);
    onOpen();
  };
  
  return (
    <Box>
      {error && (
        <Alert status="error" mb={4}>
          <AlertIcon />
          {error}
        </Alert>
      )}
      
      {/* Create Vault Form */}
      <Card mb={6}>
        <CardHeader>
          <Heading size="md">Create New Vault</Heading>
        </CardHeader>
        <CardBody>
          <Stack spacing={4}>
            <FormControl>
              <FormLabel>Vault Name</FormLabel>
              <Input 
                value={newVaultName}
                onChange={(e) => setNewVaultName(e.target.value)}
                placeholder="My Vault"
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Beneficiaries (comma-separated addresses)</FormLabel>
              <Input 
                value={newVaultBeneficiaries}
                onChange={(e) => setNewVaultBeneficiaries(e.target.value)}
                placeholder="5GrwvaEF5..., 5FHneW46..."
              />
            </FormControl>
            
            <FormControl>
              <FormLabel>Threshold (minimum signatures required)</FormLabel>
              <NumberInput 
                min={1} 
                value={newVaultThreshold}
                onChange={(valueString) => setNewVaultThreshold(parseInt(valueString))}
              >
                <NumberInputField />
              </NumberInput>
            </FormControl>
          </Stack>
        </CardBody>
        <CardFooter>
          <Button 
            leftIcon={<AddIcon />}
            colorScheme="blue" 
            onClick={handleCreateVault}
            isLoading={isLoading}
            isDisabled={!isConnected}
          >
            Create Vault
          </Button>
        </CardFooter>
      </Card>
      
      {/* Vaults List */}
      <Card>
        <CardHeader>
          <Heading size="md">Your Vaults</Heading>
        </CardHeader>
        <CardBody>
          {isLoading ? (
            <Flex justify="center" p={4}>
              <Spinner />
            </Flex>
          ) : vaults.length === 0 ? (
            <Text color="gray.500">You don't have any vaults yet</Text>
          ) : (
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Name</Th>
                  <Th>Beneficiaries</Th>
                  <Th>Threshold</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {vaults.map((vault) => (
                  <Tr key={vault.id}>
                    <Td>{vault.name}</Td>
                    <Td>{vault.beneficiaries.length} addresses</Td>
                    <Td>{vault.threshold}</Td>
                    <Td>
                      <Button 
                        size="sm" 
                        colorScheme="blue"
                        onClick={() => openVaultModal(vault)}
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
      
      {/* Vault Management Modal */}
      {selectedVault && (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>{selectedVault.name}</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Box mb={4}>
                <Heading size="sm" mb={2}>Vault Details</Heading>
                <Text><strong>ID:</strong> {selectedVault.id}</Text>
                <Text><strong>Creator:</strong> {selectedVault.creator.slice(0, 6)}...{selectedVault.creator.slice(-4)}</Text>
                <Text><strong>Beneficiaries:</strong> {selectedVault.beneficiaries.length} addresses</Text>
                <Text><strong>Threshold:</strong> {selectedVault.threshold} signatures</Text>
              </Box>
              
              <Divider my={4} />
              
              <Box mb={4}>
                <Heading size="sm" mb={2}>Balances</Heading>
                {vaultBalances[selectedVault.id] ? (
                  <Table size="sm" variant="simple">
                    <Thead>
                      <Tr>
                        <Th>Token</Th>
                        <Th>Balance</Th>
                      </Tr>
                    </Thead>
                    <Tbody>
                      {Object.entries(vaultBalances[selectedVault.id]).map(([token, balance]) => (
                        <Tr key={token}>
                          <Td>{token}</Td>
                          <Td>{balance}</Td>
                        </Tr>
                      ))}
                    </Tbody>
                  </Table>
                ) : (
                  <Text color="gray.500">No balances available</Text>
                )}
              </Box>
              
              <Divider my={4} />
              
              <Tabs>
                <TabList>
                  <Tab>Deposit</Tab>
                  <Tab>Withdraw</Tab>
                </TabList>
                
                <TabPanels>
                  <TabPanel>
                    <Stack spacing={4}>
                      <FormControl>
                        <FormLabel>Amount</FormLabel>
                        <NumberInput>
                          <NumberInputField
                            value={depositAmount}
                            onChange={(e) => setDepositAmount(e.target.value)}
                            placeholder="0.0"
                          />
                        </NumberInput>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Token</FormLabel>
                        <Select
                          value={depositToken}
                          onChange={(e) => setDepositToken(e.target.value)}
                        >
                          {availableTokens.map((token) => (
                            <option key={token} value={token}>{token}</option>
                          ))}
                        </Select>
                      </FormControl>
                      
                      <Button
                        leftIcon={<LockIcon />}
                        colorScheme="blue"
                        onClick={handleDeposit}
                        isLoading={isLoading}
                      >
                        Deposit
                      </Button>
                    </Stack>
                  </TabPanel>
                  
                  <TabPanel>
                    <Stack spacing={4}>
                      <FormControl>
                        <FormLabel>Amount</FormLabel>
                        <NumberInput>
                          <NumberInputField
                            value={withdrawAmount}
                            onChange={(e) => setWithdrawAmount(e.target.value)}
                            placeholder="0.0"
                          />
                        </NumberInput>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Token</FormLabel>
                        <Select
                          value={withdrawToken}
                          onChange={(e) => setWithdrawToken(e.target.value)}
                        >
                          {availableTokens.map((token) => (
                            <option key={token} value={token}>{token}</option>
                          ))}
                        </Select>
                      </FormControl>
                      
                      <FormControl>
                        <FormLabel>Destination Address</FormLabel>
                        <Input
                          value={withdrawDestination}
                          onChange={(e) => setWithdrawDestination(e.target.value)}
                          placeholder="5GrwvaEF5..."
                        />
                      </FormControl>
                      
                      <Button
                        leftIcon={<UnlockIcon />}
                        colorScheme="orange"
                        onClick={handleWithdraw}
                        isLoading={isLoading}
                      >
                        Withdraw
                      </Button>
                    </Stack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
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

// Add missing import
import { Tabs, TabList, TabPanels, Tab, TabPanel } from '@chakra-ui/react';

export default VaultPanel;
