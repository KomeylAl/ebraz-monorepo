import type {
  AdminSubRole,
  AppointmentStatus,
  AssessmentStatus,
  Gender,
  PaymentStatus,
  PostStatus,
  Prisma,
  TherapistResourceType,
} from "@prisma/client";
import { bumpStat, log, type MigrationContext } from "./context";
import {
  asBoolean,
  asDate,
  asInt,
  asOptionalString,
  asRequiredDate,
  asString,
  parseJson,
  type MysqlRow,
} from "./utils";

async function query(ctx: MigrationContext, sql: string): Promise<MysqlRow[]> {
  const [rows] = await ctx.mysql.query(sql);
  return rows as MysqlRow[];
}

function enumValue<T extends string>(value: unknown, allowed: T[], fallback: T): T {
  const normalized = asString(value, fallback);
  return allowed.includes(normalized as T) ? (normalized as T) : fallback;
}

// ─── Core entities ───────────────────────────────────────────────────────────

export async function migrateAdmins(ctx: MigrationContext): Promise<void> {
  const rows = await query(ctx, "SELECT * FROM admins ORDER BY id ASC");
  for (const row of rows) {
    const phone = asString(row.phone);
    if (!phone) continue;

    const existing = await ctx.prisma.admin.findUnique({ where: { phone } });
    if (existing) {
      ctx.idMap.set("admin", row.id as number, existing.id);
      if (ctx.options.skipExisting) {
        bumpStat(ctx, "admins_skipped");
        continue;
      }
    }

    const data = {
      name: asString(row.name, "Admin"),
      phone,
      password: asString(row.password),
      subRole: enumValue<AdminSubRole>(row.role, [
        "boss",
        "receptionist",
        "manager",
        "author",
        "accountant",
      ], "boss"),
      birthDate: asRequiredDate(row.birth_date),
      createdAt: asRequiredDate(row.created_at),
      updatedAt: asRequiredDate(row.updated_at),
    };

    if (ctx.options.dryRun) {
      bumpStat(ctx, "admins");
      ctx.idMap.set("admin", row.id as number, `dry-admin-${row.id}`);
      continue;
    }

    const record = existing
      ? await ctx.prisma.admin.update({ where: { id: existing.id }, data })
      : await ctx.prisma.admin.create({ data });

    ctx.idMap.set("admin", row.id as number, record.id);
    bumpStat(ctx, existing ? "admins_updated" : "admins");
  }
  log(ctx, `admins: ${ctx.stats.admins ?? 0} created, ${ctx.stats.admins_skipped ?? 0} skipped`);
}

export async function migrateTherapists(ctx: MigrationContext): Promise<void> {
  const rows = await query(ctx, "SELECT * FROM doctors ORDER BY id ASC");
  for (const row of rows) {
    const phone = asString(row.phone);
    if (!phone) continue;

    const existing = await ctx.prisma.therapist.findUnique({ where: { phone } });
    if (existing) {
      ctx.idMap.set("therapist", row.id as number, existing.id);
      if (ctx.options.skipExisting) {
        bumpStat(ctx, "therapists_skipped");
        continue;
      }
    }

    const data = {
      name: asString(row.name, "Therapist"),
      phone,
      password: asOptionalString(row.password),
      nationalCode: asString(row.national_code, `legacy-${row.id}`),
      birthDate: asRequiredDate(row.birth_date),
      cardNumber: asString(row.card_number, `card-${row.id}`),
      medicalNumber: asOptionalString(row.medical_number),
      email: asOptionalString(row.email),
      avatar: asOptionalString(row.avatar),
      times: asOptionalString(row.times),
      days: asOptionalString(row.days),
      resume: asOptionalString(row.resume),
      profilePath: asOptionalString(row.profile_path),
      createdAt: asRequiredDate(row.created_at),
      updatedAt: asRequiredDate(row.updated_at),
    };

    if (ctx.options.dryRun) {
      bumpStat(ctx, "therapists");
      ctx.idMap.set("therapist", row.id as number, `dry-therapist-${row.id}`);
      continue;
    }

    const record = existing
      ? await ctx.prisma.therapist.update({ where: { id: existing.id }, data })
      : await ctx.prisma.therapist.create({ data });

    ctx.idMap.set("therapist", row.id as number, record.id);
    bumpStat(ctx, existing ? "therapists_updated" : "therapists");
  }
}

