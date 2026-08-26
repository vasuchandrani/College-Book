export interface ShowcaseComment {
  id: string;
  author: string;
  handle: string;
  college?: string;
  body: string;
  time: string;
}

export type ShowcaseTab = "feed" | "explore" | "collab" | "my_collab" | "profile";
export type CollabSubTab = "open_source" | "hackathon" | "project";
export type MyCollabSubTab = "created" | "my_requests" | "incoming";
