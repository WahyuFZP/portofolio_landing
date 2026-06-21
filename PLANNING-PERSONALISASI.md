# 🚀 Personalisasi Portfolio — Rencana Perubahan

> Planning ini mencakup **semua file & aset** yang perlu diubah untuk mengganti identitas,
> foto, proyek, dan CV dari pemilik asli (Deft Valian Exanova) ke data milikmu sendiri.

---

## 📋 1. DATA DIRI (Nama, Nickname, Gelar)

| # | File | Yang Perlu Diubah | Keterangan |
|---|------|-------------------|------------|
| 1.1 | `dictionaries/en.json` | `about.name: "DEFT VALIAN"` → Nama kamu | Nama di About section (English) |
| 1.2 | `dictionaries/id.json` | `about.name: "DEFT VALIAN"` → Nama kamu | Nama di About section (Indonesia) |
| 1.3 | `dictionaries/en.json` | `about.role: "FULLSTACK DEVELOPER"` → Role kamu | (Opsional) Role di About |
| 1.4 | `dictionaries/id.json` | `about.role: "FULLSTACK DEVELOPER"` → Role kamu | (Opsional) Role di About |
| 1.5 | `dictionaries/en.json` | `about.bio` → Bio kamu | Bio panjang di About (EN) |
| 1.6 | `dictionaries/id.json` | `about.bio` → Bio kamu | Bio panjang di About (ID) |
| 1.7 | `dictionaries/en.json` | `hero.role: "Fullstack Developer"` → Role kamu | Hero subtitle (EN) |
| 1.8 | `dictionaries/id.json` | `hero.role: "Fullstack Developer"` → Role kamu | Hero subtitle (ID) |
| 1.9 | `dictionaries/en.json` | `hero.tagline` → Tagline kamu | Hero deskripsi (EN) |
| 1.10 | `dictionaries/id.json` | `hero.tagline` → Tagline kamu | Hero deskripsi (ID) |
| 1.11 | `components/Hero.tsx` (line 42) | `Wahyu Fikkri Zeni Putra` → Nama kamu | Nama besar di Hero h1 |
| 1.12 | `components/Hero.tsx` (line 106) | `alt="Deft Valian"` → Nama kamu | Alt text foto hero |
| 1.13 | `components/Hero.tsx` (line 114) | `Deft Valian` + `Exanova` → Nama + Nickname kamu | Teks di kartu profil kanan |
| 1.14 | `components/Hero.tsx` (line 115) | `Fullstack Developer` → Role kamu | Role di kartu profil |
| 1.15 | `components/Hero.tsx` (line 127) | `@dftvln` → Username/IG kamu | Username di badge bawah kartu |
| 1.16 | `components/Navbar.tsx` (line 88) | `DV.` → Inisial kamu | Logo navbar (kiri atas) |

---

## 🔗 2. SOCIAL MEDIA & KONTAK

| # | File | Yang Perlu Diubah | Keterangan |
|---|------|-------------------|------------|
| 2.1 | `components/Hero.tsx` (line 50) | `https://github.com/exvade` → GitHub kamu | Link GitHub |
| 2.2 | `components/Hero.tsx` (line 53) | `https://instagram.com/dftvln` → IG kamu | Link Instagram |
| 2.3 | `components/Hero.tsx` (line 56) | `https://linkedin.com/in/deftvalian` → LinkedIn kamu | Link LinkedIn |
| 2.4 | `components/Contact.tsx` (line 88-89) | `deftvalian2411@gmail.com` → Email kamu | Email di Contact section |
| 2.5 | `components/Contact.tsx` (line 117) | `Bekasi, Indonesia` → Lokasi kamu | Lokasi di Contact section |

---

## 🖼️ 3. FOTO & ASET VISUAL

