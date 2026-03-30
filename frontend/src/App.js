import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import InvoiceForm from "./pages/InvoiceForm";
import InvoiceList from "./pages/InvoiceList";
import "./App.css";

function App() {
  return (
    <Router>
      <div className="navbar">
        <Link to="/">📝 Create Invoice</Link>
        <Link to="/invoices">📋 Invoice List</Link>
      </div>

      <Routes>
        <Route path="/" element={<InvoiceForm />} />
        <Route path="/invoices" element={<InvoiceList />} />
      </Routes>
    </Router>
  );
}

export default App;
