import { MessageCircle, X } from "lucide-react"
import { useState } from "react"

interface WhatsAppWidgetProps {
  phoneNumber: string
  businessName?: string
}

export default function WhatsAppWidget({ phoneNumber, businessName = "Naija Snacks" }: WhatsAppWidgetProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [message, setMessage] = useState("")

  const predefinedMessages = [
    "Hi! I'd like to place an order",
    "What are your available products?",
    "Do you deliver to my area?",
    "What are your prices?",
    "I need help with my order",
  ]

  const sendMessage = (msg?: string) => {
    const messageToSend = msg || message || "Hi! I'm interested in your products"
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(messageToSend)}`
    window.open(whatsappUrl, "_blank")
    setIsOpen(false)
    setMessage("")
  }

  return (
    <>
      {/* Chat Widget */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-80 bg-white rounded-lg shadow-2xl border z-50">
          <div className="bg-green-500 text-white p-4 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-green-500 font-bold text-sm">NS</span>
              </div>
              <div>
                <h4 className="font-semibold">{businessName}</h4>
                <p className="text-xs opacity-90">Typically replies instantly</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:bg-green-600 p-1 rounded">
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-4">
            <div className="mb-4">
              <div className="bg-gray-100 p-3 rounded-lg mb-2">
                <p className="text-sm text-gray-700">
                  Hi there! 👋<br />
                  How can we help you today?
                </p>
              </div>
            </div>

            <div className="space-y-2 mb-4">
              <p className="text-xs text-gray-500 font-medium">Quick replies:</p>
              {predefinedMessages.map((msg, index) => (
                <button
                  key={index}
                  onClick={() => sendMessage(msg)}
                  className="w-full text-left p-2 text-sm bg-gray-50 hover:bg-gray-100 rounded border transition-colors"
                >
                  {msg}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type your message..."
                className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-green-500"
                rows={3}
              />
              <button
                onClick={() => sendMessage()}
                className="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded-lg font-medium transition-colors"
              >
                Send Message
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Float Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all z-50"
        title="Chat on WhatsApp"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </>
  )
}
