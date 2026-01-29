import React, { useState, useMemo, useRef } from 'react';
import { 
  Mail, FileText, Send, Users, Search, Plus, Filter, 
  Eye, Edit2, Copy, Trash2, X, ChevronDown, Check, Image as ImageIcon, 
  Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, Link as LinkIcon, Code,
  Upload, FileSpreadsheet, UserPlus, Paperclip, File as FileIcon, XCircle, Monitor
} from 'lucide-react';
import { Card, Button, Input, Select, Badge, Modal, Pagination } from '../components/Common';
import { CAMPAIGNS } from '../data';
import { Campaign } from '../types';

type ViewMode = 'list' | 'create';

interface Recipient {
  name: string;
  email: string;
  source: 'Manual' | 'CSV';
}

const MarketingPage: React.FC = () => {
  const [view, setView] = useState<ViewMode>('list');
  const [data, setData] = useState<Campaign[]>(CAMPAIGNS);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Create Form State
  const [newCampaign, setNewCampaign] = useState({
    title: '',
    subject: '',
    audience: 'Approved Users',
    content: '',
    image: null as string | null
  });

  // Extension State: Recipients
  const [customRecipients, setCustomRecipients] = useState<Recipient[]>([]);
  const [manualEntry, setManualEntry] = useState({ name: '', email: '' });
  const csvInputRef = useRef<HTMLInputElement>(null);

  // Extension State: Attachments & Image Drag/Drop
  const [attachments, setAttachments] = useState<File[]>([]);
  const attachmentInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingAttachments, setIsDraggingAttachments] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Analytics & Preview Modal State
  const [analyticsOpen, setAnalyticsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);

  // --- Filtering ---
  const filteredCampaigns = useMemo(() => {
    return data.filter(c => {
      const matchesSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'All' || c.status === statusFilter.toUpperCase();
      return matchesSearch && matchesStatus;
    });
  }, [data, searchTerm, statusFilter]);

  // --- Handlers ---
  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this campaign?')) {
      setData(prev => prev.filter(c => c.id !== id));
    }
  };

  const handleDuplicate = (campaign: Campaign) => {
    const duplicate: Campaign = {
      ...campaign,
      id: `CAM-${Date.now()}`,
      title: `${campaign.title} (Copy)`,
      status: 'DRAFT',
      delivered: 0,
      failed: 0,
      sentAt: undefined
    };
    setData(prev => [duplicate, ...prev]);
  };

  const openAnalytics = (campaign: Campaign) => {
    setSelectedCampaign(campaign);
    setAnalyticsOpen(true);
  };

  // Estimate Count Logic
  const getEstimatedRecipients = () => {
    if (newCampaign.audience === 'Custom Email List') return customRecipients.length;
    if (newCampaign.audience === 'All Users') return 3035;
    if (newCampaign.audience === 'Approved Users') return 201;
    return 50; // Pending users
  };

  const handleCreateSave = (status: 'DRAFT' | 'SENT') => {
    if (!newCampaign.title || !newCampaign.subject) {
        alert("Please enter a campaign title and subject.");
        return;
    }

    // Calculate recipients based on selection
    let recipientCount = 0;
    if (newCampaign.audience === 'Custom Email List') {
       recipientCount = customRecipients.length;
    } else if (status === 'SENT') {
       recipientCount = getEstimatedRecipients(); 
    }

    const campaign: Campaign = {
      id: `CAM-${Date.now()}`,
      title: newCampaign.title,
      subject: newCampaign.subject,
      status: status,
      audience: newCampaign.audience,
      recipients: recipientCount,
      delivered: 0,
      failed: 0,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      sentAt: status === 'SENT' ? 'Sending now...' : undefined,
      content: newCampaign.content,
      attachments: attachments.map(f => f.name) // Store filenames
    };

    setData(prev => [campaign, ...prev]);
    setView('list');
    
    // Reset Form
    setNewCampaign({ title: '', subject: '', audience: 'Approved Users', content: '', image: null });
    setCustomRecipients([]);
    setAttachments([]);
  };

  // --- Extension Handlers: Recipients ---
  const addManualRecipient = () => {
    if (!manualEntry.name || !manualEntry.email) return;
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(manualEntry.email)) {
      alert("Please enter a valid email address.");
      return;
    }
    if (customRecipients.some(r => r.email.toLowerCase() === manualEntry.email.toLowerCase())) {
      alert("This email is already in the list.");
      return;
    }

    setCustomRecipients(prev => [...prev, { ...manualEntry, source: 'Manual' }]);
    setManualEntry({ name: '', email: '' });
  };

  const handleCSVUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result as string;
      const lines = text.split(/\r?\n/); // Handle both \n and \r\n
      const newRecipients: Recipient[] = [];
      let errorCount = 0;

      // Simple CSV parse: assume header row, then Name,Email
      const startIndex = lines[0].toLowerCase().includes('email') ? 1 : 0;

      for (let i = startIndex; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const parts = line.split(',');
        if (parts.length >= 2) {
          const name = parts[0].trim();
          const email = parts[1].trim();
          
          if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
             if (!newRecipients.some(r => r.email === email) && 
                 !customRecipients.some(r => r.email === email)) {
                newRecipients.push({ name, email, source: 'CSV' });
             }
          } else {
            errorCount++;
          }
        }
      }

      setCustomRecipients(prev => [...prev, ...newRecipients]);
      if (errorCount > 0) {
        alert(`Imported ${newRecipients.length} recipients. Skipped ${errorCount} invalid rows.`);
      }
      
      if (csvInputRef.current) csvInputRef.current.value = '';
    };
    reader.readAsText(file);
  };

  const removeRecipient = (email: string) => {
    setCustomRecipients(prev => prev.filter(r => r.email !== email));
  };

  // --- Extension Handlers: Attachments & Images ---
  const handleFiles = (files: FileList | null) => {
    if (files) {
      const filesArray = Array.from(files);
      const uniqueFiles = filesArray.filter(
        newFile => !attachments.some(existing => existing.name === newFile.name && existing.size === newFile.size)
      );
      setAttachments(prev => [...prev, ...uniqueFiles]);
    }
  };

  const handleAttachmentDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingAttachments(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleImageDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingImage(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            setNewCampaign(prev => ({...prev, image: ev.target?.result as string}));
        };
        reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
            setNewCampaign(prev => ({...prev, image: ev.target?.result as string}));
        };
        reader.readAsDataURL(file);
      }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // --- RENDER: Create View ---
  if (view === 'create') {
    return (
      <div className="max-w-[1600px] mx-auto pb-12">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-0 z-20">
           <h1 className="text-xl font-bold text-slate-900">New Email Campaign</h1>
           <div className="flex gap-2">
              <Button variant="ghost" onClick={() => setPreviewOpen(true)} icon={<Eye className="h-4 w-4" />}>Preview</Button>
              <Button variant="secondary" onClick={() => handleCreateSave('DRAFT')}>Save Draft</Button>
              <Button variant="primary" onClick={() => handleCreateSave('SENT')}>Save & Send</Button>
              <button onClick={() => setView('list')} className="p-2 text-slate-400 hover:text-slate-600">
                 <X className="h-6 w-6" />
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Left: Content */}
           <div className="lg:col-span-2 space-y-6">
              <Card className="p-6">
                 <div className="space-y-4">
                    <Input 
                      label="Campaign Title *" 
                      placeholder="e.g. Monthly Newsletter" 
                      value={newCampaign.title}
                      onChange={e => setNewCampaign({...newCampaign, title: e.target.value})}
                    />
                    <Input 
                      label="Email Subject *" 
                      placeholder="e.g. Don't miss out!" 
                      value={newCampaign.subject}
                      onChange={e => setNewCampaign({...newCampaign, subject: e.target.value})}
                    />
                 </div>
              </Card>

              {/* Rich Text Editor */}
              <Card className="p-0 overflow-hidden">
                 <div className="bg-slate-50 border-b border-slate-200 p-2 flex items-center gap-1">
                    {/* Mock Toolbar - Visual Only */}
                    <button className="p-2 hover:bg-slate-200 rounded text-slate-600"><Bold className="h-4 w-4" /></button>
                    <button className="p-2 hover:bg-slate-200 rounded text-slate-600"><Italic className="h-4 w-4" /></button>
                    <button className="p-2 hover:bg-slate-200 rounded text-slate-600"><Underline className="h-4 w-4" /></button>
                    <div className="w-px h-6 bg-slate-300 mx-2" />
                    <button className="p-2 hover:bg-slate-200 rounded text-slate-600"><AlignLeft className="h-4 w-4" /></button>
                    <button className="p-2 hover:bg-slate-200 rounded text-slate-600"><AlignCenter className="h-4 w-4" /></button>
                    <button className="p-2 hover:bg-slate-200 rounded text-slate-600"><AlignRight className="h-4 w-4" /></button>
                    <div className="w-px h-6 bg-slate-300 mx-2" />
                    <button className="p-2 hover:bg-slate-200 rounded text-slate-600"><LinkIcon className="h-4 w-4" /></button>
                    <div className="flex-1" />
                    <button className="p-2 hover:bg-slate-200 rounded text-slate-600 flex items-center gap-2 text-xs font-bold">
                       <Code className="h-4 w-4" /> HTML
                    </button>
                 </div>
                 <textarea 
                    className="w-full h-96 p-6 focus:outline-none resize-none font-sans text-slate-700 leading-relaxed" 
                    placeholder="Write your email content here..."
                    value={newCampaign.content}
                    onChange={e => setNewCampaign({...newCampaign, content: e.target.value})}
                 />
              </Card>

              {/* Attachments Section */}
              <Card className="p-6">
                 <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-slate-900 flex items-center gap-2">
                       <Paperclip className="h-4 w-4 text-indigo-500" /> Email Attachments (Optional)
                    </h3>
                    <input 
                       type="file" 
                       multiple 
                       ref={attachmentInputRef} 
                       className="hidden" 
                       accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.png"
                       onChange={(e) => handleFiles(e.target.files)}
                    />
                    <Button size="sm" variant="secondary" onClick={() => attachmentInputRef.current?.click()}>Add Attachment</Button>
                 </div>
                 
                 {attachments.length === 0 ? (
                    <div 
                        className={`border-2 border-dashed rounded-xl p-6 text-center transition-colors cursor-pointer ${isDraggingAttachments ? 'border-indigo-500 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300 hover:bg-slate-50'}`}
                        onClick={() => attachmentInputRef.current?.click()}
                        onDragOver={(e) => { e.preventDefault(); setIsDraggingAttachments(true); }}
                        onDragLeave={() => setIsDraggingAttachments(false)}
                        onDrop={handleAttachmentDrop}
                    >
                       <p className="text-sm text-slate-500">Drag & drop files here or click to browse</p>
                       <p className="text-xs text-slate-400 mt-1">PDF, DOC, XLSX, JPG, PNG supported</p>
                    </div>
                 ) : (
                    <div className="space-y-2">
                       {attachments.map((file, idx) => (
                          <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-200">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-white rounded-lg border border-slate-200 text-indigo-600">
                                   <FileIcon className="h-4 w-4" />
                                </div>
                                <div>
                                   <p className="text-sm font-medium text-slate-900">{file.name}</p>
                                   <p className="text-xs text-slate-500">{formatFileSize(file.size)}</p>
                                </div>
                             </div>
                             <button onClick={() => removeAttachment(idx)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-rose-50 rounded-full transition-colors">
                                <X className="h-4 w-4" />
                             </button>
                          </div>
                       ))}
                        <div 
                            className="mt-4 border-2 border-dashed border-slate-200 rounded-lg p-3 text-center cursor-pointer hover:border-indigo-300 hover:bg-slate-50 transition-colors"
                            onClick={() => attachmentInputRef.current?.click()}
                            onDragOver={(e) => { e.preventDefault(); setIsDraggingAttachments(true); }}
                            onDragLeave={() => setIsDraggingAttachments(false)}
                            onDrop={handleAttachmentDrop}
                        >
                            <span className="text-xs font-medium text-slate-500">+ Add more files</span>
                        </div>
                    </div>
                 )}
              </Card>

              {/* Campaign Image */}
              <Card 
                className={`p-6 border-dashed border-2 transition-colors cursor-pointer flex flex-col items-center justify-center py-12 ${
                    isDraggingImage ? 'border-indigo-500 bg-indigo-50' : 'border-slate-300 hover:border-indigo-400 bg-slate-50'
                }`}
                onClick={() => imageInputRef.current?.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDraggingImage(true); }}
                onDragLeave={() => setIsDraggingImage(false)}
                onDrop={handleImageDrop}
              >
                 <input type="file" className="hidden" ref={imageInputRef} accept="image/*" onChange={handleImageUpload} />
                 
                 {newCampaign.image ? (
                    <div className="relative w-full max-w-md">
                        <img src={newCampaign.image} alt="Campaign" className="w-full h-auto rounded-lg shadow-sm" />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 transition-opacity rounded-lg">
                            <span className="text-white font-medium text-sm">Click to change</span>
                        </div>
                    </div>
                 ) : (
                    <>
                        <div className="h-12 w-12 bg-white rounded-full shadow-sm flex items-center justify-center text-slate-400 mb-3">
                            <ImageIcon className="h-6 w-6" />
                        </div>
                        <p className="text-sm font-medium text-slate-700">Campaign Image (Optional)</p>
                        <p className="text-xs text-slate-500 mt-1 mb-4">Drag & drop or click to upload</p>
                        <Button variant="secondary" size="sm">Choose Image</Button>
                    </>
                 )}
              </Card>
           </div>

           {/* Right: Settings */}
           <div className="space-y-6">
              <Card className="p-6">
                 <h3 className="font-bold text-slate-900 mb-4">Target Audience</h3>
                 <Select 
                   value={newCampaign.audience}
                   onChange={e => setNewCampaign({...newCampaign, audience: e.target.value})}
                 >
                    <option>Approved Users</option>
                    <option>Pending Users</option>
                    <option>All Users</option>
                    <option>Custom Email List</option>
                 </Select>
                 
                 <div className="mt-6 bg-indigo-50 rounded-xl p-4 border border-indigo-100 flex items-center gap-4">
                    <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600">
                       <Users className="h-5 w-5" />
                    </div>
                    <div>
                       <p className="text-2xl font-bold text-indigo-900">{getEstimatedRecipients()}</p>
                       <p className="text-xs text-indigo-700">Est. Recipients based on selection</p>
                    </div>
                 </div>
              </Card>

              {/* Recipient Management Section (Conditional) */}
              {newCampaign.audience === 'Custom Email List' && (
                 <div className="space-y-6 animate-fadeIn">
                    <Card className="p-6 border-indigo-200 shadow-md">
                       <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                          <UserPlus className="h-4 w-4 text-indigo-600" /> Recipients Management
                       </h4>
                       
                       {/* Manual Entry */}
                       <div className="space-y-3 mb-6">
                          <p className="text-xs font-semibold text-slate-500 uppercase">Add Recipient (Manual)</p>
                          <div className="grid grid-cols-1 gap-3">
                             <Input 
                                placeholder="Name" 
                                value={manualEntry.name}
                                onChange={e => setManualEntry(prev => ({ ...prev, name: e.target.value }))}
                                className="text-sm"
                             />
                             <Input 
                                placeholder="Email Address" 
                                value={manualEntry.email}
                                onChange={e => setManualEntry(prev => ({ ...prev, email: e.target.value }))}
                                className="text-sm"
                             />
                             <Button size="sm" onClick={addManualRecipient} disabled={!manualEntry.name || !manualEntry.email}>Add Recipient</Button>
                          </div>
                       </div>

                       <div className="border-t border-slate-100 my-4"></div>

                       {/* CSV Upload */}
                       <div className="space-y-3">
                          <p className="text-xs font-semibold text-slate-500 uppercase">Upload Recipients via CSV</p>
                          <div className="flex flex-col gap-2">
                             <input 
                                type="file" 
                                ref={csvInputRef} 
                                className="hidden" 
                                accept=".csv"
                                onChange={handleCSVUpload}
                             />
                             <Button 
                                variant="secondary" 
                                size="sm" 
                                icon={<FileSpreadsheet className="h-4 w-4" />}
                                onClick={() => csvInputRef.current?.click()}
                             >
                                Upload CSV
                             </Button>
                             <p className="text-[10px] text-slate-400">CSV must contain name and email columns.</p>
                          </div>
                       </div>
                    </Card>

                    {/* Recipients Preview Table */}
                    {customRecipients.length > 0 && (
                       <Card className="overflow-hidden">
                          <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                             <h5 className="font-bold text-slate-700 text-sm">Recipients List</h5>
                             <span className="text-xs font-medium bg-white px-2 py-1 rounded border border-slate-200">{customRecipients.length} Total</span>
                          </div>
                          <div className="max-h-60 overflow-y-auto">
                             <table className="min-w-full divide-y divide-slate-100">
                                <thead className="bg-white sticky top-0">
                                   <tr>
                                      <th className="px-4 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase">Name</th>
                                      <th className="px-4 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase">Email</th>
                                      <th className="px-4 py-2 text-left text-[10px] font-semibold text-slate-500 uppercase">Source</th>
                                      <th className="px-4 py-2 text-right text-[10px] font-semibold text-slate-500 uppercase">Action</th>
                                   </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-slate-50">
                                   {customRecipients.map((r, idx) => (
                                      <tr key={idx} className="hover:bg-slate-50">
                                         <td className="px-4 py-2 text-xs font-medium text-slate-900">{r.name}</td>
                                         <td className="px-4 py-2 text-xs text-slate-500">{r.email}</td>
                                         <td className="px-4 py-2">
                                            <Badge variant="neutral">{r.source}</Badge>
                                         </td>
                                         <td className="px-4 py-2 text-right">
                                            <button onClick={() => removeRecipient(r.email)} className="text-rose-400 hover:text-rose-600 transition-colors">
                                               <XCircle className="h-4 w-4" />
                                            </button>
                                         </td>
                                      </tr>
                                   ))}
                                </tbody>
                             </table>
                          </div>
                       </Card>
                    )}
                 </div>
              )}
           </div>
        </div>

        {/* Preview Modal */}
        <Modal 
            isOpen={previewOpen}
            onClose={() => setPreviewOpen(false)}
            title="Campaign Preview"
            size="lg"
            footer={
                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={() => setPreviewOpen(false)}>Close Preview</Button>
                </div>
            }
        >
            <div className="space-y-6">
                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <div className="grid grid-cols-[80px_1fr] gap-2 text-sm mb-2">
                        <span className="text-slate-500 font-medium text-right">Subject:</span>
                        <span className="font-bold text-slate-900">{newCampaign.subject || '(No Subject)'}</span>
                    </div>
                    <div className="grid grid-cols-[80px_1fr] gap-2 text-sm">
                        <span className="text-slate-500 font-medium text-right">To:</span>
                        <span className="text-slate-700">{newCampaign.audience} ({getEstimatedRecipients()} recipients)</span>
                    </div>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                    <div className="bg-white p-8 min-h-[300px]">
                        {newCampaign.image && (
                            <img src={newCampaign.image} alt="Campaign Header" className="w-full h-auto max-h-60 object-cover rounded-lg mb-6" />
                        )}
                        <div className="prose prose-sm max-w-none text-slate-800 whitespace-pre-wrap">
                            {newCampaign.content || <span className="text-slate-400 italic">No content entered...</span>}
                        </div>
                    </div>
                    {attachments.length > 0 && (
                        <div className="bg-slate-50 p-4 border-t border-slate-200">
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Attachments ({attachments.length})</p>
                            <div className="flex flex-wrap gap-2">
                                {attachments.map((file, idx) => (
                                    <div key={idx} className="flex items-center gap-2 px-3 py-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                                        <FileIcon className="h-4 w-4 text-indigo-500" />
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-700">{file.name}</span>
                                            <span className="text-[10px] text-slate-400">{formatFileSize(file.size)}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
                
                <div className="flex items-center justify-center gap-2 text-xs text-slate-400">
                    <Monitor className="h-3 w-3" /> Previewing Desktop View
                </div>
            </div>
        </Modal>
      </div>
    );
  }

  // --- RENDER: List View ---
  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      
      {/* 1. Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Email Campaigns</h1>
          <p className="text-slate-500 mt-1">Manage marketing emails and newsletters.</p>
        </div>
        <Button variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => setView('create')}>New Campaign</Button>
      </div>

      {/* 2. Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <SummaryCard label="Total Campaigns" value={26} icon={Mail} color="indigo" />
        <SummaryCard label="Sent Campaigns" value={10} icon={Send} color="emerald" />
        <SummaryCard label="Draft Campaigns" value={10} icon={FileText} color="amber" />
        <SummaryCard label="Total Recipients" value={3035} icon={Users} color="blue" />
      </div>

      {/* 3. Main Content */}
      <Card className="flex flex-col overflow-hidden">
         {/* Actions */}
         <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center bg-white">
            <div className="w-full sm:w-72">
               <Input 
                  placeholder="Search campaigns..." 
                  icon={<Search className="h-4 w-4" />} 
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
               />
            </div>
            
            <div className="flex gap-4 w-full sm:w-auto">
               <div className="w-40">
                  <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                     <option value="All">All Status</option>
                     <option value="Draft">Draft</option>
                     <option value="Sent">Sent</option>
                     <option value="Failed">Failed</option>
                     <option value="Sending">Sending</option>
                  </Select>
               </div>
            </div>
         </div>

         {/* Table */}
         <div className="overflow-x-auto min-h-[400px]">
            <table className="min-w-full divide-y divide-slate-100">
               <thead className="bg-slate-50/50">
                  <tr>
                     <th className="px-6 py-4 text-left"><input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" /></th>
                     <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Campaign Title</th>
                     <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Subject</th>
                     <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                     <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Audience</th>
                     <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Recipients</th>
                     <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</th>
                     <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                  </tr>
               </thead>
               <tbody className="bg-white divide-y divide-slate-100">
                  {filteredCampaigns.map(campaign => (
                     <tr key={campaign.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4"><input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" /></td>
                        <td className="px-6 py-4 font-bold text-slate-900 text-sm">{campaign.title}</td>
                        <td className="px-6 py-4 text-sm text-slate-600 max-w-xs truncate">{campaign.subject}</td>
                        <td className="px-6 py-4">
                           <Badge variant={
                              campaign.status === 'SENT' ? 'success' : 
                              campaign.status === 'FAILED' ? 'danger' : 
                              campaign.status === 'SENDING' ? 'warning' : 'info'
                           }>
                              {campaign.status}
                           </Badge>
                        </td>
                        <td className="px-6 py-4">
                           <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {campaign.audience}
                           </span>
                        </td>
                        <td className="px-6 py-4">
                           <div className="flex flex-col">
                              <span className="text-sm font-bold text-slate-900">{campaign.recipients}</span>
                              <div className="text-[10px] flex gap-2 text-slate-500 mt-0.5">
                                 <span className="text-emerald-600 flex items-center gap-0.5">✔ {campaign.delivered}</span>
                                 <span className="text-rose-600 flex items-center gap-0.5">✕ {campaign.failed}</span>
                              </div>
                           </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500">{campaign.date}</td>
                        <td className="px-6 py-4 text-right">
                           <div className="flex justify-end items-center gap-2">
                              <ActionButton icon={Eye} onClick={() => openAnalytics(campaign)} />
                              <ActionButton icon={Edit2} onClick={() => {}} disabled={campaign.status !== 'DRAFT'} />
                              <ActionButton icon={Copy} onClick={() => handleDuplicate(campaign)} />
                              <ActionButton icon={Send} onClick={() => {}} disabled={campaign.status !== 'DRAFT'} />
                              <ActionButton icon={Trash2} onClick={() => handleDelete(campaign.id)} danger />
                           </div>
                        </td>
                     </tr>
                  ))}
               </tbody>
            </table>
         </div>
         
         <Pagination 
            currentPage={1} 
            totalItems={filteredCampaigns.length} 
            itemsPerPage={10} 
            onPageChange={() => {}} 
            entityName="campaigns"
         />
      </Card>

      {/* 4. Analytics Modal */}
      <Modal
         isOpen={analyticsOpen}
         onClose={() => setAnalyticsOpen(false)}
         title="Campaign Analytics"
         size="lg"
      >
         {selectedCampaign && (
            <div className="space-y-6">
               <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                     <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Delivery Stats</h4>
                     <div className="flex items-center justify-between mb-4">
                        <span className="text-3xl font-extrabold text-slate-900">
                           {selectedCampaign.recipients > 0 ? Math.round((selectedCampaign.delivered / selectedCampaign.recipients) * 100) : 0}%
                        </span>
                        <span className="text-xs font-medium px-2 py-1 bg-emerald-50 text-emerald-700 rounded-lg">Delivery Rate</span>
                     </div>
                     <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                           <span className="text-slate-600 flex items-center gap-2"><Check className="h-4 w-4 text-emerald-500" /> Delivered</span>
                           <span className="font-bold text-slate-900">{selectedCampaign.delivered}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                           <span className="text-slate-600 flex items-center gap-2"><X className="h-4 w-4 text-rose-500" /> Failed</span>
                           <span className="font-bold text-slate-900">{selectedCampaign.failed}</span>
                        </div>
                     </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                     <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-3">Engagement</h4>
                     <div className="space-y-4">
                        <div>
                           <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-slate-700">Open Rate</span>
                              <span className="text-sm font-bold text-slate-900">0%</span>
                           </div>
                           <div className="w-full bg-slate-100 rounded-full h-2">
                              <div className="bg-indigo-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                           </div>
                        </div>
                        <div>
                           <div className="flex justify-between mb-1">
                              <span className="text-sm font-medium text-slate-700">Click Rate</span>
                              <span className="text-sm font-bold text-slate-900">0%</span>
                           </div>
                           <div className="w-full bg-slate-100 rounded-full h-2">
                              <div className="bg-blue-500 h-2 rounded-full" style={{ width: '0%' }}></div>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                  <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 border-b border-slate-200 pb-2">Campaign Details</h4>
                  <div className="grid grid-cols-2 gap-y-4 gap-x-8">
                     <div>
                        <p className="text-xs text-slate-500">Campaign Name</p>
                        <p className="font-medium text-slate-900">{selectedCampaign.title}</p>
                     </div>
                     <div>
                        <p className="text-xs text-slate-500">Status</p>
                        <Badge variant={
                           selectedCampaign.status === 'SENT' ? 'success' : 
                           selectedCampaign.status === 'FAILED' ? 'danger' : 
                           selectedCampaign.status === 'SENDING' ? 'warning' : 'info'
                        }>{selectedCampaign.status}</Badge>
                     </div>
                     <div>
                        <p className="text-xs text-slate-500">Total Recipients</p>
                        <p className="font-medium text-slate-900">{selectedCampaign.recipients}</p>
                     </div>
                     <div>
                        <p className="text-xs text-slate-500">Sent At</p>
                        <p className="font-medium text-slate-900">{selectedCampaign.sentAt || 'Not sent'}</p>
                     </div>
                  </div>
               </div>
            </div>
         )}
      </Modal>
    </div>
  );
};

const SummaryCard = ({ label, value, icon: Icon, color }: any) => {
  const styles: any = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    neutral: 'bg-slate-50 text-slate-600 border-slate-100',
  };

  return (
    <Card className="p-5 flex items-center justify-between hover:shadow-md transition-shadow">
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <h3 className="text-2xl font-bold text-slate-900 mt-1">{value}</h3>
      </div>
      <div className={`p-3 rounded-xl border ${styles[color] || styles.neutral}`}>
        <Icon className="h-6 w-6" />
      </div>
    </Card>
  );
};

const ActionButton = ({ icon: Icon, onClick, disabled, danger }: any) => (
   <button 
      onClick={onClick}
      disabled={disabled}
      className={`
         p-2 rounded-lg transition-all
         ${disabled ? 'text-slate-300 cursor-not-allowed' : 
           danger ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50' : 
           'text-slate-400 hover:text-indigo-600 hover:bg-indigo-50'}
      `}
   >
      <Icon className="h-4 w-4" />
   </button>
);

export default MarketingPage;