export async function migrateClients(ctx: MigrationContext): Promise<void> {
  const rows = await query(ctx, "SELECT * FROM clients ORDER BY id ASC");
  for (const row of rows) {
    const phone = asString(row.phone);
    if (!phone) continue;

    const existing = await ctx.prisma.client.findUnique({ where: { phone } });
    if (existing) {
      ctx.idMap.set("client", row.id as number, existing.id);
      if (ctx.options.skipExisting) {
        bumpStat(ctx, "clients_skipped");
        continue;
      }
    }

    const data = {
      name: asString(row.name, "Client"),
      phone,
      password: asOptionalString(row.password),
      birthDate: asDate(row.birth_date),
      address: asOptionalString(row.address),
      createdAt: asRequiredDate(row.created_at),
      updatedAt: asRequiredDate(row.updated_at),
    };

    if (ctx.options.dryRun) {
      bumpStat(ctx, "clients");
      ctx.idMap.set("client", row.id as number, `dry-client-${row.id}`);
      continue;
    }

    const record = existing
      ? await ctx.prisma.client.update({ where: { id: existing.id }, data })
      : await ctx.prisma.client.create({ data });

    ctx.idMap.set("client", row.id as number, record.id);
    bumpStat(ctx, existing ? "clients_updated" : "clients");
  }
}

export async function migrateCompanions(ctx: MigrationContext): Promise<void> {
  const rows = await query(ctx, "SELECT * FROM companions ORDER BY id ASC");
  for (const row of rows) {
    const phone = asString(row.phone);
    if (!phone) continue;

    const existing = await ctx.prisma.companion.findUnique({ where: { phone } });
    if (existing) {
      ctx.idMap.set("companion", row.id as number, existing.id);
      if (ctx.options.skipExisting) continue;
    }

    const data = {
      name: asString(row.name, "Companion"),
      phone,
      birthDate: asDate(row.birth_date),
      address: asOptionalString(row.address),
      createdAt: asRequiredDate(row.created_at),
      updatedAt: asRequiredDate(row.updated_at),
    };

    if (ctx.options.dryRun) {
      ctx.idMap.set("companion", row.id as number, `dry-companion-${row.id}`);
      bumpStat(ctx, "companions");
      continue;
    }

    const record = existing
      ? await ctx.prisma.companion.update({ where: { id: existing.id }, data })
      : await ctx.prisma.companion.create({ data });

    ctx.idMap.set("companion", row.id as number, record.id);
    bumpStat(ctx, "companions");
  }
}

// ─── CMS ─────────────────────────────────────────────────────────────────────

export async function migrateCategories(ctx: MigrationContext): Promise<void> {
  const rows = await query(ctx, "SELECT * FROM categories ORDER BY id ASC");
  for (const row of rows) {
    const slug = asString(row.slug, `category-${row.id}`);
    const existing = await ctx.prisma.category.findUnique({ where: { slug } });
    if (existing) {
      ctx.idMap.set("category", row.id as number, existing.id);
      if (ctx.options.skipExisting) continue;
    }

    const data = {
      name: asString(row.name, slug),
      slug,
      excerpt: asOptionalString(row.excerpt),
      content: asString(row.content, ""),
      image: asOptionalString(row.image),
      createdAt: asRequiredDate(row.created_at),
      updatedAt: asRequiredDate(row.updated_at),
    };

    if (ctx.options.dryRun) {
      ctx.idMap.set("category", row.id as number, `dry-category-${row.id}`);
      bumpStat(ctx, "categories");
      continue;
    }

    const record = existing
      ? await ctx.prisma.category.update({ where: { id: existing.id }, data })
      : await ctx.prisma.category.create({ data });

    ctx.idMap.set("category", row.id as number, record.id);
    bumpStat(ctx, "categories");
  }
}

