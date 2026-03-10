export type Priority = "urgent" | "important" | "normal" | "ignore";
export type Category = "Job" | "School" | "Orders / Travel" | "Ads / Subscriptions" | "Other";

export interface Email {
  id: string;
  subject: string;
  sender: string;
  senderEmail: string;
  category: Category;
  priority: Priority;
  summary: string;
  timestamp: string;
  // For orders/tickets
  orderData?: {
    date: string;
    location: string;
    orderNumber: string;
    hasQR: boolean;
  };
  // For job emails
  jobType?: "interview" | "rejection" | "recommendation" | "recruiting";
  // For school emails
  schoolType?: "deadline" | "exam" | "admin" | "event";
}

export const mockEmails: Email[] = [
  // Job
  {
    id: "1",
    subject: "Interview Invitation — Senior Frontend Engineer",
    sender: "Sarah Chen, TechCorp HR",
    senderEmail: "sarah.chen@techcorp.com",
    category: "Job",
    priority: "urgent",
    summary: "Interview scheduled for March 12, 10:00 AM PST. Prepare system design case study. Video call link included.",
    timestamp: "2026-03-10T08:14:00",
    jobType: "interview",
  },
  {
    id: "2",
    subject: "Application Update — Product Designer Role",
    sender: "Greenhouse Notifications",
    senderEmail: "noreply@greenhouse.io",
    category: "Job",
    priority: "important",
    summary: "Moved to final round. Hiring manager review pending. Expected decision by end of week.",
    timestamp: "2026-03-10T07:45:00",
    jobType: "recommendation",
  },
  {
    id: "3",
    subject: "We regret to inform you — Data Analyst Position",
    sender: "HR Team, AnalyticsCo",
    senderEmail: "careers@analyticsco.com",
    category: "Job",
    priority: "normal",
    summary: "Application not selected. Position filled internally. Encouraged to apply for future openings.",
    timestamp: "2026-03-10T06:30:00",
    jobType: "rejection",
  },
  {
    id: "4",
    subject: "New jobs matching your profile",
    sender: "LinkedIn Jobs",
    senderEmail: "jobs-noreply@linkedin.com",
    category: "Job",
    priority: "ignore",
    summary: "12 new frontend engineer positions in your area. 3 match your salary preferences.",
    timestamp: "2026-03-10T05:00:00",
    jobType: "recruiting",
  },
  // School
  {
    id: "5",
    subject: "REMINDER: CS 401 Final Project Due Tomorrow",
    sender: "Prof. Liu, Computer Science",
    senderEmail: "j.liu@university.edu",
    category: "School",
    priority: "urgent",
    summary: "Final project submission deadline March 11 at 11:59 PM. Submit via course portal. Late penalty: 10% per day.",
    timestamp: "2026-03-10T09:00:00",
    schoolType: "deadline",
  },
  {
    id: "6",
    subject: "Midterm Exam Schedule — Spring 2026",
    sender: "Registrar Office",
    senderEmail: "registrar@university.edu",
    category: "School",
    priority: "important",
    summary: "Midterms begin March 17. Your exams: CS 401 (Mar 17, 2PM), MATH 302 (Mar 19, 10AM), PHIL 201 (Mar 20, 9AM).",
    timestamp: "2026-03-10T08:30:00",
    schoolType: "exam",
  },
  {
    id: "7",
    subject: "Campus Career Fair — March 15",
    sender: "Student Affairs",
    senderEmail: "events@university.edu",
    category: "School",
    priority: "normal",
    summary: "Annual career fair in Student Union. 40+ employers attending. Bring resume copies. Business casual.",
    timestamp: "2026-03-10T07:00:00",
    schoolType: "event",
  },
  // Orders / Travel
  {
    id: "8",
    subject: "Your flight to Tokyo — Booking Confirmed",
    sender: "ANA Airlines",
    senderEmail: "booking@ana.co.jp",
    category: "Orders / Travel",
    priority: "important",
    summary: "Round trip SFO → NRT confirmed. Departure Mar 25, 11:45 AM. Return Apr 2, 3:20 PM.",
    timestamp: "2026-03-10T04:15:00",
    orderData: {
      date: "March 25, 2026 — 11:45 AM",
      location: "SFO → NRT (Narita)",
      orderNumber: "ANA-7829341",
      hasQR: true,
    },
  },
  {
    id: "9",
    subject: "Order Shipped — Mechanical Keyboard",
    sender: "Amazon",
    senderEmail: "shipment@amazon.com",
    category: "Orders / Travel",
    priority: "normal",
    summary: "Keychron Q1 Pro shipped via UPS. Estimated delivery: March 13. Tracking number included.",
    timestamp: "2026-03-10T03:50:00",
    orderData: {
      date: "March 13, 2026 (est.)",
      location: "Delivery to 742 Evergreen Terrace",
      orderNumber: "114-3928471-9182736",
      hasQR: false,
    },
  },
  // Ads / Subscriptions
  {
    id: "10",
    subject: "Your weekly digest from Medium",
    sender: "Medium Daily Digest",
    senderEmail: "noreply@medium.com",
    category: "Ads / Subscriptions",
    priority: "ignore",
    summary: "5 recommended articles based on your reading history. Top pick: 'Why Rust is eating the world.'",
    timestamp: "2026-03-10T06:00:00",
  },
  {
    id: "11",
    subject: "Flash Sale — 40% off everything",
    sender: "Uniqlo",
    senderEmail: "promo@uniqlo.com",
    category: "Ads / Subscriptions",
    priority: "ignore",
    summary: "Spring collection sale. 40% off sitewide. Ends March 12. Free shipping over $75.",
    timestamp: "2026-03-10T05:30:00",
  },
  {
    id: "12",
    subject: "Your Spotify Wrapped — March Edition",
    sender: "Spotify",
    senderEmail: "noreply@spotify.com",
    category: "Ads / Subscriptions",
    priority: "ignore",
    summary: "Top artist: Radiohead. 847 minutes listened. New playlist generated based on habits.",
    timestamp: "2026-03-10T04:00:00",
  },
  // Other
  {
    id: "13",
    subject: "Dinner Friday? — Re: Weekend Plans",
    sender: "Alex Park",
    senderEmail: "alex.park@gmail.com",
    category: "Other",
    priority: "normal",
    summary: "Suggesting dinner at 7pm Friday. Italian place on 5th. Asking if you can bring wine.",
    timestamp: "2026-03-10T09:20:00",
  },
  {
    id: "14",
    subject: "Your password was changed",
    sender: "GitHub Security",
    senderEmail: "noreply@github.com",
    category: "Other",
    priority: "important",
    summary: "Password changed from new device (Chrome, macOS). If not you, reset immediately.",
    timestamp: "2026-03-10T02:10:00",
  },
];

export const categories: Category[] = ["Job", "School", "Orders / Travel", "Ads / Subscriptions", "Other"];

export function getEmailsByCategory(category: Category): Email[] {
  return mockEmails.filter(e => e.category === category);
}

export function getDailySummary() {
  const urgent = mockEmails.filter(e => e.priority === "urgent").length;
  const important = mockEmails.filter(e => e.priority === "important").length;
  const total = mockEmails.length;
  return { urgent, important, total, date: "March 10, 2026" };
}
