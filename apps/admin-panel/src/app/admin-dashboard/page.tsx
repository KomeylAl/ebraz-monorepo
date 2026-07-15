"use client";

import React from "react";
import Header from "@/components/layout/Header";
import ToDaysList from "./_components/lists/TodaysList";
import { ClientsList } from "./_components/lists/ClientsList";
import { useModal } from "@/hooks/useModal";
import { Modal } from "@/components/common/Modal";
import StoreAppForm from "./_components/forms/StoreAppForm";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminDashboard = () => {
  const { isOpen, openModal, closeModal } = useModal();

  return (
    <div className="flex-1 h-screen overflow-y-auto flex flex-col">
      <Header isShowSearch={false} searchFn={() => {}} />

      <div className="flex-1 p-8 flex flex-col">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-xl">داشبورد مدیریت</h2>
          <button
            onClick={openModal}
            className="px-12 py-2 bg-blue-600 rounded-sm text-white text-center cursor-pointer"
          >
            افزودن نوبت
          </button>
        </div>

        <div className="mt-12 flex-1">
          <Tabs defaultValue="todaysApps" className="w-full overflow-x-auto">
            <TabsList className="gap-4">
              <TabsTrigger value="todaysApps" defaultChecked>
                نوبت های امروز
              </TabsTrigger>
              <TabsTrigger value="clients">مراجعان</TabsTrigger>
            </TabsList>
            <TabsContent value="todaysApps" className="w-full">
              <ToDaysList />
            </TabsContent>
            <TabsContent value="clients" className="w-full">
              <ClientsList />
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Modal
        isOpen={isOpen}
        onClose={closeModal}
        showCloseButton={false}
        className="max-w-[700px] bg-white"
      >
        <StoreAppForm
          onCloseModal={closeModal}
          onAddedAppointment={() => {
            closeModal();
          }}
        />
      </Modal>
    </div>
  );
};

export default AdminDashboard;
