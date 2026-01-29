import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Plus, RotateCcw, Search, Download, Edit2, Trash2, Tag, CheckCircle, Clock, ShoppingBag, 
  ArrowUpDown
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Modal, Pagination } from '../components/Common';
import { COUPONS, CATEGORIES } from '../data';
import { Coupon } from '../types';

type SortConfig = { key: string; direction: 'asc' | 'desc' } | null;

const CouponsPage: React.FC = () => {
  const location = useLocation();

  // --- State ---
  const [data, setData] = useState<Coupon[]>(COUPONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Partial<Coupon>>({
    code: '',
    type: 'Fixed Amount',
    value: 0,
    minOrder: 0,
    maxDiscount: 0,
    usageLimit: 0,
    validFrom: '',
    validUntil: '',
    categories: []
  });

  // --- Effects ---
  useEffect(() => {
    if (location.state && (location.state as any).openModal) {
      handleOpenModal();
    }
  }, [location]);

  // --- Filtering & Sorting ---
  const filteredCoupons = useMemo(() => {
    let result = data.filter(c => {
      const matchesSearch = c.code.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter;
      const matchesType = typeFilter === 'All' || c.type === typeFilter;
      return matchesSearch && matchesStatus && matchesType;
    });

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
  }, [data, searchTerm, statusFilter, typeFilter, sortConfig]);

  const paginatedCoupons = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredCoupons.slice(start, start + itemsPerPage);
  }, [filteredCoupons, currentPage, itemsPerPage]);

  // --- Handlers ---
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleRefresh = () => {
    // Simulate refresh
    const current = data;
    setData([]);
    setTimeout(() => setData(current), 300);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this coupon?')) {
      setData(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleOpenModal = (coupon?: Coupon) => {
    if (coupon) {
      setEditingId(coupon.id);
      setFormData({ ...coupon });
    } else {
      setEditingId(null);
      setFormData({
        code: '',
        type: 'Fixed Amount',
        value: 0,
        minOrder: 0,
        maxDiscount: 0,
        usageLimit: 100,
        validFrom: new Date().toISOString().split('T')[0],
        validUntil: '',
        categories: []
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.code || !formData.validFrom || !formData.validUntil) return; // Basic validation

    if (editingId) {
      setData(prev => prev.map(c => c.id === editingId ? { ...c, ...formData } as Coupon : c));
    } else {
      const newCoupon: Coupon = {
        ...formData as Coupon,
        id: `CPN-${Date.now()}`,
        status: 'Active',
        usedCount: 0
      };
      setData(prev => [newCoupon, ...prev]);
    }
    setIsModalOpen(false);
    // Success toast could go here
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const options = e.target.options;
    const value: string[] = [];
    for (let i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    setFormData(prev => ({ ...prev, categories: value }));
  };

  // Stats
  const total = data.length;
  const active = data.filter(c => c.status === 'Active').length;
  const expired = data.filter(c => c.status === 'Expired').length;
  const used = data.reduce((acc, c) => acc + c.usedCount, 0);

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Coupons</h1>
          <p className="text-slate-500 mt-1">View and manage discount coupons</p>
        </div>
        <div className="flex gap-2">
           <button 
             onClick={handleRefresh}
             className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-900 transition-all bg-white shadow-sm"
           >
             <RotateCcw className="h-4 w-4" />
           </button>
           <Button icon={<Plus className="h-4 w-4" />} onClick={() => handleOpenModal()}>Add Coupon</Button>
        </div>
      </div>

      {/* 2. Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <SummaryCard label="Total Coupons" value={total} icon={Tag} color="blue" />
        <SummaryCard label="Active Coupons" value={active} icon={CheckCircle} color="emerald" />
        <SummaryCard label="Expired Coupons" value={expired} icon={Clock} color="rose" />
        <SummaryCard label="Coupons Used" value={used} icon={ShoppingBag} color="indigo" />
      </div>

      <Card className="flex flex-col overflow-hidden">
        {/* 3. Filters & Controls */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto flex-1">
             <div className="w-full sm:w-72">
               <Input 
                 placeholder="Search by coupon code..." 
                 icon={<Search className="h-4 w-4" />} 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
             </div>
             <div className="w-36">
               <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                 <option value="All">All Status</option>
                 <option value="Active">Active</option>
                 <option value="Expired">Expired</option>
                 <option value="Upcoming">Upcoming</option>
               </Select>
             </div>
             <div className="w-40">
               <Select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                 <option value="All">All Types</option>
                 <option value="Fixed Amount">Fixed Amount</option>
                 <option value="Percentage">Percentage</option>
               </Select>
             </div>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
             <div className="w-24">
                <Select value={itemsPerPage} onChange={(e) => setItemsPerPage(Number(e.target.value))}>
                   <option value="10">10 rows</option>
                   <option value="20">20 rows</option>
                   <option value="50">50 rows</option>
                </Select>
             </div>
             <Button variant="secondary" icon={<Download className="h-4 w-4" />}>Export</Button>
          </div>
        </div>

        {/* 4. Coupons Table */}
        <div className="overflow-x-auto min-h-[400px]">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('code')}>
                  <div className="flex items-center gap-2">Code <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('type')}>
                  <div className="flex items-center gap-2">Type <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('value')}>
                  <div className="flex items-center gap-2">Value <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Min Order</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Max Discount</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Usage Limit</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Used</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Valid From</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Valid Until</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-2">Status <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                </th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {paginatedCoupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap font-mono text-sm font-bold text-indigo-600">
                    {coupon.code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">
                    {coupon.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-slate-900">
                    {coupon.type === 'Percentage' ? `${coupon.value}%` : `£${coupon.value}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    £{coupon.minOrder}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    £{coupon.maxDiscount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {coupon.usageLimit}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {coupon.usedCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {coupon.validFrom}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {coupon.validUntil}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={
                      coupon.status === 'Active' ? 'success' : 
                      coupon.status === 'Upcoming' ? 'info' : 'neutral'
                    }>
                      {coupon.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center items-center gap-2">
                       <button 
                         className="h-8 w-8 rounded-lg border border-slate-200 text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 flex items-center justify-center transition-all"
                         onClick={() => handleOpenModal(coupon)}
                         title="Edit"
                       >
                         <Edit2 className="h-4 w-4" />
                       </button>
                       <button 
                         className="h-8 w-8 rounded-lg border border-slate-200 text-rose-600 hover:bg-rose-50 hover:border-rose-200 flex items-center justify-center transition-all"
                         onClick={() => handleDelete(coupon.id)}
                         title="Delete"
                       >
                         <Trash2 className="h-4 w-4" />
                       </button>
                    </div>
                  </td>
                </tr>
              ))}
              {paginatedCoupons.length === 0 && (
                 <tr>
                    <td colSpan={11} className="px-6 py-12 text-center text-slate-500">No coupons found.</td>
                 </tr>
              )}
            </tbody>
          </table>
        </div>
        
        <Pagination 
            currentPage={currentPage}
            totalItems={filteredCoupons.length}
            itemsPerPage={itemsPerPage}
            onPageChange={setCurrentPage}
            onItemsPerPageChange={setItemsPerPage}
            entityName="coupons"
        />
      </Card>

      {/* 5. Add/Edit Modal */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingId ? "Edit Coupon" : "Add Coupon"}
        size="lg"
        footer={
           <div className="flex gap-3 justify-end w-full">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSave} disabled={!formData.code}>{editingId ? "Save Coupon" : "Add Coupon"}</Button>
          </div>
        }
      >
        <div className="space-y-6">
           <div className="bg-white p-5 rounded-xl border border-slate-200">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-100 pb-2">Coupon Details</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                 <div className="md:col-span-2">
                    <Input 
                      label="Coupon Code" 
                      placeholder="e.g. SUMMER25" 
                      value={formData.code} 
                      onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                    />
                 </div>
                 <Select 
                   label="Type" 
                   value={formData.type} 
                   onChange={e => setFormData({...formData, type: e.target.value as any})}
                 >
                    <option value="Fixed Amount">Fixed Amount</option>
                    <option value="Percentage">Percentage</option>
                 </Select>
                 <Input 
                   label="Value" 
                   type="number" 
                   value={formData.value} 
                   onChange={e => setFormData({...formData, value: Number(e.target.value)})} 
                 />
                 <Input 
                   label="Min Order Amount" 
                   type="number" 
                   value={formData.minOrder} 
                   onChange={e => setFormData({...formData, minOrder: Number(e.target.value)})} 
                 />
                 <Input 
                   label="Max Discount" 
                   type="number" 
                   value={formData.maxDiscount} 
                   onChange={e => setFormData({...formData, maxDiscount: Number(e.target.value)})} 
                 />
                 <Input 
                   label="Usage Limit" 
                   type="number" 
                   value={formData.usageLimit} 
                   onChange={e => setFormData({...formData, usageLimit: Number(e.target.value)})} 
                 />
                 <div className="hidden md:block"></div> {/* Spacer */}
                 
                 <Input 
                   label="Valid From" 
                   type="date" 
                   value={formData.validFrom} 
                   onChange={e => setFormData({...formData, validFrom: e.target.value})} 
                 />
                 <Input 
                   label="Valid Until" 
                   type="date" 
                   value={formData.validUntil} 
                   onChange={e => setFormData({...formData, validUntil: e.target.value})} 
                 />
                 
                 <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Applicable Categories</label>
                    <select 
                      multiple 
                      className="block w-full rounded-xl border border-slate-200 bg-white shadow-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 sm:text-sm py-2.5 px-3.5 h-32"
                      value={formData.categories}
                      onChange={handleCategoryChange}
                    >
                       <option value="All">All Categories</option>
                       {CATEGORIES.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    <p className="text-xs text-slate-500 mt-1">Hold Ctrl (Windows) or Cmd (Mac) to select multiple options.</p>
                 </div>
              </div>
           </div>
        </div>
      </Modal>

    </div>
  );
};

const SummaryCard = ({ label, value, icon: Icon, color }: any) => {
  const styles: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
  };
  return (
    <Card className="p-4 flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl border ${styles[color]}`}>
        <Icon className="h-5 w-5" />
      </div>
    </Card>
  );
};

export default CouponsPage;