export interface ItemImage {
  id: string;
  url: string;
  isPrimary: boolean;
  orderIndex: number;
}

export interface ItemOwner {
  id: string;
  name: string;
  avatarUrl: string | null;
  karmaScore: number;
}

export interface ItemGroup {
  id: string;
  name: string;
  imageUrl: string | null;
}

export interface ItemDetail {
  id: string;
  name: string;
  description: string | null;
  category: string;
  imageUrl: string | null;
  status: 'AVAILABLE' | 'BORROWED' | 'REQUESTED' | 'LOST'; // Add other statuses as needed
  createdAt: string;
  ownerId: string | null;
  groupId: string | null;
  owner?: ItemOwner;
  group?: ItemGroup;
  images?: ItemImage[];
  condition?: string | null;
  lenderNote?: string | null;
  maxLendingDays?: number | null;
  deposit?: number | string | null; // Decimal comes as string or number from JSON
}

export interface ItemRequest {
  id: string;
  status: string;
  startDate: string;
  endDate: string;
  requester?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}
