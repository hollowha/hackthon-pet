import { render, screen } from '@testing-library/vue';
import { test, expect } from 'vitest';
import TestPopup from '../pages/TestPopup.vue';

test('Testpage', () => {
    render(TestPopup);
    expect(screen.getByText("Hello World")).toBeInTheDocument();
});




  