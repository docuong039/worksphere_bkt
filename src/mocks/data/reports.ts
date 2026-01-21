export const mockReports = [
    {
        id: 'rep-1',
        org_id: 'org-1',
        submitted_by: 'user-emp',
        period_type: 'WEEK',
        period_start: '2025-01-13',
        period_end: '2025-01-19',
        title: 'Báo cáo công việc tuần 3 tháng 1',
        content: 'Đã hoàn thành thiết kế UI cho các trang core. Đang triển khai tích hợp API.',
        status: 'SUBMITTED',
        created_at: '2025-01-19T20:00:00Z',
    }
];

export const mockReportComments = [
    {
        id: 'rc-1',
        report_id: 'rep-1',
        author_user_id: 'user-pm',
        comment_text: 'Tiến độ rất tốt, cần chú ý deadline tuần sau.',
        created_at: '2025-01-20T08:00:00Z',
    }
];
