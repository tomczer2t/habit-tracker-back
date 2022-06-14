import { UserRecord } from '../records/user-record';
import { pool } from '../utils/db';

const initialData = {
  email: 'test@test.test',
  password: 'Testowe123?',
};

let user: UserRecord;

afterAll(async () => {
  await pool.end();
});

beforeAll(() => {
  user = new UserRecord(initialData);
});

test('Creating user with not valid email throws an error', () => {
  expect(() => new UserRecord({ ...initialData, email: 'test.test' })).toThrow();
});

test('Creating user with no email throws an error', () => {
  expect(() => new UserRecord({ ...initialData, email: undefined })).toThrow();
});

test('Creating user with password shorter than 8 characters throws an error', () => {
  expect(() => new UserRecord({ ...initialData, password: 'Test1?' })).toThrow();
});

test('Creating user with password longer than 100 characters throws an error', () => {
  expect(() => new UserRecord({
    ...initialData,
    password: 'Test1?fdfdshfjdshjkfdskjhfdhjkfkdsjhfdhjksfhjkdsfhjkdshjkfdkjshfhkjdsfkhjdfhdshjkfdshjkfhjdshfjkreiggffoiufdiugfdiuogudfio',
  })).toThrow();
});

test('Creating user with password with no any special character from "?", "!", "@", "#", "$" or "%" throws an error', () => {
  expect(() => new UserRecord({ ...initialData, password: 'TestTest12' })).toThrow();
});

test('Creating user with password with any other special character than "?", "!", "@", "#", "$" or "%" throws an error', () => {
  expect(() => new UserRecord({ ...initialData, password: 'TestTest12;' })).toThrow();
  expect(() => new UserRecord({ ...initialData, password: 'TestTest12"' })).toThrow();
  expect(() => new UserRecord({ ...initialData, password: 'TestTest12^' })).toThrow();
  expect(() => new UserRecord({ ...initialData, password: 'TestTest12)' })).toThrow();
  expect(() => new UserRecord({ ...initialData, password: 'TestTest12(' })).toThrow();
  expect(() => new UserRecord({ ...initialData, password: 'TestTest12]' })).toThrow();
  expect(() => new UserRecord({ ...initialData, password: 'TestTest12[' })).toThrow();
  expect(() => new UserRecord({ ...initialData, password: 'TestTest12{' })).toThrow();
  expect(() => new UserRecord({ ...initialData, password: 'TestTest12}' })).toThrow();
});

test('Creating user with no password throws an error', () => {
  expect(() => new UserRecord({ ...initialData, password: undefined })).toThrow();
});

test('Not inserted user should not have an id', () => {
  expect(user.id).toBeUndefined();
});

test('Inserted user should have an id as a valid v4 uuid.', async () => {
  await user.insert();
  expect(user.id).toBeDefined();
  expect(user.id).toMatch(/^[0-9A-F]{8}-[0-9A-F]{4}-4[0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i);
});

test('Inserted user should have encrypted password', () => {
  expect(user.password === initialData.password).toBeFalsy();
});

test('Getting inserted user by email should returns user', async () => {
  const user = await UserRecord.getByEmail(initialData.email);
  expect(user.id).toBeDefined();
  expect(user.email).toBeDefined();
  expect(user.password).toBeDefined();
  expect(user).toHaveProperty('refreshToken');
});

test('Getting inserted user by id should returns user', async () => {
  const userById = await UserRecord.getById(user.id);
  expect(userById.id).toBeDefined();
  expect(userById.email).toBeDefined();
  expect(userById.password).toBeDefined();
  expect(userById).toHaveProperty('refreshToken');
});

test('Getting by id not existing user should return null', async () => {
  const userNull = await UserRecord.getById('12121212121212121212121212121');
  expect(userNull).toBeNull();
});

test('Getting by email not existing user should return null', async () => {
  const userNull = await UserRecord.getByEmail('test.test.test@test.test');
  expect(userNull).toBeNull();
});

test('Using delete method should delete user.', async () => {
  await user.delete();
  const userAfterDelete = await UserRecord.getByEmail(initialData.email);
  expect(userAfterDelete).toBeNull();
});