export async function migrateTags(ctx: MigrationContext): Promise<void> {
  const rows = await query(ctx, "SELECT * FROM tags ORDER BY id ASC");
  for (const row of rows) {
    const slug = asString(row.slug, `tag-${row.id}`);
    const existing = await ctx.prisma.tag.findUnique({ where: { slug } });
    if (existing) {
      ctx.idMap.set("tag", row.id as number, existing.id);
      if (ctx.options.skipExisting) continue;
    }

    const data = {
      name: asString(row.name, slug),
      slug,
      excerpt: asOptionalString(row.excerpt),
      content: asString(row.content, ""),
      image: asOptionalString(row.image),
      createdAt: asRequiredDate(row.created_at),
      updatedAt: asRequiredDate(row.updated_at),
    };

    if (ctx.options.dryRun) {
      ctx.idMap.set("tag", row.id as number, `dry-tag-${row.id}`);
      bumpStat(ctx, "tags");
      continue;
    }

    const record = existing
      ? await ctx.prisma.tag.update({ where: { id: existing.id }, data })
      : await ctx.prisma.tag.create({ data });

    ctx.idMap.set("tag", row.id as number, record.id);
    bumpStat(ctx, "tags");
  }
}

export async function migratePosts(ctx: MigrationContext): Promise<void> {
  const rows = await query(ctx, "SELECT * FROM posts ORDER BY id ASC");
  for (const row of rows) {
    const slug = asString(row.slug, `post-${row.id}`);
    const adminId = ctx.idMap.get("admin", row.admin_id as number);
    if (!adminId) {
      bumpStat(ctx, "posts_skipped");
      continue;
    }

    const existing = await ctx.prisma.post.findUnique({ where: { slug } });
    const categoryId = ctx.idMap.get("category", row.category_id as number);

    const data = {
      adminId,
      categoryId,
      title: asString(row.title, slug),
      slug,
      excerpt: asOptionalString(row.excerpt),
      content: asString(row.content, ""),
      thumbnail: asOptionalString(row.thumbnail),
      status: enumValue<PostStatus>(row.status, ["draft", "published", "archived"], "draft"),
      publishedAt: asDate(row.published_at),
      createdAt: asRequiredDate(row.created_at),
      updatedAt: asRequiredDate(row.updated_at),
    };

    if (ctx.options.dryRun) {
      ctx.idMap.set("post", row.id as number, `dry-post-${row.id}`);
      bumpStat(ctx, "posts");
      continue;
    }

    const record = existing
      ? await ctx.prisma.post.update({ where: { id: existing.id }, data })
      : await ctx.prisma.post.create({ data });

    ctx.idMap.set("post", row.id as number, record.id);
    bumpStat(ctx, "posts");
  }

  const pivots = await query(ctx, "SELECT * FROM post_tag");
  for (const row of pivots) {
    const postId = ctx.idMap.get("post", row.post_id as number);
    const tagId = ctx.idMap.get("tag", row.tag_id as number);
    if (!postId || !tagId) continue;

    if (ctx.options.dryRun) {
      bumpStat(ctx, "post_tags");
      continue;
    }

    await ctx.prisma.postTag.upsert({
      where: { postId_tagId: { postId, tagId } },
      create: { postId, tagId },
      update: {},
    });
    bumpStat(ctx, "post_tags");
  }
}