| # | File | Yang Perlu Diubah | Keterangan |
|---|------|-------------------|------------|
| 3.1 | `public/images/hero.webp` | Ganti dengan foto kamu | Foto utama di Hero (kanan) |
| 3.2 | `public/images/hero2.webp` | Ganti dengan foto profil kecil kamu | Foto di badge bawah kartu Hero |
| 3.3 | `public/images/about.jpg` | Ganti dengan foto kamu | Foto di About section (kiri) |
| 3.4 | `public/images/certificate/*.webp` | Ganti dengan gambar sertifikat kamu | 6 file: `freecodecamp.webp`, `uiux.webp`, `bootstrap.webp`, `react.webp`, `webdev.webp`, `frontend.webp` |
| 3.5 | `components/Certificates.tsx` (line 13-18) | Update `alt` text & path gambar jika beda nama file | Alt text dan path sertifikat |
| 3.6 | `public/images/projects/*.webp` | Ganti screenshot proyek kamu | `Absen.webp`, `Tivity.webp`, `PassKeeper.webp`, `KoperGrosir.webp` |

---

## 📄 4. CV (Curriculum Vitae)

| # | File | Yang Perlu Diubah | Keterangan |
|---|------|-------------------|------------|
| 4.1 | `public/CV-DeftValianExanova.pdf` | **Hapus** file ini, **tambahkan** CV kamu | File PDF CV |
| 4.2 | `components/About.tsx` (line 78) | `href="/CV-DeftValianExanova.pdf"` → CV kamu | Link download CV |
| 4.3 | `components/About.tsx` (line 79) | `download="CV-DeftValianExanova.pdf"` → Nama file CV kamu | Atribut download (nama file saat diunduh) |
| 4.4 | `middleware.ts` (line 45) | `CV-DeftValianExanova.pdf` → Nama file CV kamu | Pengecualian middleware (agar CV bisa diakses langsung) |

---

## 📁 5. PROYEK (MDX Content)

> ⚠️ **PENTING**: Proyek disimpan dalam file MDX terpisah per bahasa.
> Setiap proyek punya versi **English** (`content/en/`) dan **Indonesia** (`content/id/`).

### 5.1 Proyek Absensi

| # | File | Yang Perlu Diubah |
|---|------|-------------------|
| 5.1a | `content/en/absensi.mdx` | `title`, `description`, `image`, `tags`, `link`, `github` |
| 5.1b | `content/id/absensi.mdx` | `title`, `description`, `image`, `tags`, `link`, `github` |

### 5.2 Proyek Tivity

| # | File | Yang Perlu Diubah |
|---|------|-------------------|
| 5.2a | `content/en/tivity.mdx` | `title`, `description`, `image`, `tags`, `link`, `github` |
| 5.2b | `content/id/tivity.mdx` | `title`, `description`, `image`, `tags`, `link`, `github` |

### 5.3 Proyek PassKeeper

| # | File | Yang Perlu Diubah |
|---|------|-------------------|
| 5.3a | `content/en/passkeeper.mdx` | `title`, `description`, `image`, `tags`, `link`, `github` (⚠️ link GitHub mengarah ke `github.com/Exvade`) |
| 5.3b | `content/id/passkeeper.mdx` | `title`, `description`, `image`, `tags`, `link`, `github` (⚠️ link GitHub mengarah ke `github.com/Exvade`) |

### 5.4 Proyek KoperGrosir

| # | File | Yang Perlu Diubah |
|---|------|-------------------|
| 5.4a | `content/en/kopergrosir.mdx` | `title`, `description`, `image`, `tags`, `link`, `github` |
| 5.4b | `content/id/kopergrosir.mdx` | `title`, `description`, `image`, `tags`, `link`, `github` |

> 💡 **Tips**: Kamu bisa menambah proyek baru atau menghapus yang tidak relevan.
> Format MDX: frontmatter YAML di antara `---`, lalu konten deskripsi Markdown di bawahnya.

---

## 💼 6. PENGALAMAN KERJA (Experience)

| # | File | Yang Perlu Diubah | Keterangan |
|---|------|-------------------|------------|
| 6.1 | `dictionaries/en.json` → `experience.list` | Ganti seluruh array pengalaman kerja | 2 objek: PT Advics + Vocasia → Pengalaman kamu |
| 6.2 | `dictionaries/id.json` → `experience.list` | Ganti seluruh array pengalaman kerja | Versi bahasa Indonesia |

