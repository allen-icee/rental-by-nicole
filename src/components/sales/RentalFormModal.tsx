import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "../../lib/supabase/client";
import { AdminModal } from "@/components/admin/AdminModal";
import { FormInput } from "@/components/ui/forms/FormInput";
import { FormSelect } from "@/components/ui/forms/FormSelect";
import { FormSubmitButton } from "@/components/ui/forms/FormSubmitButton";
import { useCreateRentalBooking, useRentalBookings } from "../../features/sales/useRentalBookings";
import { useCustomers, useCreateCustomer } from "../../features/customers/useCustomers";
import { calculateEndDate, calculateDownPayment } from "../../utils/sales-calculations";
import { useToast } from "@/components/ui/toast-context";
import { Icon } from "@iconify/react";
import { getModeColor, getPaymentColor, getStatusColor } from "./RentalTable";

interface RentalFormInputs {
  customerName: string;
  startDate: string;
  time: string;
  rentalDays: number;
  dressId: string;
  sizeId: string;
  accessories: { itemId: string; name: string; price: number }[];
  pickupMode: string;
  paymentMethod: string;
  status: string;
  downPayment: number;
  securityDeposit: number;
}

export function RentalFormModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { showToast } = useToast();
  const createRental = useCreateRentalBooking();
  const { data: rentals } = useRentalBookings();
  const { data: customers } = useCustomers();
  const createCustomer = useCreateCustomer();
  const { data: catalogItems } = useQuery({
    queryKey: ["catalog_items_minimal"],
    queryFn: async () => {
      const { data, error } = await supabase.from("catalog_items").select("id, name, price, categories(classification)");
      if (error) throw error;
      return data as any[];
    },
  });

  const { data: sizes } = useQuery({
    queryKey: ["catalog_item_sizes"],
    queryFn: async () => {
      const { data, error } = await supabase.from("catalog_item_sizes").select("id, catalog_item_id, size_label, inventory_quantity");
      if (error) throw error;
      return data as any[];
    },
  });

  const dresses = (catalogItems || []).filter((i: any) => !i.categories || i.categories.classification === "Dress");
  const accs = (catalogItems || []).filter((i: any) => i.categories?.classification === "Accessory");

  const { control, handleSubmit, reset, watch, setValue, formState: { isSubmitting, isDirty, isValid, isSubmitSuccessful } } = useForm<RentalFormInputs>({
    defaultValues: {
      customerName: "",
      startDate: new Date().toISOString().slice(0, 10),
      time: "",
      rentalDays: 2,
      dressId: "",
      sizeId: "",
      accessories: [],
      pickupMode: "Pick Up",
      paymentMethod: "Cash",
      status: "Reserved",
      downPayment: 0,
      securityDeposit: 200
    }
  });

  const { fields: accessoryFields, append: appendAccessory, remove: removeAccessory } = useFieldArray({
    control,
    name: "accessories"
  });

  const watchDressId = watch("dressId");
  const watchAccessories = watch("accessories");

  const dressPrice = watchDressId ? (dresses.find((d: any) => d.id === watchDressId)?.price || 0) : 0;
  const accsCost = watchAccessories.reduce((sum, a) => sum + (Number(a.price) || 0), 0);
  const subtotal = dressPrice + accsCost;
  const recommendedDownPayment = calculateDownPayment(subtotal);

  useEffect(() => {
    setValue("downPayment", recommendedDownPayment);
  }, [subtotal, setValue, recommendedDownPayment]);

  useEffect(() => {
    if (watchDressId) {
      const dressSizes = sizes?.filter((s: any) => s.catalog_item_id === watchDressId) || [];
      if (dressSizes.length === 1) {
        setValue("sizeId", dressSizes[0].id);
      } else {
        setValue("sizeId", "");
      }
    }
  }, [watchDressId, sizes, setValue]);

  useEffect(() => {
    if (isOpen) {
      reset({
        customerName: "",
        startDate: new Date().toISOString().slice(0, 10),
        time: "",
        rentalDays: 2,
        dressId: "",
        sizeId: "",
        accessories: [],
        pickupMode: "Pick Up",
        paymentMethod: "Cash",
        status: "Reserved",
        downPayment: 0,
        securityDeposit: 200
      });
    }
  }, [isOpen, reset]);

  const onSubmit = async (data: RentalFormInputs) => {
    try {
      if (!data.dressId) {
        showToast({ tone: "error", title: "Error", message: "Please select a dress." });
        return;
      }

      let customerId = null;
      let customerName = data.customerName.trim();
      
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
          } catch (e) {}
        }
      }

      // Fetch the latest booking numbers directly from the database to ensure we check all records, not just cached/displayed ones
      const { data: bookingNumbers } = await supabase.from("rental_bookings").select("booking_number");
      const lastNum = bookingNumbers?.reduce((max, r) => {
        const match = (r.booking_number || "").match(/(\d+)$/);
        return match ? Math.max(max, parseInt(match[1])) : max;
      }, 0) || 0;
      
      const bookingNumber = `RNT-${lastNum + 1}`;
      const endDate = calculateEndDate(data.startDate, data.rentalDays);
      const accList = data.accessories.map(a => {
        const matchingAcc = accs.find((ac: any) => ac.id === a.itemId);
        return {
          id: a.itemId,
          name: matchingAcc?.name || "Custom Accessory",
          price: matchingAcc?.price || 0
        };
      }).filter(a => a.id);

      await createRental.mutateAsync({
        bookingNumber,
        startDate: data.startDate,
        time: data.time || null,
        endDate,
        rentalDays: data.rentalDays,
        customerName,
        dressId: data.dressId,
        sizeId: data.sizeId || null,
        accessories: accList,
        subtotal,
        downPayment: data.downPayment,
        securityDeposit: data.securityDeposit,
        damageCharge: 0,
        lateFee: 0,
        refundAmount: data.securityDeposit,
        total: subtotal,
        status: data.status,
        pickupMode: data.pickupMode,
        paymentMethod: data.paymentMethod
      } as any);

      showToast({ tone: "success", title: "Rental Record Added", message: `Record ${bookingNumber} created successfully.` });
      onClose();
    } catch (err: any) {
      showToast({ tone: "error", title: "Error", message: err.message || "Failed to add rental record." });
    }
  };

  const dressSizes = sizes?.filter((s: any) => s.catalog_item_id === watchDressId) || [];

  return (
    <AdminModal isOpen={isOpen} onClose={onClose} title="New Rental Record" maxWidth="2xl">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <FormInput name="startDate" control={control} type="date" label="Start Date" required />
          <FormInput name="time" control={control} type="time" label="Time" />
          <FormInput name="rentalDays" control={control} type="number" min={1} label="Rental Days" required />
          <div className="sm:col-span-3">
            <FormInput name="customerName" control={control} label="Customer Name" placeholder="e.g. Maria Theresa" list="customers-list" required />
            <datalist id="customers-list">
              {Array.from(new Set(customers?.map(c => c.name) || [])).map(name => (
                <option key={name} value={name} />
              ))}
            </datalist>
          </div>
        </div>

        <div className="border-t border-pink-100 pt-4 mt-4">
          <h3 className="text-sm font-bold text-pink-950 mb-3">Dress Selection</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FormSelect 
              name="dressId" 
              control={control} 
              label="Select Dress" 
              placeholder="Search dress..." 
              options={dresses.map((d: any) => ({ value: d.id as string, label: `${d.name} (₱${d.price})` }))} 
            />
            <FormSelect 
              name="sizeId" 
              control={control} 
              label="Select Size" 
              options={dressSizes.map((s: any) => ({ value: s.id as string, label: s.size_label }))} 
              placeholder={watchDressId ? "Select size..." : "Select dress first"}
            />
          </div>
        </div>

        <div className="border-t border-pink-100 pt-4 mt-4">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-pink-950">Accessories</h3>
          </div>
          <div className="space-y-2">
            {accessoryFields.map((field, index) => (
              <div key={field.id} className="flex items-end gap-2 relative bg-pink-50/50 p-2 rounded-xl">
                <div className="flex-1">
                  <FormSelect 
                    name={`accessories.${index}.itemId`} 
                    control={control} 
                    label="Select Accessory" 
                    placeholder="Search accessory..." 
                    options={accs.map((a: any) => ({ value: a.id as string, label: `${a.name} (₱${a.price})` }))} 
                  />
                </div>
                <button type="button" onClick={() => removeAccessory(index)} className="mb-2 p-2 text-red-500 hover:bg-red-50 rounded-lg">
                  <Icon icon="mdi:trash-can-outline" className="size-5" />
                </button>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => appendAccessory({ itemId: "", name: "", price: 0 })} className="mt-2 w-full py-2 text-xs font-semibold text-brand-primary bg-pink-50/50 hover:bg-pink-100 rounded-lg flex items-center justify-center gap-1 transition-colors border border-dashed border-pink-200">
            <Icon icon="mdi:plus" className="size-4" /> Add Accessory
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-pink-100 pt-4 mt-4">
          <FormInput name="downPayment" control={control} type="number" min={0} label="Downpayment" />
          <FormInput name="securityDeposit" control={control} type="number" min={0} label="Sec. Deposit" />
          <FormSelect name="pickupMode" control={control} label="Mode" searchable={false} options={[{value:"Pick Up", label:"Pick Up"}, {value:"Delivery", label:"Delivery"}, {value:"Courier", label:"Courier"}, {value:"Meet Up", label:"Meet Up"}]} getColor={getModeColor} />
          <FormSelect name="paymentMethod" control={control} label="Payment" searchable={false} options={[{ value: "Cash", label: "Cash" }, { value: "GCash", label: "GCash" }, { value: "Bank", label: "Bank" }]} getColor={getPaymentColor} />
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-pink-100 pt-4 mt-4">
          <FormSelect 
            name="status" 
            control={control} 
            label="Status" 
            searchable={false} 
            getColor={getStatusColor}
            options={[
              {value: "Pending", label: "Pending"},
              {value: "Reserved", label: "Reserved"},
              {value: "Ready for Pickup", label: "Ready for Pickup"},
              {value: "Picked Up", label: "Picked Up"},
              {value: "Due Today", label: "Due Today"},
              {value: "Overdue", label: "Overdue"},
              {value: "Returned", label: "Returned"},
              {value: "Cancelled", label: "Cancelled"}
            ]} 
          />
          <div className="flex flex-col justify-end pb-2">
            <div className="text-right">
              <span className="text-xs font-semibold text-pink-950/60 uppercase">Total Expected</span>
              <div className="text-2xl font-black text-brand-primary">₱{subtotal.toFixed(2)}</div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 border-t border-pink-100 pt-6 mt-6">
          <button type="button" onClick={onClose} className="rounded-xl px-6 py-3 font-semibold text-pink-950 hover:bg-pink-50 transition-colors">Cancel</button>
          <FormSubmitButton isDirty={isDirty} isValid={isValid} isSubmitting={isSubmitting} isSubmitSuccessful={isSubmitSuccessful} defaultText="Create Record" />
        </div>
      </form>
    </AdminModal>
  );
}