export async function migrateDepartments(ctx: MigrationContext): Promise<void> {
  const rows = await query(ctx, "SELECT * FROM departments ORDER BY id ASC");
  for (const row of rows) {
    const slug = asString(row.slug, `department-${row.id}`);
    const existing = await ctx.prisma.department.findUnique({ where: { slug } });
    if (existing) {
      ctx.idMap.set("department", row.id as number, existing.id);
      if (ctx.options.skipExisting) continue;
    }

    const data = {
      title: asString(row.title, slug),
      slug,
      excerpt: asOptionalString(row.excerpt),
      content: asString(row.content, ""),
      thumbnail: asOptionalString(row.thumbnail),
      createdAt: asRequiredDate(row.created_at),
      updatedAt: asRequiredDate(row.updated_at),
    };

    if (ctx.options.dryRun) {
      ctx.idMap.set("department", row.id as number, `dry-department-${row.id}`);
      bumpStat(ctx, "departments");
      continue;
    }

    const record = existing
      ? await ctx.prisma.department.update({ where: { id: existing.id }, data })
      : await ctx.prisma.department.create({ data });

    ctx.idMap.set("department", row.id as number, record.id);
    bumpStat(ctx, "departments");
  }

  const pivots = await query(ctx, "SELECT * FROM department_doctor ORDER BY id ASC");
  for (const row of pivots) {
    const departmentId = ctx.idMap.get("department", row.department_id as number);
    const therapistId = ctx.idMap.get("therapist", row.doctor_id as number);
    if (!departmentId || !therapistId) continue;

    if (ctx.options.dryRun) {
      bumpStat(ctx, "department_therapists");
      continue;
    }

    await ctx.prisma.departmentTherapist.upsert({
      where: { departmentId_therapistId: { departmentId, therapistId } },
      create: { departmentId, therapistId },
      update: {},
    });
    bumpStat(ctx, "department_therapists");
  }
}

export async function migrateAbout(ctx: MigrationContext): Promise<void> {
  const rows = await query(ctx, "SELECT * FROM abouts ORDER BY id ASC");
  for (const row of rows) {
    const data = {
      title: asString(row.title, "Ebraz Clinic"),
      about: asString(row.about, ""),
      address: asString(row.address, ""),
      phones: asString(row.phones, ""),
      mobilePhones: asString(row.mobile_phones, ""),
      logoPath: asString(row.logo_path, ""),
      lat: asString(row.lat, "0"),
      longitude: asString(row.long, "0"),
      createdAt: asRequiredDate(row.created_at),
      updatedAt: asRequiredDate(row.updated_at),
    };

    if (ctx.options.dryRun) {
      bumpStat(ctx, "abouts");
      continue;
    }

    const existing = await ctx.prisma.about.findFirst();
    if (existing) {
      await ctx.prisma.about.update({ where: { id: existing.id }, data });
    } else {
      await ctx.prisma.about.create({ data });
    }
    bumpStat(ctx, "abouts");
  }
}

// ─── Workshops ───────────────────────────────────────────────────────────────