Setiap item experience punya struktur:
```json
{
  "company": "Nama Perusahaan",
  "role": "Jabatan",
  "period": "Periode (contoh: Jan 2025 - Jun 2025)",
  "location": "Lokasi",
  "description": ["Poin 1", "Poin 2", ...],
  "technologies": ["Tech1", "Tech2", ...]
}
```

---

## 🛠️ 7. SKILLS (Keahlian)

| # | File | Yang Perlu Diubah | Keterangan |
|---|------|-------------------|------------|
| 7.1 | `components/Skills.tsx` (line 11-15) | Array `topRowSkills` → Skill kamu | Baris atas (5 skill) |
| 7.2 | `components/Skills.tsx` (line 18-24) | Array `bottomRowSkills` → Skill kamu | Baris bawah (5 skill) |

Icon diambil dari CDN `devicon`. Cari nama icon kamu di: https://devicon.dev

---

## 🌐 8. SEO & METADATA

| # | File | Yang Perlu Diubah | Keterangan |
|---|------|-------------------|------------|
| 8.1 | `app/[locale]/layout.tsx` (line 14) | `https://deftvalian.vercel.app` → Domain kamu | `metadataBase` URL |
| 8.2 | `app/[locale]/layout.tsx` (line 16) | `Deft Valian Exanova \| Fullstack Developer` → Nama + Role kamu | Title default |
| 8.3 | `app/[locale]/layout.tsx` (line 17) | `%s \| Deft Valian Exanova` → Nama kamu | Title template |
| 8.4 | `app/[locale]/layout.tsx` (line 19-20) | Deskripsi → Deskripsi kamu | Meta description |
| 8.5 | `app/[locale]/layout.tsx` (line 22-25) | OG title, description, siteName | Open Graph tags |
| 8.6 | `app/[locale]/layout.tsx` (line 28-34) | OG image alt text | OG image metadata |
| 8.7 | `app/[locale]/layout.tsx` (line 38-42) | Twitter card title & description | Twitter card |

---

## 🎨 9. KONTAK FORM (Formspree)

| # | File | Yang Perlu Diubah | Keterangan |
|---|------|-------------------|------------|
| 9.1 | `components/Contact.tsx` (line 34) | `https://formspree.io/f/xojbeear` → Endpoint Formspree kamu | **BUAT akun di [formspree.io](https://formspree.io)**, dapatkan form ID baru |

---

## 📝 10. RINGKASAN CHECKLIST CEPAT

### ✅ Checklist Utama

- [ ] **Nama** — Ganti di 16+ tempat (dictionaries, Hero, Navbar, layout metadata)
- [ ] **Foto** — Ganti 3 foto utama + 6 sertifikat + 4 screenshot proyek
- [ ] **CV PDF** — Hapus CV lama, tambahkan CV baru, update link di About & middleware
- [ ] **Social Links** — GitHub, Instagram, LinkedIn di Hero
- [ ] **Email & Lokasi** — Di Contact section
- [ ] **Proyek** — 4 file MDX (EN) + 4 file MDX (ID) = 8 file
- [ ] **Experience** — 2 objek di dictionaries (EN & ID)
- [ ] **Skills** — 10 skill icon di Skills.tsx
- [ ] **SEO Metadata** — layout.tsx (7 item)
- [ ] **Formspree** — Ganti endpoint form di Contact.tsx

---

## 🔢 Total Estimasi File yang Disentuh

| Kategori | Jumlah File |
|----------|-------------|
| Dictionaries (EN + ID) | 2 |
| Components | 5 (Hero, About, Navbar, Contact, Skills) |
| MDX Content | 8 (4 proyek × 2 bahasa) |
| Layout / Middleware | 2 (layout.tsx, middleware.ts) |
| Aset (Foto, CV, Screenshot) | ~15 file |
| **Total** | **~32 file** |

---

> 💬 **Saran**: Kerjakan per kategori dari atas ke bawah. Mulai dari
> dictionaries (JSON) dulu karena itu sumber data utama, lalu components,
> lalu aset visual, terakhir SEO & form.

---

*Planning ini dibuat otomatis berdasarkan analisis seluruh kode project.*
*Update terakhir: 2026-06-21*
