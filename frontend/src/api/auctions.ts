import apiClient from './apiClient';

export interface Bid {
  id: string;
  auctionId: string;
  memberId: string;
  memberName: string;
  amount: number;
  timestamp: string;
}

export interface Auction {
  id: string;
  cycleId: string;
  status: 'PENDING' | 'LIVE' | 'COMPLETED';
  startTime?: string;
  endTime?: string;
  currentBid?: number;
  winnerId?: string;
}

export const getAuction = async (cycleId: string): Promise<Auction> => {
  const response = await apiClient.get<Auction>(`/cycles/${cycleId}/auction`);
  return response.data;
};

export const getBids = async (auctionId: string): Promise<Bid[]> => {
  const response = await apiClient.get<Bid[]>(`/auctions/${auctionId}/bids`);
  return response.data;
};

export const placeBid = async (auctionId: string, memberId: string, amount: number): Promise<Bid> => {
  const response = await apiClient.post<Bid>(`/auctions/${auctionId}/bids`, { memberId, amount });
  return response.data;
};

export const endAuction = async (auctionId: string): Promise<Auction> => {
  const response = await apiClient.post<Auction>(`/auctions/${auctionId}/end`);
  return response.data;
};
