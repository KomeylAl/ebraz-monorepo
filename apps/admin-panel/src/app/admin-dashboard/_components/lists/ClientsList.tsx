"use client";

import { useState } from "react";
import { PuffLoader } from "react-spinners";
import { useClients, useDeleteClient } from "@/hooks/useClients";
import { useModal } from "@/hooks/useModal";
import Table from "@/components/common/Table";
import { clientColumns } from "@/lib/columns";
import { Modal } from "@/components/common/Modal";
import DeleteModal from "@/components/common/DeleteModal";
import { ClientApiType } from "../../../../../types/clientTypes";
import UpdateClientForm from "../forms/UpdateClientForm";
import CreateClientForm from "../forms/CreateClientForm";

export const ClientsList = () => {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const [clientId, setClientId] = useState("0");
  const [client, setClient] = useState<ClientApiType>();

  const { data, isLoading, error, refetch } = useClients(
    page,
    pageSize,
    search
  );

  const { mutate: deleteClient, isPending: isDeleting } = useDeleteClient(
    () => {
      closeDelete();
      refetch();
    }
  );

  const {
    isOpen: deleteOpen,
    openModal: openDelete,
    closeModal: closeDelete,
  } = useModal();

  const {
    isOpen: editOpen,
    openModal: openEdit,
    closeModal: closeEdit,
  } = useModal();
  const { isOpen, openModal, closeModal } = useModal();

  return (
    <div className="w-full h-full flex items-center justify-center">
      {isLoading && <PuffLoader size={60} color="#3e86fa" />}

      {error && (
        <div className="w-full h-full flex items-center justify-center">
          <p className="text-rose-500">خطا در دریافت اطلاعات</p>
        </div>
      )}

      {data && (
        <Table
          data={data.data ?? []}
          columns={clientColumns}
          currentPage={data.meta?.current_page ?? 1}
          pageSize={data.meta?.per_page ?? 10}
          showActions
          totalItems={data.meta?.total ?? 0}
          onPageChange={(newPage) => {
            setPage(newPage);
          }}
          onDelete={(item: any) => {
            setClientId(item.id);
            openDelete();
          }}
          onEdit={(item: any) => {
            setClient(item);
            openEdit();
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
          deleteFn={() => deleteClient(clientId)}
          isDeleting={isDeleting}
          onCancel={closeDelete}
          description="با حذف مراجع تمامی نوبت ها، ارزیابی ها و پرونده مراجع نیز حدف میگردد."
        />
      </Modal>

      <Modal
        showCloseButton={false}
        isOpen={editOpen}
        onClose={closeEdit}
        className="max-w-[700px] bg-white"
      >
        <UpdateClientForm
          client={client!}
          onClientUpdated={() => {
            closeEdit();
            refetch();
          }}
          onCloseModal={closeEdit}
        />
      </Modal>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        className="max-w-[700px] bg-white"
        showCloseButton={false}
      >
        <CreateClientForm
          onClientCreated={() => {
            closeModal();
            refetch();
          }}
          onCloseModal={closeModal}
        />
      </Modal>
    </div>
  );
};
