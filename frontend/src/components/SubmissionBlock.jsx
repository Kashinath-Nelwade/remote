import { useState } from "react";
import { CheckCircle, Clock, XCircle, Code, Calendar } from "lucide-react";

const SubmissionBlock = ({ submissions = [] }) => {
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  const getStatusIcon = (status) => {
    switch (status) {
      case "accepted":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "wrong":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "accepted":
        return "bg-green-50 border-green-200 text-green-800";
      case "wrong":
        return "bg-red-50 border-red-200 text-red-800";
      default:
        return "bg-yellow-50 border-yellow-200 text-yellow-800";
    }
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-2 mb-4">
        <Code className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Submissions</h3>
        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
          {submissions.length}
        </span>
      </div>

      {submissions.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <Code className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p>No submissions yet</p>
          <p className="text-sm">Run your code and submit to see results here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {submissions.map((submission, index) => (
            <div
              key={submission.id}
              className={`p-3 rounded-lg border cursor-pointer transition-all hover:shadow-md ${
                selectedSubmission?.id === submission.id
                  ? "ring-2 ring-blue-500 border-blue-300"
                  : getStatusColor(submission.status)
              }`}
              onClick={() => setSelectedSubmission(submission)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {getStatusIcon(submission.status)}
                  <div>
                    <p className="font-medium">
                      Submission #{submissions.length - index}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      {new Date(submission.timestamp).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium capitalize">
                    {submission.status}
                  </p>
                  <p className="text-xs text-gray-500">
                    {submission.language}
                  </p>
                </div>
              </div>

              {selectedSubmission?.id === submission.id && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">
                        Code:
                      </h4>
                      <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                        <code>{submission.code}</code>
                      </pre>
                    </div>
                    
                    {submission.output && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-700 mb-2">
                          Output:
                        </h4>
                        <pre className="bg-gray-50 p-3 rounded text-sm overflow-x-auto">
                          <code>{submission.output}</code>
                        </pre>
                      </div>
                    )}

                    {submission.error && (
                      <div>
                        <h4 className="text-sm font-medium text-red-700 mb-2">
                          Error:
                        </h4>
                        <pre className="bg-red-50 p-3 rounded text-sm overflow-x-auto text-red-800">
                          <code>{submission.error}</code>
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubmissionBlock;