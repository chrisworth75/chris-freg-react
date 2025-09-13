export interface Fee {
  id: number;
  code: string;
  value: string;
  description: string;
  status: 'draft' | 'approved' | 'live';
  start_date: string;
  end_date: string;
  type: string;
  service: string;
  jurisdiction1: string;
  jurisdiction2: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFeeRequest {
  code: string;
  value: number;
  description: string;
  status: 'draft' | 'approved' | 'live';
}