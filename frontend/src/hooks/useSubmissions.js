import { useState, useEffect } from "react";

const useSubmissions = (problemId) => {
  const [submissions, setSubmissions] = useState([]);

  // Load submissions from localStorage on mount
  useEffect(() => {
    const savedSubmissions = localStorage.getItem(`submissions_${problemId}`);
    if (savedSubmissions) {
      try {
        setSubmissions(JSON.parse(savedSubmissions));
      } catch (error) {
        console.error("Error loading submissions:", error);
      }
    }
  }, [problemId]);

  // Save submissions to localStorage whenever they change
  useEffect(() => {
    if (submissions.length > 0) {
      localStorage.setItem(`submissions_${problemId}`, JSON.stringify(submissions));
    }
  }, [submissions, problemId]);

  const addSubmission = (submission) => {
    setSubmissions(prev => [submission, ...prev]); // Add to beginning for latest first
  };

  const clearSubmissions = () => {
    setSubmissions([]);
    localStorage.removeItem(`submissions_${problemId}`);
  };

  const getSubmissionStats = () => {
    const total = submissions.length;
    const accepted = submissions.filter(s => s.status === "accepted").length;
    const wrong = submissions.filter(s => s.status === "wrong").length;
    
    return { total, accepted, wrong };
  };

  return {
    submissions,
    addSubmission,
    clearSubmissions,
    getSubmissionStats
  };
};

export default useSubmissions;