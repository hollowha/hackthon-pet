import { mount } from '@vue/test-utils';
import ShopPage from '@/pages/ShopPage.vue';
import { createTestingPinia } from '@pinia/testing';
import { vi } from 'vitest';

// 模擬 localStorage
beforeEach(() => {
  // 清除所有的 localStorage
  localStorage.clear();

  // 模擬 user 資料
  localStorage.setItem('user', JSON.stringify({ uid: 'test-user-id' }));
});

describe('ShopPage', () => {
  it('應該渲染並顯示內部商城', () => {
    const wrapper = mount(ShopPage, {
      global: {
        plugins: [createTestingPinia()],
      },
    });

    // 確認內部商城被渲染
    expect(wrapper.text()).toContain('內部商城');
  });
});
