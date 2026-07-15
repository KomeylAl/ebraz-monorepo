import { AdminSubRole, UserRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  ADMIN_SUB_ROLE_PERMISSIONS,
  PERMISSION_DEFINITIONS,
  ROLE_PERMISSIONS,
} from "./constants/permissions";
import { prisma } from "./client";

const DEV_PASSWORD = "Ebraz@1234";

async function seedPermissions() {
  const permissionMap = new Map<string, string>();

  for (const permission of PERMISSION_DEFINITIONS) {
    const record = await prisma.permission.upsert({
      where: { key: permission.key },
      update: { description: permission.description, deletedAt: null },
      create: permission,
    });
    permissionMap.set(permission.key, record.id);
  }

  return permissionMap;
}

async function seedRolePermissions(permissionMap: Map<string, string>) {
  for (const [subRole, keys] of Object.entries(ADMIN_SUB_ROLE_PERMISSIONS)) {
    for (const key of keys) {
      const permissionId = permissionMap.get(key);
      if (!permissionId) continue;

      const existing = await prisma.rolePermission.findFirst({
        where: {
          role: UserRole.ADMIN,
          subRole: subRole as AdminSubRole,
          permissionId,
          deletedAt: null,
        },
      });

      if (existing) continue;

      await prisma.rolePermission.create({
        data: {
          role: UserRole.ADMIN,
          subRole: subRole as AdminSubRole,
          permissionId,
        },
      });
    }
  }

  for (const [role, keys] of Object.entries(ROLE_PERMISSIONS)) {
    for (const key of keys) {
      const permissionId = permissionMap.get(key);
      if (!permissionId) continue;

      const existing = await prisma.rolePermission.findFirst({
        where: {
          role: role as UserRole,
          subRole: null,
          permissionId,
          deletedAt: null,
        },
      });

      if (existing) continue;

      await prisma.rolePermission.create({
        data: {
          role: role as UserRole,
          permissionId,
        },
      });
    }
  }
}

async function seedDevUsers() {
  const passwordHash = await bcrypt.hash(DEV_PASSWORD, 12);

  await prisma.admin.upsert({
    where: { phone: "09121234567" },
    update: {
      name: "مدیر سیستم",
      password: passwordHash,
      subRole: AdminSubRole.boss,
      birthDate: new Date("1990-01-01"),
      deletedAt: null,
    },
    create: {
      name: "مدیر سیستم",
      phone: "09121234567",
      password: passwordHash,
      subRole: AdminSubRole.boss,
      birthDate: new Date("1990-01-01"),
    },
  });

  await prisma.therapist.upsert({
    where: { phone: "09131234567" },
    update: {
      name: "دکتر نمونه",
      password: passwordHash,
      nationalCode: "1234567890",
      birthDate: new Date("1985-06-15"),
      cardNumber: "6037991234567890",
      medicalNumber: "psy-12345",
      email: "therapist@ebraz.local",
      days: "شنبه,دوشنبه,چهارشنبه",
      times: "09:00-17:00",
      deletedAt: null,
    },
    create: {
      name: "دکتر نمونه",
      phone: "09131234567",
      password: passwordHash,
      nationalCode: "1234567890",
      birthDate: new Date("1985-06-15"),
      cardNumber: "6037991234567890",
      medicalNumber: "psy-12345",
      email: "therapist@ebraz.local",
      days: "شنبه,دوشنبه,چهارشنبه",
      times: "09:00-17:00",
    },
  });

  await prisma.client.upsert({
    where: { phone: "09141234567" },
    update: {
      name: "مراجع نمونه",
      password: passwordHash,
      birthDate: new Date("1995-03-20"),
      deletedAt: null,
    },
    create: {
      name: "مراجع نمونه",
      phone: "09141234567",
      password: passwordHash,
      birthDate: new Date("1995-03-20"),
    },
  });

  console.log("Dev users seeded (password: Ebraz@1234):");
  console.log("  Admin:     09121234567");
  console.log("  Therapist: 09131234567");
  console.log("  Client:    09141234567");

  await seedDevAppointment();
  await seedDevCms();
  await seedDevWorkshops();
  await seedDevAssessments();
  await seedDevNotifications();
  await seedDevTherapistPanel();
}

