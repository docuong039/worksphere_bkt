'use client';

import { useEffect, useState } from 'react';

export function MSWProvider({ children }: { children: React.ReactNode }) {
    const [mswReady, setMswReady] = useState(false);

    useEffect(() => {
        async function initMsw() {
            // Chỉ chạy ở phía Client và khi env cho phép (ví dụ: DEVELOPMENT)
            if (typeof window !== 'undefined' && process.env.NEXT_PUBLIC_API_MOCKING === 'true') {
                const { worker } = await import('@/mocks/browser');
                await worker.start({
                    onUnhandledRequest: 'bypass',
                });
                console.log('%c[MSW] Ready to intercept requests', 'color: #10b981; font-weight: bold;');
                setMswReady(true);
            } else {
                setMswReady(true);
            }
        }

        initMsw();
    }, []);

    if (!mswReady) {
        return null;
    }

    return (
        <>
            {process.env.NEXT_PUBLIC_API_MOCK_INDICATOR === 'true' && (
                <div className="fixed bottom-4 right-4 z-[9999] bg-rose-600 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg animate-pulse">
                    MOCK MODE (NO BACKEND)
                </div>
            )}
            {children}
        </>
    );
}
