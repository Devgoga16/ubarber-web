import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./routes/ProtectedRoute";
import { AppLayout } from "./components/layout/AppLayout";
import { LoginPage } from "./pages/LoginPage";
import { AppointmentsPage } from "./pages/AppointmentsPage";
import { LocationsPage } from "./pages/LocationsPage";
import { BarbersPage } from "./pages/BarbersPage";
import { ClientsPage } from "./pages/ClientsPage";
import { ServicesPage } from "./pages/ServicesPage";
import { MySchedulePage } from "./pages/MySchedulePage";
import { DashboardPage } from "./pages/DashboardPage";
import { CashboxPage } from "./pages/CashboxPage";
import { PaymentMethodsPage } from "./pages/PaymentMethodsPage";
import { WhatsAppPage } from "./pages/WhatsAppPage";
import { BookingLinkPage } from "./pages/BookingLinkPage";
import { DepositSettingsPage } from "./pages/DepositSettingsPage";
import { PublicBookingPage } from "./pages/PublicBookingPage";
import { BarberConfirmationPage } from "./pages/BarberConfirmationPage";
import { AdminBusinessesPage } from "./pages/admin/AdminBusinessesPage";
import { AdminPaymentsPage } from "./pages/admin/AdminPaymentsPage";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reservar/:slug" element={<PublicBookingPage />} />
          <Route path="/confirmar/:token" element={<BarberConfirmationPage />} />

          <Route element={<ProtectedRoute allowedRoles={["owner", "manager", "barber"]} />}>
            <Route element={<AppLayout />}>
              <Route path="/" element={<AppointmentsPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["owner", "manager"]} />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/caja" element={<CashboxPage />} />
              <Route path="/metodos-de-pago" element={<PaymentMethodsPage />} />
              <Route path="/whatsapp" element={<WhatsAppPage />} />
              <Route path="/enlace-de-reservas" element={<BookingLinkPage />} />
              <Route path="/adelantos" element={<DepositSettingsPage />} />
              <Route path="/sedes" element={<LocationsPage />} />
              <Route path="/barberos" element={<BarbersPage />} />
              <Route path="/clientes" element={<ClientsPage />} />
              <Route path="/servicios" element={<ServicesPage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["barber"]} />}>
            <Route element={<AppLayout />}>
              <Route path="/mi-horario" element={<MySchedulePage />} />
            </Route>
          </Route>

          <Route element={<ProtectedRoute allowedRoles={["super_admin"]} />}>
            <Route element={<AppLayout />}>
              <Route path="/admin" element={<AdminBusinessesPage />} />
              <Route path="/admin/pagos" element={<AdminPaymentsPage />} />
            </Route>
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
