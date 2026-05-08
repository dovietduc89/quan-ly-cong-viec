# PLANNING.md - Task Manager Pro

## 1. Tổng quan dự án

**Mục tiêu:** Xây dựng web app quản lý công việc cá nhân kết hợp công việc cơ quan, chạy 24/7 trên cloud hoàn toàn miễn phí.

**Người dùng:** Chỉ 1 người (single user) - Duc Do

---

## 2. Tech Stack

| Thành phần | Công nghệ | Lý do chọn |
|---|---|---|
| **Frontend** | Next.js 14 (App Router) | Stable, đã battle-tested, deploy free trên Vercel |
| **UI Library** | Tailwind CSS 3 + shadcn/ui | Giao diện hiện đại, stable, ecosystem lớn |
| **Backend** | Next.js API Routes (Route Handlers) | Không cần server riêng, chạy serverless trên Vercel |
| **Database** | Neon PostgreSQL | Free tier 0.5GB, không auto-pause, always-on |
| **Auth** | NextAuth.js v5 (Google OAuth) | Lightweight, email whitelist server-side, không phụ thuộc DB provider |
| **Cron Jobs** | Vercel Cron | Free tier hỗ trợ cron, dùng cho nhắc nhở deadline |
| **Notifications** | Email (Resend free tier) + Browser Push | Nhắc nhở không cần mở app |
| **Hosting** | Vercel | Free tier đủ dùng cho single user, uptime 24/7 |
| **Language** | TypeScript | Type safety, giảm bug |

### Tại sao chọn stack này?

- **Hoàn toàn miễn phí:** Tất cả dịch vụ đều có free tier đủ cho single user
- **Không cần server:** Serverless = không lo quản lý, tự scale, chạy 24/7
- **Stable & battle-tested:** Next.js 14 + Tailwind 3 đã ổn định, tài liệu và community support lớn
- **Dễ maintain:** 1 repo duy nhất, deploy tự động qua Git push
- **Database always-on:** Neon không auto-pause trên free tier, Supabase free thì pause sau 7 ngày

### Tại sao Neon thay vì Supabase?

| Tiêu chí | Supabase Free | Neon Free |
|---|---|---|
| Auto-pause | Pause sau 7 ngày không dùng | Không pause (compute suspend nhưng wake on connect ~0.5s) |
| Storage | 500MB | 0.5GB |
| Branching | Không | Có (dev/staging branches) |
| Phù hợp 24/7 | Cần workaround (cron ping) | Sẵn sàng, không cần hack |

### Tại sao NextAuth thay vì Supabase Auth?

- **Tách biệt auth khỏi DB provider:** Đổi database không ảnh hưởng auth
- **Email whitelist server-side:** Check `ALLOWED_EMAIL` trong `authorize` callback, không lộ ra client
- **Nhẹ hơn:** Không cần Supabase SDK cho auth, chỉ cần `next-auth`

### Free Tier Limits (đủ dùng)

| Dịch vụ | Giới hạn Free |
|---|---|
| Vercel | 100GB bandwidth/tháng, serverless functions |
| Neon | 0.5GB storage, 190h compute/tháng (auto-suspend khi idle, wake on connect) |
| Resend | 100 emails/ngày |

---

## 3. Tính năng chi tiết

### 3.1. Quản lý Task (Core)

- **Tạo task** với các trường:
  - Tiêu đề (bắt buộc)
  - Mô tả (tùy chọn, hỗ trợ markdown)
  - Phân loại: `Cơ quan` hoặc `Cá nhân`
  - Ưu tiên: `Cao` (đỏ), `Vừa` (vàng), `Thấp` (xanh)
  - Deadline (ngày + giờ)
  - Trạng thái: `Todo` → `Đang làm` → `Hoàn thành`
- **Sửa task** inline hoặc modal
- **Xóa task** (soft delete, có thể khôi phục)
- **Đánh dấu hoàn thành** bằng 1 click
- **Kéo thả** để thay đổi trạng thái (Kanban board)

### 3.2. Bộ lọc & Tìm kiếm

- Lọc theo phân loại (Cơ quan / Cá nhân / Tất cả)
- Lọc theo ưu tiên
- Lọc theo trạng thái
- Lọc theo deadline (Hôm nay / Tuần này / Quá hạn)
- Tìm kiếm theo tiêu đề

