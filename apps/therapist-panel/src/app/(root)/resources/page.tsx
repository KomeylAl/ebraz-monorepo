"use client";

import { useCallback, useState } from "react";
import { debounce } from "lodash";
import { PuffLoader } from "react-spinners";
import Table from "@/components/common/Table";
import { resourceColumns } from "@/lib/columns";
import Header from "@/components/layout/Header";
import { Button } from "@/components/ui/button";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/common/modal/Modal";
import TherapyResourceForm from "@/components/common/form/DoctorTherapyResources";
import DeleteModal from "@/components/common/DeleteModal";
import { useDeleteResource, useResources } from "@/hooks/useResources";
import type { resourceApiType } from "@/types";

const Resources = () => {
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [resourceId, setResourceId] = useState<string>("");
  const [resource, setResource] = useState<resourceApiType>();

  const { data, isLoading, error, refetch } = useResources(page, pageSize, search);

  const { isOpen, openModal, closeModal } = useModal();
  const {
    isOpen: editOpen,
    openModal: openEditModal,
    closeModal: closeEditModal,
  } = useModal();
  const {
    isOpen: deleteOpen,
    openModal: openDeleteModal,
    closeModal: closeDeleteModal,
  } = useModal();

  const { mutate: deleteResource, isPending: isDeleting } = useDeleteResource(() => {
    closeDeleteModal();
    setResourceId("");
  });

  const debouncedSearch = useCallback(
    debounce(() => {
      refetch();
    }, 300),
    [refetch],
  );

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1);
    debouncedSearch();
  };

  return (
    <div className="w-full h-full flex flex-col">
      <Header searchFn={onSearchChange} isShowSearch />
      <div className="w-full flex flex-col p-12">
        <div className="w-full flex items-center justify-between gap-4">
          <h2 className="text-xl font-bold">منابع درمانی پیشنهادی</h2>
          <Button className="bg-blue-600 text-white" onClick={openModal}>
            افزودن منبع
          </Button>
        </div>

        <div className="w-full h-full flex items-center justify-center mt-8">
          {isLoading && <PuffLoader size={60} color="#3e86fa" />}

          {error && (
            <div className="w-full h-full flex items-center justify-center">
              <p className="text-rose-500">خطا در دریافت اطلاعات</p>
            </div>
          )}

          {data && (
            <Table
              data={data.data ?? []}
              columns={resourceColumns}
              currentPage={data.meta?.current_page ?? 1}
              pageSize={data.meta?.per_page ?? 10}
              totalItems={data.meta?.total ?? 0}
              showActions
              onPageChange={(newPage) => setPage(newPage)}
              onEdit={(item: resourceApiType) => {
                setResource(item);
                setResourceId(item.id);
                openEditModal();
              }}
              onDelete={(item: resourceApiType) => {
                setResourceId(item.id);
                openDeleteModal();
              }}
            />
          )}
        </div>
      </div>

      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        showCloseButton={false}
        className="max-w-[700px] bg-white"
      >
        <TherapyResourceForm
          onClose={closeModal}
          onSuccess={() => {
            closeModal();
            refetch();
          }}
        />
      </Modal>

      <Modal
        isOpen={editOpen}
        onClose={closeEditModal}
        showCloseButton={false}
        className="max-w-[700px] bg-white"
      >
        <TherapyResourceForm
          resource={resource}
          onClose={closeEditModal}
          onSuccess={() => {
            closeEditModal();
            setResource(undefined);
            refetch();
          }}
        />
      </Modal>

      <Modal
        isOpen={deleteOpen}
        onClose={closeDeleteModal}
        showCloseButton={false}
        className="max-w-[700px] bg-white"
      >
        <DeleteModal
          isDeleting={isDeleting}
          onCancel={closeDeleteModal}
          description="با حذف این منبع، دسترسی مراجعین به آن نیز از بین می‌رود."
          deleteFn={() => deleteResource(resourceId)}
        />
      </Modal>
    </div>
  );
};

export default Resources;