export async function migrateWorkshops(ctx: MigrationContext): Promise<void> {
  const rows = await query(ctx, "SELECT * FROM work_shops ORDER BY id ASC");
  for (const row of rows) {
    const slug = asOptionalString(row.slug) ?? `workshop-${row.id}`;
    const existing = await ctx.prisma.workshop.findUnique({ where: { slug } });
    if (existing) {
      ctx.idMap.set("workshop", row.id as number, existing.id);
      if (ctx.options.skipExisting) continue;
    }

    const data = {
      title: asString(row.title, slug),
      slug,
      excerpt: asOptionalString(row.excerpt),
      content: asString(row.content, ""),
      organizers: asOptionalString(row.organizers),
      startDate: asDate(row.start_date),
      endDate: asDate(row.end_date),
      weekDay: asOptionalString(row.week_day),
      time: asOptionalString(row.time),
      imgPath: asOptionalString(row.img_path),
      createdAt: asRequiredDate(row.created_at),
      updatedAt: asRequiredDate(row.updated_at),
    };

    if (ctx.options.dryRun) {
      ctx.idMap.set("workshop", row.id as number, `dry-workshop-${row.id}`);
      bumpStat(ctx, "workshops");
      continue;
    }

    const record = existing
      ? await ctx.prisma.workshop.update({ where: { id: existing.id }, data })
      : await ctx.prisma.workshop.create({ data });

    ctx.idMap.set("workshop", row.id as number, record.id);
    bumpStat(ctx, "workshops");
  }

  const participants = await query(ctx, "SELECT * FROM participants ORDER BY id ASC");
  for (const row of participants) {
    const phone = asString(row.phone, `participant-${row.id}`);
    const existing = await ctx.prisma.participant.findFirst({ where: { phone } });
    if (existing) {
      ctx.idMap.set("participant", row.id as number, existing.id);
      if (ctx.options.skipExisting) continue;
    }

    const data = {
      name: asString(row.name, "Participant"),
      nameEn: asOptionalString(row.name_en),
      nationalCode: asOptionalString(row.national_code),
      phone,
      gender: enumValue<Gender>(row.gender, ["male", "female"], "male"),
      approved: asBoolean(row.approved),
      createdAt: asRequiredDate(row.created_at),
      updatedAt: asRequiredDate(row.updated_at),
    };

    if (ctx.options.dryRun) {
      ctx.idMap.set("participant", row.id as number, `dry-participant-${row.id}`);
      bumpStat(ctx, "participants");
      continue;
    }

    const record = existing
      ? await ctx.prisma.participant.update({ where: { id: existing.id }, data })
      : await ctx.prisma.participant.create({ data });

    ctx.idMap.set("participant", row.id as number, record.id);
    bumpStat(ctx, "participants");
  }

  const pivots = await query(ctx, "SELECT * FROM participant_workshop ORDER BY id ASC");
  for (const row of pivots) {
    const participantId = ctx.idMap.get("participant", row.participant_id as number);
    const workshopId = ctx.idMap.get("workshop", row.work_shop_id as number);
    if (!participantId || !workshopId) continue;

    const data = {
      approved: asBoolean(row.approved),
      joinedAt: asDate(row.joined_at),
      registeredAt: asRequiredDate(row.registered_at ?? row.created_at),
    };

    if (ctx.options.dryRun) {
      bumpStat(ctx, "participant_workshops");
      continue;
    }

    await ctx.prisma.participantWorkshop.upsert({
      where: { participantId_workshopId: { participantId, workshopId } },
      create: { participantId, workshopId, ...data },
      update: data,
    });
    bumpStat(ctx, "participant_workshops");
  }

  const sessions = await query(ctx, "SELECT * FROM workshop_sessions ORDER BY id ASC");
  for (const row of sessions) {
    const workshopId = ctx.idMap.get("workshop", row.work_shop_id as number);
    if (!workshopId) continue;

    const data = {
      workshopId,
      title: asString(row.title, "Session"),
      description: asString(row.description, ""),
      sessionDate: asDate(row.session_date),
      startTime: asString(row.start_time, "00:00"),
      endTime: asString(row.end_time, "00:00"),
      location: asOptionalString(row.location),
      link: asOptionalString(row.link),
      createdAt: asRequiredDate(row.created_at),
      updatedAt: asRequiredDate(row.updated_at),
    };

    if (ctx.options.dryRun) {
      bumpStat(ctx, "workshop_sessions");
      continue;
    }

    await ctx.prisma.workshopSession.create({ data });
    bumpStat(ctx, "workshop_sessions");
  }
}

// ─── Therapist panel extras ──────────────────────────────────────────────────

export async function migrateTherapistResumes(ctx: MigrationContext): Promise<void> {
  const rows = await query(ctx, "SELECT * FROM resumes ORDER BY id ASC");
  for (const row of rows) {
    const therapistId = ctx.idMap.get("therapist", row.doctor_id as number);
    if (!therapistId) continue;

    const data = {
      therapistId,
      title: asOptionalString(row.title),
      bio: asOptionalString(row.bio),
      specialization: asOptionalString(row.specialization),
      educations: parseJson(row.educations) as Prisma.InputJsonValue | undefined,
      experiences: parseJson(row.experiences) as Prisma.InputJsonValue | undefined,
      skills: parseJson(row.skills) as Prisma.InputJsonValue | undefined,
      certifications: parseJson(row.certifications) as Prisma.InputJsonValue | undefined,
      content: asOptionalString(row.content),
      socialLinks: parseJson(row.social_links) as Prisma.InputJsonValue | undefined,
      filePath: asOptionalString(row.file_path),
      createdAt: asRequiredDate(row.created_at),
      updatedAt: asRequiredDate(row.updated_at),
    };

    if (ctx.options.dryRun) {
      bumpStat(ctx, "therapist_resumes");
      continue;
    }

    await ctx.prisma.therapistResume.upsert({
      where: { therapistId },
      create: data,
      update: data,
    });
    bumpStat(ctx, "therapist_resumes");
  }

  const pdfRows = await query(ctx, "SELECT * FROM doctor_resumes ORDER BY id ASC");
  for (const row of pdfRows) {
    const therapistId = ctx.idMap.get("therapist", row.doctor_id as number);
    if (!therapistId) continue;

    if (ctx.options.dryRun) {
      bumpStat(ctx, "therapist_resume_pdfs");
      continue;
    }

    const existing = await ctx.prisma.therapistResume.findUnique({ where: { therapistId } });
    if (existing?.filePath) continue;

    await ctx.prisma.therapistResume.upsert({
      where: { therapistId },
      create: {
        therapistId,
        filePath: asString(row.file_path),
        createdAt: asRequiredDate(row.created_at),
        updatedAt: asRequiredDate(row.updated_at),
      },
      update: { filePath: asString(row.file_path) },
    });
    bumpStat(ctx, "therapist_resume_pdfs");
  }
}

export async function migrateTherapistResources(ctx: MigrationContext): Promise<void> {
  const rows = await query(ctx, "SELECT * FROM doctor_resources ORDER BY id ASC");
  for (const row of rows) {
    const therapistId = ctx.idMap.get("therapist", row.doctor_id as number);
    if (!therapistId) continue;

    const data = {
      therapistId,
      title: asString(row.title, "Resource"),
      type: enumValue<TherapistResourceType>(row.type, ["link", "file"], "link"),
      description: asOptionalString(row.description),
      link: asOptionalString(row.link),
      filePath: asOptionalString(row.file),
      createdAt: asRequiredDate(row.created_at),
      updatedAt: asRequiredDate(row.updated_at),
    };

    if (ctx.options.dryRun) {
      bumpStat(ctx, "therapist_resources");
      continue;
    }

    await ctx.prisma.therapistResource.create({ data });
    bumpStat(ctx, "therapist_resources");
  }
}

// ─── Medical records ─────────────────────────────────────────────────────────

