/**
 * YouTube Service Module Index
 * Exports all YouTube-related services
 */

export * from './channel';
export * from './video';

import { YouTubeChannelService } from './channel';
import { YouTubeVideoService } from './video';

// Main YouTube service that combines all modules
export class YouTubeService {
  public readonly channels: YouTubeChannelService;
  public readonly videos: YouTubeVideoService;

  constructor() {
    this.channels = new YouTubeChannelService();
    this.videos = new YouTubeVideoService();
  }
}
