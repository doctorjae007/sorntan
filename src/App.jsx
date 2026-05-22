import { useState } from "react";
import FormPage from "./pages/FormPage";
import ReportPage from "./pages/ReportPage";

export default function App() {
  const [currentPage, setCurrentPage] = useState("form");
  const [submittedData, setSubmittedData] = useState(null);

  const handleFormSubmit = (data) => {
    setSubmittedData(data);
    setCurrentPage("report");
  };

  const handleBackToForm = () => {
    setCurrentPage("form");
  };

  return (
    <>
      {currentPage === "form" ? (
        <FormPage onSubmit={handleFormSubmit} />
      ) : (
        <ReportPage data={submittedData} onBackToForm={handleBackToForm} />
      )}
    </>
  );
}