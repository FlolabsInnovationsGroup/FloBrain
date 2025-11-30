// File: src/features/ai-pipeline/ai.service.test.ts

import { aiService } from './ai.service';
import { MediaRecording } from './ai.types';
import models from '../../../models';

// --- DEPENDENCY MOCKS ---
// Mock the database models to isolate the service from the database layer.
jest.mock('../../../models', () => ({
  MediaRecording: {
    findOne: jest.fn(),
    update: jest.fn(),
  },
}));

// Mock the AI processor to control its responses during tests.
jest.mock('./ai.mock.processor', () => ({
  mockAiProcessor: {
    transcription: jest.fn(),
    summary: jest.fn(),
    tags: jest.fn(),
    embedding: jest.fn(),
  },
}));

const MockedMediaRecording = (models as any).MediaRecording;

// --- TEST SUITE ---
describe('AiService - Unit Tests', () => {
  
  let runOrchestrationSpy: jest.SpyInstance;

  // Before each test, clear all mocks and prevent the real orchestration from running.
  beforeEach(() => {
    jest.clearAllMocks();
    // Spy on the private _runOrchestration method and replace it with a dummy function.
    // This prevents the async background process from running during unit tests.
    runOrchestrationSpy = jest.spyOn(aiService as any, '_runOrchestration').mockImplementation(() => Promise.resolve());
  });

  // After each test, restore the original implementation of spied methods.
  afterEach(() => {
    runOrchestrationSpy.mockRestore();
  });

  describe('Job Plan Creation', () => {
    it('should create a full job plan for an audio media type', async () => {
      // Arrange
      const mockMedia: MediaRecording = {
        id: 'audio1',
        userId: 'user1',
        mediaType: 'audio',
        processingStatus: 'pending_processing',
      };
      MockedMediaRecording.findOne.mockResolvedValue(mockMedia);
      
      // Act
      const result = await aiService.startProcessing('audio1', 'user1');
      
      // Assert
      expect(result.plan).toEqual(['transcription', 'summary', 'tags', 'embedding']);
    });

    it('should create a reduced job plan for an image media type', async () => {
      // Arrange
      const mockMedia: MediaRecording = {
        id: 'image1',
        userId: 'user1',
        mediaType: 'image',
        processingStatus: 'pending_processing',
      };
      MockedMediaRecording.findOne.mockResolvedValue(mockMedia);
      
      // Act
      const result = await aiService.startProcessing('image1', 'user1');
      
      // Assert
      expect(result.plan).toEqual(['tags', 'embedding']);
    });
  });

  describe('Input Validation and Error Handling', () => {
    it('should throw "MediaNotFound" error if media does not exist', async () => {
      // Arrange: Configure the mock to find nothing.
      MockedMediaRecording.findOne.mockResolvedValue(null);

      // Act & Assert: Expect the promise to be rejected with the specific error.
      await expect(aiService.startProcessing('not-found-id', 'user1')).rejects.toThrow('MediaNotFound');
    });

    it('should throw "AlreadyProcessing" error if media is already in a "processing" state', async () => {
      // Arrange
      const mockMedia: MediaRecording = {
        id: 'audio1',
        userId: 'user1',
        mediaType: 'audio',
        processingStatus: 'processing', // The status that should trigger the error.
      };
      MockedMediaRecording.findOne.mockResolvedValue(mockMedia);

      // Act & Assert
      await expect(aiService.startProcessing('audio1', 'user1')).rejects.toThrow('AlreadyProcessing');
    });
  });
});