'use client';

import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, XCircle } from 'lucide-react';

interface WalletItem {
  address: string;
  tag: string;
  date_added: string;
}

interface ResultItem {
  address: string;
  hasInteracted: boolean;
}

export default function WatchdogDashboard() {
  const [contractAddress, setContractAddress] = useState<string>('');
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [results, setResults] = useState<ResultItem[]>([]);
  const [wallets, setWallets] = useState<WalletItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const baseURL = process.env.NEXT_PUBLIC_API_URL as string;

  const fetchWallets = useCallback(async () => {
    try {
      const response = await axios.get<WalletItem[]>(
        `${baseURL}/api/wallets/`
      );
      setWallets(response.data);
    } catch (error) {
      console.error('Error fetching wallets:', error);
    }
  }, [baseURL]);

  useEffect(() => {
    fetchWallets();
  }, [fetchWallets]);

  const handleSearch = async () => {
    setLoading(true);
	setResults([])
    try {
      const response = await axios.get<ResultItem[]>(
        `${baseURL}/api/search/${contractAddress}`
      );
      setResults(response.data);
    } catch (error) {
      console.error('Error fetching contract interactions:', error);
	  alert("Error fetching contract interactions")
    } finally {
      setLoading(false);
    }
  };

  const handleAddWallet = async () => {
    if (!walletAddress) return;
    try {
      const response = await axios.post<{ message: string }>(
        `${baseURL}/api/wallets/`,
        { address: walletAddress }
      );
      alert(response.data.message || 'Wallet added successfully');
      setWalletAddress('');
      fetchWallets();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.error || 'Failed to add wallet');
      } else {
        console.error('Unexpected error:', error);
        alert('An unexpected error occurred');
      }
    }
  };

  const handleUpdateWalletTag = async (address: string, newTag: string) => {
    try {
      await axios.put(`${baseURL}/api/wallets/`, {
        address,
        tag: newTag,
      });
      alert('Wallet tag updated successfully');
      fetchWallets();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.error);
      } else {
        console.error('Unexpected error:', error);
        alert('Failed to update wallet tag');
      }
    }
  };

  const handleDeleteWallet = async (address: string) => {
    try {
      await axios.delete(`${baseURL}/api/wallets/${address}/`);
      alert('Wallet deleted successfully');
      fetchWallets();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        alert(error.response?.data?.error);
      } else {
        console.error('Unexpected error:', error);
        alert('Failed to delete wallet');
      }
    }
  };

  return (
    <div className="bg-[#e06fdd] p-4 sm:p-6 md:p-8 min-h-screen w-full">
      <div className="bg-[#7c5c7b] mx-auto my-5 max-w-2xl rounded-lg text-[#e9e7ea]">
        <div className="font-bold text-2xl sm:text-3xl py-4 sm:py-6 text-center">
          WATCHDOG
        </div>
      </div>
      <div className="mx-auto px-2 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8 w-full max-w-7xl rounded-lg">
        <div className="bg-[#7c5c7b] rounded-lg p-4 sm:p-6 w-full">
          <div className="gap-6 grid md:grid-cols-2">
            <div className="w-full">
              <h3 className="mb-2 font-semibold text-lg text-[#c3b5c2]">Search Token</h3>
              <div className="flex flex-col sm:flex-row gap-2 mb-4">
                <Input
                  placeholder="Enter token address"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                  className="bg-white w-full flex-grow sm:w-auto"
                />
                <Button
                  className="bg-[#5b3a59] hover:bg-[#5b3a59] text-[#e7e4e7] px-5 w-full sm:w-auto"
                  onClick={handleSearch}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Search'}
                </Button>
              </div>
              <p className="mb-4 mt-2 text-sm text-[#ccc5d0]">
                Enter the token in the search box above and
                we will run a check on the addresses in the
                right if they own the token.
              </p>
              <ul className="space-y-4">
                {results.length !== 0 ? (
                  <>
                    {results.map((result, index) => (
                      <li
                        key={index}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-[#e06fdd] hover:bg-[#fffff0] hover:cursor-pointer text-[#432542] shadow-md hover:shadow-lg p-4 rounded-lg transition-all"
                      >
                        <span className="mb-2 sm:mb-0 font-mono text-[#432542] text-sm break-all">
                          {result.address}
                        </span>
                        {result.hasInteracted ? (
                          <div className="flex items-center text-green-900">
                            <CheckCircle className="mr-2 w-5 h-5" />
                            <span className="font-medium text-sm">Interacted</span>
                          </div>
                        ) : (
                          <div className="flex items-center text-red-900">
                            <XCircle className="mr-2 w-5 h-5" />
                            <span className="font-medium text-sm">No Interaction</span>
                          </div>
                        )}
                      </li>
                    ))}
                  </>
                ) : (
                  <Card className="bg-[#5b3a59] border-0 mt-5">
                    <CardHeader className="p-0">
                      <CardTitle className="rounded-t-lg text-sm bg-[#432542] hover:bg-[#432542] text-[#b4a9b4] py-6 px-3">
                        Tokenomics
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0 px-3">
                      <p className="border-b border-[#344054] py-5 text-sm text-[#b4a9b4]">Token Name: ADANTIUM</p>
                      <p className="border-b border-[#344054] py-5 text-sm text-[#b4a9b4]">Token Ticker: ADA</p>
                      <p className="py-5 text-sm text-[#b4a9b4]">
                        Token Holders: 4231
                      </p>
                    </CardContent>
                  </Card>
                )}
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-semibold text-lg text-[#e7e4e7]">
                Add to Watchlist
              </h3>
              <div>
                <div className="flex flex-col sm:flex-row gap-2 mb-4">
                  <Input
                    placeholder="Enter holder address"
                    value={walletAddress}
                    onChange={(e) => setWalletAddress(e.target.value)}
                    className="bg-white w-full flex-grow sm:w-auto"
                  />
                  <Button
                    className="bg-[#5b3a59] hover:bg-[#5b3a59] text-[#e7e4e7] w-full sm:w-auto"
                    onClick={handleAddWallet}
                  >
                    Add to watchlist
                  </Button>
                </div>
                <div className="mb-8 overflow-x-auto">
                  <h2 className="my-4 font-semibold text-xl text-[#e7e4e7]">Watchlist</h2>
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-[#344054] bg-[#432542] hover:bg-[#432542]">
                          <TableHead className="text-[#e7e4e7]">
                            Wallet
                          </TableHead>
                          <TableHead className="text-[#e7e4e7]">
                            Status
                          </TableHead>
                          <TableHead className="text-[#e7e4e7]">
                            Date Added
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {wallets
                          .filter((item) => item.tag === 'Watchlist')
                          .map((wallet) => (
                            <TableRow
                              key={wallet.address}
                              className="bg-[#5b3a59] border-[#344054] hover:bg-[#e06fdd]"
                            >
                              <TableCell className="font-mono text-[#e7e4e7] break-all">
                                {wallet.address}
                              </TableCell>
                              <TableCell>
                                <div className="flex flex-col sm:flex-row gap-2">
                                  <Button
                                    variant="outline"
                                    className="bg-transparent border-[#432542] hover:bg-[#5b3a59] px-3 rounded-full w-full sm:w-auto h-7 text-[#432542] text-xs"
                                    onClick={() => handleDeleteWallet(wallet.address)}
                                  >
                                    Remove
                                  </Button>
                                  <Button
                                    variant="outline"
                                    className="bg-[#eff8ff] border-[#b3ddff] hover:bg-[#eff8ff] rounded-full w-full sm:w-auto h-7 text-[#5f80c2] hover:text-[#5f80c2] text-xs"
                                    onClick={() => handleUpdateWalletTag(wallet.address, 'Store')}
                                  >
                                    Store
                                  </Button>
                                </div>
                              </TableCell>
                              <TableCell className="text-[#e7e4e7]">
                                {new Date(wallet.date_added).toLocaleDateString()}
                              </TableCell>
                            </TableRow>
                          ))}
                      </TableBody>
                    </Table>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <h2 className="mb-4 font-semibold text-xl text-[#e7e4e7]">Stored Addresses</h2>
                  <Table>
                    <TableHeader>
                      <TableRow className="border-[#344054] bg-[#432542] hover:bg-[#432542]">
                        <TableHead className="text-[#e7e4e7]">
                          Wallet
                        </TableHead>
                        <TableHead className="text-[#e7e4e7]">
                          Status
                        </TableHead>
                        <TableHead className="text-[#e7e4e7]">
                          Date Added
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {wallets
                        .filter((item) => item.tag === 'Store')
                        .map((wallet) => (
                          <TableRow
                            key={wallet.address}
                            className="bg-[#5b3a59] border-[#344054] hover:bg-[#e06fdd]"
                          >
                            <TableCell className="font-mono text-[#e7e4e7] break-all">
                              {wallet.address}
                            </TableCell>
                            <TableCell>
                              <Button
                                variant="outline"
                                className="bg-transparent border-[#306557] rounded-full hover:bg-[#306557] px-3 w-full sm:w-auto h-7 text-[#306557] text-xs"
                                onClick={() => handleUpdateWalletTag(wallet.address, 'Watchlist')}
                              >
                                Add to watchlist
                              </Button>
                            </TableCell>
                            <TableCell className="text-[#e7e4e7]">
                              {new Date(wallet.date_added).toLocaleDateString()}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}