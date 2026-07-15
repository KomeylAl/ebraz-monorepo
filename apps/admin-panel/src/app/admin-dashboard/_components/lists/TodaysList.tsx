"use client";

import { PuffLoader } from "react-spinners";
import { useAppointments, useDeleteAppointment } from "@/hooks/useAppointments";
import Table from "@/components/common/Table";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/common/Modal";
import { appointmentColumns } from "@/lib/columns";
import DeleteModal from "@/components/common/DeleteModal";
import { useState } from "react";
import { AppointmentApiType } from "../../../../../types/appointmentTypes";
import UpdateAppForm from "../forms/UpdateAppForm";

const ToDaysList = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const date = new Date().toJSON().slice(0, 10);
  const { data, isLoading, error, refetch } = useAppointments(
    page,
    pageSize,
    "",
    date
  );
  const [appId, setAppId] = useState("0");
  const [appointment, setAppointment] = useState<AppointmentApiType>();

  const { mutate: deleteAppointment, isPending: isDeleting } =
    useDeleteAppointment(() => {
      closeModal();
      refetch();
    });

  const { isOpen, openModal, closeModal } = useModal();
  const {
    isOpen: editOpen,
    openModal: openEdit,
    closeModal: closeEdit,
  } = useModal();
  const {
    isOpen: deleteOpen,
    openModal: openDelete,
    closeModal: closeDelete,
  } = useModal();

  return (
    <div className="w-full h-full flex items-center justify-center">
      {isLoading && <PuffLoader size={60} color="#3e86fa" />}

      {data && (
        <Table
          data={data.data ?? []}
          columns={appointmentColumns}
          currentPage={data.meta?.current_page ?? 1}
          pageSize={data.meta?.per_page ?? 10}
          showActions
          totalItems={data.meta?.total ?? 0}
          onPageChange={(newPage) => {
            setPage(newPage);
          }}
          onEdit={(item: any) => {
            setAppId(item.referral_id);
            setAppointment(item);
            openEdit();
          }}
          onDelete={(item: any) => {
            setAppId(item.referral_id);
            openDelete();
          }}
        />
      )}

      <Modal
        showCloseButton={false}
        isOpen={deleteOpen}
        onClose={closeDelete}
        className="max-w-[700px] bg-white"
      >
        <DeleteModal
          deleteFn={() => deleteAppointment(appId)}
          isDeleting={isDeleting}
          onCancel={closeDelete}
        />
      </Modal>
      <Modal
        isOpen={editOpen}
        onClose={openEdit}
        showCloseButton={false}
        className="max-w-[700px] bg-white"
      >
        <UpdateAppForm
          onCloseModal={() => {
            closeEdit();
            refetch();
          }}
          appId={appId}
          appointment={appointment!}
        />
      </Modal>
    </div>
  );
};

export default ToDaysList;
