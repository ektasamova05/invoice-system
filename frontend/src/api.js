const BASE_URL = "http://localhost:5000/api/invoice";

async function handleResponse(res) {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Server Error");
  return data;
}


// GET Customer by Mobile Number
export const getCustomerByMobile = async (mobile) => {
  try {
    const response = await fetch(
      `http://localhost:5000/api/customer/mobile/${mobile}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const result = await response.json();

    // If customer not found
    if (!response.ok) {
      return null;
    }

    // Return only customer object directly
    return result.data;

  } catch (error) {
    console.error("API Error:", error);
    return null;
  }
};


// CREATE INVOICE (POST)

export const createInvoice = async (data) => {
  const res = await fetch(BASE_URL + "/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleResponse(res);
};



//  GET INVOICE WIITH PAGENATION

export const getInvoices = async (page = 1, limit = 10) => {
  const res = await fetch(`${BASE_URL}/?page=${page}&limit=${limit}`);
  return handleResponse(res);
};


// SOFT DELETE

export const softDeleteInvoice = async (id) => {
  const res = await fetch(`${BASE_URL}/soft-delete/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
};

// HARD DELETE

export const hardDeleteInvoice = async (id) => {
  const res = await fetch(`${BASE_URL}/hard-delete/${id}`, {
    method: "DELETE",
  });
  return handleResponse(res);
};

//PDF 

export const downloadInvoicePDF = async (id) => {
  try {
    const res = await fetch(
      `${BASE_URL}/pdf/${id}`
    );

    if (!res.ok) {
      throw new Error("Failed to download PDF");
    }

    const blob = await res.blob();
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `invoice-${id}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (error) {
    alert(error.message);
  }
};


