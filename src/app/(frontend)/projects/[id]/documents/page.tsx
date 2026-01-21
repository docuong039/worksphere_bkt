'use client';

import React, { useState, use } from 'react';
import Link from 'next/link';
import {
    ChevronLeft,
    FileText,
    FileImage,
    FileCode,
    File,
    Upload,
    MoreVertical,
    Download,
    Trash2,
    Search,
    Plus,
    FolderOpen
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';

const MOCK_DOCS = [
    { id: '1', name: 'Software Requirement Specification.pdf', size: '2.4 MB', type: 'PDF', owner: 'John Doe', date: '2026-01-10' },
    { id: '2', name: 'System Architecture Diagrams.png', size: '5.1 MB', type: 'IMG', owner: 'Alice Smith', date: '2026-01-12' },
    { id: '3', name: 'Database Schema.sql', size: '12 KB', type: 'CODE', owner: 'Bob Wilson', date: '2026-01-15' },
    { id: '4', name: 'User Manual v1.0.docx', size: '1.2 MB', type: 'DOC', owner: 'John Doe', date: '2026-01-18' },
];

const FileIcon = ({ type }: { type: string }) => {
    switch (type) {
        case 'PDF': return <FileText className="text-rose-500" />;
        case 'IMG': return <FileImage className="text-blue-500" />;
        case 'CODE': return <FileCode className="text-emerald-500" />;
        default: return <File className="text-slate-400" />;
    }
};

export default function DocumentsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const { user } = useAuthStore();
    const [search, setSearch] = useState('');

    const filteredDocs = MOCK_DOCS.filter(doc => doc.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <AppLayout>
            <div className="max-w-7xl mx-auto pb-20 animate-in fade-in duration-700">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="space-y-2">
                        <Button variant="ghost" asChild className="-ml-4 text-slate-500 hover:text-slate-900 mb-2">
                            <Link href={`/projects/${id}/overview`}>
                                <ChevronLeft className="mr-2 h-4 w-4" /> Quay lại Dự án
                            </Link>
                        </Button>
                        <div className="flex items-center gap-3">
                            <FolderOpen className="h-8 w-8 text-blue-600" />
                            <h1 className="text-3xl font-black text-slate-900 tracking-tight">Tài liệu Dự án</h1>
                        </div>
                    </div>
                    <Button className="bg-blue-600 hover:bg-blue-700 font-bold h-11 px-6 shadow-lg shadow-blue-100">
                        <Upload className="mr-2 h-4 w-4" /> Tải lên tài liệu
                    </Button>
                </div>

                <Card className="border-none shadow-sm bg-white mb-6">
                    <CardContent className="p-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Tìm kiếm tài liệu..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 h-11 bg-slate-50 border-none rounded-xl"
                            />
                        </div>
                    </CardContent>
                </Card>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {filteredDocs.map(doc => (
                        <Card key={doc.id} className="border-none shadow-sm bg-white hover:shadow-md transition-shadow group overflow-hidden">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-slate-50 rounded-2xl group-hover:bg-blue-50 transition-colors">
                                        <FileIcon type={doc.type} />
                                    </div>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                                <MoreVertical size={16} />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem className="font-bold flex items-center gap-2">
                                                <Download size={14} /> Tải xuống
                                            </DropdownMenuItem>
                                            {user?.role === 'PROJECT_MANAGER' && (
                                                <DropdownMenuItem className="text-rose-600 font-bold flex items-center gap-2">
                                                    <Trash2 size={14} /> Xóa
                                                </DropdownMenuItem>
                                            )}
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <h3 className="text-sm font-black text-slate-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors" title={doc.name}>
                                    {doc.name}
                                </h3>
                                <div className="flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest mt-auto pt-4 border-t border-slate-50">
                                    <span>{doc.size}</span>
                                    <span>{doc.date}</span>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                    <button className="flex flex-col items-center justify-center p-6 bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all text-slate-400 hover:text-blue-500 group">
                        <Plus className="h-8 w-8 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-black uppercase tracking-widest">Thêm tài liệu</span>
                    </button>
                </div>
            </div>
        </AppLayout>
    );
}

