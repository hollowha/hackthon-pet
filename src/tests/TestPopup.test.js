import { render, screen } from '@testing-library/vue';
import { test, expect } from 'vitest';
import TestPopup from '../pages/TestPopup.vue';

test('顯示正確的內容2', () => {
    render(TestPopup);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
});




  