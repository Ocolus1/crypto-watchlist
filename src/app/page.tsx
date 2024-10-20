"use client";

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
import { ChevronRight, Home, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

interface WalletItem {
    address: string;
    tag: string;
    date_added: string;
}

interface ResultItem {
    address: string;
    hasInteracted: boolean;
}

export default function Page() {
    const [contractAddress, setContractAddress] = useState<string>('');
    const [walletAddress, setWalletAddress] = useState<string>('');
    const [results, setResults] = useState<ResultItem[]>([]);
    const [wallets, setWallets] = useState<WalletItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    // const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

    const baseURL = process.env.NEXT_PUBLIC_API_URL as string;

    const fetchWallets = useCallback(async () => {
        try {
            const response = await axios.get<WalletItem[]>(`${baseURL}/api/wallets/`);
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
        try {
            const response = await axios.get<ResultItem[]>(`${baseURL}/api/search/${contractAddress}`);
            setResults(response.data);
        } catch (error) {
            console.error('Error fetching contract interactions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddWallet = async () => {
        if (!walletAddress) return;
        try {
            const response = await axios.post<{ message: string }>(`${baseURL}/api/wallets/`, { address: walletAddress });
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
            await axios.put(`${baseURL}/api/wallets/`, { address, tag: newTag });
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
        <div className="bg-gray-50 min-h-screen">
            <div className="mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-7xl">
                <div className="flex justify-between items-center mb-8">
                    <div className="flex items-center text-gray-500 text-sm">
                        <Link href="#" className="flex items-center hover:text-gray-700">
                            <Home className="mr-2 w-4 h-4" />
                            <span className="sm:inline hidden">Home</span>
                        </Link>
                        <ChevronRight className="mx-2 w-4 h-4" />
                        <Link href="#" className="sm:inline hidden hover:text-gray-700">Dashboard</Link>
                        <ChevronRight className="sm:inline hidden mx-2 w-4 h-4" />
                        <span className="text-gray-900">Sources</span>
                    </div>
                </div>

                <h1 className="mb-8 font-bold text-3xl">Sources</h1>

                <div className="gap-6 grid md:grid-cols-2">
                <div>
                        <h2 className="mb-2 font-semibold text-lg">Search Token</h2>
                        <div className="flex sm:flex-row flex-col gap-2 mb-4">
                            <Input
                                placeholder="Enter token address"
                                value={contractAddress}
                                onChange={(e) => setContractAddress(e.target.value)}
                                className="flex-grow"
                            />
                            <Button
                                className="bg-purple-500 hover:bg-purple-600 w-full sm:w-auto"
                                onClick={handleSearch}
                                disabled={loading}
                            >
                                {loading ? 'Loading...' : 'Search'}
                            </Button>
                        </div>
                        <p className="mt-2 mb-4 text-gray-500 text-sm">
                            Enter the token in the search box above and we will run a check on the addresses if they own the token.
                        </p>
                        <ul className="space-y-4">
                            {results.map((result, index) => (
                                <li
                                    key={index}
                                    className="flex sm:flex-row flex-col justify-between items-start sm:items-center bg-white shadow-md hover:shadow-lg p-4 rounded-lg transition-all"
                                >
                                    <span className="mb-2 sm:mb-0 font-mono text-gray-600 text-sm">
                                        {result.address}
                                    </span>
                                    {result.hasInteracted ? (
                                        <div className="flex items-center text-green-500">
                                            <CheckCircle className="mr-2 w-5 h-5" />
                                            <span className="font-medium text-sm">Interacted</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-red-500">
                                            <XCircle className="mr-2 w-5 h-5" />
                                            <span className="font-medium text-sm">No Interaction</span>
                                        </div>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div >
                        <h2 className="mb-2 font-semibold text-lg">Add to Watchlist</h2>
                        <div className="flex sm:flex-row flex-col gap-2 mb-8">
                            <Input
                                placeholder="Enter holder address"
                                value={walletAddress}
                                onChange={(e) => setWalletAddress(e.target.value)}
                                className="flex-grow"
                            />
                            <Button
                                className="bg-purple-500 hover:bg-purple-600 w-full sm:w-auto"
                                onClick={handleAddWallet}
                            >
                                Add to watchlist
                            </Button>
                        </div>

                        <div className="mb-8 overflow-x-auto">
                            <h2 className="my-4 font-semibold text-xl">Watchlist</h2>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Wallet</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date Added</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {wallets
                                        .filter((item) => item.tag === 'Watchlist')
                                        .map((wallet) => (
                                            <TableRow key={wallet.address}>
                                                <TableCell className="font-mono break-all">
                                                    {wallet.address}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex sm:flex-row flex-col gap-2">
                                                        <Button
                                                            variant="outline"
                                                            className="border-purple-200 hover:bg-purple-50 px-3 rounded-full w-full sm:w-auto h-7 text-purple-700 text-xs"
                                                            onClick={() => handleDeleteWallet(wallet.address)}
                                                        >
                                                            Remove
                                                        </Button>
                                                        <Button
                                                            variant="outline"
                                                            className="hover:bg-blue-50 px-3 border-blue-200 rounded-full w-full sm:w-auto h-7 text-blue-700 text-xs"
                                                            onClick={() => handleUpdateWalletTag(wallet.address, 'Store')}
                                                        >
                                                            Store
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    {new Date(wallet.date_added).toLocaleDateString()}
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="overflow-x-auto">
                            <h2 className="mb-4 font-semibold text-xl">Stored Addresses</h2>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Wallet</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date Added</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {wallets
                                        .filter((item) => item.tag === 'Store')
                                        .map((wallet) => (
                                            <TableRow key={wallet.address}>
                                                <TableCell className="font-mono break-all">
                                                    {wallet.address}
                                                </TableCell>
                                                <TableCell>
                                                    <Button
                                                        variant="outline"
                                                        className="border-green-200 hover:bg-green-50 px-3 rounded-full w-full sm:w-auto h-7 text-green-700 text-xs"
                                                        onClick={() => handleUpdateWalletTag(wallet.address, 'Watchlist')}
                                                    >
                                                        Add to watchlist
                                                    </Button>
                                                </TableCell>
                                                <TableCell>
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
    );
}