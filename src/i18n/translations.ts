export type Lang = "en" | "zh";

const translations = {
  // Sidebar
  "sidebar.brand": { en: "Triage", zh: "邮件助手" },
  "sidebar.inbox": { en: "Inbox", zh: "收件箱" },
  "sidebar.system": { en: "System", zh: "系统" },
  "sidebar.dashboard": { en: "Dashboard", zh: "仪表盘" },
  "sidebar.allEmails": { en: "All Emails", zh: "所有邮件" },
  "sidebar.jobs": { en: "Jobs", zh: "求职" },
  "sidebar.school": { en: "School", zh: "学校" },
  "sidebar.orders": { en: "Orders", zh: "订单" },
  "sidebar.ads": { en: "Ads", zh: "广告" },
  "sidebar.settings": { en: "Settings", zh: "设置" },
  "sidebar.sub.Interview": { en: "Interview", zh: "面试" },
  "sidebar.sub.Application": { en: "Application", zh: "网申" },
  "sidebar.sub.OA": { en: "OA / Assessment", zh: "OA / Assessment" },
  "sidebar.sub.Offer": { en: "Offer", zh: "Offer" },
  "sidebar.sub.Rejection": { en: "Rejection", zh: "Rejection" },
  "sidebar.sub.Recruiter": { en: "Recruiter", zh: "Recruiter" },
  "sidebar.sub.Course": { en: "Course", zh: "课程通知" },
  "sidebar.sub.Deadline": { en: "Assignment / Deadline", zh: "作业 / Deadline" },
  "sidebar.sub.Exam": { en: "Exam", zh: "Exam" },
  "sidebar.sub.Events": { en: "Events", zh: "活动" },
  "sidebar.sub.Ecommerce": { en: "Ecommerce", zh: "电商" },
  "sidebar.sub.Travel": { en: "Travel", zh: "机票酒店" },
  "sidebar.sub.Bills": { en: "Bills", zh: "账单" },
  "sidebar.sub.Refund": { en: "Refund", zh: "退款" },
  "sidebar.sub.Newsletter": { en: "Newsletter", zh: "Newsletter" },
  "sidebar.sub.Promotion": { en: "Promotion", zh: "Promotion" },
  "sidebar.sub.Banking": { en: "Banking", zh: "银行" },
  "sidebar.sub.Social": { en: "Social", zh: "社交" },
  "sidebar.sub.Uncategorized": { en: "Uncategorized", zh: "未分类" },

  // Dashboard
  "dashboard.dailySummary": { en: "Daily Summary", zh: "每日摘要" },
  "dashboard.urgent": { en: "Urgent", zh: "紧急" },
  "dashboard.important": { en: "Important", zh: "重要" },
  "dashboard.normal": { en: "Normal", zh: "普通" },
  "dashboard.ignored": { en: "Ignored", zh: "已忽略" },
  "dashboard.todaysBrief": { en: "Today's Brief", zh: "今日简报" },
  "dashboard.needsAttention": { en: "Needs Attention", zh: "需要关注" },
  "dashboard.viewAll": { en: "View all", zh: "查看全部" },
  "dashboard.briefInterview": { en: "Interview at TechCorp scheduled for March 12, 10:00 AM PST.", zh: "TechCorp 面试安排在 3 月 12 日上午 10:00（太平洋时间）。" },
  "dashboard.briefProject": { en: "CS 401 final project due tonight at 11:59 PM.", zh: "CS 401 期末项目今晚 11:59 PM 截止。" },
  "dashboard.briefGithub": { en: "GitHub password change detected — verify if authorized.", zh: "检测到 GitHub 密码更改 — 请确认是否为本人操作。" },
  "dashboard.briefFlight": { en: "Flight to Tokyo confirmed for March 25.", zh: "3 月 25 日飞往东京的航班已确认。" },
  "dashboard.briefExams": { en: "Midterm exams begin March 17.", zh: "期中考试于 3 月 17 日开始。" },
  "dashboard.connectPrompt": { en: "Connect Outlook or NetEase in Settings to see your inbox.", zh: "在设置中连接 Outlook 或网易邮箱以查看收件箱。" },
  "dashboard.goToSettings": { en: "Go to Settings", zh: "前往设置" },
  "dashboard.noEmails": { en: "No emails", zh: "暂无邮件" },
  "dashboard.connectToSee": { en: "Connect Outlook or NetEase in Settings to see emails.", zh: "在设置中连接 Outlook 或网易邮箱以查看邮件。" },

  // Priority
  "priority.urgent": { en: "Urgent", zh: "紧急" },
  "priority.important": { en: "Important", zh: "重要" },
  "priority.normal": { en: "Normal", zh: "普通" },
  "priority.ignore": { en: "Ignore", zh: "忽略" },

  // Email List
  "emailList.inbox": { en: "Inbox", zh: "收件箱" },
  "emailList.allEmails": { en: "All Emails", zh: "所有邮件" },
  "emailList.emails": { en: "emails", zh: "封邮件" },
  "emailList.email": { en: "email", zh: "封邮件" },
  "emailList.time": { en: "Time", zh: "时间" },
  "emailList.subjectSender": { en: "Subject / Sender", zh: "主题 / 发件人" },
  "emailList.category": { en: "Category", zh: "分类" },
  "emailList.priority": { en: "Priority", zh: "优先级" },
  "emailList.actions": { en: "Actions", zh: "操作" },
  "emailList.none": { en: "None.", zh: "无。" },
  "emailList.translate": { en: "Translate", zh: "翻译" },
  "emailList.reply": { en: "Reply", zh: "回复" },

  // Categories
  "category.Job": { en: "Job", zh: "求职" },
  "category.School": { en: "School", zh: "学校" },
  "category.Orders / Travel": { en: "Orders / Travel", zh: "订单 / 出行" },
  "category.Ads / Subscriptions": { en: "Ads / Subscriptions", zh: "广告 / 订阅" },
  "category.Other": { en: "Other", zh: "其他" },

  // Settings
  "settings.configuration": { en: "Configuration", zh: "配置" },
  "settings.title": { en: "Settings", zh: "设置" },
  "settings.resume": { en: "Resume", zh: "简历" },
  "settings.resumeDesc": { en: "Upload your resume to enable AI-powered job matching. PDF or DOCX accepted.", zh: "上传您的简历以启用 AI 职位匹配功能。支持 PDF 或 DOCX 格式。" },
  "settings.uploadPrompt": { en: "Click to upload or drag file here", zh: "点击上传或拖拽文件至此" },
  "settings.jobPreferences": { en: "Job Preferences", zh: "求职偏好" },
  "settings.targetRoles": { en: "Target Roles", zh: "目标职位" },
  "settings.preferredLocations": { en: "Preferred Locations", zh: "首选地点" },
  "settings.minimumSalary": { en: "Minimum Salary", zh: "最低薪资" },
  "settings.keywords": { en: "Keywords", zh: "关键词" },
  "settings.schoolPreferences": { en: "School Email Preferences", zh: "学校邮件偏好" },
  "settings.institution": { en: "Institution", zh: "学校名称" },
  "settings.emailDomain": { en: "Email Domain", zh: "邮箱域名" },
  "settings.trackDeadlines": { en: "Track Deadlines", zh: "跟踪截止日期" },
  "settings.trackExams": { en: "Track Exams", zh: "跟踪考试" },
  "settings.trackEvents": { en: "Track Events", zh: "跟踪活动" },
  "settings.save": { en: "Save Preferences", zh: "保存设置" },
  "settings.outlook": { en: "Outlook", zh: "Outlook" },
  "settings.outlookDesc": {
    en: "Connect your Outlook account to let the assistant read your Microsoft 365 mailboxes. This is read-only for now.",
    zh: "连接您的 Outlook 帐号以便助手读取您的 Microsoft 365 邮箱。目前仅为只读访问。"
  },
  "settings.connectOutlook": { en: "Connect Outlook", zh: "连接 Outlook" },
  "settings.outlookMissingEnv": {
    en: "Outlook connection is not configured yet. Please set VITE_MS_CLIENT_ID and VITE_MS_TENANT_ID in your .env file.",
    zh: "Outlook 连接尚未配置。请在 .env 中设置 VITE_MS_CLIENT_ID 和 VITE_MS_TENANT_ID。"
  },
  "settings.disconnectOutlook": { en: "Disconnect Outlook", zh: "断开 Outlook" },
  "settings.netease": { en: "NetEase Email", zh: "网易邮箱" },
  "settings.neteaseDesc": {
    en: "Connect NetEase email (163 / 126) to load messages. Accounts are managed independently from Outlook.",
    zh: "连接网易邮箱（163 / 126）以加载邮件。与 Outlook 账户独立管理。"
  },
  "settings.connectNetease": { en: "Connect NetEase", zh: "连接网易邮箱" },
  "settings.disconnectNetease": { en: "Disconnect NetEase", zh: "断开网易邮箱" },
  "settings.neteaseEmail": { en: "Email address", zh: "邮箱地址" },
  "settings.neteaseAppPassword": { en: "Authorization code / App password", zh: "授权码 / 应用密码" },
  "settings.neteaseProvider": { en: "Provider", zh: "邮箱类型" },

  // EmailRow hover actions
  "action.translate": { en: "Translate", zh: "翻译" },
  "action.summarize": { en: "Summarize", zh: "摘要" },
  "action.draftReply": { en: "Draft Reply", zh: "起草回复" },

  // OrderDetail
  "order.date": { en: "Date", zh: "日期" },
  "order.location": { en: "Location", zh: "地点" },
  "order.orderNo": { en: "Order No.", zh: "订单号" },
  "order.qrCode": { en: "QR Code", zh: "二维码" },

  // DailySummary
  "dailySummary.title": { en: "Daily Summary", zh: "每日摘要" },
  "dailySummary.urgentCount": { en: "urgent", zh: "紧急" },
  "dailySummary.importantCount": { en: "important", zh: "重要" },
  "dailySummary.totalEmails": { en: "total emails today", zh: "封邮件" },
  "dailySummary.briefText": {
    en: "You have an interview at TechCorp tomorrow and a CS 401 project due tonight. A GitHub password change was flagged.",
    zh: "您明天有 TechCorp 的面试，今晚 CS 401 项目截止。GitHub 密码变更已标记。"
  },

  // Language
  "lang.toggle": { en: "中文", zh: "EN" },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: Lang): string {
  return translations[key]?.[lang] ?? key;
}

export default translations;
