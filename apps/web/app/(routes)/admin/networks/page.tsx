"use client";

import { useState, useEffect } from 'react';
import { useAllNetworkRPCs } from '../../../../hooks/useNetworkRPC';
import { rpcService, NetworkRPC } from '../../../../lib/rpcService';

export default function NetworkAdminPage() {
  const { networkRPCs, loading, error, refetch } = useAllNetworkRPCs();
  const [editingNetwork, setEditingNetwork] = useState<NetworkRPC | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState<Partial<NetworkRPC>>({});

  const handleEdit = (network: NetworkRPC) => {
    setEditingNetwork(network);
    setFormData(network);
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setEditingNetwork(null);
    setFormData({
      chainId: 0,
      chainName: '',
      rpcUrl: '',
      backupRpcUrls: [],
      blockExplorer: '',
      nativeCurrency: { name: 'ETH', symbol: 'ETH', decimals: 18 },
      isTestnet: false,
      isActive: true,
      priority: 0
    });
    setIsAddingNew(true);
  };

  const handleSave = async () => {
    try {
      await rpcService.updateNetworkRPC(formData);
      setEditingNetwork(null);
      setIsAddingNew(false);
      setFormData({});
      refetch();
    } catch (error) {
      console.error('Error saving network:', error);
    }
  };

  const handleCancel = () => {
    setEditingNetwork(null);
    setIsAddingNew(false);
    setFormData({});
  };

  const handleDelete = async (chainId: number) => {
    if (confirm('Are you sure you want to delete this network configuration?')) {
      try {
        await rpcService.updateNetworkRPC({ chainId, isActive: false });
        refetch();
      } catch (error) {
        console.error('Error deleting network:', error);
      }
    }
  };

  const handleInitializeDefaults = async () => {
    try {
      await rpcService.initializeDefaultRPCs();
      refetch();
    } catch (error) {
      console.error('Error initializing defaults:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading network configurations...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Network RPC Management</h1>
        <div className="space-x-4">
          <button
            onClick={handleInitializeDefaults}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Initialize Defaults
          </button>
          <button
            onClick={handleAddNew}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Add New Network
          </button>
        </div>
      </div>

      {/* Network List */}
      <div className="grid gap-6">
        {networkRPCs.map((network) => (
          <div key={network.chainId} className="bg-white border border-gray-200 rounded-lg p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">{network.chainName}</h3>
                <p className="text-gray-600">Chain ID: {network.chainId}</p>
                <p className="text-sm text-gray-500">
                  {network.isTestnet ? 'Testnet' : 'Mainnet'} • Priority: {network.priority}
                </p>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleEdit(network)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(network.chainId)}
                  className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                >
                  Delete
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Primary RPC</h4>
                <p className="text-sm text-gray-600 break-all">{network.rpcUrl}</p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Block Explorer</h4>
                <a 
                  href={network.blockExplorer} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-sm text-blue-600 hover:underline"
                >
                  {network.blockExplorer}
                </a>
              </div>
            </div>

            {network.backupRpcUrls.length > 0 && (
              <div className="mt-4">
                <h4 className="font-medium text-gray-700 mb-2">Backup RPCs</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                  {network.backupRpcUrls.map((url, index) => (
                    <li key={index} className="break-all">{url}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 flex items-center space-x-4">
              <span className={`px-2 py-1 rounded text-xs ${
                network.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
              }`}>
                {network.isActive ? 'Active' : 'Inactive'}
              </span>
              <span className="text-xs text-gray-500">
                Native: {network.nativeCurrency.symbol}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {(editingNetwork || isAddingNew) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">
              {isAddingNew ? 'Add New Network' : 'Edit Network'}
            </h2>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Chain ID
                  </label>
                  <input
                    type="number"
                    value={formData.chainId || ''}
                    onChange={(e) => setFormData({...formData, chainId: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <input
                    type="number"
                    value={formData.priority || 0}
                    onChange={(e) => setFormData({...formData, priority: parseInt(e.target.value)})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chain Name
                </label>
                <input
                  type="text"
                  value={formData.chainName || ''}
                  onChange={(e) => setFormData({...formData, chainName: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Primary RPC URL
                </label>
                <input
                  type="url"
                  value={formData.rpcUrl || ''}
                  onChange={(e) => setFormData({...formData, rpcUrl: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Block Explorer URL
                </label>
                <input
                  type="url"
                  value={formData.blockExplorer || ''}
                  onChange={(e) => setFormData({...formData, blockExplorer: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Native Currency Name
                  </label>
                  <input
                    type="text"
                    value={formData.nativeCurrency?.name || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      nativeCurrency: {...formData.nativeCurrency, name: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Symbol
                  </label>
                  <input
                    type="text"
                    value={formData.nativeCurrency?.symbol || ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      nativeCurrency: {...formData.nativeCurrency, symbol: e.target.value}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Decimals
                  </label>
                  <input
                    type="number"
                    value={formData.nativeCurrency?.decimals || 18}
                    onChange={(e) => setFormData({
                      ...formData, 
                      nativeCurrency: {...formData.nativeCurrency, decimals: parseInt(e.target.value)}
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isTestnet || false}
                    onChange={(e) => setFormData({...formData, isTestnet: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Testnet</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isActive !== false}
                    onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Active</span>
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button
                onClick={handleCancel}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                {isAddingNew ? 'Add Network' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
