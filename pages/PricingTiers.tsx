import React, { useState, useMemo } from 'react';
import { 
  Plus, RotateCcw, Search, Edit2, Trash2, Tag, Check, Info, Layers, 
  ArrowUpDown, ShieldCheck, Star
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Modal, Pagination, Toggle } from '../components/Common';
import { PRICING_STRATEGIES } from '../data';
import { PricingStrategy, PricingTierItem } from '../types';

type SortConfig = { key: string; direction: 'asc' | 'desc' } | null;

const PricingTiersPage: React.FC = () => {
  // --- State ---
  const [data, setData] = useState<PricingStrategy[]>(PRICING_STRATEGIES);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const defaultFormState = {
    name: '',
    description: '',
    type: 'Global' as 'Global' | 'Category' | 'Product',
    status: true, // Active
    isDefault: false,
    tiers: [{ name: '', minQty: 1, maxQty: '' as string | number, discount: 0 }]
  };

  const [formData, setFormData] = useState(defaultFormState);
  const [showErrors, setShowErrors] = useState(false);

  // --- Filtering & Sorting ---
  const filteredStrategies = useMemo(() => {
    let result = data.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig) {
      result.sort((a: any, b: any) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];
        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return result;
  }, [data, searchTerm, sortConfig]);

  const paginatedStrategies = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStrategies.slice(start, start + itemsPerPage);
  }, [filteredStrategies, currentPage, itemsPerPage]);

  // --- Helpers ---
  const formatTiers = (tiers: PricingTierItem[]) => {
    return (
      <div className="flex flex-col gap-1">
        {tiers.map((tier, idx) => (
          <span key={idx} className="text-xs font-mono text-slate-600 bg-slate-100 px-2 py-0.5 rounded w-fit">
            {tier.minQty}{tier.maxQty ? `–${tier.maxQty}` : '+'} : {tier.discount}%
          </span>
        ))}
      </div>
    );
  };

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleRefresh = () => {
    const current = data;
    setData([]);
    setTimeout(() => setData(current), 300);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this strategy?')) {
      setData(prev => prev.filter(s => s.id !== id));
    }
  };

  // --- Modal Logic ---
  const handleOpenModal = (strategy?: PricingStrategy) => {
    setShowErrors(false);
    if (strategy) {
      setEditingId(strategy.id);
      setFormData({
        name: strategy.name,
        description: strategy.description || '',
        type: strategy.type,
        status: strategy.status === 'Active',
        isDefault: strategy.isDefault,
        tiers: strategy.tiers.map(t => ({
          name: t.name || '',
          minQty: t.minQty,
          maxQty: t.maxQty === null ? '' : t.maxQty,
          discount: t.discount
        }))
      });
    } else {
      setEditingId(null);
      setFormData(defaultFormState);
    }
    setIsModalOpen(true);
  };

  const handleAddTierRow = () => {
    setFormData(prev => ({
      ...prev,
      tiers: [...prev.tiers, { name: '', minQty: 0, maxQty: '', discount: 0 }]
    }));
  };

  const handleRemoveTierRow = (index: number) => {
    if (formData.tiers.length <= 1) return; // Prevent deleting last row
    setFormData(prev => ({
      ...prev,
      tiers: prev.tiers.filter((_, i) => i !== index)
    }));
  };

  const handleTierChange = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newTiers = [...prev.tiers];
      // @ts-ignore
      newTiers[index][field] = value;
      return { ...prev, tiers: newTiers };
    });
  };

  const handleSave = () => {
    setShowErrors(true);
    if (!formData.name) return;
    
    // Validate Tiers
    const validTiers = formData.tiers.map(t => ({
      name: t.name,
      minQty: Number(t.minQty),
      maxQty: t.maxQty === '' ? null : Number(t.maxQty),
      discount: Number(t.discount)
    }));

    // Ensure minQty is valid
    if (validTiers.some(t => t.minQty <= 0)) {
      alert("Min Quantity must be greater than 0");
      return;
    }

    if (editingId) {
      setData(prev => prev.map(s => s.id === editingId ? {
        id: s.id,
        name: formData.name,
        description: formData.description,
        type: formData.type,
        status: formData.status ? 'Active' : 'Inactive',
        isDefault: formData.isDefault,
        tiers: validTiers
      } : s));
    } else {
      const newStrategy: PricingStrategy = {
        id: `PS-${Date.now()}`,
        name: formData.name,
        description: formData.description,
        type: formData.type,
        status: formData.status ? 'Active' : 'Inactive',
        isDefault: formData.isDefault,
        tiers: validTiers
      };
      setData(prev => [newStrategy, ...prev]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pricing Tiers</h1>
          <p className="text-slate-500 mt-1">Manage volume-based pricing strategies and discounts.</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={handleRefresh}
             className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all bg-white shadow-sm"
           >
             <RotateCcw className="h-4 w-4" />
           </button>
           <Button icon={<Plus className="h-4 w-4" />} onClick={() => handleOpenModal()}>Add Pricing Tier</Button>
        </div>
      </div>

      <Card className="flex flex-col overflow-hidden">
        {/* 2. Controls */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white sticky top-0 z-10">
          <div className="w-full sm:w-80">
            <Input 
               placeholder="Search strategies..." 
               icon={<Search className="h-4 w-4" />} 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
             <div className="w-24">
                <Select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                   <option value="10">10 rows</option>
                   <option value="20">20 rows</option>
                   <option value="50">50 rows</option>
                </Select>
             </div>
          </div>
        </div>

        {/* 3. Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-2">Name <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('type')}>
                  <div className="flex items-center gap-2">Type <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tiers</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-2">Status <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {paginatedStrategies.map((strategy) => (
                <tr key={strategy.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-bold text-slate-900">{strategy.name}</div>
                    {strategy.description && <div className="text-xs text-slate-500 mt-0.5">{strategy.description}</div>}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                      {strategy.type}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {formatTiers(strategy.tiers)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col gap-1 items-start">
                       <Badge variant={strategy.status === 'Active' ? 'success' : 'neutral'}>
                         {strategy.status}
                       </Badge>
                       {strategy.isDefault && (
                         <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-100 mt-1">
                           Default
                         </span>
                       )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center items-center gap-2">
                       <button 
                         className="h-8 w-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 flex items-center justify-center transition-all"
                         onClick={() => handleOpenModal(strategy)}
                         title="Edit"
                       >
                         <Edit2 className="h-4 w-4" />
                       </button>
                       <button 
                         className="h-8 w-8 rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center transition-all"
                         onClick={() => handleDelete(strategy.id)}
                         title="Delete"
                       >
                         <Trash2 className="h-4 w-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedStrategies.length === 0 && (
                 <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No pricing strategies found.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <Pagination 
            currentPage={currentPage}
            totalItems={filteredStrategies.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            entityName="strategies"
        />
      </Card>

      {/* 4. Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingId ? "Edit Pricing Tier Strategy" : "Add Pricing Tier Strategy"}
        size="lg"
        footer={
           <div className="flex gap-3 justify-end w-full">
            <Button variant="secondary" onClick={() => { setFormData(defaultFormState); setIsModalOpen(false); }}>Reset</Button>
            <Button variant="primary" onClick={handleSave}>
               {editingId ? "Save Strategy" : "Create Pricing Strategy"}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
           
           {/* SECTION 1: STRATEGY DETAILS */}
           <div className="bg-white p-5 rounded-xl border border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2 flex items-center gap-2">
                 <Tag className="h-4 w-4 text-indigo-500" /> Strategy Details
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="md:col-span-2">
                    <Input 
                      label="Strategy Name *" 
                      placeholder="e.g. Wholesale Discount" 
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                    {showErrors && !formData.name && <p className="text-xs text-rose-500 mt-1 ml-1">Name is required.</p>}
                 </div>
                 
                 <Select 
                   label="Application Type" 
                   value={formData.type} 
                   onChange={e => setFormData({...formData, type: e.target.value as any})}
                 >
                    <option value="Global">Global</option>
                    <option value="Category">Category</option>
                    <option value="Product">Product</option>
                 </Select>

                 <div className="md:col-span-2">
                    <Input 
                      label="Description" 
                      placeholder="Optional description" 
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                 </div>

                 <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <Toggle 
                      checked={formData.status} 
                      onChange={(checked) => setFormData({...formData, status: checked})} 
                      label="Active"
                    />
                 </div>
                 
                 <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <Toggle 
                      checked={formData.isDefault} 
                      onChange={(checked) => setFormData({...formData, isDefault: checked})} 
                      label="Set as Default Strategy"
                    />
                 </div>
              </div>
           </div>

           {/* SECTION 2: PRICING TIERS */}
           <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-2">
                 <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <Layers className="h-4 w-4 text-indigo-500" /> Pricing Tiers
                 </h4>
                 <Button size="sm" variant="secondary" icon={<Plus className="h-3 w-3" />} onClick={handleAddTierRow}>Add Tier</Button>
              </div>
              
              <div className="space-y-3">
                 {/* Header Row */}
                 <div className="grid grid-cols-12 gap-2 text-xs font-semibold text-slate-500 px-2">
                    <div className="col-span-4">Tier Name (Optional)</div>
                    <div className="col-span-3">Min Qty *</div>
                    <div className="col-span-3">Max Qty</div>
                    <div className="col-span-2">Discount %</div>
                 </div>

                 {formData.tiers.map((tier, idx) => (
                    <div key={idx} className="grid grid-cols-12 gap-2 items-center animate-fadeIn">
                       <div className="col-span-4">
                          <Input 
                             placeholder="e.g. Bulk" 
                             value={tier.name} 
                             onChange={(e) => handleTierChange(idx, 'name', e.target.value)}
                             className="h-9 py-1 text-sm"
                          />
                       </div>
                       <div className="col-span-3">
                          <Input 
                             type="number"
                             placeholder="1" 
                             min="1"
                             value={tier.minQty} 
                             onChange={(e) => handleTierChange(idx, 'minQty', e.target.value)}
                             className="h-9 py-1 text-sm"
                          />
                       </div>
                       <div className="col-span-3">
                          <Input 
                             type="number"
                             placeholder="∞" 
                             value={tier.maxQty} 
                             onChange={(e) => handleTierChange(idx, 'maxQty', e.target.value)}
                             className="h-9 py-1 text-sm"
                          />
                       </div>
                       <div className="col-span-2 flex items-center gap-2">
                          <div className="relative w-full">
                            <Input 
                               type="number"
                               placeholder="0" 
                               max="100"
                               value={tier.discount} 
                               onChange={(e) => handleTierChange(idx, 'discount', e.target.value)}
                               className="h-9 py-1 text-sm pr-6"
                            />
                            <span className="absolute right-2 top-2 text-xs text-slate-400">%</span>
                          </div>
                          <button 
                             onClick={() => handleRemoveTierRow(idx)}
                             className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                             disabled={formData.tiers.length === 1}
                             title="Remove Tier"
                          >
                             <Trash2 className="h-4 w-4" />
                          </button>
                       </div>
                    </div>
                 ))}
              </div>
              
              <div className="mt-4 bg-blue-50 text-blue-700 text-xs p-3 rounded-lg flex items-start gap-2">
                 <Info className="h-4 w-4 mt-0.5 flex-shrink-0" />
                 <p>Leave "Max Qty" empty to apply discount for all quantities above the minimum.</p>
              </div>
           </div>

        </div>
      </Modal>

    </div>
  );
};

export default PricingTiersPage;