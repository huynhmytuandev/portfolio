// Single source of truth for portfolio content. Copy follows the
// "Portfolio v3 — TuanOS" design; markup should read from here.
import type { ImageMetadata } from 'astro';

import avatar from '../assets/avatar.png';
import feliAi from '../assets/felicash/ai_transaction_record.png';
import feliDashboard from '../assets/felicash/dashboard_screen.png';
import feliTransactions from '../assets/felicash/transaction_list_screen.png';
import type { YearMonth } from '../lib/time.ts';

export { resumePath, resumeUrl } from './resume.ts';

export const profile = {
  name: 'Huynh My Tuan',
  shortName: 'Tuan',
  role: 'Mobile Developer',
  location: 'Ho Chi Minh City',
  tagline: 'I build Flutter apps people rely on every day.',
  intro: '4+ years shipping Flutter & .NET apps to production, from government platforms to open-source packages.',
  bio: 'I like the hard parts of mobile: offline sync, real-time chat and app security. I also publish Flutter packages on pub.dev.',
  pitch: 'Have a project, a role, or a question about Flutter? Email is the fastest way to reach me.',
  avatar: avatar as ImageMetadata,
  avatarAlt: 'Portrait of Huynh My Tuan',
};

export const contact = {
  email: 'huynhmytuan.dev@gmail.com',
  phoneDisplay: '(+84) 355 156 468',
  phoneHref: 'tel:+84355156468',
  githubUser: 'huynhmytuandev',
  githubUrl: 'https://github.com/huynhmytuandev',
  pubDevName: 'huynhmytuan.dev',
  pubDevUrl: 'https://pub.dev/publishers/huynhmytuan.dev/packages',
  siteUrl: 'https://huynhmytuan.dev',
};

export const mailto = (subject?: string) =>
  `mailto:${contact.email}${subject ? `?subject=${encodeURIComponent(subject)}` : ''}`;

/** "Find me" rows in the contact card. Rows with `href` are links. */
export const findMe: { icon: string; key: string; value: string; href?: string; action?: string; external?: boolean }[] = [
  { icon: 'github', key: 'GitHub', value: contact.githubUser, href: contact.githubUrl, action: 'arrow-up-right', external: true },
  { icon: 'package', key: 'pub.dev', value: contact.pubDevName, href: contact.pubDevUrl, action: 'arrow-up-right', external: true },
  { icon: 'phone', key: 'Phone', value: contact.phoneDisplay, href: contact.phoneHref, action: 'phone' },
  { icon: 'globe', key: 'Time zone', value: 'GMT+7 (Vietnam)' },
  { icon: 'graduation-cap', key: 'Education', value: 'B.Sc. Software Engineering, UEF · GPA 3.72' },
  { icon: 'languages', key: 'Languages', value: 'Vietnamese, English (TOEIC 730)' },
];

export interface Skill {
  title: string;
  subtitle: string;
  icon: string;
}

export const skills: Skill[] = [
  { title: 'Flutter · Dart', subtitle: 'Unit & widget tests', icon: 'smartphone' },
  { title: 'Bloc · Riverpod', subtitle: 'GetX · Provider · Clean Arch', icon: 'component' },
  { title: '.NET · C#', subtitle: 'Entity Framework · SignalR', icon: 'server' },
  { title: 'SQL Server · Supabase', subtitle: 'PowerSync offline sync', icon: 'database' },
  { title: 'OAuth2 · SSO', subtitle: 'Secure sign-in flows', icon: 'key-round' },
  { title: 'App hardening', subtitle: 'Encryption · root & capture block', icon: 'shield-check' },
  { title: 'AWS · Firebase', subtitle: 'Lambda · RDS', icon: 'cloud' },
  { title: 'Tooling', subtitle: 'GitLab CI/CD · Figma · Postman', icon: 'git-branch' },
];

export const projects = {
  felicash: {
    name: 'FeliCash',
    meta: 'SIDE PROJECT · OPEN SOURCE · MIT',
    description:
      'An AI money tracker. Type or say what you spent, and it files the transaction in the right wallet and currency.',
    prompt: '“Yesterday at 7 AM I spent $10 on a hamburger”',
    stack: ['Flutter', 'BLoC', 'Supabase', 'PowerSync', 'n8n + LLM'],
    url: 'https://github.com/quimblelabs/felicash-app',
    screens: [
      { src: feliDashboard as ImageMetadata, alt: 'FeliCash dashboard showing wallet balances and a spending chart' },
      { src: feliAi as ImageMetadata, alt: 'FeliCash AI assistant turning a typed sentence into a transaction' },
      { src: feliTransactions as ImageMetadata, alt: 'FeliCash transaction list grouped by day' },
    ],
  },
  govApps: {
    name: 'HCMC Gov Apps',
    meta: '2022 — 2026 · VIETINFO · UNDER NDA',
    description:
      "Internal apps for Ho Chi Minh City's departments. They're under NDA, so I can't show screens here.",
    stats: [
      // The mobile design keeps the longer labels.
      { value: 10, suffix: '+', label: 'apps on the App Store & Google Play', labelMobile: 'apps shipped to the App Store & Google Play' },
      { value: 10_000, suffix: '+', label: 'civil servants use them every day', labelMobile: 'civil servants using them every day' },
    ],
    /** Shown on mobile only, as in the mobile design. */
    note: "Screens are private, so I can't show them here. Happy to walk you through how they're built.",
    cta: 'Ask me for a walkthrough',
    ctaSubject: 'HCMC Gov Apps walkthrough',
  },
  quickAction: {
    name: 'QuickAction',
    meta: '2026 · OPEN SOURCE · PUB.DEV',
    description:
      'Telegram/WeChat-style context menus for Flutter: the anchor flies up, the menu sticks, the backdrop blurs. Runs on Android, iOS, web and desktop.',
    url: 'https://pub.dev/packages/quick_action_menu',
    urlLabel: 'quick_action_menu on pub.dev',
    urlLabelMobile: 'pub.dev/packages/quick_action_menu',
  },
};

export interface Job {
  company: string;
  title: string;
  start: YearMonth;
  /** Omit for the current job. */
  end?: YearMonth;
  description: string;
  awards?: string[];
}

export const jobs: Job[] = [
  {
    company: 'Buildpal',
    title: 'Mobile Developer',
    start: '2026-03',
    description: 'Joined a startup making something great for builders.',
  },
  {
    company: 'VietInfo',
    title: 'Senior Mobile Developer',
    start: '2022-09',
    end: '2026-02',
    description:
      'Led the Digital Governance apps for Ho Chi Minh City: shared Flutter SDKs, security hardening and real-time chat.',
    awards: ['Employee of the Month & of the Year · 2023', 'Employee of the Year · 2025'],
  },
  {
    company: 'Aduro Labs VN',
    title: 'Network Operator',
    start: '2021-01',
    end: '2022-08',
    description: 'First job in tech.',
  },
];
