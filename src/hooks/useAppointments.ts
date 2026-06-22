import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api/client";
import type { Appointment, AppointmentStatus } from "../api/types";

export function useAppointments(
  params: { from?: string; to?: string; locationId?: string; status?: AppointmentStatus } = {}
) {
  return useQuery({
    queryKey: ["appointments", params],
    queryFn: async () =>
      (await apiClient.get<Appointment[]>("/business/appointments", { params })).data,
  });
}

export function useCreateAppointment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: {
      locationId: string;
      barberId?: string;
      clientId: string;
      serviceIds: string[];
      startsAt: string;
      notes?: string;
    }) => (await apiClient.post<Appointment>("/business/appointments", payload)).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

export function useUpdateAppointmentStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: AppointmentStatus }) =>
      (await apiClient.patch<Appointment>(`/business/appointments/${id}/status`, { status })).data,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["appointments"] }),
  });
}

export function useRegisterAppointmentPayment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      paymentMethodId,
      receiptPhoto,
    }: {
      id: string;
      paymentMethodId: string;
      receiptPhoto?: string;
    }) =>
      (
        await apiClient.patch<Appointment>(`/business/appointments/${id}/payment`, {
          paymentMethodId,
          receiptPhoto,
        })
      ).data,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["appointments"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
