"use client";

import React from "react";
import Link from "next/link";
import { PuffLoader } from "react-spinners";
import Header from "@/components/layout/Header";
import ErrorComponent from "@/components/layout/ErrorComponent";
import { useClient, useClientRecord } from "@/hooks/useClients";
import { dateConvert } from "@/lib/utils";

interface Params {
  clientId: string;
}

interface PageProps {
  params: React.Usable<Params>;
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="text-sm font-medium text-slate-800 whitespace-pre-wrap">
        {value?.trim() ? value : "—"}
      </p>
    </div>
  );
}

export default function ClientDetailPage({ params }: PageProps) {
  const { clientId } = React.use(params);
  const { data: client, isLoading, error, refetch } = useClient(clientId);
  const {
    data: record,
    isLoading: recordLoading,
    error: recordError,
    refetch: refetchRecord,
  } = useClientRecord(clientId);

  return (
    <div className="w-full h-full flex flex-col">
      <Header searchFn={() => {}} isShowSearch={false} />
      <div className="w-full p-8 space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <Link href="/clients" className="text-sm text-blue-600 hover:underline">
              بازگشت به مراجعین
            </Link>
            <h2 className="font-bold text-2xl mt-2">پرونده مراجع</h2>
          </div>
        </div>

        {(isLoading || recordLoading) && (
          <div className="w-full h-64 flex items-center justify-center">
            <PuffLoader size={60} color="#3e86fa" />
          </div>
        )}

        {error && <ErrorComponent refetch={refetch} />}

        {!isLoading && client && (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            <div className="rounded-xl border border-slate-200 bg-white p-5 space-y-4">
              <h3 className="font-semibold text-lg">اطلاعات شخصی</h3>
              <Field label="نام" value={client.name} />
              <Field label="تلفن" value={client.phone} />
              <Field
                label="تاریخ تولد"
                value={client.birth_date ? dateConvert(client.birth_date) : null}
              />
              <Field label="آدرس" value={client.address} />
            </div>

            <div className="xl:col-span-2 rounded-xl border border-slate-200 bg-white p-5 space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold text-lg">پرونده پزشکی</h3>
                {recordError && (
                  <button
                    type="button"
                    onClick={() => refetchRecord()}
                    className="text-sm text-blue-600 hover:underline"
                  >
                    تلاش مجدد
                  </button>
                )}
              </div>

              {!record && !recordLoading && !recordError && (
                <p className="text-sm text-slate-500 py-10 text-center">
                  برای این مراجع هنوز پرونده پزشکی ثبت نشده است.
                </p>
              )}

              {record && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <Field label="شماره پرونده" value={record.record_number} />
                  <Field label="منبع ارجاع" value={record.reference_source} />
                  <Field
                    label="تاریخ پذیرش"
                    value={record.admission_date ? dateConvert(record.admission_date) : null}
                  />
                  <Field
                    label="تاریخ مراجعه"
                    value={record.visit_date ? dateConvert(record.visit_date) : null}
                  />
                  <Field label="شکایات اصلی" value={record.chief_complaints} />
                  <Field label="بیماری فعلی" value={record.present_illness} />
                  <Field label="سابقه قبلی" value={record.past_history} />
                  <Field label="سابقه خانوادگی" value={record.family_history} />
                  <Field label="سابقه شخصی" value={record.personal_history} />
                  <Field label="MSE" value={record.mse} />
                  <Field label="تشخیص" value={record.diagnosis} />
                  <Field label="نام همراه" value={record.companion?.name} />
                  <Field label="تلفن همراه" value={record.companion?.phone} />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
