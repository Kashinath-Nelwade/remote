import { useState } from "react";
import { Send, Loader2, CheckCircle } from "lucide-react";
import toast from "react-hot-toast";

const SubmitButton = ({ 
  code, 
  language, 
  problemId, 
  onSubmit, 
  disabled = false,
  lastOutput = null 
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmissionStatus, setLastSubmissionStatus] = useState(null);

  const handleSubmit = async () => {
    if (!code.trim()) {
      toast.error("Please write some code before submitting");
      return;
    }

    setIsSubmitting(true);
    setLastSubmissionStatus(null);

    try {
      const submission = {
        id: Date.now().toString(),
        code: code.trim(),
        language,
        problemId,
        timestamp: new Date().toISOString(),
        output: lastOutput?.output || "",
        error: lastOutput?.error || "",
        status: lastOutput?.error ? "wrong" : "accepted"
      };

      // Call the onSubmit callback
      await onSubmit(submission);
      
      setLastSubmissionStatus(submission.status);
      
      if (submission.status === "accepted") {
        toast.success("Solution submitted successfully!");
      } else {
        toast.error("Submission failed - check your code");
      }

    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit solution");
      setLastSubmissionStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getButtonContent = () => {
    if (isSubmitting) {
      return (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          Submitting...
        </>
      );
    }

    if (lastSubmissionStatus === "accepted") {
      return (
        <>
          <CheckCircle className="w-4 h-4" />
          Submitted
        </>
      );
    }

    return (
      <>
        <Send className="w-4 h-4" />
        Submit Solution
      </>
    );
  };

  const getButtonStyle = () => {
    if (lastSubmissionStatus === "accepted") {
      return "bg-green-600 hover:bg-green-700 text-white";
    }
    
    if (lastSubmissionStatus === "wrong") {
      return "bg-red-600 hover:bg-red-700 text-white";
    }

    return "bg-blue-600 hover:bg-blue-700 text-white";
  };

  return (
    <button
      onClick={handleSubmit}
      disabled={disabled || isSubmitting || !code.trim()}
      className={`
        px-4 py-2 rounded-lg font-medium transition-all duration-200
        flex items-center gap-2 min-w-[140px] justify-center
        disabled:opacity-50 disabled:cursor-not-allowed
        ${getButtonStyle()}
      `}
    >
      {getButtonContent()}
    </button>
  );
};

export default SubmitButton;