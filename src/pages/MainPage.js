// /* eslint-env jest */

// // 加入此行以支援 fetch
// import "openai/shims/node";

// import { mount, flushPromises } from "@vue/test-utils";
// import MainPage from "@/pages/MainPage.vue";
// import { usePetStore } from "@/stores/petStore";
// import { createTestingPinia } from "@pinia/testing";
// import { test, expect } from "@jest/globals";

// // Mock Firebase 依賴
// jest.mock("../firebase", () => ({
//   ref: jest.fn(),
//   onValue: jest.fn(),
//   update: jest.fn(),
// }));
// // 模擬 fetch
// global.fetch = jest.fn(() =>
//   Promise.resolve({
//     json: () => Promise.resolve({}),
//   })
// );

// // Mock Firebase 依賴
// jest.mock("../firebase", () => ({
//   ref: jest.fn(),
//   onValue: jest.fn(),
//   update: jest.fn(),
// }));

// describe("MainPage.vue", () => {
//   let wrapper;

//   beforeEach(() => {
//     // 使用 Pinia 的測試插件來管理 store
//     wrapper = mount(MainPage, {
//       global: {
//         plugins: [createTestingPinia({ createSpy: jest.fn })],
//       },
//     });
//   });

//   afterEach(() => {
//     wrapper.unmount();
//     global.fetch.mockClear(); // 清除 fetch 模擬，避免影響其他測試
//   });

//   test("顯示加載訊息當 user 尚未加載", () => {
//     expect(wrapper.text()).toContain("Loading user information...");
//   });

//   test("顯示寵物的名稱和等級", async () => {
//     const petStore = usePetStore();
//     petStore.selectedPet = { name: "Fluffy", level: 1, src: "pet/pet1.png" };

//     await flushPromises(); // 等待所有 Promise 完成
//     expect(wrapper.find(".pet-name").text()).toBe("Name: Fluffy");
//     expect(wrapper.find(".pet-level").text()).toBe("Level: 1");
//   });

//   test("模擬點擊事件顯示文字氣泡", async () => {
//     const petStore = usePetStore();
//     petStore.selectedPet = { name: "Fluffy", level: 1, src: "pet/pet1.png" };

//     await flushPromises();
//     await wrapper.find(".pet-display").trigger("click");
//     expect(wrapper.find(".floating-text").exists()).toBe(true);
//   });

//   test("接受任務並更新任務狀態", async () => {
//     wrapper.setData({
//       user: { uid: "test-user" },
//       tasks: [{ id: 1, description: "Test Task", status: "not started" }],
//     });

//     await flushPromises();
//     const acceptButton = wrapper.find("button");
//     await acceptButton.trigger("click");
//     expect(wrapper.vm.tasks[0].status).toBe("in progress");
//   });

//   test("完成任務並增加經驗值", async () => {
//     wrapper.setData({
//       user: { uid: "test-user" },
//       tasks: [{ id: 1, description: "Test Task", status: "in progress" }],
//     });

//     const petStore = usePetStore();
//     petStore.addExperience = jest.fn();

//     await flushPromises();
//     const completeButton = wrapper.find("button");
//     await completeButton.trigger("click");
//     expect(wrapper.vm.tasks[0].status).toBe("completed");
//     expect(petStore.addExperience).toHaveBeenCalledWith(10);
//   });
// });
