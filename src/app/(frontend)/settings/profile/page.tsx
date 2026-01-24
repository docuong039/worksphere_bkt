/**
 * Settings Profile Page
 * 
 * User Stories:
 * - Hỗ trợ gián tiếp cho tất cả User Stories liên quan đến user identity
 * - US-ORG-01-05: User tự đổi mật khẩu
 * 
 * Access: All authenticated users (chỉ sửa profile của mình)
 * 
 * Tech Stack: Next.js 15, Shadcn UI, Zustand, TailwindCSS
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
    User,
    Lock,
    Bell,
    Camera,
    Eye,
    EyeOff,
    Save,
    Loader2,
    CheckCircle2,
    Building2,
    Calendar,
    Phone,
    MapPin,
    Briefcase
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import AppLayout from '@/components/layout/AppLayout';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

type TabType = 'profile' | 'security' | 'notifications';

interface UserProfile {
    id: string;
    email: string;
    full_name: string;
    avatar_url: string | null;
    roles: string[];
    profile: {
        phone: string | null;
        address: string | null;
        birth_date: string | null;
        department: string | null;
        job_title: string | null;
        joined_at: string | null;
    };
}

export default function SettingsProfilePage() {
    const { user, updateUser } = useAuthStore();
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

    // Profile form
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [birthDate, setBirthDate] = useState('');
    const [address, setAddress] = useState('');
    const [profileErrors, setProfileErrors] = useState<Record<string, string>>({});
    const [profileSuccess, setProfileSuccess] = useState(false);

    // Password form
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
    const [passwordSuccess, setPasswordSuccess] = useState(false);
    const [changingPassword, setChangingPassword] = useState(false);

    // Notification settings
    const [emailTaskAssigned, setEmailTaskAssigned] = useState(true);
    const [emailComments, setEmailComments] = useState(true);
    const [emailStatusChange, setEmailStatusChange] = useState(true);
    const [emailWeeklyReport, setEmailWeeklyReport] = useState(false);
    const [inAppAll, setInAppAll] = useState(true);
    const [inAppBadge, setInAppBadge] = useState(true);
    const [inAppSound, setInAppSound] = useState(true);

    // Fetch user profile
    const fetchProfile = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const res = await fetch('/api/users/me', {
                headers: {
                    'x-user-id': user.id,
                    'x-user-role': user.role || ''
                }
            });
            const data = await res.json();
            setUserProfile(data.data);

            // Populate form
            if (data.data) {
                setFullName(data.data.full_name || '');
                setPhone(data.data.profile?.phone || '');
                setBirthDate(data.data.profile?.birth_date || '');
                setAddress(data.data.profile?.address || '');
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user) fetchProfile();
    }, [user]);

    // Validate profile
    const validateProfile = () => {
        const errors: Record<string, string> = {};
        if (!fullName.trim()) errors.fullName = 'Họ và tên là bắt buộc';
        if (fullName.length > 255) errors.fullName = 'Họ và tên tối đa 255 ký tự';
        setProfileErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Save profile
    const handleSaveProfile = async () => {
        if (!validateProfile()) return;
        setSaving(true);
        setProfileSuccess(false);
        try {
            const res = await fetch('/api/users/me', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                },
                body: JSON.stringify({
                    full_name: fullName.trim(),
                    phone: phone.trim() || null,
                    address: address.trim() || null,
                    birth_date: birthDate || null
                })
            });

            if (res.ok) {
                setProfileSuccess(true);
                updateUser({ full_name: fullName.trim() });
                setTimeout(() => setProfileSuccess(false), 3000);
            }
        } catch (error) {
            console.error('Error saving profile:', error);
        } finally {
            setSaving(false);
        }
    };

    // Validate password
    const validatePassword = () => {
        const errors: Record<string, string> = {};
        if (!currentPassword) errors.currentPassword = 'Vui lòng nhập mật khẩu hiện tại';
        if (!newPassword) errors.newPassword = 'Vui lòng nhập mật khẩu mới';
        if (newPassword.length < 8) errors.newPassword = 'Mật khẩu tối thiểu 8 ký tự';
        if (!/[a-zA-Z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
            errors.newPassword = 'Mật khẩu phải có cả chữ và số';
        }
        if (newPassword !== confirmPassword) errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Change password
    const handleChangePassword = async () => {
        if (!validatePassword()) return;
        setChangingPassword(true);
        setPasswordSuccess(false);
        try {
            const res = await fetch('/api/users/me/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'x-user-id': user?.id || '',
                    'x-user-role': user?.role || ''
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword,
                    confirm_password: confirmPassword
                })
            });

            if (res.ok) {
                setPasswordSuccess(true);
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
                setTimeout(() => setPasswordSuccess(false), 3000);
            } else {
                const data = await res.json();
                setPasswordErrors({ currentPassword: data.message || 'Đổi mật khẩu thất bại' });
            }
        } catch (error) {
            console.error('Error changing password:', error);
        } finally {
            setChangingPassword(false);
        }
    };

    const tabs = [
        { id: 'profile' as TabType, label: 'Hồ sơ', icon: User },
        ...(user?.role !== 'EMPLOYEE' ? [
            { id: 'security' as TabType, label: 'Bảo mật', icon: Lock },
            { id: 'notifications' as TabType, label: 'Thông báo', icon: Bell }
        ] : []),
    ];

    return (
        <AppLayout>
            <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-700" data-testid="settings-profile-container">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-extrabold tracking-tight text-slate-900" data-testid="settings-profile-title">
                        ⚙️ Cài đặt tài khoản
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">
                        Quản lý thông tin cá nhân và bảo mật.
                    </p>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 border-b border-slate-200 pb-2" data-testid="settings-tabs">
                    {tabs.map((tab) => {
                        const Icon = tab.icon;
                        return (
                            <Button
                                key={tab.id}
                                variant={activeTab === tab.id ? 'default' : 'ghost'}
                                onClick={() => setActiveTab(tab.id)}
                                className={cn(
                                    activeTab === tab.id ? 'bg-blue-600' : ''
                                )}
                                data-testid={`tab-${tab.id}`}
                            >
                                <Icon className="mr-2 h-4 w-4" />
                                {tab.label}
                            </Button>
                        );
                    })}
                </div>

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <Card className="border-none shadow-lg" data-testid="tab-content-profile">
                        <CardContent className="p-8 space-y-6">
                            {loading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-24 w-24 rounded-full mx-auto" />
                                    <Skeleton className="h-10 w-full" />
                                    <Skeleton className="h-10 w-full" />
                                </div>
                            ) : (
                                <>
                                    {/* Avatar */}
                                    <div className="flex flex-col items-center gap-4">
                                        <Avatar className="h-24 w-24 border-4 border-white shadow-lg">
                                            <AvatarFallback className="text-3xl font-bold bg-blue-100 text-blue-600">
                                                {fullName.charAt(0) || 'U'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <Button variant="outline" size="sm" data-testid="btn-change-avatar">
                                            <Camera className="mr-2 h-4 w-4" />
                                            Đổi ảnh
                                        </Button>
                                    </div>

                                    {/* Success message */}
                                    {profileSuccess && (
                                        <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-2" data-testid="profile-success">
                                            <CheckCircle2 size={16} />
                                            Đã lưu thay đổi!
                                        </div>
                                    )}

                                    {/* Full Name */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">
                                            Họ và tên <span className="text-red-500">*</span>
                                        </label>
                                        <Input
                                            value={fullName}
                                            onChange={(e) => setFullName(e.target.value)}
                                            className={profileErrors.fullName ? 'border-red-300' : ''}
                                            data-testid="input-full-name"
                                        />
                                        {profileErrors.fullName && (
                                            <p className="text-sm text-red-600">{profileErrors.fullName}</p>
                                        )}
                                    </div>

                                    {/* Email (readonly) */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700">
                                            Email <Lock size={12} className="inline ml-1 text-slate-400" />
                                        </label>
                                        <Input
                                            value={userProfile?.email || ''}
                                            disabled
                                            className="bg-slate-50"
                                            data-testid="input-email"
                                        />
                                        <p className="text-xs text-slate-400">
                                            {user?.role === 'EMPLOYEE'
                                                ? "Email và mật khẩu không thể thay đổi tại đây. Vui lòng sử dụng tính năng 'Quên mật khẩu' để đặt lại mật khẩu."
                                                : "Email không thể thay đổi"}
                                        </p>
                                    </div>

                                    {/* Phone */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <Phone size={14} /> Số điện thoại
                                        </label>
                                        <Input
                                            value={phone}
                                            onChange={(e) => setPhone(e.target.value)}
                                            placeholder="0901234567"
                                            data-testid="input-phone"
                                        />
                                    </div>

                                    {/* Birth Date */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <Calendar size={14} /> Ngày sinh
                                        </label>
                                        <Input
                                            type="date"
                                            value={birthDate}
                                            onChange={(e) => setBirthDate(e.target.value)}
                                            data-testid="input-birth-date"
                                        />
                                    </div>

                                    {/* Address */}
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                                            <MapPin size={14} /> Địa chỉ
                                        </label>
                                        <Textarea
                                            value={address}
                                            onChange={(e) => setAddress(e.target.value)}
                                            placeholder="123 Nguyen Hue, Q1, HCM"
                                            rows={2}
                                            data-testid="input-address"
                                        />
                                    </div>

                                    {/* Company Info (readonly) */}
                                    {userProfile?.profile && (
                                        <div className="pt-6 border-t border-slate-100">
                                            <h3 className="text-sm font-bold text-slate-500 mb-4 flex items-center gap-2">
                                                <Building2 size={14} /> Thông tin công ty
                                            </h3>
                                            <div className="grid grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <span className="text-slate-400">Phòng ban:</span>
                                                    <span className="ml-2 font-medium text-slate-700">
                                                        {userProfile.profile.department || 'Chưa cập nhật'}
                                                    </span>
                                                </div>
                                                <div>
                                                    <span className="text-slate-400">Chức danh:</span>
                                                    <span className="ml-2 font-medium text-slate-700">
                                                        {userProfile.profile.job_title || 'Chưa cập nhật'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Actions */}
                                    <div className="flex justify-end gap-3 pt-6">
                                        <Button
                                            variant="outline"
                                            onClick={fetchProfile}
                                            data-testid="settings-profile-btn-cancel"
                                        >
                                            Hủy thay đổi
                                        </Button>
                                        <Button
                                            onClick={handleSaveProfile}
                                            disabled={saving}
                                            className="bg-blue-600 hover:bg-blue-700"
                                            data-testid="btn-save-profile"
                                        >
                                            {saving ? (
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="mr-2 h-4 w-4" />
                                            )}
                                            Lưu
                                        </Button>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Security Tab */}
                {activeTab === 'security' && (
                    <div className="space-y-6" data-testid="tab-content-security">
                        {/* Change Password */}
                        <Card className="border-none shadow-lg">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Lock className="h-5 w-5 text-blue-600" />
                                    Đổi mật khẩu
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {passwordSuccess && (
                                    <div className="p-3 bg-emerald-50 text-emerald-700 rounded-lg flex items-center gap-2" data-testid="password-success">
                                        <CheckCircle2 size={16} />
                                        Đã đổi mật khẩu thành công!
                                    </div>
                                )}

                                {/* Current Password */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">
                                        Mật khẩu hiện tại <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type={showCurrentPassword ? 'text' : 'password'}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            className={passwordErrors.currentPassword ? 'border-red-300 pr-10' : 'pr-10'}
                                            data-testid="input-current-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {passwordErrors.currentPassword && (
                                        <p className="text-sm text-red-600">{passwordErrors.currentPassword}</p>
                                    )}
                                </div>

                                {/* New Password */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">
                                        Mật khẩu mới <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type={showNewPassword ? 'text' : 'password'}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            className={passwordErrors.newPassword ? 'border-red-300 pr-10' : 'pr-10'}
                                            data-testid="input-new-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    <p className="text-xs text-slate-400">Tối thiểu 8 ký tự, bao gồm chữ và số</p>
                                    {passwordErrors.newPassword && (
                                        <p className="text-sm text-red-600">{passwordErrors.newPassword}</p>
                                    )}
                                </div>

                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <label className="text-sm font-semibold text-slate-700">
                                        Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type={showConfirmPassword ? 'text' : 'password'}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className={passwordErrors.confirmPassword ? 'border-red-300 pr-10' : 'pr-10'}
                                            data-testid="input-confirm-password"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                        >
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                    {passwordErrors.confirmPassword && (
                                        <p className="text-sm text-red-600">{passwordErrors.confirmPassword}</p>
                                    )}
                                </div>

                                <div className="flex justify-end pt-4">
                                    <Button
                                        onClick={handleChangePassword}
                                        disabled={changingPassword}
                                        className="bg-blue-600 hover:bg-blue-700"
                                        data-testid="btn-change-password"
                                    >
                                        {changingPassword ? (
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        ) : (
                                            <Lock className="mr-2 h-4 w-4" />
                                        )}
                                        Đổi mật khẩu
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}

                {/* Notifications Tab */}
                {activeTab === 'notifications' && (
                    <Card className="border-none shadow-lg" data-testid="tab-content-notifications">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Bell className="h-5 w-5 text-blue-600" />
                                Cài đặt thông báo
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            {/* Email notifications */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-bold text-slate-700">Thông báo qua Email</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <Checkbox
                                            checked={emailTaskAssigned}
                                            onCheckedChange={(c) => setEmailTaskAssigned(!!c)}
                                            data-testid="checkbox-email-task-assigned"
                                        />
                                        <span className="text-sm text-slate-600">Khi được gán task mới</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <Checkbox
                                            checked={emailComments}
                                            onCheckedChange={(c) => setEmailComments(!!c)}
                                            data-testid="checkbox-email-comments"
                                        />
                                        <span className="text-sm text-slate-600">Khi có comment/reply</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <Checkbox
                                            checked={emailStatusChange}
                                            onCheckedChange={(c) => setEmailStatusChange(!!c)}
                                            data-testid="checkbox-email-status"
                                        />
                                        <span className="text-sm text-slate-600">Khi task bị chuyển trạng thái</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <Checkbox
                                            checked={emailWeeklyReport}
                                            onCheckedChange={(c) => setEmailWeeklyReport(!!c)}
                                            data-testid="checkbox-email-weekly"
                                        />
                                        <span className="text-sm text-slate-600">Báo cáo hàng tuần</span>
                                    </label>
                                </div>
                            </div>

                            {/* In-app notifications */}
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                                <h3 className="text-sm font-bold text-slate-700">Thông báo trong ứng dụng</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <Checkbox
                                            checked={inAppAll}
                                            onCheckedChange={(c) => setInAppAll(!!c)}
                                            data-testid="checkbox-inapp-all"
                                        />
                                        <span className="text-sm text-slate-600">Tất cả thông báo</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <Checkbox
                                            checked={inAppBadge}
                                            onCheckedChange={(c) => setInAppBadge(!!c)}
                                            data-testid="checkbox-inapp-badge"
                                        />
                                        <span className="text-sm text-slate-600">Hiển thị badge trên icon</span>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer">
                                        <Checkbox
                                            checked={inAppSound}
                                            onCheckedChange={(c) => setInAppSound(!!c)}
                                            data-testid="checkbox-inapp-sound"
                                        />
                                        <span className="text-sm text-slate-600">Âm thanh thông báo</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end pt-4">
                                <Button className="bg-blue-600 hover:bg-blue-700" data-testid="btn-save-notifications">
                                    <Save className="mr-2 h-4 w-4" />
                                    Lưu
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
