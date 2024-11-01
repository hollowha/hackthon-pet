import { render, screen, waitFor } from '@testing-library/vue';
import { test, expect, vi } from 'vitest';
import MainPage from '../pages/MainPage.vue';
import { createPinia } from 'pinia';
import { ref, update } from 'firebase/database';
import 'web-streams-polyfill'; // 嘗試這個


// 模擬 Firebase 的 getDatabase 和 onValue 方法
vi.mock('firebase/database', () => ({
    ref: vi.fn(),
    onValue: vi.fn((ref, callback) => {
        const mockData = {
            tasks: [
                { id: 1, description: 'Task 1', status: 'not started' },
                { id: 2, description: 'Task 2', status: 'in progress' }
            ]
        };
        callback({ val: () => mockData });
    }),
    getDatabase: vi.fn(() => ({})), // 模擬 getDatabase 方法
    update: vi.fn(), // 模擬 update 方法
}));

test('MainPage', async () => {
    const pinia = createPinia();
    
    // 模擬用戶資料
    const mockUser = { uid: 'user123', displayName: 'Kevin' };
    localStorage.setItem('user', JSON.stringify(mockUser));

    // 直接渲染 MainPage 元件，而不是掛載後的實例
    const { getByText } = render(MainPage, {
        global: {
            plugins: [pinia] // 將 Pinia 插件加入全局
        }
    });

    // 確認加載用戶信息的提示已消失
    await waitFor(() => {
        expect(screen.queryByText('Loading user information...')).not.toBeInTheDocument();
    });

    // 確認寵物信息顯示
    expect(getByText('Your Pet')).toBeInTheDocument();

    // 確認任務狀態顯示
    expect(getByText('Task Status')).toBeInTheDocument();
    expect(getByText('Complete tasks to level up your pet!')).toBeInTheDocument();
    expect(getByText('Task 1')).toBeInTheDocument();
    expect(getByText('Status: not started')).toBeInTheDocument();
    expect(getByText('Task 2')).toBeInTheDocument();
    expect(getByText('Status: in progress')).toBeInTheDocument();

    // 確認接受任務按鈕存在
    expect(getByText('Accept Task')).toBeInTheDocument();
    // 確認完成任務按鈕存在
    expect(getByText('Complete Task')).toBeInTheDocument();
});
