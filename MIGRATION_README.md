# نقشه راه مهاجرت Ebraz Backend

> **هدف:** انتقال بک‌اند مدیریت کلینیک «ابراز» از Laravel 11 (MySQL) به **Next.js API Routes** با دیتابیس **PostgreSQL**.  
> **مخاطب:** توسعه‌دهنده پروژه Next.js  
> **منبع:** پروژه Laravel موجود در همین ریپازیتوری

---

## فهرست مطالب

1. [خلاصه پروژه](#۱-خلاصه-پروژه)
2. [معماری فعلی](#۲-معماری-فعلی)
3. [احراز هویت](#۳-احراز-هویت)
4. [اسکیمای دیتابیس (وضعیت نهایی)](#۴-اسکیمای-دیتابیس-وضعیت-نهایی)
5. [روابط بین جداول](#۵-روابط-بین-جداول)
6. [API Routes](#۶-api-routes)
7. [قوانین اعتبارسنجی](#۷-قوانین-اعتبارسنجی)
8. [منطق کسب‌وکار کلیدی](#۸-منطق-کسب‌وکار-کلیدی)
9. [ذخیره فایل](#۹-ذخیره-فایل)
10. [یکپارچگی‌های خارجی](#۱۰-یکپارچگی‌های-خارجی)
11. [نوتیفیکیشن و Real-time](#۱۱-نوتیفیکیشن-و-real-time)
12. [نکات مهاجرت MySQL → PostgreSQL](#۱۲-نکات-مهاجرت-mysql--postgresql)
13. [باگ‌ها و بدهی فنی (اصلاح در پروژه جدید)](#۱۳-باگ‌ها-و-بدهی-فنی-اصلاح-در-پروژه-جدید)
14. [پیشنهاد ساختار Next.js](#۱۴-پیشنهاد-ساختار-nextjs)
15. [فازبندی پیاده‌سازی](#۱۵-فازبندی-پیاده‌سازی)
16. [فهرست مایگریشن‌های Laravel](#۱۶-فهرست-مایگریشن‌های-laravel)

---

## ۱. خلاصه پروژه

سیستم مدیریت کلینیک روانشناسی/پزشکی با این ماژول‌ها:

| ماژول | توضیح |
|-------|-------|
| **نوبت‌دهی (Appointments)** | جدول `referrals` + pivot `referral_user` + `payments` |
| **مراجعان (Clients)** | اطلاعات بیمار + پرونده پزشکی |
| **پزشکان (Doctors)** | پروفایل، رزومه، منابع، دپارتمان‌ها |
| **ادمین‌ها (Admins)** | نقش‌های مختلف (boss, receptionist, manager, author, accountant) |
| **ارزیابی اولیه** | `init_assessments` + pivot `assessment_user` |
| **فاکتور (Invoices)** | PDF فاکتور نوبت‌ها در بازه تاریخ |
| **کارگاه‌ها (Workshops)** | ثبت‌نام، جلسات، تأیید شرکت‌کنندگان |
| **وبلاگ/CMS** | پست، دسته‌بندی، تگ، دپارتمان |
| **نوتیفیکیشن** | in-app + broadcast (Reverb) + email/SMS |
| **Backup/Restore** | export/import JSON موجودیت‌ها |
| **کلاس‌ها (Classes)** | فیچر قدیمی — جدول `classes` بدون migration |

**تعداد جداول اصلی:** ۳۶ (+ جدول `migrations` لاراول)  
**تعداد فایل migration:** ۵۱ (۳۶ create + ۱۵ alter)

---

## ۲. معماری فعلی

```
Client (Frontend / Mobile)
        │
        ▼
   /api/*  (prefix)
        │
   ┌────┴────────────────────────────────────┐
   │  Middleware: throttle (60/min), CORS    │
   └────┬────────────────────────────────────┘
        │
   ┌────┴──────────┬──────────────┬─────────────┐
   │ Public        │ auth:admin   │ auth:doctor │
   │ routes        │ JWT guard    │ JWT guard   │
   └───────────────┴──────────────┴─────────────┘
        │
   Controllers (بدون Repository/Service layer)
        │
   Eloquent Models → MySQL
```

**پکیج‌های مهم Laravel:**

| پکیج | کاربرد |
|------|--------|
| `tymon/jwt-auth` | احراز هویت JWT برای admin/doctor/client |
| `morilog/jalali` | تاریخ شمسی در SMS و فاکتور |
| `barryvdh/laravel-dompdf` | تولید PDF فاکتور |
| `laravel/reverb` | WebSocket برای نوتیفیکیشن real-time |

**نکته:** هیچ Form Request، Repository یا PHP Enum در پروژه وجود ندارد. validation مستقیم در Controller انجام می‌شود.

---

## ۳. احراز هویت

### ۳.۱ سه نوع کاربر

| Guard | جدول | فیلد لاگین | Claim در JWT |
|-------|------|-----------|--------------|
| `admin` | `admins` | `phone` + `password` | `user_type: "admin"` |
| `doctor` | `doctors` | `phone` + `password` | `user_type: "doctor"` |
| `client` | `clients` | `phone` + `password` | `user_type: "client"` |

### ۳.۲ Endpointهای لاگین

```
POST /api/auth/admin/login   → { phone, password } → { user, access_token }
POST /api/auth/doctor/login  → { phone, password } → { user, access_token }
POST /api/auth/client/login  → { phone, password } → { user, access_token }
```

**هدر درخواست‌های محافظت‌شده:**
```
Authorization: Bearer <access_token>
```

### ۳.۳ Middlewareها

| Middleware | شرط |
|------------|-----|
| `auth:admin` | JWT معتبر از جدول admins |
| `auth:doctor` | JWT معتبر از جدول doctors |
| `author.only` | admin با `role === 'author'` (فقط برای نوشتن وبلاگ) |

### ۳.۴ نقش‌های Admin

```
enum: boss | receptionist | manager | author | accountant
```

### ۳.۵ پیشنهاد Next.js

- از **NextAuth.js** با Credentials provider یا **jose/jsonwebtoken** استفاده کنید.
- claim `user_type` را در payload JWT حفظ کنید.
- middleware در `middleware.ts` برای محافظت routeها.
- **توجه:** login برای client وجود دارد ولی هیچ route محافظت‌شده با `auth:client` تعریف نشده.

---

## ۴. اسکیمای دیتابیس (وضعیت نهایی)

> اسکیمای زیر **وضعیت نهایی** پس از اجرای همه migrationهاست (نه فقط create اولیه).  
> در PostgreSQL: `enum`ها را می‌توان با `CREATE TYPE ... AS ENUM` یا `VARCHAR + CHECK` پیاده کرد. `JSON` برای فیلدهای json. `bigint` → `BIGSERIAL/BIGINT`.

---

### `admins`

| ستون | نوع | Null | پیش‌فرض | محدودیت |
|------|-----|------|---------|---------|
| id | bigint | NO | auto | PK |
| name | varchar(255) | NO | | |
| phone | varchar(255) | NO | | UNIQUE |
| role | enum | NO | | boss, receptionist, manager, author, accountant |
| birth_date | date | NO | | |
| password | varchar(255) | NO | | bcrypt hash |
| created_at | timestamp | YES | | |
| updated_at | timestamp | YES | | |

---

### `doctors`

| ستون | نوع | Null | پیش‌فرض | محدودیت |
|------|-----|------|---------|---------|
| id | bigint | NO | auto | PK |
| name | varchar(255) | NO | | |
| avatar | varchar(255) | YES | | *اضافه شده* |
| times | varchar(255) | YES | | *اضافه شده — ساعات کاری* |
| days | varchar(255) | YES | | *اضافه شده — روزهای کاری* |
| resume | varchar(255) | YES | | *اضافه شده — مسیر فایل PDF* |
| phone | varchar(255) | NO | | UNIQUE |
| national_code | varchar(255) | NO | | UNIQUE |
| birth_date | date | NO | | |
| card_number | varchar(255) | NO | | UNIQUE |
| medical_number | varchar(255) | YES | | UNIQUE |
| email | varchar(255) | YES | | |
| password | varchar(255) | YES | | |
| profile_path | varchar(255) | YES | | |
| created_at | timestamp | YES | | |
| updated_at | timestamp | YES | | |

---

### `clients`

| ستون | نوع | Null | پیش‌فرض | محدودیت |
|------|-----|------|---------|---------|
| id | bigint | NO | auto | PK |
| name | varchar(255) | NO | | |
| phone | varchar(255) | NO | | UNIQUE |
| birth_date | date | YES | | |
| address | varchar(255) | YES | | |
| created_at | timestamp | YES | | |
| updated_at | timestamp | YES | | |

---

### `users` (legacy — استفاده محدود)

| ستون | نوع | Null | محدودیت |
|------|-----|------|---------|
| id | bigint | PK | |
| name | varchar(255) | NO | |
| phone | varchar(255) | NO | UNIQUE |
| national_code | varchar(255) | YES | UNIQUE |
| birth_date | varchar(255) | YES | |
| address | varchar(255) | NO | |
| email | varchar(255) | YES | |
| password | varchar(255) | YES | |
| role | enum | NO | boss, admin, doctor, client, w_student, c_student |

---

### `referrals` (نوبت‌ها)

| ستون | نوع | Null | محدودیت |
|------|-----|------|---------|
| id | bigint | PK | |
| date | date | NO | |
| time | varchar(255) | NO | |
| amount | integer | NO | مبلغ به ریال/تومان |
| status | enum | NO | pending, done |
| created_at, updated_at | timestamp | YES | |

---

### `referral_user` (pivot نوبت ↔ پزشک ↔ مراجع)

| ستون | نوع | Null | FK |
|------|-----|------|-----|
| id | bigint | PK | |
| referral_id | bigint | NO | → referrals.id CASCADE |
| doctor_id | bigint | NO | → doctors.id CASCADE |
| client_id | bigint | NO | → clients.id CASCADE |
| created_at, updated_at | timestamp | YES | |

---

### `payments`

| ستون | نوع | Null | محدودیت |
|------|-----|------|---------|
| id | bigint | PK | |
| referral_id | bigint | NO | FK → referrals.id CASCADE |
| status | enum | NO | pending, paid, unpaid |
| amount | integer | NO | اگر unpaid باشد → 0 |
| created_at, updated_at | timestamp | YES | |

---

### `medical_records`

| ستون | نوع | Null | محدودیت |
|------|-----|------|---------|
| id | bigint | PK | |
| record_number | varchar(255) | NO | UNIQUE |
| client_id | bigint | NO | FK → clients.id CASCADE |
| doctor_id | bigint | YES | FK → doctors.id SET NULL |
| supervisor_id | bigint | YES | FK → doctors.id SET NULL |
| admin_id | bigint | YES | FK → admins.id SET NULL |
| companion_id | bigint | YES | FK → companions.id SET NULL *(اضافه شده)* |
| reference_source | varchar(255) | YES | |
| admission_date | date | NO | |
| visit_date | date | NO | |
| chief_complaints | text | YES | |
| present_illness | text | YES | |
| past_history | text | YES | |
| family_history | text | YES | |
| personal_history | text | YES | |
| mse | text | YES | |
| diagnosis | text | YES | |
| created_at, updated_at | timestamp | YES | |

---

### `companions`

| ستون | نوع | Null | محدودیت |
|------|-----|------|---------|
| id | bigint | PK | |
| name | varchar(255) | NO | |
| phone | varchar(255) | NO | UNIQUE |
| birth_date | date | YES | |
| address | varchar(255) | YES | |

---

### `record_images_teble` ⚠️ typo در نام جدول

| ستون | نوع | Null | FK |
|------|-----|------|-----|
| id | bigint | PK | |
| medical_record_id | bigint | NO | → medical_records.id CASCADE |
| file_path | varchar(255) | NO | |
| created_at, updated_at | timestamp | YES | |

> **پیشنهاد PostgreSQL:** نام را به `record_images` اصلاح کنید.

---

### `sessions` (جلسات درمانی — نه HTTP session)

| ستون | نوع | Null | FK |
|------|-----|------|-----|
| id | bigint | PK | |
| client_id | bigint | NO | → clients.id CASCADE |
| doctor_id | bigint | NO | → doctors.id CASCADE |
| medical_record_id | bigint | NO | → medical_records.id CASCADE |
| session_number | integer | NO | |
| session_date | date | NO | |
| description | text | NO | |
| created_at, updated_at | timestamp | YES | |

---

### `init_assessments`

| ستون | نوع | Null | محدودیت |
|------|-----|------|---------|
| id | bigint | PK | |
| date | date | YES | |
| time | varchar(255) | YES | |
| status | enum | NO | pending, done |
| file_path | varchar(255) | YES | |
| created_at, updated_at | timestamp | YES | |

---

### `assessment_user` (pivot)

| ستون | نوع | Null | FK |
|------|-----|------|-----|
| id | bigint | PK | |
| init_assessment_id | bigint | NO | → init_assessments.id CASCADE |
| doctor_id | bigint | YES | → doctors.id CASCADE |
| client_id | bigint | NO | → clients.id CASCADE |
| created_at, updated_at | timestamp | YES | |

---

### `invoices`

| ستون | نوع | Null | FK |
|------|-----|------|-----|
| id | bigint | PK | |
| client_id | bigint | NO | → clients.id CASCADE |
| from_date | date | NO | |
| to_date | date | NO | |
| admin_id | bigint | NO | → admins.id CASCADE |
| file_path | varchar(255) | NO | مسیر PDF |
| created_at, updated_at | timestamp | YES | |

---

### `resumes` (رزومه ساختاریافته پزشک)

| ستون | نوع | Null | FK |
|------|-----|------|-----|
| id | bigint | PK | |
| doctor_id | bigint | NO | → doctors.id CASCADE |
| title | varchar(255) | YES | |
| bio | text | YES | |
| specialization | varchar(255) | YES | |
| educations | json | YES | آرایه |
| experiences | json | YES | آرایه |
| skills | json | YES | آرایه |
| certifications | json | YES | آرایه |
| content | longtext | YES | *اضافه شده* |
| social_links | json | YES | |
| file_path | varchar(255) | YES | |
| created_at, updated_at | timestamp | YES | |

> **توجه:** سه مفهوم رزومه همزمان وجود دارد:
> 1. `doctors.resume` — مسیر فایل PDF
> 2. `doctor_resumes` — جدول فایل‌های PDF جداگانه
> 3. `resumes` — پروفایل JSON کامل

---

### `doctor_resumes`

| ستون | نوع | Null | FK |
|------|-----|------|-----|
| id | bigint | PK | |
| doctor_id | bigint | NO | → doctors.id CASCADE |
| file_path | varchar(255) | NO | |
| created_at, updated_at | timestamp | YES | |

---

### `doctor_resources`

| ستون | نوع | Null | محدودیت |
|------|-----|------|---------|
| id | bigint | PK | |
| doctor_id | bigint | NO | FK → doctors.id CASCADE |
| title | varchar(255) | NO | |
| type | enum | NO | link, file |
| description | varchar(255) | YES | |
| link | varchar(255) | YES | |
| file | varchar(255) | YES | |
| created_at, updated_at | timestamp | YES | |

---

### `departments`

| ستون | نوع | Null | محدودیت |
|------|-----|------|---------|
| id | bigint | PK | |
| title | varchar(255) | NO | |
| slug | varchar(255) | NO | UNIQUE |
| excerpt | text | YES | |
| content | longtext | NO | |
| thumbnail | varchar(255) | YES | |
| created_at, updated_at | timestamp | YES | |

---

### `department_doctor` (pivot)

| ستون | نوع | FK |
|------|-----|-----|
| id | bigint PK | |
| doctor_id | bigint | → doctors.id CASCADE |
| department_id | bigint | → departments.id CASCADE |
| created_at, updated_at | timestamp | |

---

### `work_shops`

| ستون | نوع | Null | توضیح |
|------|-----|------|-------|
| id | bigint | PK | |
| title | varchar(255) | NO | |
| slug | varchar(255) | YES | *جایگزین description* |
| excerpt | text | YES | *اضافه شده* |
| content | longtext | NO | *اضافه شده* |
| organizers | varchar(255) | YES | *اضافه شده* |
| start_date | date | YES | |
| end_date | date | YES | |
| week_day | varchar(255) | YES | |
| time | varchar(255) | YES | |
| img_path | varchar(255) | YES | |
| created_at, updated_at | timestamp | YES | |

**حذف شده:** `description` (varchar — در create اولیه بود)

---

### `workshop_sessions`

| ستون | نوع | Null | توضیح |
|------|-----|------|-------|
| id | bigint | PK | |
| work_shop_id | bigint | NO | FK → work_shops.id CASCADE |
| title | varchar(255) | NO | *اضافه شده* |
| description | text | NO | *اضافه شده* |
| session_date | date | YES | |
| start_time | varchar(255) | YES | *از time به string تغییر کرد* |
| end_time | varchar(255) | YES | *از time به string تغییر کرد* |
| location | varchar(255) | YES | |
| link | varchar(255) | YES | |
| created_at, updated_at | timestamp | YES | |

---

### `participants`

| ستون | نوع | Null | محدودیت |
|------|-----|------|---------|
| id | bigint | PK | |
| name | varchar(255) | NO | |
| name_en | varchar(255) | YES | |
| national_code | varchar(255) | YES | |
| phone | varchar(255) | NO | |
| gender | enum | YES | male, female |
| approved | boolean | NO | false *(اضافه شده)* |
| created_at, updated_at | timestamp | YES | |

---

### `participant_workshop` (pivot)

| ستون | نوع | Null | محدودیت |
|------|-----|------|---------|
| id | bigint | PK | |
| participant_id | bigint | NO | FK → participants.id CASCADE |
| work_shop_id | bigint | NO | FK → work_shops.id CASCADE |
| approved | boolean | NO | false *(اضافه شده)* |
| joined_at | timestamp | YES | *(اضافه شده)* |
| registered_at | timestamp | YES | |
| created_at, updated_at | timestamp | YES | |
| — | — | — | **UNIQUE** (participant_id, work_shop_id) |

---

### `categories`

| ستون | نوع | Null | توضیح |
|------|-----|------|-------|
| id | bigint | PK | |
| name | varchar(255) | NO | |
| slug | varchar(255) | NO | UNIQUE |
| excerpt | text | YES | *اضافه شده* |
| content | longtext | NO | *اضافه شده* |
| image | varchar(255) | YES | *اضافه شده* |
| created_at, updated_at | timestamp | YES | |

---

### `tags`

| ستون | نوع | Null | توضیح |
|------|-----|------|-------|
| id | bigint | PK | |
| name | varchar(255) | NO | |
| slug | varchar(255) | NO | UNIQUE |
| excerpt | text | YES | *اضافه شده* |
| content | longtext | NO | *اضافه شده* |
| image | varchar(255) | YES | *اضافه شده* |
| created_at, updated_at | timestamp | YES | |

---

### `posts`

| ستون | نوع | Null | محدودیت |
|------|-----|------|---------|
| id | bigint | PK | |
| admin_id | bigint | NO | FK → admins.id CASCADE |
| category_id | bigint | YES | FK → categories.id SET NULL |
| title | varchar(255) | NO | |
| slug | varchar(255) | NO | UNIQUE |
| excerpt | text | YES | |
| content | longtext | NO | |
| thumbnail | varchar(255) | YES | *اضافه شده* |
| status | enum | NO | draft, published, archived (default: draft) |
| published_at | timestamp | YES | |
| created_at, updated_at | timestamp | YES | |

---

### `post_tag` (pivot — بدون id)

| ستون | FK |
|------|-----|
| post_id | → posts.id CASCADE |
| tag_id | → tags.id CASCADE |
| **PRIMARY KEY** | (post_id, tag_id) |

---

### `comments`

| ستون | نوع | Null | FK |
|------|-----|------|-----|
| id | bigint | PK | |
| post_id | bigint | NO | → posts.id CASCADE |
| user_id | bigint | YES | → users.id SET NULL |
| body | text | NO | |
| author_name | varchar(255) | NO | |
| email | varchar(255) | NO | |
| approved | boolean | NO | default false |
| created_at, updated_at | timestamp | YES | |

> **توجه:** `CommentController` import شده ولی route تعریف نشده.

---

### `notifications`

| ستون | نوع | Null | پیش‌فرض |
|------|-----|------|---------|
| id | bigint | PK | |
| title | varchar(255) | NO | |
| message | text | YES | |
| type | varchar(255) | NO | 'system' |
| notifiable_type | varchar(255) | YES | polymorphic |
| notifiable_id | bigint | YES | polymorphic |
| priority | enum | NO | low, medium, high |
| delivery_channels | json | YES | e.g. ["in_app","email","sms"] |
| status | enum | NO | pending, sent, failed |
| meta | json | YES | |
| scheduled_at | timestamp | YES | |
| created_at, updated_at | timestamp | YES | |

---

### `notification_reads`

| ستون | نوع | Null | FK |
|------|-----|------|-----|
| id | bigint | PK | |
| notification_id | bigint | NO | → notifications.id CASCADE |
| receiver_type | varchar(255) | NO | polymorphic (Admin/Doctor/Client) |
| receiver_id | bigint | NO | polymorphic |
| read_at | timestamp | YES | |
| created_at, updated_at | timestamp | YES | |

---

### `abouts` (اطلاعات کلینیک — معمولاً یک رکورد)

| ستون | نوع | Null |
|------|-----|------|
| id | bigint | PK |
| title | varchar(255) | NO |
| about | text | NO |
| address | varchar(255) | NO |
| phones | varchar(255) | NO |
| mobile_phones | varchar(255) | NO |
| logo_path | varchar(255) | NO |
| lat | varchar(255) | NO |
| long | varchar(255) | NO |
| created_at, updated_at | timestamp | YES |

---

### `backups`

| ستون | نوع | Null |
|------|-----|------|
| id | bigint | PK |
| type | enum | NO | doctor, doctorResume, client, clientRecord, assessment, appoitment, payment, admin, department, post, category, tag, workshop, about |
| file_path | varchar(255) | NO |
| file_url | varchar(255) | NO |
| created_at, updated_at | timestamp | YES |

---

### `restores`

| ستون | نوع | Null |
|------|-----|------|
| id | bigint | PK |
| type | enum | NO | (همان مقادیر backups.type) |
| created_at, updated_at | timestamp | YES |

---

### جداول Laravel (نیاز به تصمیم)

| جدول | نیاز در Next.js؟ |
|------|------------------|
| `personal_access_tokens` | خیر — Sanctum استفاده نمی‌شود |
| `password_resets` | اختیاری |
| `failed_jobs` | اگر queue دارید |

---

### جداول بدون migration (legacy)

| جدول | وضعیت |
|------|-------|
| `classes` | در `ClassesModel` استفاده می‌شود، migration ندارد |
| `class_dates` | فقط در SQL dump — `class_id`, `date` |

---

## ۵. روابط بین جداول

```
referrals ──1:1── payments
referrals ──M:N── doctors, clients  (via referral_user)

init_assessments ──M:N── doctors, clients  (via assessment_user)

clients ──1:1── medical_records
medical_records ──1:N── record_images
medical_records ──N:1── companions (optional)
medical_records ──1:N── sessions

doctors ──1:1── resumes
doctors ──1:N── doctor_resumes, doctor_resources
doctors ──M:N── departments  (via department_doctor)

work_shops ──1:N── workshop_sessions
work_shops ──M:N── participants  (via participant_workshop)

posts ──N:1── categories, admins
posts ──M:N── tags  (via post_tag)
posts ──1:N── comments

notifications ──1:N── notification_reads
notifications ──polymorphic── Admin/Doctor/Client
```

---

## ۶. API Routes

> همه routeها با prefix `/api` شروع می‌شوند.  
> در Next.js: `app/api/.../route.ts`

### ۶.۱ احراز هویت

| Method | Path | Auth | توضیح |
|--------|------|------|-------|
| POST | `/auth/admin/login` | — | لاگین ادمین |
| POST | `/auth/doctor/login` | — | لاگین پزشک |
| POST | `/auth/client/login` | — | لاگین مراجع (بدون route محافظت‌شده) |
| POST | `/logout` | admin | خروج ادمین |
| POST | `/v2/doctors/logout` | doctor | خروج پزشک |
| GET | `/user-info` | admin | اطلاعات ادمین جاری |

### ۶.۲ نوبت‌ها (Appointments)

| Method | Path | Auth | Query Params |
|--------|------|------|--------------|
| GET | `/appointments` | admin | `per_page`, `search`, `date`, `client_id` |
| GET | `/appointments/{id}` | admin | |
| GET | `/appointments/date/{date}` | admin | |
| POST | `/appointments` | admin | body: doctor_id, client_id, date, time, amount, status, payment_status |
| PATCH | `/appointments/{id}` | admin | |
| DELETE | `/appointments/{id}` | admin | |

**Side effect:** پس از ایجاد نوبت، SMS از طریق sms.ir ارسال می‌شود.

### ۶.۳ مراجعان

| Method | Path | Auth | Query Params |
|--------|------|------|--------------|
| GET | `/clients` | admin | `search`, `sort_by`, `sort_direction`, `per_page` |
| GET | `/clients/{id}` | admin | |
| POST | `/clients` | admin | name, phone, birth_date?, address? |
| PATCH | `/clients/{id}` | admin | |
| DELETE | `/clients/{id}` | admin | |

### ۶.۴ پرونده پزشکی

| Method | Path | Auth | توضیح |
|--------|------|------|-------|
| GET | `/clients/{id}/record` | public | دریافت پرونده |
| POST | `/clients/{id}/record` | public | ایجاد/ویرایش پرونده |

### ۶.۵ پزشکان

| Method | Path | Auth |
|--------|------|------|
| GET | `/doctors` | public |
| GET | `/v1/doctors/{doctor}` | public |
| GET | `/doctors/{doctor}` | admin |
| POST | `/doctors` | admin |
| POST | `/doctors/{doctor}` | admin |
| DELETE | `/doctors/{id}` | admin |
| POST | `/doctors/{doctor}/password` | admin |
| GET | `/doctors/{id}/panel/seven-days` | admin |
| GET | `/doctors/{id}/panel/30-days` | admin |
| GET | `/doctors/{id}/panel/today-sms` | admin |
| GET | `/doctors/{id}/panel/tomorrow-sms` | admin |
| GET | `/doctors/{doctor}/resume` | admin |
| POST | `/doctors/{doctor}/resume` | admin |

**نوبت‌های عمومی پزشک (بدون auth):**

| Method | Path |
|--------|------|
| GET | `/app/doctors/{id}/appointments/today` |
| GET | `/app/doctors/{id}/appointments/yesterday` |
| GET | `/app/doctors/{id}/appointments/tomorrow` |
| GET | `/app/doctors/{id}/appointments/7-days` |
| GET | `/app/doctors/{id}/appointments/30-days` |
| GET | `/app/doctors/{id}/appointments/next-30-days` |
| GET | `/app/doctors/{id}/appointments/all` |
| GET | `/app/doctors/{id}/clients` |

### ۶.۶ API پزشک (v2)

| Method | Path | Auth |
|--------|------|------|
| GET | `/v2/doctors/resume` | doctor |
| POST | `/v2/doctors/resume` | doctor |
| GET | `/v2/doctors/appointments` | doctor |
| GET | `/v2/doctors/resources` | doctor |
| GET | `/v2/doctors/assessments` | doctor |
| GET | `/v2/doctors/notifications` | doctor |

### ۶.۷ پرداخت‌ها و فاکتور

| Method | Path | Auth |
|--------|------|------|
| GET | `/payments` | admin |
| GET | `/invoices` | admin |
| POST | `/invoices/add` | admin — body: client_id, from_date, to_date |

### ۶.۸ ادمین‌ها

| Method | Path | Auth |
|--------|------|------|
| GET | `/admins` | admin |
| GET | `/admins/rec-admins` | admin |
| GET | `/admins/{id}` | admin |
| POST | `/admins` | admin |
| POST | `/admins/{id}` | admin |
| DELETE | `/admins/{id}` | admin |

### ۶.۹ ارزیابی اولیه

| Method | Path | Auth |
|--------|------|------|
| POST | `/assessments` | public |
| GET | `/assessments` | admin |
| DELETE | `/assessments/{id}` | admin |

### ۶.۱۰ SMS

| Method | Path | Auth |
|--------|------|------|
| POST | `/sms/single` | admin |
| POST | `/sms/multi` | admin |

### ۶.۱۱ کلاس‌ها

| Method | Path | Auth |
|--------|------|------|
| GET | `/classes` | admin |
| GET | `/classes/{id}` | admin |
| POST | `/classes/add` | admin |
| PATCH | `/classes/{id}` | admin — **پیاده‌سازی خالی** |
| DELETE | `/classes/{id}` | admin |

### ۶.۱۲ کارگاه‌ها

| Method | Path | Auth |
|--------|------|------|
| GET | `/workshops` | public |
| POST | `/workshops` | public ⚠️ |
| GET | `/workshops/{id}` | public |
| POST | `/workshops/{id}` | public ⚠️ |
| DELETE | `/workshops/{id}` | public ⚠️ |
| GET | `/workshops/{id}/sessions` | public |
| POST | `/workshops/{id}/sessions` | public |
| GET | `/workshops/{id}/sessions/{sessionId}` | public |
| POST | `/workshops/{id}/sessions/{sessionId}` | public |
| DELETE | `/workshops/{id}/sessions/{sessionId}` | public |
| GET | `/workshops/{id}/participants` | public |
| POST | `/workshops/{id}/participants` | public |
| POST | `/workshops/{id}/participants/{participantId}` | public |
| DELETE | `/workshops/{id}/participants/{participantId}` | public |
| PATCH | `/workshops/{id}/participants/{participantId}/approve` | public |
| PATCH | `/workshops/{id}/participants/{participantId}/unapprove` | public — **متد وجود ندارد** |

### ۶.۱۳ وبلاگ

**خواندن (public):**
- `GET /posts`, `GET /posts/{id}`
- `GET /categories`, `GET /tags`

**نوشتن (admin + role=author):**
- `POST/PUT/PATCH/DELETE /posts`, `/categories`, `/tags`

**⚠️ Duplicate routes بدون auth:**
- `POST /posts`, `POST /posts/{slug}`, `DELETE /posts/{slug}`
- `POST /categories`, `POST /categories/{slug}`

### ۶.۱۴ دپارتمان‌ها

| Method | Path | Auth |
|--------|------|------|
| GET | `/departments` | public |
| POST | `/departments` | public ⚠️ |
| GET | `/departments/{slug}` | public |
| POST | `/departments/{slug}` | public ⚠️ |
| DELETE | `/departments/{slug}` | public ⚠️ |

### ۶.۱۵ درباره ما

| Method | Path | Auth |
|--------|------|------|
| GET | `/about` | public |
| POST | `/about/upsert` | public ⚠️ |

### ۶.۱۶ نوتیفیکیشن

| Method | Path | Auth |
|--------|------|------|
| GET | `/notifications` | نیاز به JWT در controller |
| GET | `/notifications/unread` | |
| POST | `/notifications` | |
| GET | `/notifications/test` | |
| GET | `/notifications/me` | |
| POST | `/notifications/{id}/read` | |

### ۶.۱۷ Backup / Restore

| Method | Path | Auth |
|--------|------|------|
| GET | `/backup/admins` | admin |
| GET | `/backup/doctors` | admin |
| GET | `/backup/doctor-resumes` | admin |
| GET | `/backup/clients` | admin |
| GET | `/backup/posts` | admin |
| GET | `/backup/categories` | admin |
| GET | `/backup/tags` | admin |
| GET | `/backup/workshops` | admin |
| GET | `/backup/about` | admin |
| POST | `/restore/*` | admin — همان entityها |

### ۶.۱۸ Broadcasting

| Method | Path | Auth |
|--------|------|------|
| POST | `/broadcasting/auth` | JWT (custom middleware) |

**کانال‌های خصوصی:**
- `Doctor.{id}`, `Client.{id}`, `Admin.{id}`, `Admins`, `notifications.public`

---

## ۷. قوانین اعتبارسنجی

### Clients
```
name: required|string
phone: required|string|unique:clients
birth_date: nullable|date
address: nullable|string
```

### Doctors (create)
```
name: required|string
phone: required|unique:doctors
national_code: required|unique:doctors
birth_date: required|date
card_number: required|unique:doctors
medical_number: nullable|unique:doctors
email: nullable|email
avatar: nullable|image|max:2048
resume: nullable|file|mimetypes:application/pdf
department_ids: nullable|array
department_ids.*: exists:departments,id
```

### Referrals (appointments)
```
doctor_id: required
client_id: required
date: required|date
time: required
amount: required|integer
status: required|in:pending,done
payment_status: required|in:pending,paid,unpaid
```

### Medical Records
```
record_number: required|string|unique (ignore on update)
reference_source: nullable|string
admission_date: required|date
visit_date: required|date
doctor_id: nullable|exists:doctors,id
supervisor_id: nullable|exists:doctors,id
admin_id: nullable|exists:admins,id
images.*: nullable|image|mimes:jpg,jpeg,png|max:5120
companion_name/phone/address: nullable
```

### Posts
```
title: required|string|max:255
slug: required|string|unique
content: required|string
status: required|in:draft,published,archived
category_id: nullable|exists:categories,id
thumbnail: nullable|image|max:2048
tags: nullable|array
tags.*: exists:tags,id
```

### Workshops
```
title: required|string
content: required|string
slug: nullable|string
excerpt: nullable|string
organizers: nullable|string
start_date/end_date: nullable|date
img: nullable|image|max:5120
```

### Init Assessment (public)
```
client.phone: required
client.name: required
doctor_id: nullable|exists:doctors,id
date: nullable|date
time: nullable|string
status: required|in:pending,done
```

### Admins
```
name: required|string
phone: required|unique:admins
role: required|in:boss,receptionist,manager,author,accountant
birth_date: required|date
password: required|min:6 (on create)
```

---

## ۸. منطق کسب‌وکار کلیدی

### ۸.۱ ایجاد نوبت (Referral)

```
1. ایجاد رکورد در referrals
2. ایجاد pivot در referral_user (doctor_id + client_id)
3. ایجاد payment:
   - اگر payment_status = 'unpaid' → amount = 0
   - در غیر این صورت amount = referral.amount
4. ارسال SMS به پزشک (sms.ir API)
```

### ۸.۲ ارزیابی اولیه (public)

```
1. findOrCreate client بر اساس phone
2. ایجاد init_assessment
3. ایجاد pivot در assessment_user
```

### ۸.۳ ثبت‌نام کارگاه

```
1. findOrCreate participant بر اساس national_code یا phone
2. attach به workshop در participant_workshop
3. approved = false (نیاز به تأیید admin)
```

### ۸.۴ فاکتور PDF

```
1. دریافت referrals مراجع در بازه from_date تا to_date
2. تولید PDF با dompdf
3. ذخیره در storage/pdf/
4. ایجاد رکورد invoice
```

### ۸.۵ Pagination استاندارد

اکثر لیست‌ها از این query params پشتیبانی می‌کنند:
```
per_page (default: 10, max: 100)
search
sort_by
sort_direction (asc|desc)
```

---

## ۹. ذخیره فایل

| پوشه | کاربرد |
|------|--------|
| `blog_category_images/` | تصویر دسته‌بندی |
| `blog_tag_images/` | تصویر تگ |
| `posts_images/` | thumbnail پست |
| `department_images/` | thumbnail دپارتمان |
| `doctor_avatars/` | آواتار پزشک |
| `doctor_resumes/` | PDF رزومه |
| `workshop_images/` | تصویر کارگاه |
| `pictures/` | لوگوی about |
| `pdf/` | فاکتورها |
| `medical_records/{client_id}/` | تصاویر پرونده *(commented out)* |
| `backups/` | JSON backup |

**الگو:** `file.store('folder', 'public')` → مسیر نسبی در DB → URL: `{APP_URL}/storage/{path}`

**پیشنهاد Next.js:** S3/Cloudflare R2 یا `public/uploads/` با API route برای upload.

---

## ۱۰. یکپارچگی‌های خارجی

| سرویس | کاربرد | فایل |
|-------|--------|------|
| **sms.ir** | SMS نوبت جدید + پنل ادمین | `ReferralController`, `SmsController` |
| **dompdf** | PDF فاکتور | `InvoiceController` |
| **morilog/jalali** | تاریخ شمسی | referrals, invoices, SMS |

**SmsService** (`app/Services/SmsService.php`): فعلاً فقط log می‌کند — placeholder برای Kavenegar/Ghasedak.

---

## ۱۱. نوتیفیکیشن و Real-time

- Event: `NotificationCreated` → broadcast via Laravel Reverb
- Listener: `SendNotificationChannels` (ShouldQueue) — **ثبت نشده** در EventServiceProvider
- کانال‌ها بر اساس `user_type` و `user_id`
- `delivery_channels` بر اساس priority:
  - low → `["in_app"]`
  - medium → `["in_app", "email"]`
  - high → `["in_app", "email", "sms"]`

**پیشنهاد Next.js:** Pusher/Ably/Socket.io یا Server-Sent Events.

---

## ۱۲. نکات مهاجرت MySQL → PostgreSQL

### تبدیل نوع داده

| MySQL | PostgreSQL |
|-------|------------|
| `bigint unsigned` | `BIGSERIAL` / `BIGINT` |
| `enum(...)` | `CREATE TYPE ... AS ENUM` یا `VARCHAR + CHECK` |
| `longtext` | `TEXT` |
| `json` | `JSONB` (پیشنهادی) |
| `tinyint(1)` / `boolean` | `BOOLEAN` |
| `timestamp` | `TIMESTAMPTZ` (پیشنهادی) |

### اصلاحات پیشنهادی در اسکیمای جدید

1. `record_images_teble` → `record_images`
2. یکپارچه‌سازی مفهوم رزومه (۳ جدول/فیلد → یک مدل)
3. اضافه کردن `ON DELETE` مناسب برای همه FKها
4. index روی `referrals.date`, `clients.phone`, `doctors.phone`
5. `work_shops` → `workshops` (نام‌گذاری یکدست)

### ORM پیشنهادی

- **Prisma** یا **Drizzle ORM** با PostgreSQL
- migrationها را به صورت یک اسکیمای تمیز (نه ۵۱ فایل alter) بنویسید

### انتقال داده

```bash
# ابزارهای پیشنهادی:
pgloader mysql://... postgresql://...
# یا export JSON از backup endpoints موجود
```

---

## ۱۳. باگ‌ها و بدهی فنی (اصلاح در پروژه جدید)

| # | مشکل | اقدام پیشنهادی |
|---|------|----------------|
| 1 | Routeهای write بدون auth (workshops, departments, blog) | همه writeها را behind `auth:admin` ببرید |
| 2 | `WorkshopParticipantController@unapprove` وجود ندارد | پیاده‌سازی یا حذف route |
| 3 | `BackupController@backupWorkshops` vs `backupWorkShops` — case mismatch | یکسان‌سازی نام |
| 4 | `WorkShop` vs `Workshop` naming inconsistency | یک نام در همه جا |
| 5 | `ClassController@editClass` خالی | پیاده‌سازی یا حذف فیچر classes |
| 6 | `CommentController` بدون route | اضافه کردن یا حذف |
| 7 | Medical record image/companion logic commented out | فعال‌سازی کامل |
| 8 | `SendNotificationChannels` listener ثبت نشده | wire کردن event |
| 9 | Client login بدون protected routes | تصمیم: حذف یا پیاده‌سازی پنل مراجع |
| 10 | Duplicate blog routes | یک مجموعه route تمیز |
| 11 | `doctors.card_number` typo `nulllable()` در migration | NOT NULL در production |
| 12 | `classes`/`class_dates` بدون migration | migration جدید یا حذف فیچر |

---

## ۱۴. پیشنهاد ساختار Next.js

```
app/
├── api/
│   ├── auth/
│   │   ├── admin/login/route.ts
│   │   ├── doctor/login/route.ts
│   │   └── client/login/route.ts
│   ├── appointments/
│   │   ├── route.ts              # GET, POST
│   │   ├── [id]/route.ts         # GET, PATCH, DELETE
│   │   └── date/[date]/route.ts
│   ├── clients/
│   │   ├── route.ts
│   │   ├── [id]/route.ts
│   │   └── [id]/record/route.ts
│   ├── doctors/
│   │   ├── route.ts
│   │   └── [id]/...
│   ├── v2/doctors/
│   │   ├── resume/route.ts
│   │   ├── appointments/route.ts
│   │   └── ...
│   ├── workshops/...
│   ├── posts/...
│   └── ...
├── lib/
│   ├── db.ts                     # Prisma/Drizzle client
│   ├── auth.ts                   # JWT helpers
│   ├── validations/              # Zod schemas
│   └── services/
│       ├── sms.ts
│       ├── invoice-pdf.ts
│       └── notifications.ts
└── middleware.ts                 # Auth + rate limit
```

**پکیج‌های پیشنهادی:**
- `next` (App Router)
- `prisma` + `@prisma/client`
- `zod` (validation)
- `jose` یا `jsonwebtoken`
- `bcryptjs`
- `@react-pdf/renderer` یا `puppeteer` (PDF)
- `dayjs` + `jalaliday` (تاریخ شمسی)

---

## ۱۵. فازبندی پیاده‌سازی

### فاز ۱ — هسته (ضروری)
- [ ] Setup PostgreSQL + Prisma schema
- [ ] Auth (admin, doctor) + JWT middleware
- [ ] CRUD: clients, doctors, admins
- [ ] Appointments (referrals + payments)
- [ ] Medical records

### فاز ۲ — عملیات روزانه
- [ ] Doctor panel (v2 API)
- [ ] Init assessments
- [ ] Invoices + PDF
- [ ] SMS integration
- [ ] Payments list

### فاز ۳ — محتوا و آموزش
- [ ] Blog (posts, categories, tags)
- [ ] Departments
- [ ] Workshops + sessions + participants
- [ ] About page

### فاز ۴ — پیشرفته
- [ ] Notifications + real-time
- [ ] Backup/Restore
- [ ] Doctor resources
- [ ] Resume (structured JSON)

### فاز ۵ — پاکسازی
- [ ] حذف/بازنویسی classes (legacy)
- [ ] اصلاح باگ‌های امنیتی
- [ ] Migration داده از MySQL

---

## ۱۶. فهرست مایگریشن‌های Laravel

| # | فایل | عملیات |
|---|------|--------|
| 1 | `2014_10_12_000000_create_users_table` | CREATE users |
| 2 | `2014_10_12_100000_create_password_resets_table` | CREATE password_resets |
| 3 | `2019_08_19_000000_create_failed_jobs_table` | CREATE failed_jobs |
| 4 | `2019_12_14_000001_create_personal_access_tokens_table` | CREATE personal_access_tokens |
| 5 | `2024_08_08_074657_create_doctors_table` | CREATE doctors |
| 6 | `2024_08_08_132703_create_referrals_table` | CREATE referrals |
| 7 | `2024_08_08_133048_create_payments_table` | CREATE payments |
| 8 | `2024_08_08_182252_create_clients_table` | CREATE clients |
| 9 | `2024_08_08_201238_create_referral_user_table` | CREATE referral_user |
| 10 | `2024_12_16_085934_create_admins_table` | CREATE admins |
| 11 | `2024_12_21_170033_create_invoices_table` | CREATE invoices |
| 12 | `2025_02_01_165142_create_companions_table` | CREATE companions |
| 13 | `2025_02_02_160151_create_medical_records_table` | CREATE medical_records |
| 14 | `2025_02_02_221901_create_sessions_table` | CREATE sessions |
| 15 | `2025_02_02_223545_create_record_images_teble` | CREATE record_images_teble |
| 16 | `2025_05_07_120018_add_avatar_to_doctors_table` | ALTER doctors +avatar |
| 17 | `2025_05_07_120744_create_doctor_resumes_table` | CREATE doctor_resumes |
| 18 | `2025_05_07_144741_create_work_shops_table` | CREATE work_shops |
| 19 | `2025_05_07_145242_create_participants_table` | CREATE participants |
| 20 | `2025_05_07_145352_create_participant_workshop_table` | CREATE participant_workshop |
| 21 | `2025_05_07_145729_create_workshop_sessions_table` | CREATE workshop_sessions |
| 22 | `2025_07_14_154051_create_abouts_table` | CREATE abouts |
| 23 | `2025_07_16_104830_add_organizers_to_work_shops_table` | ALTER work_shops +organizers |
| 24 | `2025_07_16_130452_add_title_and_desc_to_work_shops_sessions_table` | ALTER workshop_sessions +title,+description |
| 25 | `2025_07_16_221831_change_start_and_end_time_type_in_workshop_sessions_table` | ALTER workshop_sessions time→string |
| 26 | `2025_07_17_081823_add_approved_to_participants_table` | ALTER participants +approved |
| 27 | `2025_07_17_082333_update_participant_workshop_table` | ALTER participant_workshop +approved,+joined_at,+unique |
| 28 | `2025_07_17_122131_create_categories_table` | CREATE categories |
| 29 | `2025_07_17_122145_create_posts_table` | CREATE posts |
| 30 | `2025_07_17_122209_create_tags_table` | CREATE tags |
| 31 | `2025_07_17_122218_create_post_tag_table` | CREATE post_tag |
| 32 | `2025_07_17_122232_create_comments_table` | CREATE comments |
| 33 | `2025_07_17_152928_update_tags_table` | ALTER tags +excerpt,+content,+image |
| 34 | `2025_07_17_153251_update_categories_table` | ALTER categories +excerpt,+content,+image |
| 35 | `2025_07_17_153805_add_thumbnail_to_posts_table` | ALTER posts +thumbnail |
| 36 | `2025_07_18_081603_create_departments_table` | CREATE departments |
| 37 | `2025_07_19_120838_add_resume_to_doctors_table` | ALTER doctors +resume |
| 38 | `2025_07_20_112344_create_department_doctor_table` | CREATE department_doctor |
| 39 | `2025_07_20_113807_add_time_and_days_to_doctors_table` | ALTER doctors +times,+days |
| 40 | `2025_09_23_090105_add_content_field_to_workshops_table` | ALTER work_shops +content |
| 41 | `2025_09_23_094247_update_work_shops_table` | ALTER work_shops +slug,+excerpt, -description |
| 42 | `2025_09_28_102749_create_init_assessments_table` | CREATE init_assessments |
| 43 | `2025_10_07_094044_assessment_user_table` | CREATE assessment_user |
| 44 | `2025_10_08_150627_add_companion_id_to_medical_records_table` | ALTER medical_records +companion_id |
| 45 | `2025_10_09_085030_create_notifications_table` | CREATE notifications |
| 46 | `2025_10_09_085301_create_notification_reads_table` | CREATE notification_reads |
| 47 | `2025_10_27_172604_create_resumes_table` | CREATE resumes |
| 48 | `2025_12_03_091400_create_backups_table` | CREATE backups |
| 49 | `2025_12_12_151226_create_restores_table` | CREATE restores |
| 50 | `2025_12_22_105355_create_doctor_resources_table` | CREATE doctor_resources |
| 51 | `2026_05_24_201240_add_resume_field_to_resume_table` | ALTER resumes +content |

---

## منابع در همین ریپازیتوری

| مسیر | محتوا |
|------|-------|
| `routes/api.php` | تعریف همه routeها |
| `database/migrations/` | ۵۱ فایل migration |
| `app/Models/` | ۲۹ مدل Eloquent |
| `app/Http/Controllers/` | منطق API |
| `config/auth.php` | تنظیمات JWT guards |
| `ebraz_backup.sql` | dump MySQL (قدیمی‌تر از ۴ migration آخر) |

---

*آخرین به‌روزرسانی: بر اساس وضعیت کد در تاریخ ۱۴۰۵/۰۴/۱۸*