async function seedDevAppointment() {
  const therapist = await prisma.therapist.findFirst({
    where: { phone: "09131234567", deletedAt: null },
  });
  const client = await prisma.client.findFirst({
    where: { phone: "09141234567", deletedAt: null },
  });

  if (!therapist || !client) return;

  const existing = await prisma.appointment.findFirst({
    where: {
      therapistId: therapist.id,
      clientId: client.id,
      deletedAt: null,
    },
  });

  if (existing) {
    await seedDevMedicalRecord(therapist.id);
    return;
  }

  const appointment = await prisma.appointment.create({
    data: {
      therapistId: therapist.id,
      clientId: client.id,
      date: new Date("2026-07-15"),
      time: "10:30",
      amount: 500000,
      status: "pending",
    },
  });

  await prisma.payment.create({
    data: {
      appointmentId: appointment.id,
      status: "pending",
      amount: 500000,
    },
  });

  console.log("Dev appointment seeded.");

  await seedDevMedicalRecord(therapist.id);
}

async function seedDevMedicalRecord(therapistId: string) {
  const client = await prisma.client.findFirst({
    where: { phone: "09141234567", deletedAt: null },
  });
  if (!client) return;

  const seedData = {
    recordNumber: "REC-10001",
    therapistId,
    admissionDate: new Date("2026-01-10"),
    visitDate: new Date("2026-01-15"),
    referenceSource: "وب‌سایت",
    chiefComplaints: "اضطراب و بی‌خوابی",
    diagnosis: "اختلال اضطراب",
    deletedAt: null,
    deletedBy: null,
  };

  const existing = await prisma.medicalRecord.findFirst({
    where: { clientId: client.id },
  });

  if (existing) {
    if (existing.deletedAt) {
      await prisma.medicalRecord.update({
        where: { id: existing.id },
        data: seedData,
      });
      console.log("Dev medical record restored.");
    }
    return;
  }

  await prisma.medicalRecord.create({
    data: {
      ...seedData,
      clientId: client.id,
    },
  });

  console.log("Dev medical record seeded.");
}

async function seedDevCms() {
  const admin = await prisma.admin.findFirst({
    where: { phone: "09121234567", deletedAt: null },
  });
  const therapist = await prisma.therapist.findFirst({
    where: { phone: "09131234567", deletedAt: null },
  });
  if (!admin) return;

  const category = await prisma.category.upsert({
    where: { slug: "mental-health" },
    update: { deletedAt: null },
    create: {
      name: "سلامت روان",
      slug: "mental-health",
      content: "مقالات مرتبط با سلامت روان",
      excerpt: "مجموعه مقالات تخصصی",
    },
  });

  const tag = await prisma.tag.upsert({
    where: { slug: "anxiety" },
    update: { deletedAt: null },
    create: {
      name: "اضطراب",
      slug: "anxiety",
      content: "مطالب مرتبط با اضطراب",
    },
  });

  const existingPost = await prisma.post.findFirst({
    where: { slug: "sample-post" },
  });
  if (!existingPost) {
    const post = await prisma.post.create({
      data: {
        adminId: admin.id,
        categoryId: category.id,
        title: "مقاله نمونه",
        slug: "sample-post",
        content: "<p>این یک مقاله نمونه برای تست CMS است.</p>",
        excerpt: "خلاصه مقاله نمونه",
        status: "published",
        publishedAt: new Date(),
      },
    });
    await prisma.postTag.create({
      data: { postId: post.id, tagId: tag.id },
    });
  }

  const department = await prisma.department.upsert({
    where: { slug: "psychology" },
    update: { deletedAt: null },
    create: {
      title: "روانشناسی بالینی",
      slug: "psychology",
      content: "خدمات روانشناسی بالینی کلینیک ابراز",
      excerpt: "درمان اختلالات روانی",
    },
  });

  if (therapist) {
    await prisma.departmentTherapist.upsert({
      where: {
        departmentId_therapistId: {
          departmentId: department.id,
          therapistId: therapist.id,
        },
      },
      update: {},
      create: {
        departmentId: department.id,
        therapistId: therapist.id,
      },
    });
  }

  const existingAbout = await prisma.about.findFirst({
    where: { deletedAt: null },
  });
  if (!existingAbout) {
    await prisma.about.create({
      data: {
        title: "کلینیک ابراز",
        about: "کلینیک تخصصی روانشناسی و مشاوره ابراز",
        address: "تهران، خیابان نمونه",
        phones: "02112345678",
        mobilePhones: "09121234567",
        logoPath: "/uploads/pictures/logo.png",
        lat: "35.6892",
        longitude: "51.3890",
      },
    });
  }

  console.log("Dev CMS content seeded.");
}

