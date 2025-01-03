import ChatPage from '@/pages/chat-page.tsx';
import { MessagesProvider } from '@/context/MessagesContext.tsx';

function App() {
  return (
    <MessagesProvider>
      <ChatPage />
    </MessagesProvider>
  );
}

export default App;
