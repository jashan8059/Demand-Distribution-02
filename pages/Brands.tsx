import React, { useState, useMemo, useRef } from 'react';
import { 
  Search, Plus, Download, ExternalLink, Edit, Trash2, CheckCircle, ShoppingBag, Layers, 
  Upload, Image as ImageIcon, X, ArrowUpDown
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Modal, Toggle } from '../components/Common';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, CartesianGrid 
} from 'recharts';
import { BRANDS } from '../data';
import { Brand } from '../types';

type SortConfig = { key: string; direction: 'asc' | 'desc' } | null;

const BrandsPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);
  
  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [brandForm, setBrandForm] = useState({
    name: '',
    status: true, // defaults to Active
    featured: false,
    logoPreview: null as string | null
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Data Processing ---
  const filteredBrands = useMemo(() => {
    let data = BRANDS.filter(brand => {
      const matchesSearch = brand.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || brand.status === statusFilter;
      return matchesSearch && matchesStatus;
    });

    if (sortConfig) {
        data.sort((a: any, b: any) => {
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
    return data;
  }, [searchTerm, statusFilter, sortConfig]);

  const activeBrandsCount = BRANDS.filter(b => b.status === 'Active').length;
  const totalProductsCount = BRANDS.reduce((acc, curr) => acc + curr.products, 0);

  const chartData = useMemo(() => {
    return [...BRANDS]
      .sort((a, b) => b.products - a.products)
      .slice(0, 5)
      .map(b => ({ name: b.name, products: b.products }));
  }, []);

  const statusData = [
    { name: 'Active', value: activeBrandsCount, color: '#10b981' },
    { name: 'Inactive', value: BRANDS.length - activeBrandsCount, color: '#94a3b8' },
  ].filter(d => d.value > 0);

  // --- Handlers ---
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleOpenModal = (brand?: Brand) => {
    if (brand) {
      setEditingId(brand.id);
      setBrandForm({
        name: brand.name,
        status: brand.status === 'Active',
        featured: false, // Mock default as strictly 'featured' isn't in the base data type yet
        logoPreview: brand.logo
      });
    } else {
      setEditingId(null);
      setBrandForm({
        name: '',
        status: true,
        featured: false,
        logoPreview: null
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingId(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBrandForm(prev => ({ ...prev, logoPreview: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // Validation logic
    if (!brandForm.name.trim()) return;
    
    if (editingId) {
      console.log(`Updating Brand [${editingId}]:`, brandForm);
    } else {
      console.log("Creating New Brand:", brandForm);
    }
    // Logic to update backend would go here
    handleCloseModal();
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Brands</h1>
          <p className="text-slate-500 mt-1">Manage product brands used across the catalog.</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => handleOpenModal()}>Add Brand</Button>
      </div>

      {/* 2. Brand Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <SummaryCard 
          label="Total Brands" 
          value={BRANDS.length} 
          icon={ShoppingBag}
          color="indigo"
        />
        <SummaryCard 
          label="Active Brands" 
          value={activeBrandsCount} 
          icon={CheckCircle}
          color="emerald"
        />
        <SummaryCard 
          label="Total Products Linked" 
          value={totalProductsCount} 
          icon={Layers}
          color="blue"
        />
      </div>

      {/* 3. Brand Insights (Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">Top Brands by Volume</h3>
            <p className="text-sm text-slate-500">Brands with the largest product catalogs</p>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} layout="vertical" margin={{ top: 0, right: 30, left: 40, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#475569', fontSize: 13, fontWeight: 500 }} width={100} />
                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Bar dataKey="products" fill="#4f46e5" radius={[0, 4, 4, 0]} barSize={24} name="Products" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
        <Card className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-slate-900">Brand Status</h3>
            <p className="text-sm text-slate-500">Active vs Inactive distribution</p>
          </div>
          <div className="h-64 relative">
             <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
             </ResponsiveContainer>
             <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none pb-8">
                <span className="text-3xl font-extrabold text-slate-900">{BRANDS.length}</span>
                <span className="text-xs text-slate-400 font-bold uppercase">Total</span>
              </div>
          </div>
        </Card>
      </div>

      {/* 4. Filter & Table Section */}
      <Card className="flex flex-col overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto flex-1">
            <div className="w-full sm:w-80">
               <Input 
                 placeholder="Search brands..." 
                 icon={<Search className="h-4 w-4" />} 
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="All">All Statuses</option>
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </Select>
            </div>
          </div>
          
          <div className="flex gap-2 w-full sm:w-auto">
             <Button variant="ghost" size="sm" onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}>Reset</Button>
             <Button variant="secondary" size="sm" icon={<Download className="h-4 w-4" />}>Export</Button>
          </div>
        </div>

        {/* Brands Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('name')}>
                  <div className="flex items-center gap-2">Brand Name <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('status')}>
                  <div className="flex items-center gap-2">Status <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('products')}>
                  <div className="flex items-center gap-2">Product Count <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Created Date</th>
                <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-100">
              {filteredBrands.map((brand) => (
                <tr key={brand.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img className="h-10 w-10 rounded-lg object-cover bg-slate-50 border border-slate-200 mr-4" src={brand.logo} alt="" />
                      <div>
                        <div className="text-sm font-bold text-slate-900">{brand.name}</div>
                        <div className="text-xs text-slate-400 font-mono mt-0.5">{brand.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={brand.status === 'Active' ? 'success' : 'neutral'}>
                      {brand.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                       <Layers className="h-4 w-4 text-slate-400" />
                       <span className="text-sm font-medium text-slate-700">{brand.products} items</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    Oct 24, 2023
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-center">
                    <div className="flex justify-center items-center gap-2">
                      <button 
                        className="h-9 w-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 flex items-center justify-center transition-all"
                        onClick={() => handleOpenModal(brand)}
                        title="Edit Brand"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button className="h-9 w-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center transition-all">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredBrands.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No brands found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* --- ADD/EDIT BRAND MODAL --- */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingId ? "Edit Brand" : "Add New Brand"}
        footer={
          <div className="flex gap-3 justify-end w-full">
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button 
              variant="primary" 
              onClick={handleSave} 
              disabled={!brandForm.name.trim()}
            >
              {editingId ? "Save Changes" : "Create Brand"}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          
          {/* Section 1: Brand Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Brand Information</h4>
            
            <div className="grid grid-cols-1 gap-4">
               {/* Logo Upload */}
               <div className="flex flex-col gap-2">
                 <label className="block text-sm font-semibold text-slate-700">Brand Logo</label>
                 <div 
                   className={`
                     border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors
                     ${brandForm.logoPreview ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}
                   `}
                   onClick={() => fileInputRef.current?.click()}
                 >
                   <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageUpload}
                   />
                   
                   {brandForm.logoPreview ? (
                     <div className="relative group">
                       <img src={brandForm.logoPreview} alt="Preview" className="h-24 w-24 object-contain rounded-lg bg-white shadow-sm p-1" />
                       <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-white text-xs font-medium">Change</span>
                       </div>
                       <button 
                         onClick={(e) => { e.stopPropagation(); setBrandForm(prev => ({ ...prev, logoPreview: null })); }}
                         className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-sm hover:bg-rose-600"
                       >
                         <X className="h-3 w-3" />
                       </button>
                     </div>
                   ) : (
                     <div className="text-center py-4">
                       <div className="h-10 w-10 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-2">
                          <ImageIcon className="h-5 w-5" />
                       </div>
                       <p className="text-sm font-medium text-slate-600">Click to upload logo</p>
                       <p className="text-xs text-slate-400 mt-1">SVG, PNG, JPG (max. 800x400px)</p>
                     </div>
                   )}
                 </div>
               </div>

               {/* Brand Name */}
               <Input 
                 label="Brand Name" 
                 placeholder="e.g. Acme Corp" 
                 value={brandForm.name}
                 onChange={(e) => setBrandForm(prev => ({ ...prev, name: e.target.value }))}
               />
               
               {/* Status Toggle */}
               <div className="bg-white p-3 rounded-xl border border-slate-200">
                 <Toggle 
                   checked={brandForm.status} 
                   onChange={(checked) => setBrandForm(prev => ({ ...prev, status: checked }))} 
                   label="Active Status"
                   description="Enable this brand to be used in products immediately."
                 />
               </div>
            </div>
          </div>

          {/* Section 2: Display Settings */}
          <div className="space-y-4 pt-2">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Display Settings</h4>
            
            <div className="bg-white p-3 rounded-xl border border-slate-200">
               <Toggle 
                 checked={brandForm.featured} 
                 onChange={(checked) => setBrandForm(prev => ({ ...prev, featured: checked }))} 
                 label="Featured Brand"
                 description="Highlight this brand on the storefront homepage."
               />
            </div>
          </div>

        </div>
      </Modal>

    </div>
  );
};

const SummaryCard = ({ label, value, icon: Icon, color }: any) => {
  const styles: any = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
  };
  return (
    <Card className="p-5 flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl border ${styles[color]}`}>
        <Icon className="h-6 w-6" />
      </div>
    </Card>
  );
};

export default BrandsPage;