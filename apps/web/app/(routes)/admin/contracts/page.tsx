"use client";

import { useState, useEffect } from 'react';
import { useAllContractAddresses } from '../../../../hooks/useContractAddresses';
import { contractService, ContractAddresses } from '../../../../lib/contractService';

export default function ContractAdminPage() {
  const { contractAddresses, loading, error, refetch } = useAllContractAddresses();
  const [editingContract, setEditingContract] = useState<ContractAddresses | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [formData, setFormData] = useState<Partial<ContractAddresses>>({});

  const handleEdit = (contract: ContractAddresses) => {
    setEditingContract(contract);
    setFormData(contract);
    setIsAddingNew(false);
  };

  const handleAddNew = () => {
    setEditingContract(null);
    setFormData({
      chainId: 0,
      chainName: '',
      stakingManager: '',
      soulbound: '',
      reputation: '',
      dataCoin: '',
      isActive: false
    });
    setIsAddingNew(true);
  };

  const handleSave = async () => {
    try {
      await contractService.updateContractAddresses(formData);
      setEditingContract(null);
      setIsAddingNew(false);
      setFormData({});
      refetch();
    } catch (error) {
      console.error('Error saving contract addresses:', error);
    }
  };

  const handleCancel = () => {
    setEditingContract(null);
    setIsAddingNew(false);
    setFormData({});
  };

  const handleToggleActive = async (chainId: number, isActive: boolean) => {
    try {
      await contractService.updateContractAddresses({ chainId, isActive });
      refetch();
    } catch (error) {
      console.error('Error updating contract status:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading contract addresses...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">❌ Error</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={refetch}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Contract Addresses Management</h1>
          <p className="mt-2 text-gray-600">
            Manage smart contract addresses for each network
          </p>
        </div>

        <div className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Contract Addresses</h2>
              <button
                onClick={handleAddNew}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Add New Network
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Network
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Staking Manager
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Soulbound
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Reputation
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {contractAddresses.map((contract) => (
                  <tr key={contract.chainId}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {contract.chainName}
                        </div>
                        <div className="text-sm text-gray-500">
                          Chain ID: {contract.chainId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">
                        {contract.stakingManager || 'Not set'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">
                        {contract.soulbound || 'Not set'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 font-mono">
                        {contract.reputation || 'Not set'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        contract.isActive 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {contract.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(contract)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleActive(contract.chainId, !contract.isActive)}
                          className={`${
                            contract.isActive 
                              ? 'text-red-600 hover:text-red-900' 
                              : 'text-green-600 hover:text-green-900'
                          }`}
                        >
                          {contract.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Edit/Add Modal */}
        {(editingContract || isAddingNew) && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="mt-3">
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {isAddingNew ? 'Add New Network' : 'Edit Contract Addresses'}
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Chain ID</label>
                    <input
                      type="number"
                      value={formData.chainId || ''}
                      onChange={(e) => setFormData({...formData, chainId: parseInt(e.target.value)})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Chain Name</label>
                    <input
                      type="text"
                      value={formData.chainName || ''}
                      onChange={(e) => setFormData({...formData, chainName: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Staking Manager</label>
                    <input
                      type="text"
                      value={formData.stakingManager || ''}
                      onChange={(e) => setFormData({...formData, stakingManager: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="0x..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Soulbound</label>
                    <input
                      type="text"
                      value={formData.soulbound || ''}
                      onChange={(e) => setFormData({...formData, soulbound: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="0x..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Reputation</label>
                    <input
                      type="text"
                      value={formData.reputation || ''}
                      onChange={(e) => setFormData({...formData, reputation: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="0x..."
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">DataCoin (Optional)</label>
                    <input
                      type="text"
                      value={formData.dataCoin || ''}
                      onChange={(e) => setFormData({...formData, dataCoin: e.target.value})}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2"
                      placeholder="0x..."
                    />
                  </div>
                  
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.isActive || false}
                      onChange={(e) => setFormData({...formData, isActive: e.target.checked})}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label className="ml-2 block text-sm text-gray-900">
                      Active
                    </label>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={handleCancel}
                    className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