async function seedDevWorkshops() {
  const existing = await prisma.workshop.findFirst({
    where: { slug: "stress-management", deletedAt: null },
  });
  if (existing) return;

  const workshop = await prisma.workshop.create({
    data: {
      title: "کارگاه مدیریت استرس",
      slug: "stress-management",
      excerpt: "آموزش تکنیک‌های مدیریت استرس",
      content: "<p>کارگاه عملی مدیریت استرس برای مراجعین کلینیک ابراز.</p>",
      organizers: "کلینیک ابراز",
      startDate: new Date("2026-08-01"),
      endDate: new Date("2026-12-31"),
      weekDay: "جمعه",
      time: "16:00-18:00",
      imgPath: "/uploads/workshop_images/sample.jpg",
      sessions: {
        create: {
          title: "جلسه اول",
          description: "معرفی و تکنیک‌های تنفسی",
          sessionDate: new Date("2026-08-15"),
          startTime: "16:00",
          endTime: "18:00",
          location: "کلینیک ابراز",
        },
      },
    },
    include: { sessions: true },
  });

  console.log("Dev workshop seeded:", workshop.slug);
}

async function seedDevAssessments() {
  const therapist = await prisma.therapist.findFirst({
    where: { phone: "09131234567", deletedAt: null },
  });
  const client = await prisma.client.findFirst({
    where: { phone: "09141234567", deletedAt: null },
  });
  if (!therapist || !client) return;

  const existing = await prisma.initAssessment.findFirst({
    where: {
      deletedAt: null,
      assignment: { clientId: client.id },
    },
  });
  if (existing) return;

  await prisma.initAssessment.create({
    data: {
      date: new Date("2026-07-20"),
      time: "11:00",
      status: "pending",
      assignment: {
        create: {
          clientId: client.id,
          therapistId: therapist.id,
        },
      },
    },
  });

  console.log("Dev assessment seeded.");
}

async function seedDevNotifications() {
  const existing = await prisma.notification.findFirst({
    where: { title: "خوش آمدید به کلینیک ابراز" },
  });
  if (existing) return;

  await prisma.notification.create({
    data: {
      title: "خوش آمدید به کلینیک ابراز",
      message: "سیستم نوتیفیکیشن با موفقیت راه‌اندازی شد.",
      type: "system",
      priority: "low",
      deliveryChannels: ["in_app"],
      status: "sent",
      targetRole: "ADMIN",
      targetId: null,
    },
  });

  console.log("Dev notification seeded.");
}

async function seedDevTherapistPanel() {
  const therapist = await prisma.therapist.findFirst({
    where: { phone: "09131234567", deletedAt: null },
  });
  if (!therapist) return;

  await prisma.therapistResume.upsert({
    where: { therapistId: therapist.id },
    update: {},
    create: {
      therapistId: therapist.id,
      title: "دکتر نمونه",
      bio: "روانشناس بالینی با تجربه درمان اضطراب و افسردگی",
      specialization: "روانشناسی بالینی",
      educations: [{ degree: "دکترا", institution: "دانشگاه تهران", year: "2015" }],
      experiences: [
        { role: "روانشناس", organization: "کلینیک ابراز", from: "2016", to: "اکنون" },
      ],
      skills: ["CBT", "خانواده‌درمانی"],
      certifications: ["مجوز نظام روانشناسی"],
      content: "<p>رزومه نمونه درمانگر</p>",
      socialLinks: { website: "https://ebraz.local" },
    },
  });

  const existingResource = await prisma.therapistResource.findFirst({
    where: { therapistId: therapist.id, title: "راهنمای مراجع" },
  });
  if (!existingResource) {
    await prisma.therapistResource.create({
      data: {
        therapistId: therapist.id,
        title: "راهنمای مراجع",
        type: "link",
        description: "توضیحات اولین جلسه",
        link: "https://ebraz.local/guide",
      },
    });
  }

  console.log("Dev therapist panel seeded.");
}

async function main() {
  console.log("Seeding database...");

  const permissionMap = await seedPermissions();
  console.log(`Seeded ${permissionMap.size} permissions.`);

  await seedRolePermissions(permissionMap);
  console.log("Seeded role permissions.");

  if (process.env.SEED_DEV_USERS !== "false") {
    await seedDevUsers();
  }

  console.log("Seed completed.");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
