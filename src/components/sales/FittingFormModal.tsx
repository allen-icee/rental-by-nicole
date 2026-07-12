import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { AdminModal } from "@/components/admin/AdminModal";
import { Icon } from "@iconify/react";
import { FormInput } from "@/components/ui/forms/FormInput";
import { FormSelect } from "@/components/ui/forms/FormSelect";
import { FormSubmitButton } from "@/components/ui/forms/FormSubmitButton";
import { useCreateFitting } from "../../features/sales/useFittings";
import { useCustomers, useCreateCustomer } from "../../features/customers/useCustomers";
import { useToast } from "@/components/ui/toast-context";
import { getFittingStatusColor } from "./FittingTable";

interface FittingFormInputs {
  date: string;
  time: string;
  representativeName: string;
  customerCount: number;
  fee: number;
  status: string;
}

export function FittingFormModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { showToast } = useToast();
  const createFitting = useCreateFitting();
  const { data: customers } = useCustomers();
  const createCustomer = useCreateCustomer();

  const { control, handleSubmit, reset, watch, setValue, formState: { isSubmitting, isDirty, isValid, isSubmitSuccessful } } = useForm<FittingFormInputs>({
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      time: "",
      representativeName: "",
      customerCount: 1,
      fee: 150,
      status: "Scheduled"
    }
  });

  const customerCount = watch("customerCount") || 1;

  // Keep fee synced
  useEffect(() => {
    setValue("fee", customerCount * 150);
  }, [customerCount, setValue]);

  useEffect(() => {
    if (isOpen) {
      reset({
        date: new Date().toISOString().slice(0, 10),
        time: "",
        representativeName: "",
        customerCount: 1,
        fee: 150,
        status: "Scheduled"
      });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: FittingFormInputs) => {
    try {
      // Find or create customer
      let customerId = null;
      let customerName = data.representativeName.trim();
      
      if (customerName) {
        const existing = customers?.find(c => c.name.toLowerCase() === customerName.toLowerCase());
        if (existing) {
          customerId = existing.id;
          customerName = existing.name;
        } else {
          try {
            const newC = await createCustomer.mutateAsync(customerName);
            customerId = newC.id;
            customerName = newC.name;
          } catch (e) {
            // Proceed without linking if error
          }
        }
      }

      const bookingNumber = `FIT-${Date.now()}`;

      await createFitting.mutateAsync({
        bookingNumber,
        date: data.date,
        time: data.time || null,
        representativeCustomerId: customerId,
        representativeName: customerName,
        customerCount: data.customerCount,
        fee: data.fee,
        total: data.fee,
        status: data.status
      } as any);

      showToast({ tone: "success", title: "Fitting Record Added", message: `Record ${bookingNumber} created successfully.` });
      onClose();
    } catch (err: any) {
      showToast({ tone: "error", title: "Error", message: err.message || "Failed to add fitting record." });
    }
  };

  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title="New Fitting Record" maxWidth="xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <FormInput name="representativeName" control={control} label="Customer Name" placeholder="e.g. Maria Theresa" required />
          </div>
          <FormInput name="date" control={control} type="date" label="Date" required />
          <FormInput name="time" control={control} type="time" label="Time" />
        </div>

        <div className="border-t border-pink-100 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-4">
            <FormInput name="customerCount" control={control} type="number" min={1} label="Number of Customers" required />
            <FormInput name="fee" control={control} type="number" min={0} label="Total Fee (₱)" required />
            <FormSelect 
              name="status" 
              control={control} 
              label="Status" 
              searchable={false} 
              getColor={getFittingStatusColor}
              options={[
                {value: "Scheduled", label: "Scheduled"}, 
                {value: "Completed", label: "Completed"},
                {value: "No Show", label: "No Show"},
                {value: "Cancelled", label: "Cancelled"}
              ]} 
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-pink-100 pt-6 mt-6">
          <button type="button" onClick={onClose} className="rounded-xl px-6 py-3 font-semibold text-pink-950 hover:bg-pink-50 transition-colors">Cancel</button>
          <FormSubmitButton 
            isDirty={isDirty} 
            isValid={isValid && customerCount - (stdCount + unlCount) === 0} 
            isSubmitting={isSubmitting} 
            isSubmitSuccessful={isSubmitSuccessful} 
            defaultText="Create Record" 
          />
        </div>
      </form>
    </AdminModal>
  );
}
