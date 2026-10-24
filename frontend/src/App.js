import { BrowserRouter, Routes, Route } from "react-router-dom";
import "@/App.css";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider, ThemeProvider, EnquiryProvider } from "@/context/contexts";
import { Layout } from "@/components/Layout";
import { EnquiryModal } from "@/components/EnquiryModal";
import Home from "@/pages/Home";
import DigitalMarketing from "@/pages/DigitalMarketing";
import ITProducts from "@/pages/ITProducts";
import ITTraining from "@/pages/ITTraining";
import Work from "@/pages/Work";
import About from "@/pages/About";
import Contact from "@/pages/Contact";
import Login from "@/pages/Login";
import AdminDashboard from "@/pages/AdminDashboard";

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <EnquiryProvider>
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/digital-marketing" element={<DigitalMarketing />} />
                <Route path="/it-products" element={<ITProducts />} />
                <Route path="/it-training" element={<ITTraining />} />
                <Route path="/work" element={<Work />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="/admin" element={<AdminDashboard />} />
            </Routes>
            <EnquiryModal />
            <Toaster position="top-right" richColors />
          </BrowserRouter>
        </EnquiryProvider>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
