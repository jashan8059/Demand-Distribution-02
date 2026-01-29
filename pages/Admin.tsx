import React, { useState, useMemo } from 'react';
import { 
  Settings, Bell, Shield, Users, CreditCard, Monitor, Globe, Mail, 
  Smartphone, Save, Plus, Edit2, Trash2, ArrowUpDown
} from 'lucide-react';
import { Card, Button, Input, Select, Toggle, Badge } from '../components/Common';
import { USERS } from '../data';

type SortConfig = { key: string; direction: 'asc' | 'desc' } | null;

const AdminPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  const tabs = [
    { id: 'general', label: 'General Settings', icon: Settings },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security & Access', icon: Shield },
    { id: 'team', label: 'Team Members', icon: Users },
    { id: 'billing', label: 'Billing & Plan', icon: CreditCard },
  ];

  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedUsers = useMemo(() => {
    let data = [...USERS];
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
  }, [sortConfig]);

  return (
    <div className="max-w-[1600px] mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Administration</h1>
        <p className="text-slate-500 mt-1">Manage your store settings, team preferences, and system configurations.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Sidebar Navigation */}
        <div className="w-full lg:w-72 flex-shrink-0">
          <Card className="p-2 sticky top-24">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                      isActive 
                        ? 'bg-indigo-50 text-indigo-700 shadow-sm' 
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-slate-400'}`} />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </Card>

          {/* Mini Status Card in Sidebar */}
          <Card className="mt-4 p-5 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none">
             <div className="flex items-center gap-2 mb-2">
                <Shield className="h-5 w-5 text-emerald-400" />
                <span className="font-bold text-sm">System Status</span>
             </div>
             <div className="text-xs text-slate-300 mb-4">All systems operational. Last backup 2 hours ago.</div>
             <div className="flex items-center gap-2 text-xs font-mono bg-white/10 p-2 rounded-lg">
                <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></div>
                v2.4.0 (Stable)
             </div>
          </Card>
        </div>

        {/* Content Area */}
        <div className="flex-1 w-full space-y-6">
          
          {/* GENERAL TAB */}
          {activeTab === 'general' && (
            <div className="space-y-6 animate-fadeIn">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-4">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">Store Profile</h2>
                    <p className="text-sm text-slate-500">General information about your business.</p>
                  </div>
                  <Button icon={<Save className="h-4 w-4" />}>Save Changes</Button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                     <div className="flex items-center gap-6">
                        <div className="h-20 w-20 rounded-2xl bg-slate-100 border border-slate-200 flex items-center justify-center text-2xl font-bold text-slate-400">US</div>
                        <div>
                           <Button variant="secondary" size="sm" className="mb-2">Upload Logo</Button>
                           <p className="text-xs text-slate-400">Recommended size: 512x512px (PNG, JPG)</p>
                        </div>
                     </div>
                  </div>
                  <Input label="Store Name" defaultValue="UrbanShelf Inc." />
                  <Input label="Support Email" type="email" defaultValue="support@urbanshelf.com" icon={<Mail className="h-4 w-4" />} />
                  <Input label="Phone Number" defaultValue="+1 (555) 000-0000" />
                  <Input label="Website URL" defaultValue="https://urbanshelf.com" icon={<Globe className="h-4 w-4" />} />
                </div>
              </Card>

              <Card className="p-6">
                 <div className="mb-6 border-b border-slate-100 pb-4">
                    <h2 className="text-lg font-bold text-slate-900">Regional Settings</h2>
                    <p className="text-sm text-slate-500">Currency, language, and formatting preferences.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <Select label="Currency">
                        <option>USD - US Dollar</option>
                        <option>EUR - Euro</option>
                        <option>GBP - British Pound</option>
                     </Select>
                     <Select label="Timezone">
                        <option>(GMT-08:00) Pacific Time (US & Canada)</option>
                        <option>(GMT-05:00) Eastern Time (US & Canada)</option>
                        <option>(GMT+00:00) London</option>
                     </Select>
                     <Select label="Language">
                        <option>English (United States)</option>
                        <option>Spanish</option>
                        <option>French</option>
                     </Select>
                     <Select label="Unit System">
                        <option>Imperial (lb, in)</option>
                        <option>Metric (kg, cm)</option>
                     </Select>
                  </div>
              </Card>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div className="space-y-6 animate-fadeIn">
               <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                     <div>
                        <h2 className="text-lg font-bold text-slate-900">Email Alerts</h2>
                        <p className="text-sm text-slate-500">Configure when you want to receive emails.</p>
                     </div>
                     <Badge variant="success">Active</Badge>
                  </div>
                  <div className="divide-y divide-slate-100">
                     <Toggle checked={true} onChange={() => {}} label="New Order Received" description="Get notified immediately when a customer places an order." />
                     <Toggle checked={true} onChange={() => {}} label="Low Stock Warning" description="Daily digest of items running low on inventory." />
                     <Toggle checked={false} onChange={() => {}} label="New Customer Signup" description="Notification when a new user registers an account." />
                     <Toggle checked={true} onChange={() => {}} label="Weekly Analytics Report" description="Summary of sales and performance sent every Monday." />
                  </div>
               </Card>

               <Card className="p-6">
                  <div className="flex items-center justify-between mb-6">
                     <div>
                        <h2 className="text-lg font-bold text-slate-900">Push Notifications</h2>
                        <p className="text-sm text-slate-500">Mobile and browser alerts.</p>
                     </div>
                     <Badge variant="neutral">Paused</Badge>
                  </div>
                  <div className="divide-y divide-slate-100">
                     <Toggle checked={false} onChange={() => {}} label="Order Status Changes" description="Notify when order status is updated by other admins." />
                     <Toggle checked={false} onChange={() => {}} label="System Updates" description="Alerts about system maintenance and new features." />
                  </div>
               </Card>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
             <div className="space-y-6 animate-fadeIn">
                <Card className="p-6">
                   <div className="mb-6 border-b border-slate-100 pb-4">
                      <h2 className="text-lg font-bold text-slate-900">Authentication</h2>
                      <p className="text-sm text-slate-500">Manage password policies and 2FA.</p>
                   </div>
                   <div className="flex items-center justify-between py-4 border-b border-slate-100">
                      <div className="flex items-start gap-4">
                         <div className="p-3 bg-indigo-50 rounded-full text-indigo-600">
                            <Smartphone className="h-6 w-6" />
                         </div>
                         <div>
                            <h3 className="text-sm font-bold text-slate-900">Two-Factor Authentication</h3>
                            <p className="text-xs text-slate-500 mt-1 max-w-sm">Add an extra layer of security to your account by requiring a code from your phone.</p>
                         </div>
                      </div>
                      <Button variant="outline" size="sm">Enable 2FA</Button>
                   </div>
                   
                   <div className="mt-6">
                      <h3 className="text-sm font-bold text-slate-900 mb-4">Password Requirements</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <Toggle checked={true} onChange={() => {}} label="Require Special Character" />
                         <Toggle checked={true} onChange={() => {}} label="Minimum 8 Characters" />
                         <Toggle checked={true} onChange={() => {}} label="Prevent Password Reuse" />
                         <Toggle checked={false} onChange={() => {}} label="Force Reset Every 90 Days" />
                      </div>
                   </div>
                </Card>

                <Card className="p-6">
                   <div className="mb-6">
                      <h2 className="text-lg font-bold text-slate-900">Active Sessions</h2>
                      <p className="text-sm text-slate-500">Manage devices currently logged into your account.</p>
                   </div>
                   <div className="space-y-4">
                      {/* Session 1 */}
                      <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl border border-slate-100">
                         <div className="flex items-center gap-4">
                            <Monitor className="h-5 w-5 text-slate-500" />
                            <div>
                               <p className="text-sm font-bold text-slate-900">Macbook Pro (Chrome)</p>
                               <p className="text-xs text-slate-500">San Francisco, US • Active Now</p>
                            </div>
                         </div>
                         <Badge variant="success">Current</Badge>
                      </div>
                      {/* Session 2 */}
                      <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
                         <div className="flex items-center gap-4">
                            <Smartphone className="h-5 w-5 text-slate-500" />
                            <div>
                               <p className="text-sm font-bold text-slate-900">iPhone 14 (Safari)</p>
                               <p className="text-xs text-slate-500">Los Angeles, US • 2 hours ago</p>
                            </div>
                         </div>
                         <Button variant="ghost" size="sm" className="text-rose-600 hover:bg-rose-50">Revoke</Button>
                      </div>
                   </div>
                </Card>
             </div>
          )}

          {/* TEAM TAB */}
          {activeTab === 'team' && (
             <div className="space-y-6 animate-fadeIn">
                <Card className="p-6">
                   <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <div>
                         <h2 className="text-lg font-bold text-slate-900">Team Management</h2>
                         <p className="text-sm text-slate-500">Invite and manage team members.</p>
                      </div>
                      <Button icon={<Plus className="h-4 w-4" />}>Invite Member</Button>
                   </div>

                   <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-100">
                         <thead className="bg-slate-50/50">
                            <tr>
                               <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('name')}>
                                 <div className="flex items-center gap-2">User <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                               </th>
                               <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('role')}>
                                 <div className="flex items-center gap-2">Role <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                               </th>
                               <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Last Active</th>
                               <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider cursor-pointer group select-none" onClick={() => handleSort('status')}>
                                 <div className="flex items-center gap-2">Status <ArrowUpDown className="h-3 w-3 text-slate-300 group-hover:text-indigo-500" /></div>
                               </th>
                               <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider">Action</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-slate-100">
                            {sortedUsers.map((user) => (
                               <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="px-6 py-4 whitespace-nowrap">
                                     <div className="flex items-center">
                                        <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-indigo-600 font-bold text-sm mr-3">
                                           {user.name.charAt(0)}
                                        </div>
                                        <div>
                                           <div className="text-sm font-bold text-slate-900">{user.name}</div>
                                           <div className="text-xs text-slate-500">{user.email}</div>
                                        </div>
                                     </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                     <div className="flex items-center gap-1.5 px-2 py-1 rounded border border-slate-200 w-max bg-white">
                                        <Shield className="h-3 w-3 text-slate-400" />
                                        <span className="text-xs font-medium text-slate-700">{user.role}</span>
                                     </div>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                                     Today, 10:42 AM
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                     <Badge variant={user.status === 'Active' ? 'success' : 'danger'}>{user.status}</Badge>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-center">
                                     <div className="flex justify-center items-center gap-2">
                                        <button className="h-9 w-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 flex items-center justify-center transition-all">
                                          <Edit2 className="h-4 w-4" />
                                        </button>
                                        <button className="h-9 w-9 rounded-lg border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center transition-all">
                                          <Trash2 className="h-4 w-4" />
                                        </button>
                                     </div>
                                  </td>
                               </tr>
                            ))}
                         </tbody>
                      </table>
                   </div>
                </Card>
             </div>
          )}

           {/* BILLING TAB (Simplified) */}
           {activeTab === 'billing' && (
             <div className="space-y-6 animate-fadeIn">
                <Card className="p-6">
                   <div className="flex items-start justify-between">
                      <div>
                         <h2 className="text-lg font-bold text-slate-900">Current Plan</h2>
                         <p className="text-sm text-slate-500">You are on the <span className="font-bold text-indigo-600">Pro Business</span> plan.</p>
                      </div>
                      <Badge variant="info">Annual Billing</Badge>
                   </div>
                   
                   <div className="mt-8 bg-slate-50 rounded-xl p-6 border border-slate-200">
                      <div className="flex items-baseline gap-1">
                         <span className="text-4xl font-extrabold text-slate-900">$2,400</span>
                         <span className="text-slate-500 font-medium">/ year</span>
                      </div>
                      <p className="text-sm text-slate-500 mt-2">Next payment due on <span className="font-bold text-slate-900">Oct 24, 2024</span>.</p>
                      
                      <div className="mt-6 flex gap-3">
                         <Button variant="primary">Upgrade Plan</Button>
                         <Button variant="secondary">Download Invoice</Button>
                      </div>
                   </div>
                </Card>
             </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminPage;