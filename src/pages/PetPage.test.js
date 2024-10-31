/* eslint-env jest */

jest.mock("../firebase", () => ({})); // 模擬 Firebase 文件，使其為空物件

import { mount } from "@vue/test-utils";
import PetPage from "@/pages/PetPage.vue";
import { usePetStore } from "@/stores/petStore";
import { createTestingPinia } from "@pinia/testing";

describe("PetPage.vue", () => {
  let wrapper;

  beforeEach(() => {
    // 使用 Pinia 的測試插件來管理 store
    wrapper = mount(PetPage, {
      global: {
        plugins: [createTestingPinia({ createSpy: jest.fn })],
      },
    });
  });

  afterEach(() => {
    wrapper.unmount();
  });

  test("顯示寵物的名稱和等級", () => {
    const petStore = usePetStore();
    petStore.selectedPet = {
      name: "Fluffy",
      level: 2,
      currentExperience: 30,
      experienceNeeded: 100,
    };

    expect(wrapper.find(".pet-name").text()).toBe("Name: Fluffy");
    expect(wrapper.find(".pet-level").text()).toBe("Level: 2");
  });

  test("模擬寵物點擊顯示 GIF 切換效果", async () => {
    const petStore = usePetStore();
    petStore.selectedPet = {
      src: "pet/pet3.png",
      level: 1,
      currentExperience: 0,
      experienceNeeded: 100,
    };

    await wrapper.find(".pet-feature").trigger("click");
    expect(wrapper.vm.isClickGif).toBe(true);

    // 等待動畫效果回復
    setTimeout(() => {
      expect(wrapper.vm.isClickGif).toBe(false);
    }, 1500);
  });

  test("初始化寵物集合並顯示寵物頭像", async () => {
    const petStore = usePetStore();
    petStore.updatePetCollection = jest.fn();
    petStore.selectPet = jest.fn();

    // 模擬點擊初始化按鈕
    await wrapper.find(".initialize-button").trigger("click");

    expect(petStore.updatePetCollection).toHaveBeenCalled();
    expect(petStore.selectPet).toHaveBeenCalledWith(0); // 預設選擇第一隻寵物
  });

  test("顯示正確的經驗值百分比", () => {
    const petStore = usePetStore();
    petStore.selectedPet = {
      name: "Fluffy",
      level: 1,
      currentExperience: 50,
      experienceNeeded: 100,
    };

    const progress = wrapper.find(".exp-fill").element.style.width;
    expect(progress).toBe("50%");
  });

  test("選擇寵物頭像時正確更新選中寵物", async () => {
    const petStore = usePetStore();
    petStore.petCollection = [
      {
        src: "pet/pet3.png",
        owned: true,
        level: 1,
        currentExperience: 0,
        experienceNeeded: 100,
      },
      {
        src: "pet/pet5.png",
        owned: true,
        level: 1,
        currentExperience: 0,
        experienceNeeded: 100,
      },
    ];
    petStore.selectPet = jest.fn();

    await wrapper.findAll(".pet-thumbnail").at(1).trigger("click");
    expect(petStore.selectPet).toHaveBeenCalledWith(1);
  });
});
