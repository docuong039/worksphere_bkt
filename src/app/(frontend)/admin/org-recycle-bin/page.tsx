'use client';

import React, { useState, useEffect } from 'react';
import {
    Trash2,
    RotateCcw,
    Building2,
    Calendar,
    Search,
    AlertTriangle,
    CheckCircle2,
    Loader2,
    ShieldAlert,
    Info,
    History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

interface DeletedOrg {
    id: string;
    code: string;
    name: string;
    deleted_at: string;
    deleted_by: string;
    member_count: number;
    project_count: number;
}

export default function AdminOrgRecycleBinPage() {
    const { user } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [deletedOrgs, setDeletedOrgs] = useState<DeletedOrg[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Actions State
    const [isRestoring, setIsRestoring] = useState(false);
    const [isDeletingPermanently, setIsDeletingPermanently] = useState(false);
    const [confirmId, setConfirmId] = useState<string | null>(null);
    const [confirmType, setConfirmType] = useState<'RESTORE' | 'HARD_DELETE' | null>(null);

    const isSysAdmin = user?.role === 'SYS_ADMIN';

    useEffect(() => {
        const fetchDeletedOrgs = async () => {
            setLoading(true);
            try {
                // Mock data
                await new Promise(r => setTimeout(r, 1000));
                setDeletedOrgs([
                    {
                        id: 'old-org-1',
                        code: 'ACME-OLD',
                        name: 'Acme Legacy Corp',
                        deleted_at: new Date(Date.now() - 86400000 * 5).toISOString(),
                        deleted_by: 'System Admin',
                        member_count: 12,
                        project_count: 3
                    },
                    {
                        id: 'old-org-2',
                        code: 'TEST-ORG',
                        name: 'Trial Testing Space',
                        deleted_at: new Date(Date.now() - 86400000 * 12).toISOString(),
                        deleted_by: 'System Admin',
                        member_count: 2,
                        project_count: 1
                    }
                ]);
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };

        if (user) fetchDeletedOrgs();
    }, [user]);

    const handleAction = async () => {
        if (!confirmId || !confirmType) return;

        if (confirmType === 'RESTORE') {
            setIsRestoring(true);
            // Mock API
            await new Promise(r => setTimeout(r, 1500));
            setDeletedOrgs(prev => prev.filter(o => o.id !== confirmId));
            setIsRestoring(false);
        } else {
            setIsDeletingPermanently(true);
            // Mock API
            await new Promise(r => setTimeout(r, 2000));
            setDeletedOrgs(prev => prev.filter(o => o.id !== confirmId));
            setIsDeletingPermanently(false);
        }
        setConfirmId(null);
        setConfirmType(null);
    };

    if (!isSysAdmin) {
        return (
            <AppLayout>
                <div className="flex flex-col items-center justify-center py-32 text-center h-[70vh]">
                    <ShieldAlert size={48} className="text-rose-500 mb-6" />
                    <h2 className="text-2xl font-black text-slate-900">Platform Custody Only</h2>
                    <p className="text-slate-500 mt-2 max-w-xs font-medium">The System Recycle Bin is restricted to Global Platform Administrators.</p>
                </div>
            </AppLayout>
        );
    }

    const filtered = deletedOrgs.filter(org =>
        org.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        org.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <AppLayout>
            <div className="max-w-6xl mx-auto pb-20 animate-in fade-in duration-700" data-testid="org-recycle-bin-container">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 mb-1">
                            <History className="text-rose-600 h-5 w-5" />
                            <Badge className="bg-rose-50 text-rose-700 border-none text-[10px] font-black tracking-widest uppercase">Lifecycle Management</Badge>
                        </div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight" data-testid="org-recycle-bin-title">
                            System Recycle Bin
                        </h1>
                        <p className="text-slate-500 font-medium">Review and manage deleted Organizations. Data can be recovered within 30 days of deletion.</p>
                    </div>
                </div>

                {/* Dashboard Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <Card className="border-none shadow-sm bg-white p-6 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Items for Cleanup</p>
                        <p className="text-3xl font-black text-slate-900">{deletedOrgs.length}</p>
                    </Card>
                    <Card className="border-none shadow-sm bg-white p-6 rounded-2xl">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Storage Reclaimable</p>
                        <p className="text-3xl font-black text-emerald-600">1.4 GB</p>
                    </Card>
                    <Card className="border-none shadow-sm bg-rose-600 text-white p-6 rounded-2xl relative overflow-hidden group">
                        <div className="relative z-10">
                            <p className="text-[10px] font-black text-rose-200 uppercase tracking-widest mb-1">Auto-Purge In</p>
                            <p className="text-3xl font-black">18 Hours</p>
                        </div>
                        <Trash2 className="absolute -right-2 -bottom-2 h-20 w-20 text-rose-500/30 group-hover:scale-110 transition-transform" />
                    </Card>
                </div>

                {/* Main Table */}
                <Card className="border-none shadow-sm bg-white overflow-hidden">
                    <div className="p-6 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-rose-500 transition-colors" size={16} />
                            <Input
                                placeholder="Search by name or code..."
                                className="pl-10 h-10 w-72 bg-white border-slate-200 rounded-xl text-sm font-semibold shadow-sm focus:ring-1 focus:ring-rose-500"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                data-testid="search-org-recycle"
                            />
                        </div>
                    </div>
                    <CardContent className="p-0">
                        <Table data-testid="deleted-orgs-table">
                            <TableHeader>
                                <TableRow className="bg-slate-50/50 hover:bg-slate-50/50">
                                    <TableHead className="px-8 py-6 font-black text-slate-500 uppercase tracking-widest text-[10px]">Organization</TableHead>
                                    <TableHead className="font-black text-slate-500 uppercase tracking-widest text-[10px]">Deletion Info</TableHead>
                                    <TableHead className="font-black text-slate-500 uppercase tracking-widest text-[10px]">Resources</TableHead>
                                    <TableHead className="text-right px-8 font-black text-slate-500 uppercase tracking-widest text-[10px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    Array.from({ length: 3 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell className="px-8"><Skeleton className="h-6 w-48" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell className="text-right px-8"><Skeleton className="h-8 w-16 rounded-lg ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filtered.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={4} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-3">
                                                <History className="h-10 w-10 text-slate-200" />
                                                <p className="text-sm font-bold text-slate-400">Recycle bin is empty</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : filtered.map((org) => (
                                    <TableRow key={org.id} className="hover:bg-slate-50/50 transition-colors group">
                                        <TableCell className="px-8 py-5">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                                                    <Building2 size={18} />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-slate-700">{org.name}</span>
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">CODE: {org.code}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col gap-1">
                                                <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                                                    <Calendar size={12} className="text-slate-400" />
                                                    {new Date(org.deleted_at).toLocaleDateString('vi-VN')}
                                                </div>
                                                <span className="text-[10px] text-slate-400 font-semibold italic">by {org.deleted_by}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2">
                                                <Badge variant="outline" className="text-[10px] font-bold text-slate-400 border-slate-100">
                                                    {org.member_count} Members
                                                </Badge>
                                                <Badge variant="outline" className="text-[10px] font-bold text-slate-400 border-slate-100">
                                                    {org.project_count} Projects
                                                </Badge>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right px-8">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 px-4 font-bold text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl"
                                                    onClick={() => {
                                                        setConfirmId(org.id);
                                                        setConfirmType('RESTORE');
                                                    }}
                                                    data-testid={`restore-org-${org.id}`}
                                                >
                                                    <RotateCcw className="mr-2 h-4 w-4" /> Restore
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-9 w-9 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl"
                                                    onClick={() => {
                                                        setConfirmId(org.id);
                                                        setConfirmType('HARD_DELETE');
                                                    }}
                                                    data-testid={`purge-org-${org.id}`}
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Info Box */}
                <div className="mt-12 p-8 bg-slate-900 rounded-3xl text-white relative overflow-hidden group">
                    <div className="relative z-10 flex gap-6 items-start">
                        <div className="h-12 w-12 rounded-2xl bg-rose-600/20 flex items-center justify-center shrink-0 border border-rose-600/30">
                            <AlertTriangle className="text-rose-500" />
                        </div>
                        <div className="space-y-2">
                            <h4 className="text-lg font-black uppercase tracking-widest">Global Data Safetly Protocol</h4>
                            <p className="text-sm font-semibold text-slate-400 max-w-2xl leading-relaxed">
                                Restoring an organization will recover all associated members, projects, tasks, and historical logs.
                                Permanent deletion is irreversible and complies with GDPR "Right to be Forgotten" standards.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Confirmation Dialogs */}
                <AlertDialog open={confirmId !== null} onOpenChange={(open) => !open && setConfirmId(null)}>
                    <AlertDialogContent className="rounded-2xl border-none shadow-2xl">
                        <AlertDialogHeader>
                            <AlertDialogTitle className="text-xl font-black">
                                {confirmType === 'RESTORE' ? "Confirm Restoration" : "Irreversible Action"}
                            </AlertDialogTitle>
                            <AlertDialogDescription className="font-medium text-slate-500">
                                {confirmType === 'RESTORE'
                                    ? "This will bring the organization and all its data back to active status immediately."
                                    : "This will permanently ERASE all data, logs, and files associated with this organization. This cannot be undone."}
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter className="gap-2">
                            <AlertDialogCancel className="font-bold rounded-xl border-slate-200">Cancel</AlertDialogCancel>
                            <Button
                                className={cn(
                                    "font-black px-8 rounded-xl",
                                    confirmType === 'RESTORE' ? "bg-emerald-600 hover:bg-emerald-700" : "bg-rose-600 hover:bg-rose-700"
                                )}
                                onClick={handleAction}
                                disabled={isRestoring || isDeletingPermanently}
                                data-testid="confirm-action-btn"
                            >
                                {(isRestoring || isDeletingPermanently) ? (
                                    <Loader2 className="animate-spin h-4 w-4" />
                                ) : (
                                    confirmType === 'RESTORE' ? "Recover Data" : "Purge Permanently"
                                )}
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </AppLayout>
    );
}
