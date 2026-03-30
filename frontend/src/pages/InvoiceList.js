import React, { useEffect, useState } from "react";
import {
  getInvoices,
  softDeleteInvoice,
  hardDeleteInvoice,
  downloadInvoicePDF

} from "../api";
import { useNavigate } from "react-router-dom";
import "../App.css";

function InvoiceList() {
  const [data, setData] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      const res = await getInvoices(page, 10);
      setData(res.data || []);
      setTotalPages(res.pagination?.totalPages || 1);
    };
    loadData();
  }, [page]);

  const handleDownloadPDF = async (id) => {
    try {
      await downloadInvoicePDF(id);
    } catch (error) {
      alert("Error downloading PDF");
    }
  };

  const handleSoftDelete = async (id) => {
    await softDeleteInvoice(id);
    alert("Soft Deleted");
    window.location.reload();
  };

  const handleHardDelete = async (id) => {
    await hardDeleteInvoice(id);
    alert("Hard Deleted");
    window.location.reload();
  };

  return (
    <div className="card">
      <h2>📋 All Invoices</h2>

      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Invoice No</th>
            <th>Customer Name</th>
            <th>Total Amount</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {data.map((item) => (
            <tr key={item.id}>
              <td>#{item.id}</td>
              <td><strong>{item.invoiceNumber}</strong></td>
              <td>{item.customer?.name}</td>
              <td><strong>₹ {item.totalPrice}</strong></td>

              <td>
                <button
                  className="btn-edit"
                  onClick={() => navigate(`/?edit=${item.id}`)}
                >
                  ✏️ Edit
                </button>

                <button
                  className="btn-secondary"
                  onClick={() => handleDownloadPDF(item.id)}
                >
                  📥 PDF
                </button>

                <button
                  className="btn-soft"
                  onClick={() => handleSoftDelete(item.id)}
                >
                  🗑️ Soft Delete
                </button>

                <button
                  className="btn-hard"
                  onClick={() => handleHardDelete(item.id)}
                >
                  ❌ Hard Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination">
          <button disabled={page === 1} onClick={() => setPage(page - 1)}>
            ⬅️ Previous
          </button>

          <span>📄 Page {page} of {totalPages}</span>

          <button disabled={page === totalPages} onClick={() => setPage(page + 1)}>
            Next ➡️
          </button>
        </div>
      )}
    </div>
  );
}

export default InvoiceList;