### 3.3. Chế độ xem

- **Kanban Board:** 3 cột Todo / Đang làm / Hoàn thành (mặc định)
- **List View:** Dạng bảng, sort theo deadline/ưu tiên
- **Calendar View:** Xem task theo lịch tháng/tuần

### 3.4. Dashboard

- Tổng quan số task theo trạng thái
- Task quá hạn (highlight đỏ)
- Task sắp đến hạn (trong 3 ngày)
- Thống kê hoàn thành tuần/tháng (biểu đồ đơn giản)

### 3.5. Nhắc nhở (Reminders)

- **Email nhắc nhở** trước deadline 1 ngày và 1 giờ (qua Resend)
- **Browser push notification** khi đang mở app
- **Daily digest email** mỗi sáng 7h: tóm tắt task hôm nay
- Cron job chạy mỗi giờ kiểm tra deadline sắp tới

### 3.6. Auth (NextAuth.js)

- Đăng nhập bằng Google OAuth (nhanh, không cần nhớ password)
- Email whitelist **server-side only**: `ALLOWED_EMAIL` env var, check trong NextAuth `signIn` callback
- Nếu email không khớp → reject đăng nhập, redirect về trang login với thông báo lỗi
- Session JWT (không cần database session table)
- Middleware bảo vệ tất cả routes trừ `/login` và `/api/cron/*`

---

## 4. Database Schema (Drizzle ORM)

Dùng Drizzle ORM để define schema trong TypeScript, tự generate SQL migration.

```typescript
// src/lib/db/schema.ts
import { pgTable, uuid, text, timestamp, boolean } from "drizzle-orm/pg-core";

export const tasks = pgTable("tasks", {
  id: uuid("id").defaultRandom().primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  category: text("category", { enum: ["work", "personal"] }).notNull(),
  priority: text("priority", { enum: ["high", "medium", "low"] }).notNull().default("medium"),
  status: text("status", { enum: ["todo", "in_progress", "done"] }).notNull().default("todo"),
  deadline: timestamp("deadline", { withTimezone: true }),
  reminderSent: boolean("reminder_sent").default(false),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow(),
  completedAt: timestamp("completed_at", { withTimezone: true }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
});
```

**Lưu ý:** Không cần `user_id` vì app chỉ có 1 user (auth qua NextAuth whitelist).
Nếu sau này muốn multi-user, thêm `userId` column + foreign key.

### SQL tương đương (auto-generated bởi Drizzle)

```sql
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'todo',
  deadline TIMESTAMPTZ,
  reminder_sent BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_tasks_status ON tasks(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_deadline ON tasks(deadline) WHERE deleted_at IS NULL;
CREATE INDEX idx_tasks_category ON tasks(category) WHERE deleted_at IS NULL;
```

---

## 5. Cấu trúc thư mục

```
/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── layout.tsx            # Root layout (font, theme, providers)
│   │   ├── page.tsx              # Landing / redirect to dashboard
│   │   ├── login/
│   │   │   └── page.tsx          # Trang đăng nhập
│   │   ├── dashboard/
│   │   │   └── page.tsx          # Dashboard chính
│   │   ├── tasks/
│   │   │   ├── page.tsx          # Kanban board (default view)
│   │   │   ├── list/
│   │   │   │   └── page.tsx      # List view
│   │   │   └── calendar/
│   │   │       └── page.tsx      # Calendar view
│   │   └── api/
│   │       ├── tasks/
│   │       │   └── route.ts      # CRUD API cho tasks
│   │       ├── cron/
│   │       │   └── reminder/
│   │       │       └── route.ts  # Cron job gửi nhắc nhở
│   │       └── auth/
│   │           └── callback/
│   │               └── route.ts  # OAuth callback
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── task-card.tsx         # Card hiển thị 1 task
│   │   ├── task-form.tsx         # Form tạo/sửa task
│   │   ├── kanban-board.tsx      # Kanban board
│   │   ├── task-list.tsx         # List view
│   │   ├── task-calendar.tsx     # Calendar view
│   │   ├── task-filters.tsx      # Bộ lọc
│   │   ├── dashboard-stats.tsx   # Thống kê dashboard
│   │   ├── navbar.tsx            # Navigation bar
│   │   └── sidebar.tsx           # Sidebar
│   ├── lib/
│   │   ├── db/
│   │   │   ├── index.ts          # Drizzle client (Neon connection)
│   │   │   └── schema.ts         # Drizzle schema definition
│   │   ├── auth.ts               # NextAuth config (Google OAuth + whitelist)
│   │   ├── types.ts              # TypeScript types
│   │   └── utils.ts              # Helper functions
│   └── hooks/
│       ├── use-tasks.ts          # Hook quản lý tasks (CRUD)
│       └── use-filters.ts        # Hook quản lý filters
├── public/
│   └── icons/                    # PWA icons
├── drizzle/                      # Auto-generated SQL migrations
├── drizzle.config.ts             # Drizzle Kit config
├── .env.local                    # Environment variables (không commit)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── package.json
├── vercel.json                   # Cron config
└── PLANNING.md                   # File này
```

