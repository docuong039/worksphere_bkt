export const mockJobLevels = [
    { id: 'lvl-1', code: 'J1', name: 'Junior 1', sort_order: 1 },
    { id: 'lvl-2', code: 'S1', name: 'Senior 1', sort_order: 10 },
];

export const mockCompensations = [
    {
        user_id: 'user-emp',
        level_id: 'lvl-1',
        monthly_salary: 15000000,
        hourly_cost_rate: 100000,
        effective_from: '2025-01-01',
    },
    {
        user_id: 'user-pm',
        level_id: 'lvl-2',
        monthly_salary: 30000000,
        hourly_cost_rate: 200000,
        effective_from: '2025-01-01',
    }
];
