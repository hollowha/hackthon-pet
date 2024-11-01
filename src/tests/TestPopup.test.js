import { render, screen } from '@testing-library/vue';
import { test, expect } from 'vitest';
import TestPopup from '../pages/TestPopup.vue';
import 'web-streams-polyfill'; // 嘗試這個


test('Testpage', () => {
    render(TestPopup);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
});




  