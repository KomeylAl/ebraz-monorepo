"use client";

import Header from "@/components/layout/Header";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";

import {
  useBackupDoctors,
  useBackupDoctorResumes,
  useBackupClients,
  useBackupPosts,
  useBackupCategoties,
  useBackupTags,
  useBackupWorkshops,
  useBackupAbout,
  useBackupAdmins,
} from "@/hooks/useBackup";

import {
  useRestoreDoctors,
  useRestoreDoctorResumes,
  useRestoreClients,
  useRestorePosts,
  useRestoreCategories,
  useRestoreTags,
  useRestoreWorkshops,
  useRestoreAbout,
  useRestoreAdmins,
} from "@/hooks/useRestore";
import BackupRestoreSection from "../_components/BackupRestoreSection";

export default function Settings() {
  const backupDoctors = useBackupDoctors();
  const restoreDoctors = useRestoreDoctors();
  const backupDoctorResumes = useBackupDoctorResumes();
  const restoreDoctorResumes = useRestoreDoctorResumes();
  const backupClients = useBackupClients();
  const restoreClients = useRestoreClients();
  const backupPosts = useBackupPosts();
  const restorePosts = useRestorePosts();
  const backupCategories = useBackupCategoties();
  const restoreCategories = useRestoreCategories();
  const backupTags = useBackupTags();
  const restoreTags = useRestoreTags();
  const backupWorkshops = useBackupWorkshops();
  const restoreWorkshops = useRestoreWorkshops();
  const backupAbout = useBackupAbout();
  const restoreAbout = useRestoreAbout();
  const backupAdmins = useBackupAdmins();
  const restoreAdmins = useRestoreAdmins();

  return (
    <div className="w-full h-full flex flex-col">
      <Header searchFn={() => {}} isShowSearch={false} />

      <div className="p-12 space-y-6">
        <h2 className="font-bold text-2xl">تنظیمات</h2>

        <Accordion type="multiple" className="space-y-4">
          {/* رواندرمانگران */}
          <AccordionItem value="doctors">
            <AccordionTrigger>رواندرمانگران</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <BackupRestoreSection
                title="رواندرمانگران"
                onBackup={() => backupDoctors.mutate()}
                onRestore={(data) => restoreDoctors.mutate(data)}
                isBackingUp={backupDoctors.isPending}
                isRestoring={restoreDoctors.isPending}
              />
              <BackupRestoreSection
                title="رزومه رواندرمانگران"
                onBackup={() => backupDoctorResumes.mutate()}
                onRestore={(data) => restoreDoctorResumes.mutate(data)}
                isBackingUp={backupDoctorResumes.isPending}
                isRestoring={restoreDoctorResumes.isPending}
              />
            </AccordionContent>
          </AccordionItem>

          {/* مراجعان */}
          <AccordionItem value="clients">
            <AccordionTrigger>مراجعان</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <BackupRestoreSection
                title="مراجعان"
                onBackup={() => backupClients.mutate()}
                onRestore={(data) => restoreClients.mutate(data)}
                isBackingUp={backupClients.isPending}
                isRestoring={restoreClients.isPending}
              />
            </AccordionContent>
          </AccordionItem>

          {/* محتوا */}
          <AccordionItem value="content">
            <AccordionTrigger>محتوا</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <BackupRestoreSection
                title="مقالات"
                onBackup={() => backupPosts.mutate()}
                onRestore={(data) => restorePosts.mutate(data)}
                isBackingUp={backupPosts.isPending}
                isRestoring={restorePosts.isPending}
              />
              <BackupRestoreSection
                title="دسته‌بندی‌ها"
                onBackup={() => backupCategories.mutate()}
                onRestore={(data) => restoreCategories.mutate(data)}
                isBackingUp={backupCategories.isPending}
                isRestoring={restoreCategories.isPending}
              />
              <BackupRestoreSection
                title="برچسب‌ها"
                onBackup={() => backupTags.mutate()}
                onRestore={(data) => restoreTags.mutate(data)}
                isBackingUp={backupTags.isPending}
                isRestoring={restoreTags.isPending}
              />
              <BackupRestoreSection
                title="کارگاه‌ها"
                onBackup={() => backupWorkshops.mutate()}
                onRestore={(data) => restoreWorkshops.mutate(data)}
                isBackingUp={backupWorkshops.isPending}
                isRestoring={restoreWorkshops.isPending}
              />
              <BackupRestoreSection
                title="درباره‌ی مرکز"
                onBackup={() => backupAbout.mutate()}
                onRestore={(data) => restoreAbout.mutate(data)}
                isBackingUp={backupAbout.isPending}
                isRestoring={restoreAbout.isPending}
              />
            </AccordionContent>
          </AccordionItem>

          {/* مدیران */}
          <AccordionItem value="admins">
            <AccordionTrigger>مدیران</AccordionTrigger>
            <AccordionContent className="space-y-4">
              <BackupRestoreSection
                title="مدیران"
                onBackup={() => backupAdmins.mutate()}
                onRestore={(data) => restoreAdmins.mutate(data)}
                isBackingUp={backupAdmins.isPending}
                isRestoring={restoreAdmins.isPending}
              />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
