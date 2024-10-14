export interface MessageDTO {
  id?: string;
  content: string;
  authorId: string;
  authorName?: string | null;
  timestamp?: string;
}