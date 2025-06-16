import { multiply } from '../../workers/handler';

test('multiply works', () => {
  expect(multiply(2, 3)).toBe(6);
});
