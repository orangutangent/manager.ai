import { Dialog, Transition } from "@headlessui/react";
import { Button } from "@/components/ui/Button";

interface ConfirmDeleteModalProps {
  open: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  taskTitle?: string;
}

export function ConfirmDeleteModal({
  open,
  onConfirm,
  onCancel,
  taskTitle,
}: ConfirmDeleteModalProps) {
  return (
    <Transition appear show={open} as="div">
      <Dialog as="div" className="relative z-50" onClose={onCancel}>
        <Transition.Child
          as="div"
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/25 backdrop-blur-sm" />
        </Transition.Child>
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as="div"
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900 mb-4"
                >
                  Confirm Deletion
                </Dialog.Title>
                <div className="mb-4 text-gray-700">
                  Are you sure you want to delete the task
                  {taskTitle ? (
                    <span className="font-semibold">
                      {" "}
                      &quot;{taskTitle}&quot;
                    </span>
                  ) : null}
                  ?
                  <br />
                  This action cannot be undone.
                </div>
                <div className="mt-6 flex justify-end gap-2">
                  <Button variant="outline" onClick={onCancel}>
                    Cancel
                  </Button>
                  <Button
                    variant="default"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={onConfirm}
                  >
                    Delete
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
}
