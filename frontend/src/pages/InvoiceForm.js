import React, { useState } from "react";
import { createInvoice, getCustomerByMobile } from "../api";
import "../App.css";

function InvoiceForm() {
  const [invoiceNumber, setInvoiceNumber] = useState("");

  const [customer, setCustomer] = useState({
    mobile: "",
    name: "",
    address: "",
    gst_number: "",
  });

  const [isExistingCustomer, setIsExistingCustomer] = useState(false);

  const [products, setProducts] = useState([
    { product: "", rate: "", quantity: "", gstSlab: 5 },
  ]);

  // 🔹 Handle product input change
  const handleProductChange = (index, e) => {
    const newProducts = [...products];
    newProducts[index][e.target.name] = e.target.value;
    setProducts(newProducts);
  };

  // 🔹 Add new row
  const addRow = () => {
    setProducts([
      ...products,
      { product: "", rate: "", quantity: "", gstSlab: 5 },
    ]);
  };

  // 🔹 Remove row
  const removeRow = (index) => {
    const updated = products.filter((_, i) => i !== index);
    setProducts(updated);
  };

  // 🔹 Calculate total with GST
  const calculateTotal = (item) => {
    const rate = Number(item.rate) || 0;
    const qty = Number(item.quantity) || 0;
    const base = rate * qty;
    const gst = (base * Number(item.gstSlab)) / 100;
    return base + gst;
  };

  const grandTotal = products.reduce(
    (sum, item) => sum + calculateTotal(item),
    0
  );
 
 
  // 🔹 Auto fetch customer by mobile
 const handleMobileBlur = async () => {
  if (!customer.mobile) return;

  const data = await getCustomerByMobile(customer.mobile);

  if (data) {
    setCustomer({
      mobile: data.mobile || "",
      name: data.name || "",
      address: data.address || "",
      gst_number: data.gst_number || "",
    });

    setIsExistingCustomer(true);
  } else {
    // Customer not found → allow manual entry
    setIsExistingCustomer(false);

    setCustomer((prev) => ({
      ...prev,
      name: "",
      address: "",
      gst_number: "",
    }));
  }
};


  // 🔹 Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

     //  Invoice Number Required
  if (!invoiceNumber.trim()) {
    alert("Invoice Number is required");
    return;
  }

   //  Mobile Required
  if (!customer.mobile.trim()) {
    alert("Customer Mobile is required");
    return;
  }
// customer name Required
   if (!customer.name.trim()) {
    alert("Customer Name is required");
    return;
  }

  //  At least 1 product required
  if (products.length === 0) {
    alert("Add at least one product");
    return;
  }

    try {
      const payload = {
        invoiceNumber,
        customer,
        productdata: products,
      };

      await createInvoice(payload);

      alert("Invoice Created Successfully ✅");

      // Reset form
      setInvoiceNumber("");
      setCustomer({
        mobile: "",
        name: "",
        address: "",
        gst_number: "",
      });
      setProducts([{ product: "", rate: "", quantity: "", gstSlab: 5 }]);
      setIsExistingCustomer(false);

    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="card">
      <h2>💼 Create New Invoice</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <h3>👤 Customer Information</h3>
          <div className="grid">
            <input
              placeholder="Invoice Number"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              // required
            />

            <input
              placeholder="Customer Mobile"
              value={customer.mobile}
              onChange={(e) =>
                setCustomer({ ...customer, mobile: e.target.value })
              }
              onBlur={handleMobileBlur}
              // required
            />

            <input
              placeholder="Customer Name"
              value={customer.name}
              disabled={isExistingCustomer}
              onChange={(e) =>
                setCustomer({ ...customer, name: e.target.value })
              }
            />

            <input
              placeholder="Address"
              value={customer.address}
              disabled={isExistingCustomer}
              onChange={(e) =>
                setCustomer({ ...customer, address: e.target.value })
              }
            />

            <input
              placeholder="GST Number"
              value={customer.gst_number}
              disabled={isExistingCustomer}
              onChange={(e) =>
                setCustomer({ ...customer, gst_number: e.target.value })
              }
            />
          </div>
        </div>

        <div>
          <h3>📦 Product Details</h3>
          <table>
            <thead>
              <tr>
                <th>Product</th>
                <th>Rate (₹)</th>
                <th>Qty</th>
                <th>GST %</th>
                <th>Total (₹)</th>
                <th>Action</th>
              </tr>
            </thead>

            <tbody>
              {products.map((item, index) => (
                <tr key={index}>
                  <td>
                    <input
                      name="product"
                      placeholder="Product name"
                      value={item.product}
                      onChange={(e) => handleProductChange(index, e)}
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      name="rate"
                      placeholder="0.00"
                      value={item.rate}
                      onChange={(e) => handleProductChange(index, e)}
                    />
                  </td>

                  <td>
                    <input
                      type="number"
                      name="quantity"
                      placeholder="0"
                      value={item.quantity}
                      onChange={(e) => handleProductChange(index, e)}
                    />
                  </td>

                  <td>
                    <select
                      name="gstSlab"
                      value={item.gstSlab}
                      onChange={(e) => handleProductChange(index, e)}
                    >
                      <option value={5}>5%</option>
                      <option value={12}>12%</option>
                      <option value={18}>18%</option>
                      <option value={28}>28%</option>
                    </select>
                  </td>

                  <td><strong>₹{calculateTotal(item).toFixed(2)}</strong></td>

                  <td>
                    {products.length > 1 && (
                      <button
                        type="button"
                        className="btn-hard"
                        onClick={() => removeRow(index)}
                      >
                        ❌ Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <button type="button" className="btn-secondary" onClick={addRow}>
            ➕ Add Product
          </button>
        </div>

        <div className="total">
          💰Grand Total: <strong>₹{grandTotal.toFixed(2)}</strong>
        </div>

        <button type="submit" className="btn-primary">
          ✅ Save Invoice
        </button>
      </form>
    </div>
  );
}

export default InvoiceForm;
