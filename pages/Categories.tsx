import React, { useState, useRef, useMemo } from 'react';
import { 
  Search, Plus, FolderTree, Edit, Trash2, Layers, Box, CheckCircle, XCircle, ChevronRight, Folder, FolderOpen,
  Upload, Image as ImageIcon, X, ArrowUpDown
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Modal, Toggle } from '../components/Common';
import { CATEGORIES } from '../data';
import { Category } from '../types';

type SortConfig = { key: string; direction: 'asc' | 'desc' } | null;

const CategoriesPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    name: '',
    status: true, // defaults to Active
    parentId: '',
    displayOrder: 0,
    imagePreview: null as string | null
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Data Processing ---
  const filteredCategories = useMemo(() => {
    let data = CATEGORIES.filter(cat => {
      const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || 
                            (statusFilter === 'Active' && cat.status === 'Active') || 
                            (statusFilter === 'Inactive' && cat.status === 'Hidden');
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

  const totalCategories = CATEGORIES.length;
  const activeCategories = CATEGORIES.filter(c => c.status === 'Active').length;
  const inactiveCategories = CATEGORIES.filter(c => c.status === 'Hidden').length;
  const totalProducts = CATEGORIES.reduce((acc, curr) => acc + curr.products, 0);

  // --- Handlers ---
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const handleOpenModal = (category?: Category) => {
    if (category) {
      setEditingId(category.id);
      setCategoryForm({
        name: category.name,
        status: category.status === 'Active',
        parentId: '', // Default as existing data type doesn't track parent yet
        displayOrder: 0, // Default as existing data type doesn't track order yet
        imagePreview: null // Default as existing data type doesn't track image yet
      });
    } else {
      setEditingId(null);
      setCategoryForm({
        name: '',
        status: true,
        parentId: '',
        displayOrder: 0,
        imagePreview: null
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
        setCategoryForm(prev => ({ ...prev, imagePreview: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    if (!categoryForm.name.trim()) return;
    
    if (editingId) {
      console.log(`Updating Category [${editingId}]:`, categoryForm);
    } else {
      console.log("Creating New Category:", categoryForm);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      
      {/* 1. Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Categories</h1>
          <p className="text-slate-500 mt-1">Manage product categories and catalog structure.</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />} onClick={() => handleOpenModal()}>Add Category</Button>
      </div>

      {/* 2. Category Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          label="Total Categories" 
          value={totalCategories} 
          icon={Layers} 
          color="indigo" 
        />
        <SummaryCard 
          label="Active Categories" 
          value={activeCategories} 
          icon={CheckCircle} 
          color="emerald" 
        />
        <SummaryCard 
          label="Hidden Categories" 
          value={inactiveCategories} 
          icon={XCircle} 
          color="neutral" 
        />
        <SummaryCard 
          label="Total Products" 
          value={totalProducts} 
          icon={Box} 
          color="blue" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* 5. Category Hierarchy View (Left Panel) */}
        <Card className="lg:col-span-1 p-0 flex flex-col h-[600px] overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">
              <FolderTree className="h-4 w-4 text-slate-500" /> Catalog Structure
            </h3>
            <span className="text-xs font-medium text-slate-500 px-2 py-1 bg-white rounded border border-slate-200">Root Level</span>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-1">
             {CATEGORIES.map((category) => (
               <div 
                 key={category.id}
                 onClick={() => setSelectedCategory(selectedCategory === category.id ? null : category.id)}
                 className={`
                   group flex items-center justify-between px-3 py-3 rounded-lg cursor-pointer transition-all duration-200
                   ${selectedCategory === category.id 
                     ? 'bg-indigo-50 border border-indigo-100 shadow-sm' 
                     : 'hover:bg-slate-50 border border-transparent'}
                 `}
               >
                 <div className="flex items-center gap-3">
                   {selectedCategory === category.id 
                     ? <FolderOpen className="h-5 w-5 text-indigo-600" />
                     : <Folder className="h-5 w-5 text-slate-400 group-hover:text-slate-500" />
                   }
                   <div>
                     <div className={`text-sm font-medium ${selectedCategory === category.id ? 'text-indigo-900' : 'text-slate-700'}`}>
                       {category.name}
                     </div>
                     <div className="text-xs text-slate-400">{category.products} products</div>
                   </div>
                 </div>
                 {selectedCategory === category.id && <ChevronRight className="h-4 w-4 text-indigo-400" />}
               </div>
             ))}
             
             <button 
                onClick={() => handleOpenModal()}
                className="w-full flex items-center gap-3 px-3 py-3 rounded-lg border border-dashed border-slate-200 text-slate-400 hover:text-slate-600 hover:border-slate-300 hover:bg-slate-50 transition-all text-sm font-medium"
             >
                <Plus className="h-4 w-4" /> Add Root Category
             </button>
          </div>
        </Card>

        {/* 4. Categories Table (Right Panel) */}
        <Card className="lg:col-span-2 flex flex-col h-[600px] overflow-hidden">
          {/* Filters */}
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto flex-1">
              <div className="w-full sm:w-64">
                <Input 
                  placeholder="Search categories..." 
                  icon={<Search className="h-4 w-4" />} 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="w-full sm:w-40">
                <Select 
                  value={statusFilter} 
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="All">All Statuses</option>
                  <option value="Active">Active</option>
                  <option value="Inactive">Hidden</option>
                </Select>
              </div>
            </div>
            
            <Button variant="ghost" size="sm" onClick={() => { setSearchTerm(''); setStatusFilter('All'); }}>Reset</Button>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100">
              <thead className="bg-slate-50/50 sticky top-0 z-10">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-2">Category Name <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('description')}>
                    <div className="flex items-center gap-2">Description <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('products')}>
                    <div className="flex items-center gap-2">Products <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('status')}>
                    <div className="flex items-center gap-2">Status <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                  </th>
                  <th scope="col" className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-100">
                {filteredCategories.map((category) => (
                  <tr 
                    key={category.id} 
                    className={`
                      transition-colors cursor-default
                      ${selectedCategory === category.id ? 'bg-indigo-50/30' : 'hover:bg-slate-50/80'}
                    `}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 mr-4 border border-slate-200">
                          <Layers className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-sm font-bold text-slate-900">{category.name}</div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5">{category.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-slate-600 line-clamp-1 max-w-xs">{category.description}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant="info">{category.products}</Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={category.status === 'Active' ? 'success' : 'neutral'}>
                        {category.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          className="h-9 w-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 flex items-center justify-center transition-all"
                          onClick={() => handleOpenModal(category)}
                          title="Edit Category"
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
                {filteredCategories.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">No categories found</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="bg-white px-6 py-4 border-t border-slate-100 text-sm text-slate-500">
             {filteredCategories.length} categories shown
          </div>
        </Card>
      </div>

      {/* --- ADD/EDIT CATEGORY MODAL --- */}
      <Modal 
        isOpen={isModalOpen} 
        onClose={handleCloseModal} 
        title={editingId ? "Edit Category" : "Add Category"}
        footer={
          <div className="flex gap-3 justify-end w-full">
            <Button variant="secondary" onClick={handleCloseModal}>Cancel</Button>
            <Button 
              variant="primary" 
              onClick={handleSave} 
              disabled={!categoryForm.name.trim()}
            >
              {editingId ? "Save Changes" : "Create Category"}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
          
          {/* Section 1: Category Information */}
          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Category Information</h4>
            
            <div className="grid grid-cols-1 gap-4">
              {/* Image Upload */}
               <div className="flex flex-col gap-2">
                 <label className="block text-sm font-semibold text-slate-700">Category Image / Icon</label>
                 <div 
                   className={`
                     border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center cursor-pointer transition-colors
                     ${categoryForm.imagePreview ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-300 hover:border-indigo-400 hover:bg-slate-50'}
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
                   
                   {categoryForm.imagePreview ? (
                     <div className="relative group">
                       <img src={categoryForm.imagePreview} alt="Preview" className="h-24 w-24 object-contain rounded-lg bg-white shadow-sm p-1" />
                       <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                          <span className="text-white text-xs font-medium">Change</span>
                       </div>
                       <button 
                         onClick={(e) => { e.stopPropagation(); setCategoryForm(prev => ({ ...prev, imagePreview: null })); }}
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
                       <p className="text-sm font-medium text-slate-600">Click to upload image</p>
                       <p className="text-xs text-slate-400 mt-1">SVG, PNG, JPG</p>
                     </div>
                   )}
                 </div>
               </div>

               {/* Name */}
               <Input 
                 label="Category Name" 
                 placeholder="e.g. Office Furniture" 
                 value={categoryForm.name}
                 onChange={(e) => setCategoryForm(prev => ({ ...prev, name: e.target.value }))}
               />
               
               {/* Parent Category */}
               <Select 
                 label="Parent Category" 
                 value={categoryForm.parentId} 
                 onChange={(e) => setCategoryForm(prev => ({ ...prev, parentId: e.target.value }))}
               >
                 <option value="">None (Top Level)</option>
                 {CATEGORIES.filter(c => c.id !== editingId).map(cat => (
                   <option key={cat.id} value={cat.id}>{cat.name}</option>
                 ))}
               </Select>

               {/* Display Order */}
               <Input 
                 label="Display Order" 
                 type="number"
                 placeholder="0" 
                 value={categoryForm.displayOrder}
                 onChange={(e) => setCategoryForm(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
               />

               {/* Status Toggle */}
               <div className="bg-white p-3 rounded-xl border border-slate-200 mt-2">
                 <Toggle 
                   checked={categoryForm.status} 
                   onChange={(checked) => setCategoryForm(prev => ({ ...prev, status: checked }))} 
                   label="Active Status"
                   description="Visible in catalog and menus."
                 />
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
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    neutral: 'bg-slate-100 text-slate-600 border-slate-200',
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

export default CategoriesPage;