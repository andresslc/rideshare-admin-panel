import { useState, useRef, useEffect } from "react";
import {
  Send,
  Search,
  User,
  MessageSquare,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
} from "lucide-react";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import Card from "../components/ui/Card";
import Badge from "../components/ui/Badge";
import { formatDateTime } from "../utils/helpers";

const ChatSupport = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [message, setMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const messagesEndRef = useRef(null);

  const [chats] = useState([
    {
      id: 1,
      userId: 1,
      userName: "John Doe",
      userEmail: "john@example.com",
      avatar: null,
      status: "online",
      lastMessage: "Thank you for your help!",
      lastMessageTime: "2024-01-20T15:30:00Z",
      unreadCount: 0,
      messages: [
        {
          id: 1,
          senderId: 1,
          senderName: "John Doe",
          message: "Hi, I need help with my account",
          timestamp: "2024-01-20T15:00:00Z",
          isAdmin: false,
        },
        {
          id: 2,
          senderId: "admin",
          senderName: "Admin",
          message:
            "Hello John! I'd be happy to help you with your account. What specific issue are you experiencing?",
          timestamp: "2024-01-20T15:02:00Z",
          isAdmin: true,
        },
        {
          id: 3,
          senderId: 1,
          senderName: "John Doe",
          message:
            "I can't access my premium features even though I upgraded yesterday",
          timestamp: "2024-01-20T15:05:00Z",
          isAdmin: false,
        },
        {
          id: 4,
          senderId: "admin",
          senderName: "Admin",
          message:
            "I see the issue. Let me refresh your account permissions. This should be resolved in a few minutes.",
          timestamp: "2024-01-20T15:10:00Z",
          isAdmin: true,
        },
        {
          id: 5,
          senderId: 1,
          senderName: "John Doe",
          message: "Perfect! It's working now. Thank you for your help!",
          timestamp: "2024-01-20T15:30:00Z",
          isAdmin: false,
        },
      ],
    },
    {
      id: 2,
      userId: 2,
      userName: "Jane Smith",
      userEmail: "jane@example.com",
      avatar: null,
      status: "away",
      lastMessage: "Is there any update on this?",
      lastMessageTime: "2024-01-20T14:45:00Z",
      unreadCount: 2,
      messages: [
        {
          id: 1,
          senderId: 2,
          senderName: "Jane Smith",
          message: "I submitted a bug report yesterday but haven't heard back",
          timestamp: "2024-01-19T16:30:00Z",
          isAdmin: false,
        },
        {
          id: 2,
          senderId: "admin",
          senderName: "Admin",
          message:
            "Thank you for the report. Our development team is investigating the issue.",
          timestamp: "2024-01-19T17:00:00Z",
          isAdmin: true,
        },
        {
          id: 3,
          senderId: 2,
          senderName: "Jane Smith",
          message: "Is there any update on this?",
          timestamp: "2024-01-20T14:45:00Z",
          isAdmin: false,
        },
      ],
    },
    {
      id: 3,
      userId: 3,
      userName: "Bob Johnson",
      userEmail: "bob@example.com",
      avatar: null,
      status: "offline",
      lastMessage: "Thanks for the quick response!",
      lastMessageTime: "2024-01-20T12:15:00Z",
      unreadCount: 0,
      messages: [
        {
          id: 1,
          senderId: 3,
          senderName: "Bob Johnson",
          message: "How do I cancel my subscription?",
          timestamp: "2024-01-20T12:00:00Z",
          isAdmin: false,
        },
        {
          id: 2,
          senderId: "admin",
          senderName: "Admin",
          message:
            "You can cancel your subscription from your account settings under the billing section.",
          timestamp: "2024-01-20T12:10:00Z",
          isAdmin: true,
        },
        {
          id: 3,
          senderId: 3,
          senderName: "Bob Johnson",
          message: "Thanks for the quick response!",
          timestamp: "2024-01-20T12:15:00Z",
          isAdmin: false,
        },
      ],
    },
  ]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat?.messages]);

  const handleSendMessage = () => {
    if (!message.trim() || !selectedChat) return;

    const newMessage = {
      id: selectedChat.messages.length + 1,
      senderId: "admin",
      senderName: "Admin",
      message: message.trim(),
      timestamp: new Date().toISOString(),
      isAdmin: true,
    };

    // Update the selected chat with new message
    const updatedChat = {
      ...selectedChat,
      messages: [...selectedChat.messages, newMessage],
      lastMessage: message.trim(),
      lastMessageTime: new Date().toISOString(),
    };

    setSelectedChat(updatedChat);
    setMessage("");
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const filteredChats = chats.filter(
    (chat) =>
      chat.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      chat.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "online":
        return "bg-green-500";
      case "away":
        return "bg-yellow-500";
      case "offline":
        return "bg-gray-400";
      default:
        return "bg-gray-400";
    }
  };

  const totalChats = chats.length;
  const activeChats = chats.filter((chat) => chat.status === "online").length;
  const unreadMessages = chats.reduce((sum, chat) => sum + chat.unreadCount, 0);
  const avgResponseTime = "2.5 min"; // This would be calculated from actual data

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Chats
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {totalChats}
              </p>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Active Chats
              </p>
              <p className="text-2xl font-bold text-green-600">{activeChats}</p>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <User className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Unread Messages
              </p>
              <p className="text-2xl font-bold text-red-600">
                {unreadMessages}
              </p>
            </div>
            <div className="p-3 bg-red-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Avg Response Time
              </p>
              <p className="text-2xl font-bold text-purple-600">
                {avgResponseTime}
              </p>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <MessageSquare className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Chat Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Chat List */}
        <Card className="lg:col-span-1">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Chat Support
            </h3>
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-gray-400" />}
            />
          </div>

          <div className="overflow-y-auto h-[500px]">
            {filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => setSelectedChat(chat)}
                className={`p-4 border-b border-gray-200 dark:border-gray-700 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors ${selectedChat?.id === chat.id
                    ? "bg-primary-500 dark:bg-primary-500/80"
                    : ""
                  }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <span className="text-gray-600 font-medium">
                        {chat.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div
                      className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(
                        chat.status
                      )}`}
                    ></div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                        {chat.userName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(chat.lastMessageTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                        {chat.lastMessage}
                      </p>
                      {chat.unreadCount > 0 && (
                        <Badge variant="danger" className="text-xs">
                          {chat.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Chat Messages */}
        <Card className="lg:col-span-2">
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                        <span className="text-gray-600 font-medium">
                          {selectedChat.userName.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div
                        className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${getStatusColor(
                          selectedChat.status
                        )}`}
                      ></div>
                    </div>
                    <div>
                      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {selectedChat.userName}
                      </h4>
                      <p className="text-sm text-gray-500">
                        {selectedChat.userEmail}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Phone className="w-4 h-4" />}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<Video className="w-4 h-4" />}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      icon={<MoreVertical className="w-4 h-4" />}
                    />
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 h-[400px]">
                {selectedChat.messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`flex ${msg.isAdmin ? "justify-end" : "justify-start"
                      }`}
                  >
                    <div
                      className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${msg.isAdmin
                          ? "bg-primary-600 text-white"
                          : "bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white"
                        }`}
                    >
                      <p className="text-sm">{msg.message}</p>
                      <p
                        className={`text-xs mt-1 ${msg.isAdmin ? "text-primary-100" : "text-gray-500"
                          }`}
                      >
                        {new Date(msg.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    icon={<Paperclip className="w-4 h-4" />}
                  />
                  <div className="flex-1">
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Type your message..."
                      rows={1}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                    />
                  </div>
                  <Button
                    onClick={handleSendMessage}
                    disabled={!message.trim()}
                    icon={<Send className="w-4 h-4" />}
                  >
                    Send
                  </Button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-500">
                  Choose a chat from the list to start messaging
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default ChatSupport;
