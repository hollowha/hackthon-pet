import { render, screen } from '@testing-library/vue';
import { test, expect, beforeEach } from 'vitest';
import New2TaskPage from '../pages/New2TaskPage.vue';
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { ref } from 'vue';

// 假設的任務數據
const mockTasks = [
  {
    id: '1',
    title: 'Task 1',
    description: 'Description for task 1',
    username: 'User1',
    time: '2024-11-01',
    status: 'not started',
  },
  {
    id: '2',
    title: 'Task 2',
    description: 'Description for task 2',
    username: 'User2',
    time: '2024-11-01',
    status: 'in progress',
  },
  {
    id: '3',
    title: 'Task 3',
    description: 'Description for task 3',
    username: 'User3',
    time: '2024-11-01',
    status: 'completed',
  },
];

beforeEach(() => {
  // 模擬 localStorage
  const userMock = { uid: 'test-user-id', displayName: 'Test User' };
  localStorage.setItem("user", JSON.stringify(userMock));
});

test.skip('TaskPage displays tasks correctly', async () => {
  const app = createApp(New2TaskPage);
  const pinia = createPinia();
  app.use(pinia);

  // 模擬 Firebase 的任務數據
  app.provide('tasks', ref(mockTasks)); // 用於提供任務數據

  render(New2TaskPage, {
    global: {
      plugins: [pinia],
    },
  });

  // 驗證「Not Started」任務
  expect(screen.getByText('Not Started')).toBeInTheDocument();
  expect(screen.getByText('Task 1')).toBeInTheDocument();
  expect(screen.getByText('Description for task 1')).toBeInTheDocument();

  // 驗證「In Progress」任務
  expect(screen.getByText('In Progress')).toBeInTheDocument();
  expect(screen.getByText('Task 2')).toBeInTheDocument();
  expect(screen.getByText('Description for task 2')).toBeInTheDocument();

  // 驗證「Completed」任務
  expect(screen.getByText('Completed')).toBeInTheDocument();
  expect(screen.getByText('Task 3')).toBeInTheDocument();
  expect(screen.getByText('Description for task 3')).toBeInTheDocument();
});

test.skip('Reward button displays popup on click', async () => {
  const app = createApp(New2TaskPage);
  const pinia = createPinia();
  app.use(pinia);
  app.provide('tasks', ref(mockTasks)); // 用於提供任務數據

  render(New2TaskPage, {
    global: {
      plugins: [pinia],
    },
  });

  // 驗證獎勵按鈕並點擊
  const rewardButton = screen.getByText('Receive Reward');
  await rewardButton.click();

  // 驗證彈出視窗顯示
  expect(screen.getByText('成就解鎖：超級冒險者！')).toBeInTheDocument();
  expect(screen.getByText('你已經完成了所有挑戰，獲得了獨特的獎勵！')).toBeInTheDocument();
});
