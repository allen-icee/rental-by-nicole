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
  stdCount: number;
  unlCount: number;
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
      stdCount: 1,
      unlCount: 0,
      fee: 150,
      status: "Scheduled"
    }
  });

  const customerCount = watch("customerCount") || 1;
  const stdCount = watch("stdCount");
  const unlCount = watch("unlCount");

  // Keep fee synced
  useEffect(() => {
    setValue("fee", (stdCount * 150) + (unlCount * 300));
  }, [stdCount, unlCount, setValue]);

  // Adjust counts if customerCount shrinks
  useEffect(() => {
    if (stdCount + unlCount > customerCount) {
      // Just reset to standard if it gets weird
      setValue("stdCount", customerCount);
      setValue("unlCount", 0);
    }
  }, [customerCount, setValue]);

  useEffect(() => {
    if (isOpen) {
      reset({
        date: new Date().toISOString().slice(0, 10),
        time: "",
        representativeName: "",
        customerCount: 1,
        stdCount: 1,
        unlCount: 0,
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

      const packageTypeStr = JSON.stringify({ Standard: data.stdCount, Unlimited: data.unlCount });

      await createFitting.mutateAsync({
        bookingNumber,
        date: data.date,
        time: data.time || null,
        representativeCustomerId: customerId,
        representativeName: customerName,
        customerCount: data.customerCount,
        packageType: packageTypeStr,
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

          <div className="bg-white border border-pink-100 shadow-sm rounded-2xl p-4 flex flex-col gap-3 h-fit">
            <div className="flex justify-between items-center text-sm bg-pink-50/50 p-2 rounded-xl">
              <span className="font-bold text-pink-950">Standard <span className="text-pink-950/50 text-xs font-semibold block">₱150</span></span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setValue("stdCount", Math.max(0, stdCount - 1))} className="flex items-center justify-center w-7 h-7 rounded-lg bg-white border border-pink-100 text-brand-primary font-bold hover:bg-brand-primary hover:text-white transition-colors shadow-sm"><Icon icon="mdi:minus" /></button>
                <span className="w-5 text-center font-bold text-pink-950">{stdCount}</span>
                <button type="button" onClick={() => setValue("stdCount", stdCount + 1)} className="flex items-center justify-center w-7 h-7 rounded-lg bg-white border border-pink-100 text-brand-primary font-bold hover:bg-brand-primary hover:text-white transition-colors shadow-sm"><Icon icon="mdi:plus" /></button>
              </div>
            </div>

            <div className="flex justify-between items-center text-sm bg-pink-50/50 p-2 rounded-xl">
              <span className="font-bold text-pink-950">Unlimited <span className="text-pink-950/50 text-xs font-semibold block">₱300</span></span>
              <div className="flex items-center gap-2">
                <button type="button" onClick={() => setValue("unlCount", Math.max(0, unlCount - 1))} className="flex items-center justify-center w-7 h-7 rounded-lg bg-white border border-pink-100 text-brand-primary font-bold hover:bg-brand-primary hover:text-white transition-colors shadow-sm"><Icon icon="mdi:minus" /></button>
                <span className="w-5 text-center font-bold text-pink-950">{unlCount}</span>
                <button type="button" onClick={() => setValue("unlCount", unlCount + 1)} className="flex items-center justify-center w-7 h-7 rounded-lg bg-white border border-pink-100 text-brand-primary font-bold hover:bg-brand-primary hover:text-white transition-colors shadow-sm"><Icon icon="mdi:plus" /></button>
              </div>
            </div>

            <div className="border-t border-pink-100 pt-3 mt-1 space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="text-pink-950/70 font-semibold uppercase tracking-wider">Total People</span>
                <span className="font-bold text-pink-950 bg-pink-100 px-2 py-0.5 rounded">{customerCount}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-pink-950/70 font-semibold uppercase tracking-wider">Remaining</span>
                <span className={`font-bold px-2 py-0.5 rounded ${customerCount - (stdCount + unlCount) === 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {customerCount - (stdCount + unlCount)}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm mt-2 pt-2 border-t border-pink-50">
                <span className="text-brand-accent font-bold">Fee Preview</span>
                <span className="text-brand-primary font-black">₱{(stdCount * 150 + unlCount * 300).toFixed(2)}</span>
              </div>
            </div>

            {customerCount - (stdCount + unlCount) !== 0 && (
              <div className="text-[10px] text-red-600 font-bold text-center mt-1 bg-red-50 p-2 rounded-lg border border-red-100 flex items-center justify-center gap-1">
                <Icon icon="mdi:alert" className="size-3" />
                {customerCount - (stdCount + unlCount) > 0 ? `${customerCount - (stdCount + unlCount)} customer(s) not assigned.` : `${Math.abs(customerCount - (stdCount + unlCount))} too many assigned.`}
              </div>
            )}
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
