jest.mock('uuid', () => ({
  v4: () => `global-mock-uuid-${Date.now()}`
}));

jest.mock('../../src/utils/mime', () => ({
  sniffTrusted: jest.fn().mockResolvedValue({
    family: 'image',
    mime: 'image/png',
    ext: 'png'
  })
}));
