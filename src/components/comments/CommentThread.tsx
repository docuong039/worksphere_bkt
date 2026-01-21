'use client';

import React, { useState } from 'react';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    MoreVertical,
    Reply,
    Edit2,
    Trash2,
    Send,
    Loader2,
    ChevronDown,
    ChevronUp,
    AtSign,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface Comment {
    id: string;
    content: string;
    author_id: string;
    author_name: string;
    author_avatar?: string;
    created_at: string;
    parent_id?: string | null;
    replies?: Comment[];
    mentions?: string[];
}

interface CommentThreadProps {
    comments: Comment[];
    currentUserId: string;
    onPostComment: (content: string, parentId?: string | null, mentions?: string[]) => Promise<void>;
    onEditComment?: (commentId: string, content: string) => Promise<void>;
    onDeleteComment?: (commentId: string) => Promise<void>;
    users?: { id: string; name: string }[];
}

export function CommentThread({
    comments,
    currentUserId,
    onPostComment,
    onEditComment,
    onDeleteComment,
    users = [],
}: CommentThreadProps) {
    const [newComment, setNewComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showMentionList, setShowMentionList] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');

    // Build threaded comments
    const threadedComments = buildThreadedComments(comments);

    const handleSubmit = async () => {
        if (!newComment.trim()) return;
        setIsSubmitting(true);
        try {
            const mentions = extractMentions(newComment, users);
            await onPostComment(newComment, null, mentions);
            setNewComment('');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === '@') {
            setShowMentionList(true);
        }
        if (e.key === 'Escape') {
            setShowMentionList(false);
        }
    };

    const insertMention = (userName: string) => {
        setNewComment(prev => prev + `@${userName} `);
        setShowMentionList(false);
    };

    return (
        <div className="space-y-4" data-testid="comment-thread">
            {/* New Comment Input */}
            <div className="space-y-3" data-testid="new-comment-form">
                <div className="relative">
                    <Textarea
                        placeholder="Viết bình luận... (Dùng @ để tag người)"
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        onKeyDown={handleKeyDown}
                        className="min-h-[80px] pr-12"
                        data-testid="input-new-comment"
                    />
                    <Button
                        size="icon"
                        className="absolute bottom-2 right-2 h-8 w-8"
                        onClick={handleSubmit}
                        disabled={isSubmitting || !newComment.trim()}
                        data-testid="btn-submit-comment"
                    >
                        {isSubmitting ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <Send className="h-4 w-4" />
                        )}
                    </Button>

                    {/* Mention Popover */}
                    {showMentionList && users.length > 0 && (
                        <div className="absolute bottom-full mb-2 left-0 bg-white border rounded-lg shadow-lg p-2 w-48 z-10" data-testid="mention-list">
                            <p className="text-xs text-slate-500 px-2 mb-2">Chọn người để tag</p>
                            {users.slice(0, 5).map(u => (
                                <button
                                    key={u.id}
                                    className="w-full text-left px-2 py-1.5 text-sm hover:bg-slate-100 rounded flex items-center gap-2"
                                    onClick={() => insertMention(u.name)}
                                    data-testid={`mention-user-${u.id}`}
                                >
                                    <AtSign className="h-3 w-3 text-blue-500" />
                                    {u.name}
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Comments List */}
            <div className="space-y-4" data-testid="comments-list">
                {threadedComments.length > 0 ? (
                    threadedComments.map(comment => (
                        <CommentItem
                            key={comment.id}
                            comment={comment}
                            currentUserId={currentUserId}
                            onPostComment={onPostComment}
                            onEditComment={onEditComment}
                            onDeleteComment={onDeleteComment}
                            users={users}
                            depth={0}
                        />
                    ))
                ) : (
                    <div className="text-center py-8 text-slate-400" data-testid="empty-comments">
                        <p>Chưa có bình luận nào</p>
                        <p className="text-sm">Hãy là người đầu tiên bình luận!</p>
                    </div>
                )}
            </div>
        </div>
    );
}

interface CommentItemProps {
    comment: Comment;
    currentUserId: string;
    onPostComment: (content: string, parentId?: string | null, mentions?: string[]) => Promise<void>;
    onEditComment?: (commentId: string, content: string) => Promise<void>;
    onDeleteComment?: (commentId: string) => Promise<void>;
    users?: { id: string; name: string }[];
    depth: number;
}

function CommentItem({
    comment,
    currentUserId,
    onPostComment,
    onEditComment,
    onDeleteComment,
    users = [],
    depth,
}: CommentItemProps) {
    const [isReplying, setIsReplying] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [editText, setEditText] = useState(comment.content);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showReplies, setShowReplies] = useState(true);

    const isOwner = comment.author_id === currentUserId;
    const hasReplies = comment.replies && comment.replies.length > 0;

    const handleReply = async () => {
        if (!replyText.trim()) return;
        setIsSubmitting(true);
        try {
            const mentions = extractMentions(replyText, users);
            await onPostComment(replyText, comment.id, mentions);
            setReplyText('');
            setIsReplying(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEdit = async () => {
        if (!editText.trim() || !onEditComment) return;
        setIsSubmitting(true);
        try {
            await onEditComment(comment.id, editText);
            setIsEditing(false);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async () => {
        if (!onDeleteComment) return;
        if (!confirm('Bạn có chắc muốn xóa bình luận này?')) return;
        await onDeleteComment(comment.id);
    };

    const formatTimeAgo = (dateStr: string) => {
        const diff = Date.now() - new Date(dateStr).getTime();
        const minutes = Math.floor(diff / 60000);
        if (minutes < 60) return `${minutes} phút trước`;
        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `${hours} giờ trước`;
        const days = Math.floor(hours / 24);
        return `${days} ngày trước`;
    };

    const highlightMentions = (text: string) => {
        const parts = text.split(/(@\w+)/g);
        return parts.map((part, i) => {
            if (part.startsWith('@')) {
                return (
                    <span key={i} className="text-blue-600 font-medium bg-blue-50 px-0.5 rounded">
                        {part}
                    </span>
                );
            }
            return part;
        });
    };

    return (
        <div
            className={cn('group', depth > 0 && 'ml-8 pl-4 border-l-2 border-slate-100')}
            data-testid={`comment-${comment.id}`}
        >
            <div className="flex gap-3">
                <Avatar className="h-8 w-8 shrink-0">
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs font-bold">
                        {comment.author_name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-slate-900" data-testid={`comment-author-${comment.id}`}>
                            {comment.author_name}
                        </span>
                        <span className="text-xs text-slate-400">
                            {formatTimeAgo(comment.created_at)}
                        </span>
                    </div>

                    {isEditing ? (
                        <div className="space-y-2">
                            <Textarea
                                value={editText}
                                onChange={(e) => setEditText(e.target.value)}
                                className="min-h-[60px]"
                                data-testid={`input-edit-comment-${comment.id}`}
                            />
                            <div className="flex gap-2">
                                <Button size="sm" onClick={handleEdit} disabled={isSubmitting} data-testid={`btn-save-edit-${comment.id}`}>
                                    {isSubmitting && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                                    Lưu
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setIsEditing(false)} data-testid={`btn-cancel-edit-${comment.id}`}>
                                    Hủy
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <p className="text-sm text-slate-700 whitespace-pre-wrap" data-testid={`comment-content-${comment.id}`}>
                            {highlightMentions(comment.content)}
                        </p>
                    )}

                    {/* Actions */}
                    {!isEditing && (
                        <div className="flex items-center gap-3 mt-2">
                            {depth < 2 && (
                                <button
                                    className="text-xs text-slate-500 hover:text-blue-600 font-medium flex items-center gap-1"
                                    onClick={() => setIsReplying(!isReplying)}
                                    data-testid={`btn-reply-${comment.id}`}
                                >
                                    <Reply className="h-3 w-3" />
                                    Trả lời
                                </button>
                            )}
                            {isOwner && (
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <button
                                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                                            data-testid={`btn-comment-menu-${comment.id}`}
                                        >
                                            <MoreVertical className="h-4 w-4 text-slate-400" />
                                        </button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        <DropdownMenuItem onClick={() => setIsEditing(true)} data-testid={`btn-edit-comment-${comment.id}`}>
                                            <Edit2 className="mr-2 h-3 w-3" />
                                            Chỉnh sửa
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleDelete} className="text-red-600" data-testid={`btn-delete-comment-${comment.id}`}>
                                            <Trash2 className="mr-2 h-3 w-3" />
                                            Xóa
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            )}
                        </div>
                    )}

                    {/* Reply Input */}
                    {isReplying && (
                        <div className="mt-3 space-y-2" data-testid={`reply-form-${comment.id}`}>
                            <Textarea
                                placeholder="Viết trả lời..."
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                className="min-h-[60px]"
                                autoFocus
                                data-testid={`input-reply-${comment.id}`}
                            />
                            <div className="flex gap-2">
                                <Button size="sm" onClick={handleReply} disabled={isSubmitting} data-testid={`btn-submit-reply-${comment.id}`}>
                                    {isSubmitting && <Loader2 className="mr-1 h-3 w-3 animate-spin" />}
                                    Gửi
                                </Button>
                                <Button size="sm" variant="ghost" onClick={() => setIsReplying(false)} data-testid={`btn-cancel-reply-${comment.id}`}>
                                    Hủy
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Replies */}
            {hasReplies && (
                <div className="mt-3">
                    <button
                        className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1 mb-2"
                        onClick={() => setShowReplies(!showReplies)}
                        data-testid={`btn-toggle-replies-${comment.id}`}
                    >
                        {showReplies ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
                        {comment.replies!.length} trả lời
                    </button>
                    {showReplies && (
                        <div className="space-y-3">
                            {comment.replies!.map(reply => (
                                <CommentItem
                                    key={reply.id}
                                    comment={reply}
                                    currentUserId={currentUserId}
                                    onPostComment={onPostComment}
                                    onEditComment={onEditComment}
                                    onDeleteComment={onDeleteComment}
                                    users={users}
                                    depth={depth + 1}
                                />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

// Helper functions
function buildThreadedComments(comments: Comment[]): Comment[] {
    const commentMap = new Map<string, Comment>();
    const rootComments: Comment[] = [];

    // First pass: create map and initialize replies array
    comments.forEach(c => {
        commentMap.set(c.id, { ...c, replies: [] });
    });

    // Second pass: build tree
    comments.forEach(c => {
        const comment = commentMap.get(c.id)!;
        if (c.parent_id && commentMap.has(c.parent_id)) {
            commentMap.get(c.parent_id)!.replies!.push(comment);
        } else {
            rootComments.push(comment);
        }
    });

    // Sort by created_at
    const sortByDate = (a: Comment, b: Comment) =>
        new Date(a.created_at).getTime() - new Date(b.created_at).getTime();

    rootComments.sort(sortByDate);
    rootComments.forEach(c => c.replies?.sort(sortByDate));

    return rootComments;
}

function extractMentions(text: string, users: { id: string; name: string }[]): string[] {
    const mentionMatches = text.match(/@(\w+)/g);
    if (!mentionMatches) return [];

    const mentions: string[] = [];
    mentionMatches.forEach(match => {
        const name = match.slice(1).toLowerCase();
        const user = users.find(u => u.name.toLowerCase().includes(name));
        if (user && !mentions.includes(user.id)) {
            mentions.push(user.id);
        }
    });
    return mentions;
}
