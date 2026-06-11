export type Stage = "New" | "In Progress" | "On Hold" | "Closing" | "Won" | "Lost";

export type Country = "India" | "UAE" | "England" | "Malaysia" | "Brazil" | "Australia";

export type ActivityType = "stage_change" | "hold" | "resume" | "document" | "note";

export type DocType = "Proposal" | "BOQ" | "Site Survey" | "PO" | "Contract" | "Other";

export interface Deal {
  id: string;
  clientName: string;
  country: Country;
  value: number;
  currency: string;
  stage: Stage;
  product: string;
  hold?: { reason: string; resumeDate: string };
  lastActivityAt: string;
}

export interface Activity {
  id: string;
  dealId: string;
  type: ActivityType;
  summary: string;
  detail?: string;
  actor: "Rohan Mehta";
  ts: string;
  pendingSync?: boolean;
}

export interface Doc {
  id: string;
  dealId: string;
  name: string;
  docType: DocType;
  sizeKB: number;
  uploadedBy: "Rohan Mehta";
  ts: string;
  pendingSync?: boolean;
}

export interface CRMState {
  deals: Deal[];
  activities: Activity[];
  docs: Doc[];
  offline: boolean;
}

const isoHoursAgo = (hours: number) => new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
const isoDaysAgo = (days: number) => isoHoursAgo(days * 24);
const dateDaysFromNow = (days: number) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
};

const activity = (
  id: string,
  dealId: string,
  type: ActivityType,
  summary: string,
  detail: string | undefined,
  ts: string,
): Activity => ({
  id,
  dealId,
  type,
  summary,
  detail,
  actor: "Rohan Mehta",
  ts,
});

