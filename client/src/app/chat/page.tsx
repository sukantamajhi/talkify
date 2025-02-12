"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader } from "~/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "~/components/ui/avatar"
import { ScrollArea } from "~/components/ui/scroll-area"
import { Send } from "lucide-react"

interface Message {
  id: number
  content: string
  sender: "user" | "other"
}

export default function ChatArea() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, content: "Hey there!", sender: "other" },
    { id: 2, content: "Hi! How are you?", sender: "user" },
    { id: 3, content: "I'm doing great, thanks for asking. How about you?", sender: "other" },
  ])
  const [newMessage, setNewMessage] = useState("")

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (newMessage.trim()) {
      setMessages([...messages, { id: messages.length + 1, content: newMessage, sender: "user" }])
      setNewMessage("")
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
      <Card className="w-full max-w-2xl h-[80vh] flex flex-col">
        <CardHeader className="flex flex-row items-center space-x-4 pb-4">
          <Avatar>
            <AvatarImage src="/placeholder.svg" alt="Chat Avatar" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-2xl font-bold">Chat Room</h2>
            <p className="text-gray-500">3 participants</p>
          </div>
        </CardHeader>
        <CardContent className="flex-grow overflow-hidden">
          <ScrollArea className="h-full pr-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`mb-4 flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-secondary"
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))}
          </ScrollArea>
        </CardContent>
        <CardFooter>
          <form onSubmit={handleSendMessage} className="flex w-full space-x-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-grow"
            />
            <Button type="submit">
              <Send className="h-4 w-4" />
              <span className="sr-only">Send</span>
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  )
}

