// From LinkedIn "Licenses & certifications", newest first (fetched 2026-11-15).
export interface Certificate {
  name: string;
  issuer: string;
  date: string; // YYYY-MM
  credentialId?: string;
  verifyUrl?: string;
}

export const certificates: Certificate[] = [
  {
    name: "Certified Cybersecurity Educator Professional (CCEP)",
    issuer: "Red Team Leaders",
    date: "2026-10",
    credentialId: "e4671723cfd7eade",
  },
  {
    name: "Basic Cybersecurity",
    issuer: "CODEPOLITAN",
    date: "2026-07",
    credentialId: "CPJS-CR/2026/VII/0671",
  },
  {
    name: "Belajar Dasar Pemrograman JavaScript",
    issuer: "Dicoding Indonesia",
    date: "2026-07",
    credentialId: "QLZ99MG99Z5D",
    verifyUrl: "https://www.dicoding.com/certificates/QLZ99MG99Z5D",
  },
  {
    name: "Belajar Dasar Pemrograman Web",
    issuer: "Dicoding Indonesia",
    date: "2026-07",
    credentialId: "4EXG1DGY1PRL",
    verifyUrl: "https://www.dicoding.com/certificates/4EXG1DGY1PRL",
  },
  {
    name: "Belajar Membuat Front-End Web untuk Pemula",
    issuer: "Dicoding Indonesia",
    date: "2024-11",
    credentialId: "QLZ9VGODDX5D",
    verifyUrl: "https://www.dicoding.com/certificates/QLZ9VGODDX5D",
  },
  {
    name: "Member Resmi IMPHNEN",
    issuer: "IMPHNEN",
    date: "2026-11",
    credentialId: "@pekree",
  },
];
