export type ItemStatus = 'AVAILABLE' | 'BORROWED' | 'REQUESTED' | 'ARCHIVED';

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string; // We'll use a placeholder service
  role: 'STUDENT' | 'ADMIN';
}

export interface Item {
  id: string;
  name: string;
  category: 'Electronics' | 'Books' | 'Lab' | 'Misc' | 'Chargers' | 'Class';
  description: string | null;
  ownerId: string | null;
  status: ItemStatus;
  borrowerId?: string;
  imageUrl?: string | null;
  createdAt?: string;
  price?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  distance?: number | null;
  owner?: {
    id: string;
    name: string;
    avatarUrl: string | null;
    karmaScore: number;
    latitude?: number | null;
    longitude?: number | null;
  };
}



export type RequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'BORROWED' | 'RETURNED' | 'CANCELLED';

export interface Request {
  id: string;
  itemId: string;
  requesterId: string;
  ownerId: string;
  status: RequestStatus;
  createdAt: string;
}

export interface Notification {
  id: string;
  userId: string;
  message: string;
  read: boolean;
  createdAt: string;
}
