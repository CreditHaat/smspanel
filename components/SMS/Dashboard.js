"use client";
import React, { useState, useCallback, useEffect } from "react";
import "./Dashboard.css";
import axios from "axios";
import { Roboto } from 'next/font/google'

const roboto = Roboto({
  weight: ["400", "700"],
  subsets: ["latin"],
});

// Campaign Details Component
const CampaignDetails = ({ campaignId, onBack }) => {
  const [campaignData, setCampaignData] = useState(null);
  const [smsDeliveryData, setSmsDeliveryData] = useState([]);
  const [campaignContacts, setCampaignContacts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    axios.get(`${process.env.NEXT_PUBLIC_REACT_APP_BASE_URL}/api/campaigns/list`)
      .then((res) => {
        const campaign = res.data.find((c) => c.id === campaignId);
        if (campaign) {
          setCampaignData(campaign);
        } else {
          alert("Campaign not found in list response");
        }
      })
      .catch((err) => {
        console.error("Error fetching campaign:", err);
        alert("Failed to fetch campaign: " + err.message);
      });

    axios.get(`${process.env.NEXT_PUBLIC_REACT_APP_BASE_URL}/api/delivery-reports/campaign/${campaignId}`)
  .then((res) => setSmsDeliveryData(res.data))

      .catch((err) => {
        console.error("Error fetching contacts:", err);
        alert("Failed to fetch contacts: " + err.message);
      });
  }, [campaignId]);
  const handleExportExcel = async () => {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_REACT_APP_BASE_URL}/api/delivery-reports/campaign/${campaignId}/export`, {
      method: 'GET',
    });

    if (!response.ok) throw new Error("Export failed");

    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute("download", "delivery-report.xlsx");
    document.body.appendChild(link);
    link.click();
    link.remove();
  } catch (err) {
    console.error("Download error:", err);
    alert("Failed to download report");
  }
};

  if (!campaignData) return <div>Loading...</div>;

const indexOfLastItem = currentPage * itemsPerPage;
const indexOfFirstItem = indexOfLastItem - itemsPerPage;
const currentContacts = smsDeliveryData.slice(indexOfFirstItem, indexOfLastItem);
const totalPages = Math.ceil(smsDeliveryData.length / itemsPerPage);

const handleNextPage = () => {
  if (currentPage < totalPages) {
    setCurrentPage(currentPage + 1);
  }
};

const handlePrevPage = () => {
  if (currentPage > 1) {
    setCurrentPage(currentPage - 1);
  }
};

const handlePageClick = (pageNumber) => {
  setCurrentPage(pageNumber);
};

  return (
    <div className={`${roboto.className} campaign-details-container`}>
      <div className="back-button-container">
        <button className="back-button" onClick={onBack}>
          ← Back to Campaign List
        </button>
      </div>

      <div className="campaign-header">
        <div className="campaign-title">
          <span className="target-icon">🎯</span>
          <h1>{campaignData.campaignName}</h1>
        </div>

        <div className="campaign-date-info">
          <div className="date-item">
            <span className="date-icon">📅</span>
            <span>
           {new Date(campaignData.startDate).toLocaleString("en-IN", {
             timeZone: "Asia/Kolkata",
            })}
          </span>
      </div>

          <div className="date-separator"></div>

         <div className="date-item">
  <span className="date-icon">📅</span>
  <span>
    {campaignData.endDate
      ? new Date(campaignData.endDate).toLocaleString("en-IN", {
          timeZone: "Asia/Kolkata",
        })
      : "N/A"}
  </span>
</div>

        </div>
      </div>
      <div className="table-section">
        <table className="campaign-table">
          <tbody>
            <tr>
              <td className="table-header">Campaign Name</td>
              <td>{campaignData.campaignName}</td>
            </tr>
            <tr>
              <td className="table-header">Campaign ID</td>
              <td>{campaignData.id}</td>
            </tr>
           <tr>
  <td className="table-header">Product Name</td>
  <td>{campaignData.productName || "N/A"}</td>
</tr>
            <tr>
              <td className="table-header">Status</td>
              <td>{campaignData.status}</td>
            </tr>
            <tr>
              <td className="table-header">Start Date</td>
              <td>
                 {new Date(campaignData.startDate).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                 })}
             </td>
            </tr>
           <tr>
              <td className="table-header">End Date</td>
              <td>
                {campaignData.endDate
                  ? new Date(campaignData.endDate).toLocaleString("en-IN", {
                 timeZone: "Asia/Kolkata",
                })
                 : "N/A"}
              </td>
          </tr>
          
            <tr>
              <td className="table-header">SMS Template</td>
              <td>{campaignData.smsTemplate || "N/A"}</td>
            </tr>
            <tr>
              <td className="table-header">Remarks</td>
              <td>{campaignData.remarks || "None"}</td>
            </tr>
          </tbody>
        </table>
      </div>
<button onClick={handleExportExcel} style={{ marginBottom: "10px", backgroundColor: "#6039D2", color: "white", padding: "8px 16px", border: "none", borderRadius: "4px",cursor: "pointer" }}>
  📥 Download Excel Report
</button>
      <br />
      <div className="table-section mt-20">
        <h2>SMS Delivery Report</h2>
        <table className="campaign-table sms-table">
          <thead>
            <tr>
              <th>Mobile No</th>
              <th>Delivery Time</th>
              <th>Delivery Status</th>
              <th>Clicked Time</th>
              <th>Click Count</th>
            </tr>
          </thead>
   <tbody>
  {Array.isArray(currentContacts) && currentContacts.length > 0 ? (
    currentContacts.map((item, index) => (
      <tr key={indexOfFirstItem + index}>
        <td>{item.recipient}</td>
        <td>{item.deliveryTime ? new Date(item.deliveryTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "-"}</td>
        <td>{item.deliveryStatus}</td>
        <td>{item.clickTime ? new Date(item.clickTime).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" }) : "-"}</td>
        <td>{item.clickCount}</td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="5" style={{ textAlign: "center" }}>
        No data available or error fetching data.
      </td>
    </tr>
  )}
</tbody>
        </table>
        {smsDeliveryData.length > itemsPerPage && (
  <div className="pagination-container" style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: '20px', 
    gap: '10px' 
  }}>
    <button 
      onClick={handlePrevPage} 
      disabled={currentPage === 1}
      style={{
        padding: '8px 16px',
        border: '1px solid #ccc',
        backgroundColor: currentPage === 1 ? '#f5f5f5' : '#6039D2',
        color: currentPage === 1 ? '#999' : 'white',
        borderRadius: '4px',
        cursor: currentPage === 1 ? 'not-allowed' : 'pointer'
      }}
    >
      Previous
    </button>
    
    <button 
      onClick={handleNextPage} 
      disabled={currentPage === totalPages}
      style={{
        padding: '8px 16px',
        border: '1px solid #ccc',
        backgroundColor: currentPage === totalPages ? '#f5f5f5' : '#6039D2',
        color: currentPage === totalPages ? '#999' : 'white',
        borderRadius: '4px',
        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
      }}
    >
      Next
    </button>
    
    <button 
      onClick={() => setCurrentPage(totalPages)} 
      disabled={currentPage === totalPages}
      style={{
        padding: '8px 16px',
        border: '1px solid #ccc',
        backgroundColor: currentPage === totalPages ? '#f5f5f5' : '#6039D2',
        color: currentPage === totalPages ? '#999' : 'white',
        borderRadius: '4px',
        cursor: currentPage === totalPages ? 'not-allowed' : 'pointer'
      }}
    >
      Last
    </button>
    
    <span style={{ marginLeft: '15px', fontSize: '14px', color: '#666' }}>
      Page {currentPage} of {totalPages} ({smsDeliveryData.length} total records)
    </span>
  </div>
)}
      </div>
    </div>
  );
};

// Campaign Upload Component
const CampaignUpload = () => {
  const [campaignContacts, setCampaignContacts] = useState([]);
  const [campaignName, setCampaignName] = useState("");
  const [selectedProduct, setSelectedProduct] = useState(""); 
  const [file, setFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleNameChange = (e) => {
    setCampaignName(e.target.value);
  };

  const handleProductChange = (e) => {
    setSelectedProduct(e.target.value);
  }; 

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleClickUpload = useCallback(() => {
    const input = document.getElementById("fileInput");
    if (input) {
      input.click();
    }
  }, []);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation check first
    if (!campaignName || !file || !selectedProduct) {
      setStatusMessage("Please provide campaign name, product, and CSV file.");
      return;
    }

    try {
      setLoading(true);
      setStatusMessage("Creating campaign...");

      // Step 1: Create the campaign
      const createRes = await fetch(`${process.env.NEXT_PUBLIC_REACT_APP_BASE_URL}/api/campaigns/save`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          campaignName,
          productName: selectedProduct,
        }),
      });

      if (!createRes.ok) {
        throw new Error("Failed to create campaign");
      }

      const createdCampaign = await createRes.json();
      const campaignId = createdCampaign.id;

      setStatusMessage(
        `Campaign created (ID: ${campaignId}). Uploading CSV...`
      );

      // Step 2: Upload CSV to campaign
      const formData = new FormData();
      formData.append("file", file);
      formData.append("campaignId", campaignId);
      formData.append("productName", selectedProduct);

      const uploadRes = await fetch(
        `${process.env.NEXT_PUBLIC_REACT_APP_BASE_URL}/api/upload-files/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      if (!uploadRes.ok) {
        const msg = await uploadRes.text();
        console.error("❌ File upload error:", msg);
        throw new Error("Failed to upload file: " + msg);
      }

      const successMsg = await uploadRes.text();
      setStatusMessage(successMsg + " Triggering SMS send...");

      // Step 3: Trigger SMS sending
      const smsRes = await fetch(
        `${process.env.NEXT_PUBLIC_REACT_APP_BASE_URL}/api/sms/send?campaignId=${campaignId}&productName=${selectedProduct}`,
        {
          method: "POST",
        }
      );

      if (!smsRes.ok) {
        const smsMsg = await smsRes.text();
        console.error("❌ SMS send error:", smsMsg);
        throw new Error("Failed to send SMS: " + smsMsg);
      }

      setStatusMessage("✅ SMS sending triggered successfully!");

      // Step 4: Fetch updated contacts
      const contactRes = await fetch(
        `${process.env.NEXT_PUBLIC_REACT_APP_BASE_URL}/api/contacts/campaign-contacts?campaignId=${campaignId}`
      );
      if (contactRes.ok) {
        const contacts = await contactRes.json();
        console.log("Contacts with SMS status:", contacts);
        setCampaignContacts(contacts);
      } else {
        console.log("Failed to fetch contacts");
      }
      

      // Reset state after success
      setCampaignName("");
      setSelectedProduct("");
      setFile(null);
    } catch (err) {
      console.error("❌ Full error object:", err);
      console.error("❌ Error message:", err.message);
      setStatusMessage("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`${roboto.className} campaign-upload-container`}>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="campaignName">Campaign Name</label>
          <input
            type="text"
            id="campaignName"
            value={campaignName}
            onChange={handleNameChange}
            className="input-field"
            placeholder="Enter campaign name"
          />
        </div>

        <div className="form-group">
          <label htmlFor="productName" className="field-label">
            Product Name
          </label>
          <select
            type="text"
            id="productName"
            value={selectedProduct}
            onChange={handleProductChange}
            className="product-select"
          >
            <option value="">Select a product</option>
            <option value="HeroFINCORP">HeroFINCORP</option>
            <option value="TrustPaisa">TrustPaisa</option>
            <option value="PoonawallaFincorp">PoonawallaFincorp</option>
             <option value="RamFincorp">RamFincorp</option>

          </select>
        </div>

        <div
          className={`upload-area ${isDragging ? "dragging" : ""}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <div className="upload-content">
            <div className="upload-icon">📤</div>
            <p>
              <span className="upload-link" onClick={handleClickUpload}>
                Click to upload
              </span>{" "}
              or drag and drop your campaign
            </p>

            <input
              type="file"
              id="fileInput"
              accept=".csv"
              onChange={handleFileChange}
              className="file-input"
              style={{ display: "none" }}
            />

            <p className="file-info">CSV up to 10MB</p>
            {file && <p className="selected-file">Selected: {file.name}</p>}
          </div>
        </div>

        <div className="submit-container">
          <button type="submit" className="submit-button" disabled={loading}>
            {loading ? "Processing..." : "Submit"}
          </button>
        </div>
        {statusMessage && <p className="status-message">{statusMessage}</p>}
      </form>
    </div>
  );
};

const CampaignList = () => {
  const [campaigns, setCampaigns] = useState([]);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_REACT_APP_BASE_URL}/api/campaigns/list`
      );
      setCampaigns(response.data);
    } catch (error) {
      console.error("Error fetching campaigns", error);
    }
  };

  return (
    <div className={`${roboto.className} p-4`}>
      <h2 className="text-xl font-bold mb-4">Campaign List</h2>
      <table className="min-w-full border">
        <thead>
          <tr className="bg-gray-200">
            <th className="p-2 border">Index</th>
            <th className="p-2 border">Campaign Name</th>
            <th className="p-2 border">Start Date</th>
            <th className="p-2 border">End Date</th>
            <th className="p-2 border">Product Name</th>
            <th className="p-2 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {campaigns.map((campaign, index) => (
            <tr key={campaign.id} className="text-center border-t">
              <td className="p-2 border">{index + 1}</td>
              <td className="p-2 border">{campaign.campaignName}</td>
              <td className="p-2 border">
                {campaign.startDate
                  ? new Date(campaign.startDate).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })

                  : "-"}
              </td>
              <td className="p-2 border">
                {campaign.endDate
                  ? new Date(campaign.endDate).toLocaleDateString()
                  : "-"}
              </td>
              <td className="p-2 border">{campaign.productName || "-"}</td>
              <td className="p-2 border">{campaign.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

const Dashboard = () => {
  const [activeSection, setActiveSection] = useState("dashboard");
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [originalCampaignData, setOriginalCampaignData] = useState([]);
  const [campaignData, setCampaignData] = useState([]);
  const [filters, setFilters] = useState({
    campaignName: "",
    startDate: "",
    endDate: "",
    productName: "",
    status: ""
  });
  const [currentCampaignPage, setCurrentCampaignPage] = useState(1);
  const [campaignItemsPerPage] = useState(10);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get(
          `${process.env.NEXT_PUBLIC_REACT_APP_BASE_URL}/api/campaigns/list`
        );
        setOriginalCampaignData(response.data);
        setCampaignData(response.data);
      } catch (error) {
        console.error("Error fetching campaigns:", error);
      }
    };
    fetchCampaigns();
  }, []);

  const handleFilterChange = (field, value) => {
    setFilters((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleQuery = () => {
    const filtered = originalCampaignData.filter((campaign) => {
      const { campaignName, startDate, endDate, productName, status } = filters;

      return (
        (!campaignName || campaign.campaignName?.toLowerCase().includes(campaignName.toLowerCase())) &&
        (!productName || campaign.productName?.toLowerCase().includes(productName.toLowerCase())) &&
        (!status || campaign.status?.toLowerCase().includes(status.toLowerCase())) &&
        (!startDate || new Date(campaign.startDate) >= new Date(startDate)) &&
        (!endDate || new Date(campaign.endDate) <= new Date(endDate))
      );
    });

    setCampaignData(filtered);
  };

  const handleNavigation = (section) => {
    setActiveSection(section);
    setSelectedCampaignId(null);
  };

  const handleCampaignClick = (campaignId) => {
    setSelectedCampaignId(campaignId);
    setActiveSection("campaign-details");
  };

  const handleBackToCampaignList = () => {
    setSelectedCampaignId(null);
    setActiveSection("dashboard");
  };

const indexOfLastCampaign = currentCampaignPage * campaignItemsPerPage;
const indexOfFirstCampaign = indexOfLastCampaign - campaignItemsPerPage;
const currentCampaigns = campaignData.slice(indexOfFirstCampaign, indexOfLastCampaign);
const totalCampaignPages = Math.ceil(campaignData.length / campaignItemsPerPage);

const handleNextCampaignPage = () => {
  if (currentCampaignPage < totalCampaignPages) {
    setCurrentCampaignPage(currentCampaignPage + 1);
  }
};

const handlePrevCampaignPage = () => {
  if (currentCampaignPage > 1) {
    setCurrentCampaignPage(currentCampaignPage - 1);
  }
};

  const renderMainContent = () => {
    if (activeSection === "campaign-details" && selectedCampaignId) {
      return (
        <CampaignDetails
          campaignId={selectedCampaignId}
          onBack={handleBackToCampaignList}
        />
      );
    }

    if (activeSection === "upload-campaign") {
         return (
        <div className={`${roboto.className} upload-campaign-section`}>
          <div className="header">
            <h2>📤 Upload Campaign</h2>
          </div>
          <CampaignUpload />
        </div>
      );
    }

    return (
      <>
        <div className={`${roboto.className} header`}>
          <h2>📋 Campaign List</h2>
        </div>

        <div className="filters-section">
          <div className="filter-row">
            <div className="filter-group">
              <label>Campaign Name:</label>
              <input
                type="text"
                value={filters.campaignName}
                onChange={(e) => handleFilterChange("campaignName", e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Start Date:</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>End Date:</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>
          </div>

          <div className="filter-row">
            <div className="filter-group">
              <label>Product Name:</label>
              <input
                type="text"
                value={filters.productName}
                onChange={(e) => handleFilterChange("productName", e.target.value)}
              />
            </div>
            <div className="filter-group">
              <label>Status:</label>
              <input
                type="text"
                value={filters.status}
                onChange={(e) => handleFilterChange("status", e.target.value)}
              />
            </div>
          </div>

          <div className="query-btn-container">
            <button className="query-btn" onClick={handleQuery}>
              Search
            </button>
          </div>
        </div>

        <div className="table-container">
          <table className="campaign-table">
            <thead>
              <tr>
                <th>INDEX</th>
                <th>CAMPAIGN NAME</th>
                <th>START DATE</th>
                <th>END DATE</th>
                <th>PRODUCT NAME</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
  {currentCampaigns.length > 0 ? (
    currentCampaigns.map((campaign, index) => (
      <tr key={campaign.id}>
        <td>{indexOfFirstCampaign + index + 1}</td>
        <td>
          <span
            className="campaign-name-link"
            onClick={() => handleCampaignClick(campaign.id)}
          >
            {campaign.campaignName}
          </span>
        </td>
        <td>{new Date(campaign.startDate).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</td>
        <td>
          {campaign.endDate
            ? new Date(campaign.startDate).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
            : "-"}
        </td>
        <td>{campaign.productName || "-"}</td>
        <td>
          <span className={`status ${campaign.status?.toLowerCase() || "unknown"}`}>
            {campaign.status || "N/A"}
          </span>
        </td>
      </tr>
    ))
  ) : (
    <tr>
      <td colSpan="6" style={{ textAlign: "center" }}>
        No campaigns found
      </td>
    </tr>
  )}
</tbody>
          </table>
          {campaignData.length > campaignItemsPerPage && (
  <div className="pagination-container" style={{ 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    marginTop: '20px', 
    gap: '10px' 
  }}>
    <button 
      onClick={handlePrevCampaignPage} 
      disabled={currentCampaignPage === 1}
      style={{
        padding: '8px 16px',
        border: '1px solid #ccc',
        backgroundColor: currentCampaignPage === 1 ? '#f5f5f5' : '#6039D2',
        color: currentCampaignPage === 1 ? '#999' : 'white',
        borderRadius: '4px',
        cursor: currentCampaignPage === 1 ? 'not-allowed' : 'pointer'
      }}
    >
      Previous
    </button>
    
    <button 
      onClick={handleNextCampaignPage} 
      disabled={currentCampaignPage === totalCampaignPages}
      style={{
        padding: '8px 16px',
        border: '1px solid #ccc',
        backgroundColor: currentCampaignPage === totalCampaignPages ? '#f5f5f5' : '#6039D2',
        color: currentCampaignPage === totalCampaignPages ? '#999' : 'white',
        borderRadius: '4px',
        cursor: currentCampaignPage === totalCampaignPages ? 'not-allowed' : 'pointer'
      }}
    >
      Next
    </button>
    
    <button 
      onClick={() => setCurrentCampaignPage(totalCampaignPages)} 
      disabled={currentCampaignPage === totalCampaignPages}
      style={{
        padding: '8px 16px',
        border: '1px solid #ccc',
        backgroundColor: currentCampaignPage === totalCampaignPages ? '#f5f5f5' : '#6039D2',
        color: currentCampaignPage === totalCampaignPages ? '#999' : 'white',
        borderRadius: '4px',
        cursor: currentCampaignPage === totalCampaignPages ? 'not-allowed' : 'pointer'
      }}
    >
      Last
    </button>
    
    <span style={{ marginLeft: '15px', fontSize: '14px', color: '#666' }}>
      Page {currentCampaignPage} of {totalCampaignPages} ({campaignData.length} total campaigns)
    </span>
  </div>
)}

        </div>
      </>
    );
  };

  return (
    <div className={`${roboto.className} dashboard-container`}>
      <div className="sidebar">
        <div className="login-section">
          <div className="login-btn">
            <span className="login-icon">👤</span>
            User
          </div>
        </div>

        <div className="nav-section">
          <div className="nav-item" onClick={() => handleNavigation("home")}>
            <span className="nav-icon">🏠</span>
            Home
          </div>
          <div
            className={`nav-item ${
              activeSection === "dashboard" ||
              activeSection === "campaign-details"
                ? "active"
                : ""
            }`}
            onClick={() => handleNavigation("dashboard")}
          >
            <span className="nav-icon">📊</span>
            Dashboard
          </div>
          <div
            className={`nav-item ${
              activeSection === "upload-campaign" ? "active" : ""
            }`}
            onClick={() => handleNavigation("upload-campaign")}
          >
            <span className="nav-icon">📋</span>
            Campaign
          </div>
        </div>

        <div className="others-section">
          <div className="section-title">OTHERS</div>
          <div className="nav-item">
            <span className="nav-icon">❓</span>
            Help
          </div>
          <div className="nav-item">
            <span className="nav-icon">🚪</span>
            Log Out
          </div>
        </div>
      </div>

      <div className="main-content">{renderMainContent()}</div>
    </div>
  );
};

export default Dashboard;