---

## 6. API Endpoints

| Method | Endpoint | Mô tả |
|---|---|---|
| GET | `/api/tasks` | Lấy danh sách tasks (hỗ trợ query params: status, category, priority) |
| POST | `/api/tasks` | Tạo task mới |
| PATCH | `/api/tasks` | Cập nhật task (body chứa id + fields cần update) |
| DELETE | `/api/tasks` | Soft delete task (set deleted_at) |
| POST | `/api/cron/reminder` | Cron job kiểm tra và gửi email nhắc nhở |

---

## 7. Vercel Cron Config

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/reminder",
      "schedule": "0 * * * *"
    }
  ]
}
```

Chạy mỗi giờ, kiểm tra task có deadline trong 1 giờ tới hoặc 1 ngày tới mà chưa gửi reminder.

---

## 8. UI/UX Design

### Layout chính

```
┌─────────────────────────────────────────────────┐
│  Logo    [Dashboard] [Tasks] [Calendar]   [👤]  │  ← Navbar
├─────────┬───────────────────────────────────────┤
│         │                                       │
│ Filters │        Main Content Area              │
│         │                                       │
│ ☐ CQ    │  ┌─────┐  ┌─────┐  ┌─────┐          │
│ ☐ CN    │  │Todo │  │Doing│  │Done │          │
│         │  │     │  │     │  │     │          │
│ Priority│  │Card │  │Card │  │Card │          │
│ ○ Cao   │  │Card │  │     │  │Card │          │
│ ○ Vừa   │  │     │  │     │  │     │          │
│ ○ Thấp  │  └─────┘  └─────┘  └─────┘          │
│         │                                       │
│         │              [+ Thêm task]            │
└─────────┴───────────────────────────────────────┘
```

### Màu sắc

- **Primary:** Indigo (#4F46E5)
- **Cơ quan:** Blue badge
- **Cá nhân:** Green badge
- **Ưu tiên Cao:** Red
- **Ưu tiên Vừa:** Amber/Yellow
- **Ưu tiên Thấp:** Gray
- **Dark mode:** Hỗ trợ toggle sáng/tối

### Responsive

- Desktop: Sidebar + Kanban 3 cột
- Tablet: Sidebar thu gọn, Kanban 3 cột nhỏ hơn
- Mobile: Bottom nav, Kanban scroll ngang hoặc chuyển list view

---

## 9. Kế hoạch triển khai (Phases)

### Phase 1: Foundation (Ngày 1-2)
- [x] Tạo PLANNING.md
- [ ] Khởi tạo Next.js project + Tailwind + shadcn/ui
- [ ] Setup Supabase project + database schema
- [ ] Cấu hình Auth (Google OAuth)
- [ ] Tạo layout chính (navbar, sidebar)
- [ ] Trang login

### Phase 2: Core CRUD (Ngày 3-4)
- [ ] API routes cho tasks (GET, POST, PATCH, DELETE)
- [ ] Form tạo/sửa task
- [ ] Kanban board với drag & drop
- [ ] Đánh dấu hoàn thành

### Phase 3: Filters & Views (Ngày 5)
- [ ] Bộ lọc (category, priority, status, deadline)
- [ ] Tìm kiếm
- [ ] List view
- [ ] Calendar view

### Phase 4: Dashboard & Stats (Ngày 6)
- [ ] Dashboard với thống kê
- [ ] Biểu đồ hoàn thành
- [ ] Task quá hạn / sắp hạn

### Phase 5: Reminders & Polish (Ngày 7)
- [ ] Setup Resend cho email
- [ ] Cron job nhắc nhở
- [ ] Browser push notifications
- [ ] Dark mode
- [ ] PWA (installable)

### Phase 6: Deploy & Test (Ngày 8)
- [ ] Deploy lên Vercel
- [ ] Kết nối domain (nếu có)
- [ ] Test end-to-end
- [ ] Fix bugs

---

## 10. Environment Variables

```env
# .env.local (KHÔNG commit lên git)

