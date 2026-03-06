import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import HomePage from './pages/Home';
import LocationDetail from "./pages/LocationDetail";
import LocationPhotos from "./pages/LocationPhotos";
import Locations from "./pages/Locations";
import MemoriesGallery from "./pages/MemoriesGallery";
import RatesPage from './pages/Rates';
import ContactUSPage from './pages/ContactUs';
import ScrollToTop from "./components/ScrollToTop";
function App() {
  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path = "/" element = {<HomePage />} />
        <Route path="/locations" element={<Locations />}/>
        <Route path="/locations-details/:id" element={<LocationDetail />}/>
        <Route path="/locations-details/:id/photos" element={<LocationPhotos/>}/>
        <Route path="/memories" element={<MemoriesGallery/>}/>
        <Route path = "/rates" element = {<RatesPage />} />
        <Route path = "/contact-us" element = {<ContactUSPage />} />
      </Routes>
    </Router>
  )
}

export default App;