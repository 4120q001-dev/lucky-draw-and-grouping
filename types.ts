
export interface Member {
  id: string;
  name: string;
  isDuplicate: boolean;
}

export interface GroupResult {
  id: number;
  members: Member[];
}

export type AppTab = 'members' | 'lottery' | 'grouping';