# Neon Database
DATABASE_URL=postgresql://user:pass@ep-xxx.region.neon.tech/dbname?sslmode=require

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=random-32-char-secret

# Google OAuth
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-xxx

# Resend (email)
RESEND_API_KEY=re_xxx

# Cron secret (bảo vệ cron endpoint)
CRON_SECRET=your-random-secret

# Auth whitelist (server-side only, KHÔNG có prefix NEXT_PUBLIC_)
ALLOWED_EMAIL=your-email@gmail.com
```

### Bảo mật env vars

- **`ALLOWED_EMAIL` không có prefix `NEXT_PUBLIC_`** → Next.js không bundle vào client JS, chỉ có server đọc được
- **Không hardcode email trong source code** → Đọc từ env var trong NextAuth callback
- **Trên Vercel:** Set tất cả env vars trong Dashboard > Settings > Environment Variables

---

## 11. Bảo mật

- **NextAuth middleware:** Kiểm tra session trước mỗi request đến protected routes
- **Email whitelist server-side:** `ALLOWED_EMAIL` chỉ tồn tại trong env var (không prefix `NEXT_PUBLIC_`), kiểm tra trong NextAuth `signIn` callback → reject ngay nếu email không khớp
- **CRON_SECRET:** Header `Authorization: Bearer <CRON_SECRET>` bảo vệ cron endpoint
- **Environment variables:** Không commit `.env.local`, set trên Vercel Dashboard
- **HTTPS:** Vercel tự cung cấp SSL
- **Database:** Neon connection qua SSL (sslmode=require trong connection string)

---

## 12. Các thư viện chính

```json
{
  "dependencies": {
    "next": "^14.x",
    "next-auth": "^5.x",
    "drizzle-orm": "^0.x",
    "@neondatabase/serverless": "^0.x",
    "tailwindcss": "^3.x",
    "@hello-pangea/dnd": "^17.x",
    "resend": "^4.x",
    "date-fns": "^4.x",
    "lucide-react": "^0.x",
    "recharts": "^2.x",
    "zod": "^3.x"
  },
  "devDependencies": {
    "drizzle-kit": "^0.x"
  }
}
```

| Thư viện | Mục đích |
|---|---|
| `next-auth` | Auth Google OAuth + email whitelist |
| `drizzle-orm` | Type-safe ORM, nhẹ, không magic |
| `@neondatabase/serverless` | Neon PostgreSQL driver (serverless-compatible) |
| `@hello-pangea/dnd` | Drag & drop cho Kanban board |
| `resend` | Gửi email nhắc nhở |
| `date-fns` | Xử lý ngày tháng |
| `lucide-react` | Icon set |
| `recharts` | Biểu đồ thống kê |
| `zod` | Validate input |
| `drizzle-kit` | Generate SQL migrations từ schema |

---

## 13. Ghi chú quan trọng

1. **Vercel Free Tier:** Serverless functions timeout 10s (đủ cho app này)
2. **Neon Free Tier:** Compute auto-suspend khi idle, wake on connect (~0.5s cold start) — không bị pause/delete như Supabase
3. **Resend Free Tier:** 100 emails/ngày, 1 domain → đủ cho 1 user
4. **Không cần CI/CD phức tạp:** Push to main = auto deploy trên Vercel
5. **Drizzle migrations:** Chạy `npx drizzle-kit generate` để tạo migration, `npx drizzle-kit push` để apply lên Neon
6. **Tailwind 3 + shadcn/ui:** Stable combo, tránh breaking changes của Tailwind v4 (còn mới)