export function createSeedState(): CRMState {
  const deals: Deal[] = [
    {
      id: "deal-1",
      clientName: "Gulf Star Petrochem",
      country: "UAE",
      value: 950000,
      currency: "AED",
      stage: "In Progress",
      product: "InSite RTLS — Connected Worker",
      lastActivityAt: isoDaysAgo(9),
    },
    {
      id: "deal-2",
      clientName: "Falcon Heavy Industries",
      country: "UAE",
      value: 1400000,
      currency: "AED",
      stage: "Closing",
      product: "InSite — Truck-In Truck-Out",
      lastActivityAt: isoHoursAgo(2),
    },
    {
      id: "deal-3",
      clientName: "Deccan Auto Forgings",
      country: "India",
      value: 8500000,
      currency: "INR",
      stage: "In Progress",
      product: "InSite RTLS — Asset Tracking",
      lastActivityAt: isoDaysAgo(4),
    },
    {
      id: "deal-4",
      clientName: "Ganga Cement Works",
      country: "India",
      value: 12000000,
      currency: "INR",
      stage: "New",
      product: "InSite — Forklift Safety",
      lastActivityAt: isoDaysAgo(1),
    },
    {
      id: "deal-5",
      clientName: "Northfield Aerospace",
      country: "England",
      value: 420000,
      currency: "GBP",
      stage: "Closing",
      product: "InSite RTLS — Connected Worker",
      lastActivityAt: isoDaysAgo(6),
    },
    {
      id: "deal-6",
      clientName: "Penang Precision Electronics",
      country: "Malaysia",
      value: 1200000,
      currency: "MYR",
      stage: "In Progress",
      product: "InSite RTLS — Asset Tracking",
      lastActivityAt: isoDaysAgo(12),
    },
    {
      id: "deal-7",
      clientName: "Santos Agro Processing",
      country: "Brazil",
      value: 2100000,
      currency: "BRL",
      stage: "New",
      product: "InSite — Truck-In Truck-Out",
      lastActivityAt: isoDaysAgo(3),
    },
    {
      id: "deal-8",
      clientName: "Outback Mining Services",
      country: "Australia",
      value: 760000,
      currency: "AUD",
      stage: "In Progress",
      product: "InSite — Forklift Safety",
      lastActivityAt: isoDaysAgo(15),
    },
    {
      id: "deal-9",
      clientName: "Emirates Steel Fabricators",
      country: "UAE",
      value: 600000,
      currency: "AED",
      stage: "On Hold",
      product: "InSite RTLS — Connected Worker",
      hold: { reason: "Client budget freeze", resumeDate: dateDaysFromNow(6) },
      lastActivityAt: isoDaysAgo(5),
    },
    {
      id: "deal-10",
      clientName: "Mersey Port Logistics",
      country: "England",
      value: 310000,
      currency: "GBP",
      stage: "On Hold",
      product: "InSite — Truck-In Truck-Out",
      hold: { reason: "Decision-maker unavailable", resumeDate: dateDaysFromNow(-3) },
      lastActivityAt: isoDaysAgo(11),
    },
    {
      id: "deal-11",
      clientName: "Klang Valley Glassworks",
      country: "Malaysia",
      value: 540000,
      currency: "MYR",
      stage: "Won",
      product: "InSite RTLS — Asset Tracking",
      lastActivityAt: isoDaysAgo(8),
    },
    {
      id: "deal-12",
      clientName: "Paraná Textiles",
      country: "Brazil",
      value: 890000,
      currency: "BRL",
      stage: "Lost",
      product: "InSite RTLS — Connected Worker",
      lastActivityAt: isoDaysAgo(20),
    },
  ];

  const docs: Doc[] = [
    {
      id: "doc-1",
      dealId: "deal-1",
      name: "BOQ_v2.pdf",
      docType: "BOQ",
      sizeKB: 840,
      uploadedBy: "Rohan Mehta",
      ts: isoDaysAgo(10),
    },
    {
      id: "doc-2",
      dealId: "deal-1",
      name: "Site_Survey_Photos.pdf",
      docType: "Site Survey",
      sizeKB: 4200,
      uploadedBy: "Rohan Mehta",
      ts: isoDaysAgo(9),
    },
    {
      id: "doc-3",
      dealId: "deal-2",
      name: "PO_Draft.pdf",
      docType: "PO",
      sizeKB: 310,
      uploadedBy: "Rohan Mehta",
      ts: isoHoursAgo(2),
    },
    {
      id: "doc-4",
      dealId: "deal-5",
      name: "Proposal_Northfield_v3.pdf",
      docType: "Proposal",
      sizeKB: 1150,
      uploadedBy: "Rohan Mehta",
      ts: isoDaysAgo(7),
    },
  ];

  const activities: Activity[] = [
    activity("act-1a", "deal-1", "stage_change", "Moved to In Progress", "Discovery complete; waiting on revised BOQ.", isoDaysAgo(16)),
    activity("act-1b", "deal-1", "document", "Attached BOQ_v2.pdf", "BOQ - 840 KB", isoDaysAgo(10)),
    activity("act-1c", "deal-1", "document", "Attached Site_Survey_Photos.pdf", "Site Survey - 4,200 KB", isoDaysAgo(9)),
    activity("act-2a", "deal-2", "stage_change", "Moved to Closing", "Procurement requested final PO draft.", isoDaysAgo(2)),
    activity("act-2b", "deal-2", "document", "Attached PO_Draft.pdf", "PO - 310 KB", isoHoursAgo(2)),
    activity("act-3a", "deal-3", "stage_change", "Moved to In Progress", "Plant head approved asset-tracking pilot scope.", isoDaysAgo(12)),
    activity("act-3b", "deal-3", "note", "Finance call completed", "Commercial approval expected next week.", isoDaysAgo(4)),
    activity("act-4a", "deal-4", "note", "Deal assigned", "New forklift-safety opportunity from western region.", isoDaysAgo(5)),
    activity("act-4b", "deal-4", "stage_change", "Moved to New", "Initial site visit booked.", isoDaysAgo(1)),
    activity("act-5a", "deal-5", "document", "Attached Proposal_Northfield_v3.pdf", "Proposal - 1,150 KB", isoDaysAgo(7)),
    activity("act-5b", "deal-5", "stage_change", "Moved to Closing", "Legal team reviewing contract language.", isoDaysAgo(6)),
    activity("act-6a", "deal-6", "stage_change", "Moved to In Progress", "IT team validating anchor placement.", isoDaysAgo(18)),
    activity("act-6b", "deal-6", "note", "Site walk-through done", "Waiting on safety committee response.", isoDaysAgo(12)),
    activity("act-7a", "deal-7", "note", "Deal assigned", "Operations team requested truck-yard automation demo.", isoDaysAgo(6)),
    activity("act-7b", "deal-7", "stage_change", "Moved to New", "Demo deck shared with procurement.", isoDaysAgo(3)),
    activity("act-8a", "deal-8", "stage_change", "Moved to In Progress", "Mine safety team wants forklift near-miss reporting.", isoDaysAgo(21)),
    activity("act-8b", "deal-8", "note", "Awaiting site data", "Client to share current incident baseline.", isoDaysAgo(15)),
    activity("act-9a", "deal-9", "stage_change", "Moved to In Progress", "Connected-worker proposal reviewed.", isoDaysAgo(13)),
    activity("act-9b", "deal-9", "hold", "Put on hold", "Client budget freeze; resume in 6 days.", isoDaysAgo(5)),
    activity("act-10a", "deal-10", "stage_change", "Moved to In Progress", "Port team reviewed gate automation scope.", isoDaysAgo(17)),
    activity("act-10b", "deal-10", "hold", "Put on hold", "Decision-maker unavailable; resume date overdue.", isoDaysAgo(11)),
    activity("act-11a", "deal-11", "stage_change", "Moved to Closing", "Procurement accepted final commercials.", isoDaysAgo(14)),
    activity("act-11b", "deal-11", "stage_change", "Moved to Won", "PO received from client.", isoDaysAgo(8)),
    activity("act-12a", "deal-12", "stage_change", "Moved to In Progress", "Connected-worker scope explored with plant team.", isoDaysAgo(28)),
    activity("act-12b", "deal-12", "stage_change", "Moved to Lost", "Client postponed RTLS investment to next year.", isoDaysAgo(20)),
  ];

  return { deals, activities, docs, offline: false };
}
