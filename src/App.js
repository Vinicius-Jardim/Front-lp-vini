import React from "react";
import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import { LoadScript } from "@react-google-maps/api";
import { GOOGLE_MAPS_API_KEY } from "./Config/ApiKeys";
import Navbar from "./Components/navbar";
import Home from "./Pages/Home";
import PropertyList from "./Pages/PropertyList";
import Agents from "./Pages/Agents";
import { AuthProvider } from "./Context/AuthContext";
import UserProfile from "./Pages/UserProfile";
import AgentProfile from "./Pages/AgentProfile";
import PropertyDetails from "./Pages/PropertyDetails";
import AgentPage from "./Pages/AgentPage";
import AddProperty from "./Forms/AddProperty";
import { shouldShowNavbar } from "./Config/NavbarConfig";
import EditProperty from "./Forms/EditProperty";
import NearbyProperties from "./Pages/NearbyProperties";
import AdminProfile from "./Pages/AdminProfile";

// Wrapper component to handle navbar visibility
const AppContent = () => {
  const location = useLocation();
  const showNavbar = shouldShowNavbar(location.pathname);

  return (
    <>
      {showNavbar && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/real-estate" element={<PropertyList />} />
        <Route path="/agents" element={<Agents />} />
        <Route path="/agent/:id" element={<AgentPage />} />
        <Route path="/user/profile" element={<UserProfile />} />
        <Route path="/agent/profile" element={<AgentProfile />} />
        <Route path="/admin/profile" element={<AdminProfile />} />
        <Route path="/property/:id" element={<PropertyDetails />} />
        <Route path="/add-property" element={<AddProperty />} />
        <Route path="/edit-property/:id" element={<EditProperty />} />
        <Route path="/nearby-properties" element={<NearbyProperties />} />
      </Routes>
    </>
  );
};

function App() {
  return (
    <LoadScript googleMapsApiKey={GOOGLE_MAPS_API_KEY}>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </LoadScript>
  );
}

export default App;