export async function migrateMedicalRecords(ctx: MigrationContext): Promise<void> {
  const rows = await query(ctx, "SELECT * FROM medical_records ORDER BY id ASC");
  for (const row of rows) {
    const clientId = ctx.idMap.get("client", row.client_id as number);
    if (!clientId) {
      bumpStat(ctx, "medical_records_skipped");
      continue;
    }

    const recordNumber = asString(row.record_number, `REC-${row.id}`);
    const existing = await ctx.prisma.medicalRecord.findUnique({ where: { recordNumber } });

    const data = {
      recordNumber,
      clientId,
      therapistId: ctx.idMap.get("therapist", row.doctor_id as number),
      supervisorId: ctx.idMap.get("therapist", row.supervisor_id as number),
      adminId: ctx.idMap.get("admin", row.admin_id as number),
      companionId: ctx.idMap.get("companion", row.companion_id as number),
      referenceSource: asOptionalString(row.reference_source),
      admissionDate: asRequiredDate(row.admission_date),
      visitDate: asRequiredDate(row.visit_date),
      chiefComplaints: asOptionalString(row.chief_complaints),
      presentIllness: asOptionalString(row.present_illness),
      pastHistory: asOptionalString(row.past_history),
      familyHistory: asOptionalString(row.family_history),
      personalHistory: asOptionalString(row.personal_history),
      mse: asOptionalString(row.mse),
      diagnosis: asOptionalString(row.diagnosis),
      createdAt: asRequiredDate(row.created_at),
      updatedAt: asRequiredDate(row.updated_at),
    };

    if (ctx.options.dryRun) {
      ctx.idMap.set("medical_record", row.id as number, `dry-record-${row.id}`);
      bumpStat(ctx, "medical_records");
      continue;
    }

    const record = existing
      ? await ctx.prisma.medicalRecord.update({ where: { id: existing.id }, data })
      : await ctx.prisma.medicalRecord.upsert({
          where: { clientId },
          create: data,
          update: data,
        });

    ctx.idMap.set("medical_record", row.id as number, record.id);
    bumpStat(ctx, "medical_records");
  }

  const images = await query(
    ctx,
    "SELECT * FROM record_images_teble ORDER BY id ASC",
  );
  for (const row of images) {
    const medicalRecordId = ctx.idMap.get("medical_record", row.medical_record_id as number);
    if (!medicalRecordId) continue;

    const data = {
      medicalRecordId,
      filePath: asString(row.file_path),
      createdAt: asRequiredDate(row.created_at),
      updatedAt: asRequiredDate(row.updated_at),
    };

    if (ctx.options.dryRun) {
      bumpStat(ctx, "record_images");
      continue;
    }

    await ctx.prisma.recordImage.create({ data });
    bumpStat(ctx, "record_images");
  }
}

// ─── Appointments & payments ─────────────────────────────────────────────────

export async function migrateAppointments(ctx: MigrationContext): Promise<void> {
  const rows = await query(
    ctx,
    `SELECT r.*, ru.doctor_id, ru.client_id
     FROM referrals r
     INNER JOIN referral_user ru ON ru.referral_id = r.id
     ORDER BY r.id ASC`,
  );

  for (const row of rows) {
    const therapistId = ctx.idMap.get("therapist", row.doctor_id as number);
    const clientId = ctx.idMap.get("client", row.client_id as number);
    if (!therapistId || !clientId) {
      bumpStat(ctx, "appointments_skipped");
      continue;
    }

    const data = {
      therapistId,
      clientId,
      date: asRequiredDate(row.date),
      time: asString(row.time, "00:00"),
      amount: asInt(row.amount),
      status: enumValue<AppointmentStatus>(row.status, ["pending", "done"], "pending"),
      createdAt: asRequiredDate(row.created_at),
      updatedAt: asRequiredDate(row.updated_at),
    };

    if (ctx.options.dryRun) {
      ctx.idMap.set("appointment", row.id as number, `dry-appointment-${row.id}`);
      bumpStat(ctx, "appointments");
      continue;
    }

    const record = await ctx.prisma.appointment.create({ data });
    ctx.idMap.set("appointment", row.id as number, record.id);
    ctx.idMap.set("referral", row.id as number, record.id);
    bumpStat(ctx, "appointments");
  }

  const payments = await query(ctx, "SELECT * FROM payments ORDER BY id ASC");
  for (const row of payments) {
    const appointmentId =
      ctx.idMap.get("referral", row.referral_id as number) ??
      ctx.idMap.get("appointment", row.referral_id as number);
    if (!appointmentId) {
      bumpStat(ctx, "payments_skipped");
      continue;
    }

    const data = {
      appointmentId,
      status: enumValue<PaymentStatus>(row.status, ["pending", "paid", "unpaid"], "pending"),
      amount: asInt(row.amount),
      createdAt: asRequiredDate(row.created_at),
      updatedAt: asRequiredDate(row.updated_at),
    };

    if (ctx.options.dryRun) {
      bumpStat(ctx, "payments");
      continue;
    }

    await ctx.prisma.payment.upsert({
      where: { appointmentId },
      create: data,
      update: data,
    });
    bumpStat(ctx, "payments");
  }
}

