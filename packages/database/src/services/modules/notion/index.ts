/**
 * Notion Service Module Index
 * Exports all Notion-related services
 */

export * from './workspace';
export * from './page';

import { NotionWorkspaceService } from './workspace';
import { NotionPageService } from './page';

// Main Notion service that combines all modules
export class NotionService {
  public readonly workspaces: NotionWorkspaceService;
  public readonly pages: NotionPageService;

  constructor() {
    this.workspaces = new NotionWorkspaceService();
    this.pages = new NotionPageService();
  }
}
