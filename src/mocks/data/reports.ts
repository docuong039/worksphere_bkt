export const mockReports = [
    {
        id: 'rep-1',
        org_id: 'org-1',
        submitted_by: 'user-emp',
        period_type: 'WEEK',
        period_start: '2025-01-13',
        period_end: '2025-01-19',
        title: 'Báo cáo công việc tuần 3 tháng 1 - Nguyễn Thị Lan Anh',
        content: 'Hoàn thành 100% các đầu mục thiết kế giao diện (UI) cho các trang quản trị chính. Đã bắt đầu viết mã nguồn cho hệ thống xử lý dữ liệu mock phục vụ kiểm thử. Dự kiến tuần sau sẽ bắt đầu tích hợp API.',
        status: 'SUBMITTED',
        created_at: '2025-01-19T20:00:00Z',
    },
    {
        id: 'rep-2',
        org_id: 'org-1',
        submitted_by: 'user-emp-dev1',
        period_type: 'WEEK',
        period_start: '2025-01-13',
        period_end: '2025-01-19',
        title: 'Báo cáo kĩ thuật tuần 3 tháng 1 - Phạm Minh Thu',
        content: 'Đã thiết lập cấu trúc nền cho dự án Mobile. Xử lý xong các lỗi hiển thị trên iPhone đời cũ. Đang hỗ trợ anh Sơn cấu hình môi trường staging.',
        status: 'APPROVED',
        created_at: '2025-01-19T22:00:00Z',
    }
];

export const mockReportComments = [
    {
        id: 'rc-1',
        report_id: 'rep-1',
        author_user_id: 'user-pm',
        comment_text: 'Tiến độ rất tốt, Lan Anh chú ý bám sát tiến độ tích hợp API để không ảnh hưởng đến giai đoạn sau nhé.',
        created_at: '2025-01-20T08:00:00Z',
    }
];
