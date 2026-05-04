export type Card = {
  id: string;
  title: string;
  pipelineColumnId: string;
  value: number | null;
  companyName: string | null;
  contactName: string | null;
  email: string | null;
  phone: string | null;
  notes: string | null;
  position: number;
  organizationId: string;
  contactId: string | null;
  createdAt: string;
  updatedAt: string;
};
