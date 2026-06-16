import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Upload,
  Trash2,
  KeyRound,
  Users,
  ShieldCheck,
  Copy,
  FileText,
  Shield,
  Send,
  FolderOpen,
  MessageSquareText,
} from "lucide-react";
import { chatAPI, documentAPI, userAPI } from "../utils/apiClient";
import DashboardNavbar from "../components/dashboard/DashboardNavbar";
import ActionButton from "../components/dashboard/ActionButton";
import AdminRequestsPanel from "../components/dashboard/AdminRequestsPanel";
import AdminApprovedAccessPanel from "../components/dashboard/AdminApprovedAccessPanel";
import EmployeeAccessPanel from "../components/dashboard/EmployeeAccessPanel";

export default function DashboardPage() {
  const { user, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const isEmployee = user?.role === "employee";

  const [documents, setDocuments] = useState([]);
  const [isLoadingDocuments, setIsLoadingDocuments] = useState(true);
  const [showDocuments, setShowDocuments] = useState(false);

  const [adminChat, setAdminChat] = useState(null);
  const [users, setUsers] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [approvedRequests, setApprovedRequests] = useState([]);
  const [isLoadingAdminData, setIsLoadingAdminData] = useState(false);

  const [activeAdminAction, setActiveAdminAction] = useState("");
  const [activeEmployeeAction, setActiveEmployeeAction] = useState("");

  const [companyName, setCompanyName] = useState("");
  const [documentName, setDocumentName] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  const [isDeletingChat, setIsDeletingChat] = useState(false);
  const [workspaceError, setWorkspaceError] = useState("");

  const [reviewingRequestId, setReviewingRequestId] = useState("");
  const [reviewMessage, setReviewMessage] = useState("");
  const [reviewError, setReviewError] = useState("");
  const [revokingEmployeeId, setRevokingEmployeeId] = useState("");
  const [accessMessage, setAccessMessage] = useState("");
  const [accessError, setAccessError] = useState("");

  const [accessCode, setAccessCode] = useState("");
  const [verifiedChatId, setVerifiedChatId] = useState("");
  const [verificationToken, setVerificationToken] = useState("");
  const [employeeMessage, setEmployeeMessage] = useState("");
  const [employeeError, setEmployeeError] = useState("");
  const [isVerifyingCode, setIsVerifyingCode] = useState(false);
  const [isRequestingAccess, setIsRequestingAccess] = useState(false);

  const userLookup = useMemo(() => {
    return users.reduce((accumulator, currentUser) => {
      accumulator[currentUser._id] = currentUser;
      return accumulator;
    }, {});
  }, [users]);

  const handleLogout = () => {
    logout();
    window.location.href = "/";
  };

  const loadDocuments = async () => {
    if (!isAdmin) {
      setDocuments([]);
      setIsLoadingDocuments(false);
      return;
    }

    try {
      setIsLoadingDocuments(true);
      const docs = await documentAPI.listDocuments();
      setDocuments(docs || []);
    } catch (error) {
      setDocuments([]);
    } finally {
      setIsLoadingDocuments(false);
    }
  };

  const loadAdminData = async ({
    loadChat = false,
    loadUsersData = false,
    loadPending = false,
    loadApproved = false,
  } = {}) => {
    if (!isAdmin) {
      return;
    }

    if (!loadChat && !loadUsersData && !loadPending && !loadApproved) {
      return;
    }

    try {
      setIsLoadingAdminData(true);
      const tasks = [];

      if (loadChat) {
        tasks.push(
          chatAPI
            .getAdminChat()
            .then((chat) => setAdminChat(chat))
            .catch(() => setAdminChat(null)),
        );
      }

      if (loadUsersData) {
        tasks.push(
          userAPI
            .listUsers()
            .then((allUsers) =>
              setUsers(Array.isArray(allUsers) ? allUsers : []),
            )
            .catch(() => setUsers([])),
        );
      }

      if (loadPending) {
        tasks.push(
          chatAPI
            .listAccessRequests("pending")
            .then((pending) =>
              setPendingRequests(Array.isArray(pending) ? pending : []),
            )
            .catch(() => setPendingRequests([])),
        );
      }

      if (loadApproved) {
        tasks.push(
          chatAPI
            .listAccessRequests("approved")
            .then((approved) =>
              setApprovedRequests(Array.isArray(approved) ? approved : []),
            )
            .catch(() => setApprovedRequests([])),
        );
      }

      await Promise.all(tasks);
    } catch (error) {
      setWorkspaceError(error?.message || "Failed to load admin workspace.");
    } finally {
      setIsLoadingAdminData(false);
    }
  };

  useEffect(() => {
    if (isAdmin) {
      loadDocuments();
      loadAdminData({ loadChat: true });
    } else {
      setDocuments([]);
      setShowDocuments(false);
      setIsLoadingDocuments(false);
      setAdminChat(null);
      setUsers([]);
      setPendingRequests([]);
      setApprovedRequests([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) {
      return;
    }

    if (activeAdminAction === "requests") {
      loadAdminData({ loadUsersData: true, loadPending: true });
    } else if (activeAdminAction === "access") {
      loadAdminData({ loadUsersData: true, loadApproved: true });
    } else if (
      activeAdminAction === "create" ||
      activeAdminAction === "share" ||
      activeAdminAction === "delete"
    ) {
      loadAdminData({ loadChat: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeAdminAction, isAdmin]);

  const refreshAdminData = async () => {
    await Promise.all([loadDocuments(), loadAdminData({ loadChat: true })]);
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    setUploadError("");
    setUploadSuccess("");

    if (adminChat) {
      setUploadError(
        "Only one chat is allowed for each admin. Delete the current chat first.",
      );
      return;
    }

    if (!companyName.trim() || !documentName.trim() || !selectedFile) {
      setUploadError("Company name, document name, and file are required.");
      return;
    }

    try {
      setIsUploading(true);
      const createdChat = await chatAPI.createChat(
        companyName.trim(),
        documentName.trim(),
        selectedFile,
      );

      setAdminChat(createdChat);
      setUploadSuccess("Chat created and document uploaded successfully.");
      setCompanyName("");
      setDocumentName("");
      setSelectedFile(null);
      await refreshAdminData();
    } catch (error) {
      setUploadError(error?.message || "Upload failed. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteChat = async () => {
    if (!adminChat?._id) {
      return;
    }

    const confirmed = window.confirm(
      "Delete the existing chat and its linked document?",
    );
    if (!confirmed) {
      return;
    }

    try {
      setIsDeletingChat(true);
      await chatAPI.deleteChat(adminChat._id);
      setAdminChat(null);
      setPendingRequests([]);
      setApprovedRequests([]);
      setUploadSuccess("Chat deleted successfully.");
      await Promise.all([loadDocuments(), loadAdminData({ loadChat: true })]);
    } catch (error) {
      setUploadError(error?.message || "Failed to delete chat.");
    } finally {
      setIsDeletingChat(false);
    }
  };

  const handleCopyAccessCode = async () => {
    if (!adminChat?.chat_access_code) {
      return;
    }

    try {
      await navigator.clipboard.writeText(adminChat.chat_access_code);
      setUploadSuccess("Access code copied to clipboard.");
    } catch (error) {
      setUploadError("Could not copy access code.");
    }
  };

  const handleReviewAccessRequest = async (requestId, action) => {
    setReviewMessage("");
    setReviewError("");

    try {
      setReviewingRequestId(requestId);
      await chatAPI.reviewAccessRequest(requestId, action);
      setReviewMessage(
        action === "approve" ? "Request approved." : "Request denied.",
      );
      await loadAdminData({ loadPending: true, loadApproved: true });
    } catch (error) {
      setReviewError(error?.message || "Unable to update the request.");
    } finally {
      setReviewingRequestId("");
    }
  };

  const handleRevokeAccess = async (request) => {
    setAccessMessage("");
    setAccessError("");

    try {
      setRevokingEmployeeId(request.employee_id);
      const chatId = request.chat_id || adminChat?._id;
      if (!chatId) {
        setAccessError("Could not identify chat for this access record.");
        return;
      }

      await chatAPI.revokeAccess(chatId, request.employee_id);
      setAccessMessage("Access revoked successfully.");
      await loadAdminData({ loadApproved: true });
    } catch (error) {
      setAccessError(error?.message || "Failed to revoke access.");
    } finally {
      setRevokingEmployeeId("");
    }
  };

  const handleVerifyAccessCode = async (e) => {
    e.preventDefault();
    setEmployeeError("");
    setEmployeeMessage("");

    if (!accessCode.trim()) {
      setEmployeeError("Access code is required.");
      return;
    }

    try {
      setIsVerifyingCode(true);
      const result = await chatAPI.verifyAccessCode(accessCode.trim());
      setVerifiedChatId(result.chat_id);
      setVerificationToken(result.verification_token);
      setEmployeeMessage("Code verified. You can request access now.");
    } catch (error) {
      setVerifiedChatId("");
      setVerificationToken("");
      setEmployeeError(error?.message || "Invalid access code.");
    } finally {
      setIsVerifyingCode(false);
    }
  };

  const handleRequestAccess = async () => {
    setEmployeeError("");
    setEmployeeMessage("");

    if (!verifiedChatId || !verificationToken) {
      setEmployeeError("Verify the access code first.");
      return;
    }

    try {
      setIsRequestingAccess(true);
      await chatAPI.requestAccess(verifiedChatId, verificationToken);
      setEmployeeMessage("Access request submitted.");
    } catch (error) {
      setEmployeeError(error?.message || "Failed to request access.");
    } finally {
      setIsRequestingAccess(false);
    }
  };

  const getUserLabel = (userId) => {
    const matchingUser = userLookup[userId];
    if (!matchingUser) {
      return userId;
    }
    return `${matchingUser.name} (${matchingUser.email})`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 ">
      <DashboardNavbar
        user={user}
        onLogout={handleLogout}
        onUserUpdated={updateUser}
      />

      <div className="mx-auto max-w-7xl px-6 py-12 ">
        <div className="rounded-lg bg-white p-8 shadow-md">
          <h2 className="mb-2 text-3xl font-bold text-slate-900"> 
            {isAdmin ? "Admin Dashboard" : isEmployee ? "Employee Dashboard" : "Dashboard"}
            </h2>
          {/* <p className="mb-8 text-slate-600">
            Use the action buttons below. Panels only open when selected.
          </p> */}

          {workspaceError && (
            <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {workspaceError}
            </p>
          )}

          {isAdmin && (
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                <h4 className="mb-2 font-semibold text-slate-900">Documents</h4>
                <p className="text-sm text-slate-600">
                  Hide or show the document list on demand.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                <h4 className="mb-2 font-semibold text-slate-900">Chat</h4>
                <p className="text-sm text-slate-600">
                  Create, share, or delete chats only when needed.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                <h4 className="mb-2 font-semibold text-slate-900">Requests</h4>
                <p className="text-sm text-slate-600">
                  Review access requests in a dedicated panel.
                </p>
              </div>
            </div>
          )}

          {isEmployee && (
            <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-3">
              
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                <h4 className="mb-2 font-semibold text-slate-900">Open Chat </h4>
                <p className="text-sm text-slate-600">
                  open the chat to ask questions after getting access.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                <h4 className="mb-2 font-semibold text-slate-900">Verify Code</h4>
                <p className="text-sm text-slate-600">
                 Enter your access code, provide by the admin.
                </p>
              </div>
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-6">
                <h4 className="mb-2 font-semibold text-slate-900">Request Access</h4>
                <p className="text-sm text-slate-600">
                  Request access after verifying the code to gain entry.
                </p>
              </div>
            </div>
          )}

          <div className="mt-8 flex flex-wrap items-center gap-4">
            {isAdmin && (
              <ActionButton
                icon={FolderOpen}
                label={showDocuments ? "Hide Documents" : "View Documents"}
                active={showDocuments}
                onClick={() => setShowDocuments((value) => !value)}
              />
            )}
            <ActionButton
              icon={MessageSquareText}
              label="Open Chat"
              active={false}
              onClick={() => navigate("/chat")}
            />

            {isAdmin ? (
              <>
                <ActionButton
                  icon={Upload}
                  label="Create Chat"
                  active={activeAdminAction === "create"}
                  onClick={() => setActiveAdminAction("create")}
                />
                <ActionButton
                  icon={Trash2}
                  label="Delete Chat"
                  active={activeAdminAction === "delete"}
                  onClick={() => setActiveAdminAction("delete")}
                  tone="red"
                />
                <ActionButton
                  icon={KeyRound}
                  label="Share Code"
                  active={activeAdminAction === "share"}
                  onClick={() => setActiveAdminAction("share")}
                />
                <ActionButton
                  icon={Users}
                  label="Review Requests"
                  active={activeAdminAction === "requests"}
                  onClick={() => setActiveAdminAction("requests")}
                  tone="amber"
                />
                <ActionButton
                  icon={ShieldCheck}
                  label="View Access"
                  active={activeAdminAction === "access"}
                  onClick={() => setActiveAdminAction("access")}
                  tone="emerald"
                />
              </>
            ) : (
              <>
                <ActionButton
                  icon={Shield}
                  label="Verify Code"
                  active={activeEmployeeAction === "verify"}
                  onClick={() => setActiveEmployeeAction("verify")}
                />
                <ActionButton
                  icon={Send}
                  label="Request Access"
                  active={activeEmployeeAction === "request"}
                  onClick={() => setActiveEmployeeAction("request")}
                  tone="emerald"
                />
              </>
            )}
          </div>

          {isAdmin && showDocuments && (
            <div className="mt-8 rounded-lg border border-slate-200 bg-white p-6">
              <h3 className="mb-4 inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
                <FileText className="h-5 w-5 text-indigo-600" />
                Documents
              </h3>

              {isLoadingDocuments ? (
                <p className="text-sm text-slate-500">Loading documents...</p>
              ) : documents.length === 0 ? (
                <p className="text-sm text-slate-500">
                  No documents found yet.
                </p>
              ) : (
                <ul className="space-y-2">
                  {documents.map((doc) => (
                    <li
                      key={doc._id}
                      className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2"
                    >
                      <p className="text-sm font-medium text-slate-800">
                        {doc.document_name}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {isAdmin ? (
            <div className="mt-8 space-y-6">
              {activeAdminAction === "create" && (
                <div className="rounded-lg border border-slate-200 bg-white p-6">
                  <h3 className="mb-2 inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
                    <Upload className="h-5 w-5 text-indigo-600" />
                    Create Chat While Uploading Document
                  </h3>
                  <p className="mb-4 text-sm text-slate-600">
                    Upload a policy document to create the chat workspace.
                  </p>

                  {adminChat ? (
                    <p className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-700">
                      You already have a chat. Delete it first to create a new
                      one.
                    </p>
                  ) : (
                    <form onSubmit={handleUploadSubmit} className="space-y-4">
                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                          Company Name
                        </label>
                        <input
                          type="text"
                          value={companyName}
                          onChange={(e) => setCompanyName(e.target.value)}
                          placeholder="Acme Corp"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                          Document Name
                        </label>
                        <input
                          type="text"
                          value={documentName}
                          onChange={(e) => setDocumentName(e.target.value)}
                          placeholder="Employee Handbook"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="mb-1 block text-sm font-medium text-slate-700">
                          Select File
                        </label>
                        <input
                          type="file"
                          onChange={(e) =>
                            setSelectedFile(e.target.files?.[0] || null)
                          }
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                        />
                        {selectedFile && (
                          <p className="mt-1 text-xs text-slate-500">
                            Selected: {selectedFile.name}
                          </p>
                        )}
                      </div>

                      <button
                        type="submit"
                        disabled={isUploading}
                        className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:opacity-60"
                      >
                        <Upload className="h-4 w-4" />
                        {isUploading ? "Uploading..." : "Upload & Create Chat"}
                      </button>

                      {uploadError && (
                        <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                          {uploadError}
                        </p>
                      )}
                      {uploadSuccess && (
                        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                          {uploadSuccess}
                        </p>
                      )}
                    </form>
                  )}
                </div>
              )}

              {activeAdminAction === "delete" && (
                <div className="rounded-lg border border-slate-200 bg-white p-6">
                  <h3 className="mb-2 inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
                    <Trash2 className="h-5 w-5 text-red-600" />
                    Delete Existing Chat
                  </h3>
                  <p className="mb-4 text-sm text-slate-600">
                    Remove the current chat and its linked access data.
                  </p>
                  {!adminChat ? (
                    <p className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                      No active chat exists yet.
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleDeleteChat}
                      disabled={isDeletingChat}
                      className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-500 disabled:opacity-60"
                    >
                      <Trash2 className="h-4 w-4" />
                      {isDeletingChat ? "Deleting..." : "Delete Chat"}
                    </button>
                  )}
                  {uploadError && (
                    <p className="mt-3 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                      {uploadError}
                    </p>
                  )}
                  {uploadSuccess && (
                    <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
                      {uploadSuccess}
                    </p>
                  )}
                </div>
              )}

              {activeAdminAction === "share" && (
                <div className="rounded-lg border border-slate-200 bg-white p-6">
                  <h3 className="mb-2 inline-flex items-center gap-2 text-lg font-semibold text-slate-900">
                    <KeyRound className="h-5 w-5 text-indigo-600" />
                    Share Access Code
                  </h3>
                  <p className="mb-4 text-sm text-slate-600">
                    Share this code with employees so they can verify and
                    request access.
                  </p>

                  <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Access Code
                    </p>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-2xl font-bold tracking-[0.35em] text-slate-900">
                        {adminChat?.chat_access_code || "Create a chat first"}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyAccessCode}
                        disabled={!adminChat?.chat_access_code}
                        className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <Copy className="h-4 w-4" />
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeAdminAction === "requests" && (
                <AdminRequestsPanel
                  pendingRequests={pendingRequests}
                  isLoading={isLoadingAdminData}
                  reviewError={reviewError}
                  reviewMessage={reviewMessage}
                  reviewingRequestId={reviewingRequestId}
                  getUserLabel={getUserLabel}
                  onApprove={(requestId) =>
                    handleReviewAccessRequest(requestId, "approve")
                  }
                  onDeny={(requestId) =>
                    handleReviewAccessRequest(requestId, "deny")
                  }
                />
              )}

              {activeAdminAction === "access" && (
                <AdminApprovedAccessPanel
                  approvedRequests={approvedRequests}
                  accessError={accessError}
                  accessMessage={accessMessage}
                  revokingEmployeeId={revokingEmployeeId}
                  getUserLabel={getUserLabel}
                  onRevoke={handleRevokeAccess}
                />
              )}
            </div>
          ) : (
            <EmployeeAccessPanel
              activeEmployeeAction={activeEmployeeAction}
              accessCode={accessCode}
              setAccessCode={setAccessCode}
              isVerifyingCode={isVerifyingCode}
              onVerifyAccessCode={handleVerifyAccessCode}
              employeeError={employeeError}
              employeeMessage={employeeMessage}
              isRequestingAccess={isRequestingAccess}
              onRequestAccess={handleRequestAccess}
              verificationToken={verificationToken}
            />
          )}

          


        </div>
      </div>
    </div>
  );
}
