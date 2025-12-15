import ChatArea from './components/main/main'
import Sidebar from './components/sideBar/sidebar'
import './index.css'

function App() {
  return (
    <div className="h-screen w-screen flex bg-gray-900">
      <Sidebar />
      <div className="flex-1 p-8 overflow-auto">
        <div className="text-white text-2xl font-bold">
          <ChatArea/>
        </div>
      </div>
    </div>
  )
}

export default App
