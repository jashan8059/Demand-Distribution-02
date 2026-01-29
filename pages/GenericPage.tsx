import React from 'react';
import { Plus, Filter, Search, Edit2, Trash2 } from 'lucide-react';
import { Card, Badge, Button, Input, Pagination } from '../components/Common';

interface GenericPageProps {
  title: string;
  description: string;
  data: any[];
  columns: { header: string; accessor: string | ((item: any) => React.ReactNode); className?: string }[];
  actionLabel?: string;
}

const GenericPage: React.FC<GenericPageProps> = ({ title, description, data, columns, actionLabel = "Add New" }) => {
  // Mock pagination for generic pages since they often use static data for this demo
  const currentPage = 1;
  const itemsPerPage = 10;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
          <p className="text-slate-500 mt-1">{description}</p>
        </div>
        <Button icon={<Plus className="h-4 w-4" />}>{actionLabel}</Button>
      </div>

      <Card>
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="w-full sm:w-96">
            <Input placeholder={`Search ${title.toLowerCase()}...`} icon={<Search className="h-4 w-4" />} />
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
             <Button variant="secondary" icon={<Filter className="h-4 w-4" />}>Filter</Button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                {columns.map((col, idx) => (
                  <th key={idx} scope="col" className={`px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider ${col.className || ''}`}>
                    {col.header}
                  </th>
                ))}
                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {data.map((item, idx) => (
                <tr key={item.id || idx} className="hover:bg-slate-50 transition-colors group">
                  {columns.map((col, colIdx) => (
                    <td key={colIdx} className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                      {typeof col.accessor === 'function' ? col.accessor(item) : item[col.accessor]}
                    </td>
                  ))}
                  <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                     <div className="flex items-center justify-center gap-2">
                      <button className="h-10 w-10 rounded-xl border border-slate-200 text-slate-500 hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 flex items-center justify-center transition-all">
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button className="h-10 w-10 rounded-xl border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 flex items-center justify-center transition-all">
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
         {/* Pagination */}
         <Pagination 
            currentPage={currentPage}
            totalItems={data.length}
            itemsPerPage={itemsPerPage}
            onPageChange={() => {}} // No-op for generic demo page
            entityName="results"
         />
      </Card>
    </div>
  );
};

export default GenericPage;