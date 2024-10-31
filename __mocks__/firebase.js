/* eslint-env jest */
module.exports = {
  initializeApp: jest.fn(),
  getDatabase: jest.fn(),
  getAuth: jest.fn(),
  GoogleAuthProvider: jest.fn(),
  signInWithPopup: jest.fn(),
  ref: jest.fn(),
  onValue: jest.fn(),
  update: jest.fn(),
};
