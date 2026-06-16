import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Bot, Loader2, MessageSquareText, Send } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { chatAPI } from "../utils/apiClient";
import { useAuth } from "../context/AuthContext";

function formatDate(value) {
  if (!value) {
    return "Unknown";
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return String(value);
  }

  return parsed.toLocaleString();
}

function MessageBubble({ role, text, createdAt, isThinking = false }) {
  const isUser = role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-3 shadow-sm ${
          isUser
            ? "bg-indigo-600 text-white"
            : "border border-slate-200 bg-white text-slate-900"
        }`}
      >
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] opacity-80">
          {isUser ? (
            <MessageSquareText className="h-3.5 w-3.5" />
          ) : (
            <Bot className="h-3.5 w-3.5" />
          )}
          <span>{isUser ? "You" : "Assistant"}</span>
        </div>
        <div
          className={`text-sm leading-6 ${isThinking ? "animate-pulse italic" : ""}`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap break-words">{text}</p>
          ) : (
            <div className="prose prose-sm max-w-none [&_p]:m-1 [&_p]:leading-6 [&_ul]:my-1 [&_ul]:ml-4 [&_li]:m-0 [&_strong]:font-bold [&_h1]:text-base [&_h2]:text-base [&_h3]:text-sm">
              <ReactMarkdown>{text}</ReactMarkdown>
            </div>
          )}
        </div>
        {createdAt && (
          <p
            className={`mt-2 text-xs ${isUser ? "text-indigo-100" : "text-slate-500"}`}
          >
            {formatDate(createdAt)}
          </p>
        )}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [accessibleChats, setAccessibleChats] = useState([]);
  const [isLoadingChats, setIsLoadingChats] = useState(true);
  const [listError, setListError] = useState("");

  const [activeChat, setActiveChat] = useState(null);
  const [isLoadingChat, setIsLoadingChat] = useState(false);
  const [chatError, setChatError] = useState("");

  const [question, setQuestion] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [conversation, setConversation] = useState([]);
  const messagesEndRef = useRef(null);

  const assistantLabel = user?.company_name?.trim()
    ? `${user.company_name.trim()} Assistant`
    : "Policy Assistant";

  const loadAccessibleChats = async () => {
    try {
      setIsLoadingChats(true);
      setListError("");
      const chats = await chatAPI.listChats();
      setAccessibleChats(Array.isArray(chats) ? chats : []);
    } catch (error) {
      setAccessibleChats([]);
      setListError(error?.message || "Could not load accessible chats.");
    } finally {
      setIsLoadingChats(false);
    }
  };

  const loadChat = async (selectedChatId) => {
    if (!selectedChatId) {
      setActiveChat(null);
      setConversation([]);
      setChatError("");
      return;
    }

    try {
      setIsLoadingChat(true);
      setChatError("");
      const chat = await chatAPI.getChat(selectedChatId);
      setActiveChat(chat);
      setConversation([]);
    } catch (error) {
      setActiveChat(null);
      setConversation([]);
      if (error?.status === 403) {
        setChatError("You do not have access to this chat.");
      } else if (error?.status === 404) {
        setChatError("Chat not found.");
      } else {
        setChatError(error?.message || "Could not load the chat.");
      }
    } finally {
      setIsLoadingChat(false);
    }
  };

  useEffect(() => {
    loadAccessibleChats();
  }, []);

  useEffect(() => {
    if (!chatId && !isLoadingChats && accessibleChats[0]?._id) {
      navigate(`/chat/${accessibleChats[0]._id}`, { replace: true });
    }
  }, [chatId, isLoadingChats, accessibleChats, navigate]);

  useEffect(() => {
    loadChat(chatId);
  }, [chatId]);

  useEffect(() => {
    if (chatId) {
      setIsLoadingChat(true);
    }
  }, [chatId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [conversation, isSending]);

  const handleSendQuestion = async (e) => {
    e.preventDefault();

    if (!activeChat?._id || !question.trim()) {
      return;
    }

    const userMessage = {
      role: "user",
      text: question.trim(),
      createdAt: new Date().toISOString(),
    };

    setConversation((current) => [...current, userMessage]);
    setIsSending(true);
    setChatError("");

    try {
      const response = await chatAPI.ask(activeChat._id, question.trim());
      const assistantMessage = {
        role: "assistant",
        text: response.answer,
        createdAt: new Date().toISOString(),
        sources: response.sources || [],
      };

      setConversation((current) => [...current, assistantMessage]);
      setQuestion("");
    } catch (error) {
      setChatError(
        error?.status === 403
          ? "You do not have access to this chat."
          : error?.message || "Unable to send your question.",
      );
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="h-[100dvh] overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.25),_transparent_35%)]" />

      <div className="relative mx-auto flex h-full max-w-5xl min-h-0 flex-col overflow-x-hidden px-4 py-4 sm:px-6 sm:py-8">
        <div className="mb-3 sm:mb-4">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Link>
        </div>

        <main className="flex-1 min-h-0 overflow-hidden rounded-2xl border border-white/15 bg-white text-slate-900 shadow-2xl sm:rounded-3xl">
          {isLoadingChats ||
          isLoadingChat ||
          (chatId && !activeChat && !chatError) ? (
            <div className="flex h-full items-center justify-center px-6 py-10">
              <div className="flex items-center gap-3 rounded-full bg-slate-100 px-5 py-3 text-sm font-medium text-slate-700">
                <Loader2 className="h-4 w-4 animate-spin" />
                Loading chat...
              </div>
            </div>
          ) : listError ? (
            <div className="flex h-full items-center justify-center px-6 py-10 text-center">
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {listError}
              </p>
            </div>
          ) : !chatId && accessibleChats.length === 0 ? (
            <div className="flex h-full items-center justify-center px-6 py-10 text-center">
              <p className="text-sm text-slate-600">
                No accessible chats available yet.
              </p>
            </div>
          ) : chatError ? (
            <div className="flex h-full items-center justify-center px-6 py-10 text-center">
              <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {chatError}
              </p>
            </div>
          ) : (
            <div className="flex h-full min-h-0 flex-col">
              <div className="border-b border-slate-200 px-6 py-4">
                <h1 className="text-lg font-semibold text-slate-900">
                  {assistantLabel}
                </h1>
              </div>

              <div className="chat-scroll-hidden flex-1 min-h-0 space-y-4 overflow-y-auto overflow-x-hidden px-3 py-4 sm:px-8 sm:py-6">
                {conversation.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center">
                    <MessageSquareText className="mx-auto h-6 w-6 text-slate-500" />
                    <p className="mt-3 text-sm text-slate-600">
                      Start the conversation.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {conversation.map((message, index) => (
                      <MessageBubble
                        key={`${message.role}-${index}`}
                        role={message.role}
                        text={message.text}
                        createdAt={message.createdAt}
                      />
                    ))}
                    {isSending && (
                      <MessageBubble
                        role="assistant"
                        text="Thinking..."
                        isThinking
                      />
                    )}
                    <div ref={messagesEndRef} />
                  </div>
                )}
              </div>

              <div className="border-t border-slate-200 bg-white px-4 py-4 sm:px-8">
                <form onSubmit={handleSendQuestion} className="space-y-3">
                  <div className="flex flex-row items-end gap-2">
                    <textarea
                      value={question}
                      onChange={(e) => setQuestion(e.target.value)}
                      placeholder="Type your question..."
                      rows={1}
                      className="min-h-[44px] max-h-[96px] flex-1 resize-y rounded-xl border border-slate-300 px-4 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                    <button
                      type="submit"
                      disabled={
                        !question.trim() || isSending || !activeChat?._id
                      }
                      className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60 sm:min-w-[140px]"
                    >
                      {isSending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                      {isSending ? "Sending..." : "Send"}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