// ─── Assessments ─────────────────────────────────────────────────────────────

export async function migrateAssessments(ctx: MigrationContext): Promise<void> {
  const rows = await query(ctx, "SELECT * FROM init_assessments ORDER BY id ASC");
  for (const row of rows) {
    const data = {
      date: asDate(row.date),
      time: asOptionalString(row.time),
      status: enumValue<AssessmentStatus>(row.status, ["pending", "done"], "pending"),
      filePath: asOptionalString(row.file_path),
      createdAt: asRequiredDate(row.created_at),
      updatedAt: asRequiredDate(row.updated_at),
    };

    if (ctx.options.dryRun) {
      ctx.idMap.set("assessment", row.id as number, `dry-assessment-${row.id}`);
      bumpStat(ctx, "assessments");
      continue;
    }

    const assessment = await ctx.prisma.initAssessment.create({ data });
    ctx.idMap.set("assessment", row.id as number, assessment.id);
    bumpStat(ctx, "assessments");
  }

  const assignments = await query(ctx, "SELECT * FROM assessment_user ORDER BY id ASC");
  for (const row of assignments) {
    const initAssessmentId = ctx.idMap.get("assessment", row.init_assessment_id as number);
    const clientId = ctx.idMap.get("client", row.client_id as number);
    if (!initAssessmentId || !clientId) continue;

    const data = {
      initAssessmentId,
      clientId,
      therapistId: ctx.idMap.get("therapist", row.doctor_id as number),
    };

    if (ctx.options.dryRun) {
      bumpStat(ctx, "assessment_assignments");
      continue;
    }

    await ctx.prisma.assessmentAssignment.create({ data });
    bumpStat(ctx, "assessment_assignments");
  }
}

// ─── Invoices ────────────────────────────────────────────────────────────────

export async function migrateInvoices(ctx: MigrationContext): Promise<void> {
  const rows = await query(ctx, "SELECT * FROM invoices ORDER BY id ASC");
  for (const row of rows) {
    const clientId = ctx.idMap.get("client", row.client_id as number);
    const adminId = ctx.idMap.get("admin", row.admin_id as number);
    if (!clientId || !adminId) {
      bumpStat(ctx, "invoices_skipped");
      continue;
    }

    const data = {
      clientId,
      adminId,
      fromDate: asRequiredDate(row.from_date),
      toDate: asRequiredDate(row.to_date),
      filePath: asString(row.file_path),
      totalAmount: 0,
      createdAt: asRequiredDate(row.created_at),
      updatedAt: asRequiredDate(row.updated_at),
    };

    if (ctx.options.dryRun) {
      bumpStat(ctx, "invoices");
      continue;
    }

    await ctx.prisma.invoice.create({ data });
    bumpStat(ctx, "invoices");
  }
}

export const MIGRATION_STEPS: Array<{ name: string; run: (ctx: MigrationContext) => Promise<void> }> =
  [
    { name: "admins", run: migrateAdmins },
    { name: "therapists", run: migrateTherapists },
    { name: "clients", run: migrateClients },
    { name: "companions", run: migrateCompanions },
    { name: "categories", run: migrateCategories },
    { name: "tags", run: migrateTags },
    { name: "posts", run: migratePosts },
    { name: "departments", run: migrateDepartments },
    { name: "about", run: migrateAbout },
    { name: "workshops", run: migrateWorkshops },
    { name: "therapist_resumes", run: migrateTherapistResumes },
    { name: "therapist_resources", run: migrateTherapistResources },
    { name: "medical_records", run: migrateMedicalRecords },
    { name: "appointments", run: migrateAppointments },
    { name: "assessments", run: migrateAssessments },
    { name: "invoices", run: migrateInvoices },
  ];
