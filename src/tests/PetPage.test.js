import { render, screen, fireEvent } from '@testing-library/vue';
import { test, expect } from 'vitest';
import PetPage from '../pages/PetPage.vue';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { usePetStore } from '../stores/petStore';
import 'web-streams-polyfill'; // 嘗試這個


// 初始化 Pinia store
const app = createApp(PetPage);
const pinia = createPinia();
app.use(pinia);

test('renders PetPage and checks initial state', () => {
    render(PetPage, { global: { plugins: [pinia] } });

    // 檢查是否有 "Pet Collection" 標題
    expect(screen.getByText("Pet Collection")).toBeInTheDocument();

    // 檢查初始寵物的等級和名稱
    expect(screen.getByText("Level: 1")).toBeInTheDocument();
    expect(screen.getByText("Name: Fluffy")).toBeInTheDocument();

    // 檢查是否有初始化按鈕
    expect(screen.getByText("寵物初始化")).toBeInTheDocument();
});

test('initializes pets when button is clicked', async () => {
    const { getByText } = render(PetPage, { global: { plugins: [pinia] } });

    // 模擬點擊 "寵物初始化" 按鈕
    const initializeButton = getByText("寵物初始化");
    await fireEvent.click(initializeButton);

    // 檢查寵物等級是否初始化為 1
    expect(screen.getByText("Level: 1")).toBeInTheDocument();

    // 檢查是否顯示了其他寵物的圖像
    expect(screen.getAllByRole('img')).toHaveLength(6+1); // 檢查是否有 6 隻寵物
    // print how many img
    
});
