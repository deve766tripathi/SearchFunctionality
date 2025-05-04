import React, { useState, useEffect, useCallback, useRef } from "react";
import { fetchQuestions, searchQuestions } from "../services/api";

const QuestionList = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const searchTimeoutRef = useRef(null);

  const questionsPerPage = 10;
  const totalPages = Math.ceil(totalQuestions / questionsPerPage);

  const questionTypes = [
    { value: "", label: "All Types" },
    { value: "MCQ", label: "Multiple Choice" },
    { value: "READ_ALONG", label: "Read Along" },
    { value: "ANAGRAM", label: "Anagram" },
  ];

  const loadQuestions = useCallback(async () => {
    try {
      setLoading(true);
      const params = {
        page,
        pageSize: questionsPerPage,
        type: selectedType || undefined,
        query: searchQuery || undefined,
      };

      const data = searchQuery || selectedType
        ? await searchQuestions(params)
        : await fetchQuestions(params);

      setQuestions(data.questions || []);
      setTotalQuestions(data.total || 0);
      setError(null);
    } catch (err) {
      console.error("Questions load error:", err);
      setError(err.response?.data?.message || "Failed to load questions");
      setQuestions([]);
      setTotalQuestions(0);
    } finally {
      setLoading(false);
    }
  }, [page, searchQuery, selectedType]);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      loadQuestions();
    }, 700);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, selectedType, page, loadQuestions]);

  const renderMCQOptions = (options) => {
    const optionLetters = ["a", "b", "c", "d"];
    return options.map((option, index) => (
      <div
        key={index}
        className={`option ${option.isCorrectAnswer ? "correct" : ""}`}
      >
        {optionLetters[index]}. {option.text}
      </div>
    ));
  };

  const renderQuestionContent = (question) => {
    switch (question.type) {
      case "MCQ":
        return <div>{renderMCQOptions(question.options)}</div>;

      case "ANAGRAM":
        return (
          <div>
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                justifyContent: "center",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              {question.blocks
                .filter((block) => block.showInOption)
                .map((block, index) => {
                  const optionLetters = [
                    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j",
                  ];
                  return (
                    <div key={index} className="option">
                      {optionLetters[index]}. {block.text}
                    </div>
                  );
                })}
            </div>
            <div className="option correct" style={{ padding: "10px" }}>
              <strong>Solution:</strong> {question.solution}
            </div>
          </div>
        );

      case "READ_ALONG":
        return (
          <div>
            {question.blocks?.map((block, index) => (
              <div key={index}>{block.text}</div>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const renderPagination = () => {
    const pageNumbers = [];
    const maxPagesShown = 5;
    const halfMax = Math.floor(maxPagesShown / 2);

    let startPage = Math.max(1, page - halfMax);
    let endPage = Math.min(totalPages, startPage + maxPagesShown - 1);

    if (endPage - startPage + 1 < maxPagesShown) {
      startPage = Math.max(1, endPage - maxPagesShown + 1);
    }

    if (startPage > 1) {
      pageNumbers.push(
        <button key="first" onClick={() => handlePageChange(1)} className="pagination-button">
          1
        </button>
      );
      if (startPage > 2) {
        pageNumbers.push(<span key="start-ellipsis" className="pagination-ellipsis">...</span>);
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`pagination-button ${page === i ? "active" : ""}`}
        >
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        pageNumbers.push(<span key="end-ellipsis" className="pagination-ellipsis">...</span>);
      }
      pageNumbers.push(
        <button key="last" onClick={() => handlePageChange(totalPages)} className="pagination-button">
          {totalPages}
        </button>
      );
    }

    return pageNumbers;
  };

  const handleSearchClick = () => {
    setPage(1); 
    loadQuestions();
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
  };

  const handleTypeChange = (e) => {
    const type = e.target.value;
    setSelectedType(type);
  };

  const handleReset = () => {
    setSearchQuery("");
    setSelectedType("");
    setPage(1);
  };

  if (loading) return <div>Loading questions...</div>;

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Search questions..."
          value={searchQuery}
          onChange={handleSearchChange}
          style={{
            padding: "10px",
            marginRight: "10px",
            border: "1px solid #ddd",
            width: "300px",
          }}
        />
        <select
          value={selectedType}
          onChange={handleTypeChange}
          style={{ padding: "10px", marginRight: "10px" }}
        >
          {questionTypes.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
        <button
          onClick={handleSearchClick}
          style={{
            padding: "10px",
            marginRight: "10px",
            backgroundColor: "#007bff",
            color: "white",
            border: "none",
            borderRadius: "4px",
          }}
        >
          Search
        </button>
        {(searchQuery || selectedType) && (
          <button
            type="button"
            onClick={handleReset}
            className="reset-button"
          >
            Reset
          </button>
        )}
      </div>

      {error && <div style={{ color: "red", marginBottom: "10px" }}>{error}</div>}

      <div>
        {questions.map((question, index) => (
          <div
            key={question._id}
            style={{
              border: "1px solid #ddd",
              marginBottom: "10px",
              padding: "10px",
            }}
          >
            <h3>
              Q{(page - 1) * questionsPerPage + index + 1}. {question.title}
            </h3>
            {renderQuestionContent(question)}
          </div>
        ))}
      </div>

      {questions.length === 0 && (
        <div style={{ textAlign: "center", color: "gray" }}>
          No questions found
        </div>
      )}

      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button onClick={() => handlePageChange(page - 1)} disabled={page === 1} className="pagination-button">
          Previous
        </button>
        {renderPagination()}
        <button
          onClick={() => handlePageChange(page + 1)}
          disabled={page === totalPages}
          className="pagination-button"
        >
          Next
        </button>
        <span style={{ marginLeft: "10px" }}>
          Page {page} of {totalPages}
        </span>
      </div>
    </div>
  );
};

export default QuestionList;