import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ChannelService } from './channel.service';
import { ChannelRequestDTO, ChannelResponseDTO } from '../model/channel';
import { MessageDTO } from '../model/message';
import { HttpErrorResponse } from '@angular/common/http';

describe('ChannelService', () => {
  let service: ChannelService;
  let httpMock: HttpTestingController;
  
  const baseUrl = 'http://localhost:8080/servers';
  const mockServerId = '123';
  const mockChannelId = '456';
  
  const mockChannelRequest: ChannelRequestDTO = {
    name: 'Test Channel'
  };
  
  const mockChannelResponse: ChannelResponseDTO = {
    channelId: mockChannelId,
    name: 'Test Channel'
  };
  
  const mockMessages: MessageDTO[] = [
    { 
      id: '1', 
      content: 'Message 1', 
      timestamp: new Date('2024-01-01T10:00:00Z').toISOString(), 
      authorId: 'user1' 
    },
    { 
      id: '2', 
      content: 'Message 2', 
      timestamp: new Date('2024-01-01T10:01:00Z').toISOString(), 
      authorId: 'user2' 
    }
  ];

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        ChannelService,
        provideHttpClient(),
        provideHttpClientTesting(),
      ]
    });

    service = TestBed.inject(ChannelService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  describe('createChannel', () => {
    const createChannelUrl = `${baseUrl}/${mockServerId}/channels`;

    it('should send POST request with correct data and return created channel', (done) => {
      service.createChannel(mockServerId, mockChannelRequest).subscribe({
        next: (response) => {
          expect(response).toEqual(mockChannelResponse);
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(createChannelUrl);
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(mockChannelRequest);
      req.flush(mockChannelResponse);
    });

    it('should handle 400 Bad Request error', (done) => {
      const errorMessage = 'Channel name already exists';
      
      service.createChannel(mockServerId, mockChannelRequest).subscribe({
        next: () => done.fail('should have failed with 400 error'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(400);
          expect(error.error).toBe(errorMessage);
          done();
        }
      });

      const req = httpMock.expectOne(createChannelUrl);
      req.flush(errorMessage, { status: 400, statusText: 'Bad Request' });
    });
  });

  describe('getMessages', () => {
    const messagesUrl = `${baseUrl}/${mockServerId}/channels/${mockChannelId}/messages`;

    it('should return messages for a specific channel', (done) => {
      service.getMessages(mockServerId, mockChannelId).subscribe({
        next: (messages) => {
          expect(messages).toEqual(mockMessages);
          expect(messages.length).toBe(2);
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(messagesUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockMessages);
    });

    it('should handle 404 Not Found error', (done) => {
      service.getMessages(mockServerId, mockChannelId).subscribe({
        next: () => done.fail('should have failed with 404 error'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(404);
          expect(error.statusText).toBe('Not Found');
          done();
        }
      });

      const req = httpMock.expectOne(messagesUrl);
      req.flush('Channel not found', { status: 404, statusText: 'Not Found' });
    });
  });

  describe('findChannelsByServerId', () => {
    const channelsUrl = `${baseUrl}/${mockServerId}/channels`;

    it('should return all channels for a server', (done) => {
      const mockChannels: ChannelResponseDTO[] = [
        { channelId: '1', name: 'Channel 1' },
        { channelId: '2', name: 'Channel 2' }
      ];

      service.findChannelsByServerId(mockServerId).subscribe({
        next: (channels) => {
          expect(channels).toEqual(mockChannels);
          expect(channels.length).toBe(2);
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(channelsUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockChannels);
    });

    it('should return empty array when server has no channels', (done) => {
      service.findChannelsByServerId(mockServerId).subscribe({
        next: (channels) => {
          expect(channels).toEqual([]);
          expect(channels.length).toBe(0);
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(channelsUrl);
      req.flush([]);
    });
  });

  describe('findChannelsById', () => {
    const channelUrl = `${baseUrl}/${mockServerId}/channels/${mockChannelId}`;

    it('should return specific channel by ID', (done) => {
      service.findChannelsById(mockServerId, mockChannelId).subscribe({
        next: (channel) => {
          expect(channel).toEqual(mockChannelResponse);
          expect(channel.channelId).toBe(mockChannelId);
          done();
        },
        error: done.fail
      });

      const req = httpMock.expectOne(channelUrl);
      expect(req.request.method).toBe('GET');
      req.flush(mockChannelResponse);
    });

    it('should handle non-existent channel', (done) => {
      service.findChannelsById(mockServerId, 'non-existent').subscribe({
        next: () => done.fail('should have failed with 404 error'),
        error: (error: HttpErrorResponse) => {
          expect(error.status).toBe(404);
          expect(error.error).toBe('Channel not found');
          done();
        }
      });

      const req = httpMock.expectOne(`${baseUrl}/${mockServerId}/channels/non-existent`);
      req.flush('Channel not found', { status: 404, statusText: 'Not Found' });
    });
  });
});
