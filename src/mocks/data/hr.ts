export const mockJobLevels = [
    { id: 'lvl-1', code: 'J1', name: 'Nhân viên Sơ cấp (J1)', sort_order: 1 },
    { id: 'lvl-2', code: 'S1', name: 'Nhân viên Cao cấp (S1)', sort_order: 10 },
];

export const mockCompensations = [
    {
        user_id: 'user-emp',
        level_id: 'lvl-1',
        monthly_salary: 15500000,
        hourly_cost_rate: 100000,
        effective_from: '2025-01-01',
    },
    {
        user_id: 'user-pm',
        level_id: 'lvl-2',
        monthly_salary: 35000000,
        hourly_cost_rate: 220000,
        effective_from: '2025-01-01',
    }
];
