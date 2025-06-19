import React from "react";
import { Dialog, Transition } from "@headlessui/react";

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  children,
  title,
}) => (
  <Transition show={open} as="div">
    <Dialog as="div" className="relative z-50" onClose={onClose}>
      <Transition.Child
        as="div"
        enter="ease-out duration-300"
        enterFrom="opacity-0"
        enterTo="opacity-100"
        leave="ease-in duration-200"
        leaveFrom="opacity-100"
        leaveTo="opacity-0"
      >
        <div className="fixed inset-0 bg-white/60 backdrop-blur-sm" />
      </Transition.Child>
      <div className="fixed inset-0 overflow-y-auto">
        <div className="flex min-h-full items-center justify-center p-4">
          <Transition.Child
            as="div"
            enter="ease-out duration-300"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 scale-100"
            leaveTo="opacity-0 scale-95"
          >
            <Dialog.Panel className="transform xl:w-[30rem] overflow-hidden rounded-2xl bg-white p-6 sm:p-4 xs:p-2 text-left align-middle shadow-xl transition-all overflow-y-auto max-h-[90vh]">
              {title && (
                <Dialog.Title className="text-xl font-bold ms-4 mb-3 text-gray-900">
                  {title}
                </Dialog.Title>
              )}

              {children}
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </div>
    </Dialog>
  </Transition>
);
