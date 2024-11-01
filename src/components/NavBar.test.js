// src/components/MyComponent.test.js
import { mount } from "@vue/test-utils";
import MyComponent from "./MyComponent.vue";
import { test, expect } from "@jest/globals";

test("renders message", () => {
  const wrapper = mount(MyComponent);
  expect(wrapper.text()).toBe("Hello, Vue!");
});
