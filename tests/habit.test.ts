import { HabitRecord } from '../records/habit-record';
import { HabitEntity } from '../types';
import { pool } from '../utils/db';

const testUserInDb = {
  id: '1',
  email: 'test.habit@test.com',
}

const initialData: HabitEntity = {
  name: 'running',
  orderNo: 1,
  color: '#ffffff',
  userId: testUserInDb.id,
  firstStatDate: new Date(),
  lastStatUpdateDate: new Date(),
};

let habit: HabitRecord;

beforeAll(async () => {
  habit = new HabitRecord({ ...initialData });
});
afterAll(async () => {
  await pool.end();
});

test('Not inserted habit should not have an id.', () => {
  expect(habit.id).toBeUndefined();
});

test('Inserted habit should have an id as a valid v4 uuid.', async () => {
  await habit.insert();
  expect(habit.id).toBeDefined();
  expect(habit.id).toMatch(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);
});


test('Fresh inserted habit should have stats length equal to 40', () => {
  expect(habit.stats.length).toEqual(40);
});

test('Getting not existing habit should return null.', async () => {
  const notExistHabit = await HabitRecord.getOneById('12121212121212121212');
  expect(notExistHabit).toBeNull();
});

test('Creating new HabitRecord with name longer than 40 characters should throws an error.', async () => {
  habit.name = Array(41).fill('a').join();
  expect(() => new HabitRecord(habit)).toThrow();
});

test('Creating new HabitRecord with name shorter than 1 characters should throws an error.', async () => {
  habit.name = '';
  expect(() => new HabitRecord(habit)).toThrow();
});

test('Creating new HabitRecord with no stats should not throws an error.', async () => {
  expect(() => new HabitRecord({ ...initialData, stats: null })).not.toThrow();
});

test('Creating new HabitRecord with no name should throws an error.', async () => {
  expect(() => new HabitRecord({ ...initialData, name: null })).toThrow();
});

test('Creating new HabitRecord with no orderNo should not throws an error.', async () => {
  expect(() => new HabitRecord({ ...initialData, orderNo: null })).not.toThrow();
});

test('Creating new HabitRecord with no color should throws an error.', async () => {
  expect(() => new HabitRecord({ ...initialData, color: null })).toThrow();
});

test('Creating new HabitRecord with no userId should throws an error.', async () => {
  expect(() => new HabitRecord({ ...initialData, userId: null })).toThrow();
});

test('Using delete method should delete habit.', async () => {
  await habit.delete();
  const habitAfterDelete = await HabitRecord.getOneById('1');
  expect(habitAfterDelete).toBeNull();
});
