```react
import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, Image as ImageIcon, Calculator, BookOpen, 
  Settings, LogOut, User, Lock, X, CheckCircle, Globe, Trash2,
  Code, Copy, Check, Bell, ShieldAlert, Menu, MessageSquarePlus, 
  MessageSquare, Clock, ShieldCheck, AlertTriangle, ScanLine, Search,
  Sparkles, Flame
} from 'lucide-react';

// API Key จะถูกเติมอัตโนมัติโดยระบบตอนรัน
const apiKey = ""; 

// --- Component ย่อยสำหรับ Modal ยืนยันคำสั่ง ---
const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl animate-fade-in-down">
        <h3 className="font-bold text-lg text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-600 text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-2.5 rounded-xl transition">
            ยกเลิก
          </button>
          <button onClick={onConfirm} className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-2.5 rounded-xl transition">
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
};

// --- Component ย่อยสำหรับแสดงกล่องโค้ดและปุ่ม Copy ---
const CodeBlock = ({ language, code }) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); 
    }).catch(err => {
      console.error('Failed to copy: ', err);
      const textArea = document.createElement("textarea");
      textArea.value = code;
      document.body.appendChild(textArea);
      textArea.select();
      try {
        document.execCommand('copy');
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      } catch (err) {
        console.error('Fallback copy failed', err);
      }
      document.body.removeChild(textArea);
    });
  };

  return (
    <div className="my-4 bg-[#1e1e1e] rounded-xl overflow-hidden border border-gray-700 shadow-sm">
      <div className="flex justify-between items-center bg-[#2d2d2d] px-4 py-2">
        <span className="text-xs font-mono text-gray-300 capitalize">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 text-xs text-gray-300 hover:text-white transition-colors p-1"
        >
          {isCopied ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-green-400 font-sans">คัดลอกแล้ว</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span className="font-sans">คัดลอกโค้ด</span>
            </>
          )}
        </button>
      </div>
      <div className="p-4 overflow-x-auto text-sm font-mono text-gray-100 bg-[#1e1e1e]">
        <pre><code className="whitespace-pre">{code}</code></pre>
      </div>
    </div>
  );
};

// --- Component ย่อยสำหรับแสดงรูปภาพในแชท ---
const ChatImage = ({ url, alt, isUser }) => {
  const [hasError, setHasError] = useState(false);
  
  if (hasError) {
    return (
      <a 
        href={url} 
        target="_blank" 
        rel="noopener noreferrer" 
        className={`text-xs border p-1 rounded inline-block my-1 ${isUser ? 'border-indigo-400 text-indigo-200 hover:text-white' : 'border-gray-300 text-blue-500 hover:text-blue-700'} underline`}
      >
        [ลิงก์รูปภาพ: {alt || 'เปิดในหน้าต่างใหม่'}]
      </a>
    );
  }

  return (
    <div className="my-3 flex justify-center">
      <img 
        src={url} 
        alt={alt} 
        className="max-w-full h-auto rounded-xl border border-gray-200 shadow-md object-cover" 
        style={{ maxHeight: '350px' }}
        onError={() => setHasError(true)} 
      />
    </div>
  );
};

// --- Component ไฮไลต์ข้อความสำคัญสุดล้ำ ---
const HighlightText = ({ text }) => {
  // ตรวจสอบคีย์เวิร์ดเพื่อเลือกรูปแบบไอคอนและสี (ร้อนแรง/อันตราย vs สำคัญ/แนะนำ)
  const isHot = text.match(/(ด่วน|สำคัญ|ระวัง|ร้อน|เตือน|อันตราย|!)/i);
  
  return (
    <span className={`relative inline-block px-3.5 py-1.5 mx-1 my-1.5 rounded-xl border shadow-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md ${
      isHot 
        ? 'bg-gradient-to-br from-rose-50 to-orange-50 border-orange-200 text-orange-800' 
        : 'bg-gradient-to-br from-indigo-50 to-fuchsia-50 border-indigo-200 text-indigo-800'
    }`}>
      {isHot ? (
        <Flame className="inline-block w-4 h-4 mr-1.5 mb-0.5 animate-pulse text-orange-500" />
      ) : (
        <Sparkles className="inline-block w-4 h-4 mr-1.5 mb-0.5 text-indigo-500" />
      )}
      <span className="leading-relaxed">{text}</span>
    </span>
  );
};

// --- Component แอนิเมชันสแกนลิงก์สุดล้ำ ---
const ScannerLoader = () => (
  <div className="flex flex-col items-center justify-center p-5 bg-[#0f172a] rounded-2xl rounded-bl-none shadow-lg border border-cyan-900/50 max-w-[280px]">
    <div className="relative mb-3 flex items-center justify-center">
      <ShieldAlert className="w-12 h-12 text-cyan-500/30" />
      <ScanLine className="w-8 h-8 text-cyan-400 absolute animate-pulse" />
      <div className="absolute inset-0 border-t-2 border-b-2 border-cyan-300 rounded-full animate-[spin_2s_linear_infinite] opacity-60 w-12 h-12"></div>
    </div>
    <div className="flex flex-col items-center">
      <span className="text-xs font-mono text-cyan-300 tracking-wider">CYBER SECURITY SCAN</span>
      <span className="text-[10px] text-cyan-500 mt-1 animate-pulse flex items-center gap-1">
        <Search className="w-3 h-3"/> ตรวจสอบความน่าเชื่อถือ...
      </span>
    </div>
  </div>
);

export default function App() {
  // --- States ---
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authMode, setAuthMode] = useState('login'); 
  
  // ระบบ Sidebar และ การจัดการแชท
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [chatSessions, setChatSessions] = useState([]); 
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [mode, setMode] = useState('general');

  // ระบบยืนยันตัวตนผู้พัฒนา
  const [isVerifiedDev, setIsVerifiedDev] = useState(false);
  const [showDevAuthPrompt, setShowDevAuthPrompt] = useState(false);
  const [devPassword, setDevPassword] = useState('');

  // หน่วยความจำ และ แจ้งเตือน
  const [aiMemory, setAiMemory] = useState('');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  // UI Dialog/Modal
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, title: '', message: '', action: null });

  // ข้อมูลแชทปัจจุบัน
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  // Loading States
  const [isLoading, setIsLoading] = useState(false);
  const [isScanningURL, setIsScanningURL] = useState(false);
  
  // การตั้งค่า
  const [showSettings, setShowSettings] = useState(false);
  const [devCodeInput, setDevCodeInput] = useState('');
  const [isDevUnlocked, setIsDevUnlocked] = useState(false);
  const [aiSettings, setAiSettings] = useState(() => {
    const defaultAvatarUrl = 'https://www.htx.gov.sg/images/default-source/news/2024/ai-article-1-banner-shot-min.jpg?sfvrsn=4b7c6915_3';
    try {
      const savedSettings = localStorage.getItem('rapeepatAiSettings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        parsed.name = 'Rapeepat Ai';
        if (!parsed.avatarUrl) parsed.avatarUrl = defaultAvatarUrl;
        return parsed;
      }
    } catch (e) {}
    return { name: 'Rapeepat Ai', avatarUrl: defaultAvatarUrl };
  });

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // --- Effects ---

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('rapeepatAi_username');
      const savedStatus = localStorage.getItem('rapeepatAi_isLoggedIn');
      const devStatus = localStorage.getItem('rapeepatAi_isVerifiedDev') === 'true';
      const savedAiMemory = localStorage.getItem('rapeepatAi_core_memory') || '';
      
      setAiMemory(savedAiMemory);
      
      if (savedStatus === 'true' && savedUser) {
        setUsername(savedUser);
        setIsVerifiedDev(devStatus);
        setIsLoggedIn(true);
      }
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (isLoggedIn && username) {
      loadChatSessions(username);
    }
  }, [isLoggedIn, username]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, isScanningURL]);

  useEffect(() => {
    if (toast.show) {
      const timer = setTimeout(() => setToast({ ...toast, show: false }), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast.show]);

  // --- Functions: ระบบบัญชี (Users DB) ---

  const getUsersDb = () => {
    try {
      const db = localStorage.getItem('rapeepatAi_users_db');
      return db ? JSON.parse(db) : {};
    } catch(e) { return {}; }
  };

  const saveUsersDb = (db) => {
    try {
      localStorage.setItem('rapeepatAi_users_db', JSON.stringify(db));
    } catch(e) {}
  };

  // --- Functions: ระบบจัดการ Chat Sessions ---

  const loadChatSessions = (user) => {
    try {
      const sessionsKey = `rapeepatAi_sessions_${user}`;
      const savedSessions = JSON.parse(localStorage.getItem(sessionsKey)) || [];
      savedSessions.sort((a, b) => b.updatedAt - a.updatedAt);
      setChatSessions(savedSessions);

      if (savedSessions.length > 0) {
        loadSpecificSession(savedSessions[0].id, user);
      } else {
        createNewSession('general', user);
      }
    } catch (e) {
      console.error("Failed to load sessions", e);
      createNewSession('general', user);
    }
  };

  const createNewSession = (startMode = 'general', user = username) => {
    const newId = Date.now().toString();
    const newSession = {
      id: newId,
      title: 'แชทใหม่...',
      mode: startMode,
      updatedAt: Date.now()
    };

    const updatedSessions = [newSession, ...chatSessions];
    setChatSessions(updatedSessions);
    setCurrentSessionId(newId);
    setMode(startMode);
    
    let text = '';
    const userDisplay = isVerifiedDev ? `บอส (คุณทิว)` : `คุณ ${user}`;
    if (startMode === 'general') text = `สวัสดีครับ${userDisplay}! ส่งข้อความ ค้นหาข่าวสาร หรือวาง "ลิงก์เว็บไซต์" ให้ผมช่วยสแกนความปลอดภัยได้เลยครับ 🛡️`;
    else if (startMode === 'calculator') text = `สวัสดี${userDisplay}! โหมดคำนวณพร้อมแล้วครับ`;
    else if (startMode === 'quiz') text = `โหมดฝึกสมองพร้อมแล้วครับ${userDisplay}!`;
    else if (startMode === 'code') text = `สวัสดีครับ${userDisplay}! ให้ผมช่วยเขียนโค้ดภาษาอะไรดีครับ?`;

    const initialMsgs = [{ role: 'model', text }];
    setMessages(initialMsgs);

    saveSessionData(newId, initialMsgs);
    saveSessionsList(updatedSessions, user);
    setIsSidebarOpen(false); 
  };

  const loadSpecificSession = (sessionId, user = username) => {
    try {
      const msgs = JSON.parse(localStorage.getItem(`rapeepatAi_chat_${sessionId}`)) || [];
      const sessionInfo = chatSessions.find(s => s.id === sessionId);
      if (sessionInfo) setMode(sessionInfo.mode);
      
      setMessages(msgs);
      setCurrentSessionId(sessionId);
      setIsSidebarOpen(false);
    } catch (e) {
      console.error("Failed to load session data", e);
    }
  };

  const handleDeleteSessionClick = (e, sessionId) => {
    e.stopPropagation(); 
    setConfirmDialog({
      isOpen: true,
      title: 'ลบประวัติการสนทนา',
      message: 'คุณแน่ใจหรือไม่ว่าต้องการลบประวัติการสนทนานี้ถาวร?',
      action: () => executeDeleteSession(sessionId)
    });
  };

  const executeDeleteSession = (sessionId) => {
    const updatedSessions = chatSessions.filter(s => s.id !== sessionId);
    setChatSessions(updatedSessions);
    saveSessionsList(updatedSessions, username);
    localStorage.removeItem(`rapeepatAi_chat_${sessionId}`);

    if (currentSessionId === sessionId) {
      if (updatedSessions.length > 0) loadSpecificSession(updatedSessions[0].id);
      else createNewSession('general');
    }
    setConfirmDialog({ isOpen: false, title: '', message: '', action: null });
  };

  const saveSessionsList = (sessions, user) => {
    try { localStorage.setItem(`rapeepatAi_sessions_${user}`, JSON.stringify(sessions)); } catch (e) {}
  };

  const saveSessionData = (sessionId, msgs) => {
    try {
      const msgsToSave = msgs.map(m => ({ ...m, imageUrl: null }));
      localStorage.setItem(`rapeepatAi_chat_${sessionId}`, JSON.stringify(msgsToSave));
    } catch (e) {}
  };

  const updateSessionMeta = (msgs) => {
    if (!currentSessionId || msgs.length <= 1) return;
    let updatedSessions = [...chatSessions];
    const sessionIndex = updatedSessions.findIndex(s => s.id === currentSessionId);
    
    if (sessionIndex !== -1) {
      updatedSessions[sessionIndex].updatedAt = Date.now();
      const userMsgs = msgs.filter(m => m.role === 'user');
      if (userMsgs.length === 1 && updatedSessions[sessionIndex].title === 'แชทใหม่...') {
        const firstText = userMsgs[0].text;
        updatedSessions[sessionIndex].title = firstText.length > 25 ? firstText.substring(0, 25) + '...' : (firstText || 'ส่งรูปภาพ');
      }
      updatedSessions.sort((a, b) => b.updatedAt - a.updatedAt);
      setChatSessions(updatedSessions);
      saveSessionsList(updatedSessions, username);
    }
  };

  const changeModeForCurrentSession = (newMode) => {
    if (mode === newMode) return;
    setMode(newMode);
    
    let updatedSessions = [...chatSessions];
    const sessionIndex = updatedSessions.findIndex(s => s.id === currentSessionId);
    if (sessionIndex !== -1) {
      updatedSessions[sessionIndex].mode = newMode;
      setChatSessions(updatedSessions);
      saveSessionsList(updatedSessions, username);
    }
    showNotification(`เปลี่ยนเป็นโหมด: ${getModeName(newMode)}`, 'success');
  };

  const getModeName = (m) => {
    switch(m) {
      case 'code': return 'เขียนโค้ด';
      case 'calculator': return 'คำนวณ';
      case 'quiz': return 'ฝึกสมอง';
      default: return 'ทั่วไป';
    }
  };

  // --- Functions: Utilities และ Auth ---

  const showNotification = (message, type = 'success') => {
    setToast({ show: true, message, type });
  };

  const checkIsDevName = (name) => {
    const lowerName = name.toLowerCase().trim();
    const devKeywords = ['ทิว', 'tiw', 'ระพีพัฒน์', 'rapeepat', 'อินทร์แปลง'];
    return devKeywords.some(keyword => lowerName.includes(keyword));
  };

  const handleAuthSubmit = (e) => {
    e.preventDefault();
    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
      showNotification('กรุณากรอกชื่อผู้ใช้และรหัสผ่าน', 'error');
      return;
    }

    if (checkIsDevName(trimmedUsername)) {
      setShowDevAuthPrompt(true);
    } else {
      const db = getUsersDb();
      if (authMode === 'register') {
         if (db[trimmedUsername]) {
             showNotification('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว กรุณาใช้ชื่ออื่น', 'error');
             return;
         }
         db[trimmedUsername] = password;
         saveUsersDb(db);
         showNotification('สมัครสมาชิกสำเร็จ กำลังเข้าสู่ระบบ...', 'success');
         setTimeout(() => loginUser(trimmedUsername, false), 1000);
      } else {
         if (db[trimmedUsername] && db[trimmedUsername] === password) {
             showNotification('เข้าสู่ระบบสำเร็จ!', 'success');
             loginUser(trimmedUsername, false);
         } else {
             showNotification('ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง', 'error');
         }
      }
    }
  };

  const verifyDevLogin = (e) => {
    e.preventDefault();
    if (devPassword === 'tiw1234') { 
      loginUser(username.trim(), true);
      setShowDevAuthPrompt(false);
      showNotification('ยินดีต้อนรับกลับครับ บอส!', 'success');
    } else {
      showNotification("รหัสผ่านผู้พัฒนาไม่ถูกต้อง!", "error");
      setDevPassword('');
    }
  };

  const loginUser = (name, isDev) => {
    try {
      localStorage.setItem('rapeepatAi_username', name);
      localStorage.setItem('rapeepatAi_isLoggedIn', 'true');
      localStorage.setItem('rapeepatAi_isVerifiedDev', isDev ? 'true' : 'false');
    } catch (err) {}
    setUsername(name);
    setIsVerifiedDev(isDev);
    setIsLoggedIn(true);
  };

  const handleLogoutClick = () => {
    setIsSidebarOpen(false); 
    setConfirmDialog({
      isOpen: true,
      title: 'ออกจากระบบ',
      message: 'คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบบัญชีปัจจุบัน?',
      action: () => executeLogout()
    });
  };

  const executeLogout = () => {
    try {
      localStorage.removeItem('rapeepatAi_isLoggedIn');
      localStorage.removeItem('rapeepatAi_isVerifiedDev');
      localStorage.removeItem('rapeepatAi_username');
    } catch (e) {}
    setIsLoggedIn(false);
    setIsVerifiedDev(false);
    setUsername('');
    setPassword('');
    setConfirmDialog({ isOpen: false, title: '', message: '', action: null });
    showNotification('ออกจากระบบเรียบร้อยแล้ว', 'success');
  };

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      const readerPreview = new FileReader();
      readerPreview.onload = () => setImagePreview(readerPreview.result);
      readerPreview.readAsDataURL(file);

      const readerApi = new FileReader();
      readerApi.onload = () => {
        const base64Data = readerApi.result.split(',')[1];
        setSelectedImage({ mimeType: file.type, data: base64Data });
      };
      readerApi.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const callGeminiAPI = async (userText, imageObj) => {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
      
      let baseInstruction = `ข้อมูลระบบสำคัญ: คุณคือ AI อัจฉริยะชื่อ "${aiSettings.name}"\n`;
      baseInstruction += `ผู้สร้างและผู้พัฒนาของคุณคือ: "คุณทิว" (ระพีพัฒน์ อินทร์แปลง)\n`;
      baseInstruction += `สถานะผู้ใช้ที่กำลังคุยด้วยตอนนี้: ${isVerifiedDev ? 
        "*** นี่คือคุณทิว ผู้พัฒนาตัวจริง! ให้ความเคารพอย่างสูงสุด ***" : 
        `ผู้ใช้ทั่วไปชื่อ "${username}"`
      }\n`;
      baseInstruction += `ความทรงจำที่ถูกบันทึกไว้ของ AI: ${aiMemory ? aiMemory : "ยังไม่มีความทรงจำ"}\n`;
      baseInstruction += `[คำสั่งพิเศษ 1]: หากต้องการจำสิ่งใดให้แอบพิมพ์ [REMEMBER: ข้อความ] ไว้ในคำตอบ\n`;
      // เพิ่มคำสั่งให้ AI ใช้สัญลักษณ์ ** สำหรับข้อความสำคัญ โดยห้ามใช้ HTML
      baseInstruction += `[คำสั่งพิเศษ 2]: หากมี "ข้อความที่สำคัญมาก", "ประเด็นร้อนแรง" หรือ "ข้อควรระวัง" ให้ครอบข้อความนั้นด้วยเครื่องหมาย ** (เช่น **นี่คือจุดสำคัญ**) ห้ามใช้ HTML Tag (< >) เด็ดขาด ระบบ UI จะดักจับ ** ไปแปลงเป็นกรอบกราฟิกสุดล้ำเองอัตโนมัติ\n\n`;

      let specificInstruction = "";
      let tools = undefined;

      if (mode === 'calculator') {
        specificInstruction = `หน้าที่ของคุณคือช่วยคำนวณ แก้สมการ และอธิบายวิธีทำทีละขั้นตอนอย่างเข้าใจง่าย`;
      } else if (mode === 'quiz') {
        specificInstruction = `โหมด "ฝึกทำโจทย์" ส่งโจทย์ 1 ข้อ รอผู้ใช้ตอบ แล้วตรวจถูกผิดพร้อมอธิบาย จากนั้นส่งข้อต่อไป`;
      } else if (mode === 'code') {
        specificInstruction = `คุณคือ AI โปรแกรมเมอร์ระดับซีเนียร์ เขียนโค้ดตามต้องการ กฎสำคัญ: ต้องครอบโค้ดด้วยเครื่องหมาย \`\`\` (Markdown) เสมอ`;
      } else {
        specificInstruction = `คุณรอบรู้ทุกเรื่อง ใช้ Google Search เสมอเมื่อถามข้อมูลปัจจุบัน
[ระบบ Cybersecurity สแกน URL (สำคัญมาก!)]
หากข้อความของผู้ใช้มี "ลิงก์ (URL)" หรือผู้ใช้ต้องการให้ตรวจสอบเว็บไซต์ ข่าวปลอม หรือสแปม ให้คุณทำหน้าที่วิเคราะห์ลิงก์นั้นทันที โดยวิเคราะห์ความเสี่ยง และ **ต้อง** ขึ้นต้นคำตอบด้วย Tag ต่อไปนี้เสมอ:
- [SCAN_SAFE] : เมื่อลิงก์นั้นปลอดภัย เป็นเว็บหลักที่น่าเชื่อถือ
- [SCAN_WARNING] : เมื่อลิงก์มีความน่าสงสัย เป็นเว็บข่าวที่ยังไม่ได้รับการยืนยัน
- [SCAN_DANGER] : เมื่อลิงก์มีความเสี่ยงเป็นสแปม ฟิชชิ่ง หลอกลวง หรือไวรัส
(เขียน Tag ไว้บรรทัดแรกสุด แล้วขึ้นบรรทัดใหม่เพื่ออธิบายผลการวิเคราะห์)`;
        tools = [{ "google_search": {} }];
      }

      const finalSystemInstruction = baseInstruction + specificInstruction;

      const contents = messages.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      const currentParts = [];
      if (userText) currentParts.push({ text: userText });
      if (imageObj) currentParts.push({ inlineData: { mimeType: imageObj.mimeType, data: imageObj.data } });
      
      contents.push({ role: 'user', parts: currentParts });

      const payload = {
        contents: contents,
        systemInstruction: { parts: [{ text: finalSystemInstruction }] }
      };

      if (tools) payload.tools = tools;

      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Network response was not ok');
      const data = await response.json();
      
      if (data.candidates && data.candidates[0].content.parts[0].text) {
        let responseText = data.candidates[0].content.parts[0].text;
        
        // ประมวลผลความจำ
        const memoryRegex = /\[REMEMBER:\s*(.*?)\]/g;
        let match;
        let newMemories = [];
        while ((match = memoryRegex.exec(responseText)) !== null) {
          newMemories.push(match[1].trim());
        }
        
        if (newMemories.length > 0) {
          const updatedMemory = aiMemory + (aiMemory ? "\n" : "") + newMemories.join("\n");
          setAiMemory(updatedMemory);
          localStorage.setItem('rapeepatAi_core_memory', updatedMemory);
          responseText = responseText.replace(memoryRegex, '').trim();
          // ปิดการแจ้งเตือนเรื่องการจำ ตามที่ขอ
          // showNotification("AI ได้บันทึกข้อมูลนี้ลงในหน่วยความจำถาวรแล้ว", "success");
        }

        if (responseText.includes('```')) {
          showNotification("การวิเคราะห์และสร้างโค้ดเสร็จสมบูรณ์แล้ว 💻", "code");
        }

        let sources = [];
        const attributions = data.candidates[0].groundingMetadata?.groundingAttributions;
        if (attributions) {
            const rawSources = attributions.filter(a => a.web?.uri).map(a => ({ uri: a.web.uri, title: a.web.title }));
            const uniqueUrls = new Set();
            for (const source of rawSources) {
                if (!uniqueUrls.has(source.uri)) {
                    uniqueUrls.add(source.uri);
                    sources.push(source);
                }
            }
        }
        return { text: responseText, sources: sources };
      }
      return { text: "ขออภัย เกิดข้อผิดพลาดในการประมวลผลคำตอบครับ" };
    } catch (error) {
      console.error("Error calling Gemini:", error);
      return { text: "ขออภัย ระบบไม่สามารถเชื่อมต่อกับ AI ได้ในขณะนี้ โปรดลองอีกครั้ง" };
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputText.trim() && !selectedImage) return;

    const userMessageText = inputText;
    const currentImage = selectedImage;
    const currentImagePreview = imagePreview;

    const newUserMsg = { role: 'user', text: userMessageText, imageUrl: currentImagePreview };
    const updatedMessages = [...messages, newUserMsg];
    
    setMessages(updatedMessages);
    saveSessionData(currentSessionId, updatedMessages);
    updateSessionMeta(updatedMessages); 
    
    setInputText('');
    removeImage();

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    if (userMessageText.match(urlRegex) && mode === 'general') {
      setIsScanningURL(true);
    } else {
      setIsLoading(true);
    }

    const aiResponse = await callGeminiAPI(userMessageText, currentImage);
    
    const finalMessages = [...updatedMessages, { 
      role: 'model', 
      text: aiResponse.text,
      sources: aiResponse.sources 
    }];

    setMessages(finalMessages);
    saveSessionData(currentSessionId, finalMessages);
    
    setIsScanningURL(false);
    setIsLoading(false);
  };

  const renderRichText = (text, isUser) => {
    if (!text) return null;
    const linkColorClass = isUser 
      ? 'text-indigo-200 hover:text-white font-medium' 
      : 'text-blue-600 hover:text-blue-800 font-semibold';
    
    // อัปเดต Regex ให้ตรวจจับ **ข้อความ** เพื่อนำมาทำไฮไลต์สุดล้ำ
    const regex = /(!\[.*?\]\(.*?\)|\[.*?\]\(.*?\)|https?:\/\/[^\s]+|\*\*.*?\*\*)/g;
    const parts = text.split(regex);
    
    return parts.map((part, index) => {
      if (!part) return null;
      
      const imgMatch = part.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) return <ChatImage key={index} alt={imgMatch[1]} url={imgMatch[2]} isUser={isUser} />;

      const linkMatch = part.match(/^\[(.*?)\]\((.*?)\)$/);
      if (linkMatch) {
         return <a key={index} href={linkMatch[2]} target="_blank" rel="noopener noreferrer" className={`${linkColorClass} underline break-all`}>{linkMatch[1]}</a>;
      }

      if (part.match(/^https?:\/\/[^\s]+$/)) {
        return <a key={index} href={part} target="_blank" rel="noopener noreferrer" className={`${linkColorClass} underline break-all`}>{part}</a>;
      }

      // ดักจับ Markdown Bold (**) แล้วแปลงเป็น HighlightText component
      const boldMatch = part.match(/^\*\*(.*?)\*\*$/);
      if (boldMatch) {
         return <HighlightText key={index} text={boldMatch[1]} />;
      }

      return <span key={index}>{part}</span>;
    });
  };

  const formatMessageText = (text, isUser = false) => {
    if (!text) return null;
    const parts = text.split('```');
    return parts.map((part, index) => {
      if (index % 2 === 0) {
        return <div key={index} className="whitespace-pre-wrap leading-relaxed text-sm sm:text-base break-words">{renderRichText(part, isUser)}</div>;
      } else {
        const firstNewlineIndex = part.indexOf('\n');
        let language = '';
        let codeContent = part;
        if (firstNewlineIndex !== -1) {
          language = part.substring(0, firstNewlineIndex).trim();
          codeContent = part.substring(firstNewlineIndex + 1);
        }
        if (codeContent.endsWith('\n')) codeContent = codeContent.slice(0, -1);
        return <CodeBlock key={index} language={language} code={codeContent} />;
      }
    });
  };

  const renderModelResponse = (text) => {
    if (!text) return null;
    
    let scanType = null;
    let cleanText = text;

    if (text.includes('[SCAN_SAFE]')) { 
        scanType = 'safe'; 
        cleanText = text.replace('[SCAN_SAFE]', '').trim(); 
    } else if (text.includes('[SCAN_WARNING]')) { 
        scanType = 'warning'; 
        cleanText = text.replace('[SCAN_WARNING]', '').trim(); 
    } else if (text.includes('[SCAN_DANGER]')) { 
        scanType = 'danger'; 
        cleanText = text.replace('[SCAN_DANGER]', '').trim(); 
    }

    if (scanType) {
      const config = {
        safe: { 
          color: 'text-emerald-700', bg: 'bg-emerald-50', border: 'border-emerald-200', 
          icon: <ShieldCheck className="w-6 h-6 text-emerald-600" />, 
          title: 'ลิงก์นี้ปลอดภัย น่าเชื่อถือ', badge: 'bg-emerald-100 text-emerald-800'
        },
        warning: { 
          color: 'text-amber-800', bg: 'bg-amber-50', border: 'border-amber-300', 
          icon: <AlertTriangle className="w-6 h-6 text-amber-600" />, 
          title: 'แจ้งเตือน! ควรใช้วิจารณญาณ', badge: 'bg-amber-200 text-amber-900'
        },
        danger: { 
          color: 'text-red-800', bg: 'bg-red-50', border: 'border-red-300', 
          icon: <ShieldAlert className="w-6 h-6 text-red-600 animate-pulse" />, 
          title: 'อันตราย! ความเสี่ยงสูง', badge: 'bg-red-200 text-red-900'
        }
      }[scanType];

      return (
        <div className={`border-2 ${config.border} ${config.bg} rounded-2xl rounded-bl-none overflow-hidden shadow-sm w-full transition-all duration-300`}>
          <div className="flex items-center gap-3 px-4 py-3 bg-white/50 border-b border-black/5">
            <div className={`p-1.5 rounded-full ${config.badge}`}>
               {config.icon}
            </div>
            <div className="flex flex-col">
              <span className={`font-bold ${config.color}`}>{config.title}</span>
              <span className="text-[10px] text-gray-500 font-mono tracking-tight uppercase">AI Security Analysis</span>
            </div>
          </div>
          <div className="p-4 text-gray-800">
            {formatMessageText(cleanText)}
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white border border-gray-200 p-3 sm:p-4 rounded-2xl rounded-bl-none shadow-sm w-full text-gray-800">
        {formatMessageText(cleanText)}
      </div>
    );
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100 flex items-center justify-center p-4 sm:p-6 font-sans">
        {toast.show && (
          <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in-down shadow-lg flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all"
               style={{ backgroundColor: toast.type === 'error' ? '#ef4444' : '#10b981', color: 'white' }}>
            {toast.type === 'error' ? <ShieldAlert className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
            {toast.message}
          </div>
        )}
        <div className="bg-white/80 backdrop-blur-lg w-full max-w-md rounded-3xl shadow-2xl p-6 sm:p-8 border border-white mx-auto transition-all relative">
          
          {showDevAuthPrompt ? (
            <div className="animate-fade-in">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-gray-800">ระบบป้องกันการแอบอ้าง</h2>
                <p className="text-gray-500 text-sm mt-2">
                  ชื่อ "{username}" สงวนไว้สำหรับผู้พัฒนาเท่านั้น หากคุณคือตัวจริง กรุณาใส่รหัสยืนยัน
                </p>
              </div>
              <form onSubmit={verifyDevLogin} className="space-y-4">
                <input
                  type="password"
                  required
                  autoFocus
                  value={devPassword}
                  onChange={(e) => setDevPassword(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 p-3 focus:outline-none focus:ring-2 focus:ring-red-500 text-center tracking-widest"
                  placeholder="รหัสผ่านผู้พัฒนา"
                />
                <div className="flex gap-2">
                  <button type="button" onClick={() => {
                      setShowDevAuthPrompt(false);
                      setUsername('');
                      setDevPassword('');
                    }} 
                    className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-300">
                    ยกเลิก
                  </button>
                  <button type="submit" className="flex-1 bg-red-600 text-white py-3 rounded-xl font-semibold hover:bg-red-700">
                    ยืนยันตัวตน
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="animate-fade-in">
              <div className="text-center mb-8">
                <div className="bg-white w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg overflow-hidden border-2 border-indigo-100 relative group">
                  <img src={aiSettings.avatarUrl} alt="Logo" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-blue-500/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                    <ShieldCheck className="w-8 h-8 text-white drop-shadow-md" />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-gray-800">{aiSettings.name}</h1>
                <p className="text-gray-500 mt-2 text-sm">ผู้ช่วย AI อัจฉริยะ พร้อมระบบสแกนความปลอดภัย</p>
              </div>

              <form onSubmit={handleAuthSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">ชื่อผู้ใช้</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <User className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                      className="pl-10 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                      placeholder="พิมพ์ชื่อผู้ใช้ของคุณ" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">รหัสผ่าน</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 w-full rounded-xl border border-gray-200 bg-gray-50 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition"
                      placeholder="พิมพ์รหัสผ่านของคุณ" />
                  </div>
                </div>
                
                <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition shadow-md flex justify-center items-center gap-2 mt-2">
                  {authMode === 'login' ? 'เข้าสู่ระบบ' : 'สมัครสมาชิก'}
                </button>

                <div className="text-center pt-2">
                  <button type="button" onClick={() => { setAuthMode(authMode === 'login' ? 'register' : 'login'); setUsername(''); setPassword(''); }}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium transition" >
                    {authMode === 'login' ? 'ยังไม่มีบัญชี? สมัครสมาชิกที่นี่' : 'มีบัญชีแล้ว? เข้าสู่ระบบที่นี่'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full bg-gray-50 flex flex-col font-sans relative overflow-hidden" style={{ height: '100dvh' }}>
      
      {toast.show && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-fade-in-down shadow-lg flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all"
             style={{ backgroundColor: toast.type === 'error' ? '#ef4444' : (toast.type === 'code' ? '#1e293b' : '#10b981'), color: 'white' }}>
          {toast.type === 'error' ? <ShieldAlert className="w-5 h-5" /> : (toast.type === 'code' ? <Code className="w-5 h-5 text-blue-400" /> : <Bell className="w-5 h-5" />)}
          {toast.message}
        </div>
      )}

      <ConfirmModal isOpen={confirmDialog.isOpen} title={confirmDialog.title} message={confirmDialog.message} 
        onConfirm={() => confirmDialog.action && confirmDialog.action()} 
        onCancel={() => setConfirmDialog({ isOpen: false, title: '', message: '', action: null })} />

      {/* Header */}
      <header className="bg-white border-b border-gray-200 py-3 px-4 sm:px-6 flex justify-between items-center shrink-0 z-20 shadow-sm w-full">
        <div className="flex items-center gap-3">
          <img src={aiSettings.avatarUrl} alt="AI Avatar" className="w-10 h-10 rounded-full border border-gray-200 shadow-sm object-cover shrink-0" />
          <div>
            <h1 className="font-bold text-gray-800 text-base leading-tight flex items-center gap-2">
              {aiSettings.name}
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                mode === 'general' ? 'bg-blue-100 text-blue-700' :
                mode === 'code' ? 'bg-amber-100 text-amber-700' :
                mode === 'calculator' ? 'bg-indigo-100 text-indigo-700' : 'bg-teal-100 text-teal-700'
              }`}>
                โหมด: {getModeName(mode)}
              </span>
            </h1>
            <p className="text-[11px] text-gray-500 font-medium truncate max-w-[200px]">
              {isVerifiedDev ? <span className="text-indigo-600 font-bold">🛠️ โหมดผู้พัฒนา</span> : username}
            </p>
          </div>
        </div>
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 -mr-2 text-gray-600 hover:bg-gray-100 rounded-xl transition-colors">
          <Menu className="w-6 h-6" />
        </button>
      </header>

      {isSidebarOpen && <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30 transition-opacity" onClick={() => setIsSidebarOpen(false)} />}

      {/* Right Sidebar */}
      <div className={`fixed top-0 right-0 h-full w-[85%] max-w-sm bg-white shadow-2xl z-40 transform transition-transform duration-300 ease-in-out flex flex-col ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="font-bold text-gray-800 text-lg">เมนูระบบ</h2>
          <button onClick={() => setIsSidebarOpen(false)} className="p-1.5 text-gray-400 hover:bg-gray-200 rounded-full transition"><X className="w-5 h-5" /></button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="p-4">
            <button onClick={() => createNewSession('general')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-3 rounded-xl flex items-center justify-center gap-2 font-semibold transition shadow-sm">
              <MessageSquarePlus className="w-5 h-5" /> เริ่มแชทใหม่
            </button>
          </div>

          <div className="px-4 pb-4 border-b border-gray-100">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 ml-1">เลือกโหมดการทำงาน</p>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => changeModeForCurrentSession('general')} className={`p-3 rounded-xl flex flex-col items-center gap-1.5 transition ${mode === 'general' ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'}`}>
                <Globe className="w-5 h-5" /> <span className="text-xs font-medium">ทั่วไป/สแกน</span>
              </button>
              <button onClick={() => changeModeForCurrentSession('code')} className={`p-3 rounded-xl flex flex-col items-center gap-1.5 transition ${mode === 'code' ? 'bg-amber-50 text-amber-700 border border-amber-200 shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'}`}>
                <Code className="w-5 h-5" /> <span className="text-xs font-medium">เขียนโค้ด</span>
              </button>
              <button onClick={() => changeModeForCurrentSession('calculator')} className={`p-3 rounded-xl flex flex-col items-center gap-1.5 transition ${mode === 'calculator' ? 'bg-indigo-50 text-indigo-700 border border-indigo-200 shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'}`}>
                <Calculator className="w-5 h-5" /> <span className="text-xs font-medium">คำนวณ</span>
              </button>
              <button onClick={() => changeModeForCurrentSession('quiz')} className={`p-3 rounded-xl flex flex-col items-center gap-1.5 transition ${mode === 'quiz' ? 'bg-teal-50 text-teal-700 border border-teal-200 shadow-sm' : 'bg-gray-50 text-gray-600 hover:bg-gray-100 border border-transparent'}`}>
                <BookOpen className="w-5 h-5" /> <span className="text-xs font-medium">ฝึกสมอง</span>
              </button>
            </div>
          </div>

          <div className="p-4">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 ml-1">ประวัติการแชท</p>
            <div className="space-y-2">
              {chatSessions.length === 0 ? <p className="text-sm text-gray-400 text-center py-4">ยังไม่มีประวัติการแชท</p> : (
                chatSessions.map((session) => (
                  <div key={session.id} onClick={() => loadSpecificSession(session.id)} className={`group w-full text-left p-3 rounded-xl flex items-center justify-between cursor-pointer transition ${currentSessionId === session.id ? 'bg-gray-100 border border-gray-200' : 'hover:bg-gray-50 border border-transparent'}`}>
                    <div className="flex items-center gap-3 overflow-hidden">
                      <MessageSquare className={`w-5 h-5 shrink-0 ${currentSessionId === session.id ? 'text-indigo-600' : 'text-gray-400'}`} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-800 truncate pr-2">{session.title}</p>
                        <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          {new Date(session.updatedAt).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} • {getModeName(session.mode)}
                        </p>
                      </div>
                    </div>
                    <button onClick={(e) => handleDeleteSessionClick(e, session.id)} className={`p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition ${currentSessionId === session.id ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`} title="ลบแชท"><Trash2 className="w-4 h-4" /></button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-gray-100 bg-gray-50/50 space-y-2">
          <button onClick={() => {setIsSidebarOpen(false); setShowSettings(true);}} className="w-full flex items-center gap-3 p-3 text-gray-700 hover:bg-white hover:shadow-sm rounded-xl transition text-sm font-medium">
            <Settings className="w-5 h-5 text-gray-400" /> ตั้งค่าระบบ AI
          </button>
          <button onClick={handleLogoutClick} className="w-full flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-xl transition text-sm font-medium">
            <LogOut className="w-5 h-5 text-red-400" /> ออกจากระบบ
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto p-3 sm:p-6 w-full">
        <div className="max-w-3xl mx-auto space-y-5 sm:space-y-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex items-end gap-2 ${msg.role === 'user' ? 'max-w-[92%] sm:max-w-[80%]' : 'max-w-[100%] sm:max-w-[90%]'}`}>
                {msg.role === 'model' && (
                  <img src={aiSettings.avatarUrl} alt="AI" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full mb-1 border border-gray-200 object-cover shrink-0" />
                )}
                
                {msg.role === 'user' ? (
                  <div className="p-3 sm:p-4 rounded-2xl w-full bg-indigo-600 text-white rounded-br-none shadow-md">
                    {msg.imageUrl && (
                      <img src={msg.imageUrl} alt="Uploaded" className="max-w-full h-auto rounded-lg mb-2 sm:mb-3 border border-black/10" style={{maxHeight: '200px'}} />
                    )}
                    {formatMessageText(msg.text, true)}
                  </div>
                ) : (
                  <div className="w-full">
                    {renderModelResponse(msg.text)}
                    {msg.sources && msg.sources.length > 0 && (
                      <div className="mt-2 pt-2 ml-1">
                        <p className="text-[10px] sm:text-xs text-gray-500 mb-1.5 font-semibold flex items-center gap-1">
                          <Globe className="w-3 h-3" /> แหล่งอ้างอิง:
                        </p>
                        <ul className="text-[10px] sm:text-xs space-y-1.5">
                          {msg.sources.map((source, i) => (
                             <li key={i} className="truncate">
                               <a href={source.uri} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:text-blue-700 hover:underline transition font-medium">
                                 {source.title || source.uri}
                               </a>
                             </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
          
          {(isLoading || isScanningURL) && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2">
                <img src={aiSettings.avatarUrl} alt="AI" className="w-7 h-7 sm:w-8 sm:h-8 rounded-full mb-1 object-cover shrink-0" />
                
                {isScanningURL ? (
                  <ScannerLoader />
                ) : (
                  <div className="bg-white border border-gray-200 p-3 sm:p-4 rounded-2xl rounded-bl-none shadow-sm flex gap-1.5 items-center h-[42px] sm:h-[48px]">
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></div>
                  </div>
                )}

              </div>
            </div>
          )}
          <div ref={messagesEndRef} className="pb-2" />
        </div>
      </main>

      {/* Input Area */}
      <footer className="bg-white border-t border-gray-200 p-2 sm:p-4 shrink-0 w-full z-10 safe-area-bottom">
        <div className="max-w-3xl mx-auto">
          {imagePreview && (
            <div className="mb-2 relative inline-block">
              <img src={imagePreview} alt="Preview" className="h-16 sm:h-20 rounded-lg border border-gray-300 shadow-sm object-cover" />
              <button onClick={removeImage} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600 shadow-md">
                <X className="w-3 h-3 sm:w-4 sm:h-4" />
              </button>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex items-center gap-1.5 sm:gap-2">
            <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageSelect} />
            <button type="button" onClick={() => fileInputRef.current.click()} className="p-2.5 sm:p-3 text-gray-500 bg-gray-100 hover:bg-gray-200 rounded-xl transition shrink-0 h-[44px] sm:h-[48px] flex items-center justify-center">
              <ImageIcon className="w-5 h-5" />
            </button>
            
            <input type="text" value={inputText} onChange={(e) => setInputText(e.target.value)} disabled={isLoading || isScanningURL}
              placeholder={
                mode === 'calculator' ? "พิมพ์โจทย์คำนวณ..." : 
                mode === 'quiz' ? "ตอบคำถาม..." : 
                mode === 'code' ? "ให้ช่วยเขียนโค้ดอะไรดี?..." :
                "พิมพ์สนทนา หรือ วางลิงก์เพื่อเช็คความปลอดภัย..."
              }
              className="flex-1 bg-gray-100 border-none rounded-xl px-3 sm:px-4 py-2 h-[44px] sm:h-[48px] focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm sm:text-base min-w-0"
            />
            
            <button type="submit" disabled={isLoading || isScanningURL || (!inputText.trim() && !selectedImage)} className="p-2.5 sm:p-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white rounded-xl transition shadow-md flex items-center justify-center shrink-0 h-[44px] sm:h-[48px]">
              <Send className="w-5 h-5" />
            </button>
          </form>
          <div className="text-center mt-1 sm:mt-2 text-[9px] sm:text-[10px] text-gray-400 pb-1">
            ผู้พัฒนาหลัก: คุณทิว (ระพีพัฒน์ อินทร์แปลง) {isVerifiedDev && <span className="text-indigo-400 ml-1">✓ ยืนยันตัวตนแล้ว</span>}
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl shadow-2xl w-[95%] sm:w-full max-w-sm overflow-hidden border border-gray-100">
            <div className="bg-gray-50 px-5 sm:px-6 py-4 border-b flex justify-between items-center">
              <h3 className="font-bold text-gray-800 flex items-center gap-2 text-sm sm:text-base"><Lock className="w-4 h-4 text-gray-500"/> ตั้งค่าระบบ</h3>
              <button onClick={() => {setShowSettings(false); setIsDevUnlocked(false);}} className="text-gray-400 hover:text-gray-700 p-1"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="p-5 sm:p-6">
              {!isDevUnlocked ? (
                <form onSubmit={(e) => { e.preventDefault(); if (devCodeInput === 'admin999') { setIsDevUnlocked(true); setDevCodeInput(''); } else showNotification('รหัสผู้ดูแลระบบไม่ถูกต้อง', 'error'); }} className="space-y-4">
                  <p className="text-sm text-gray-500 mb-2">กรุณาใส่รหัสผู้ดูแลระบบเพื่อเข้าถึงการตั้งค่า</p>
                  <input type="password" value={devCodeInput} onChange={(e) => setDevCodeInput(e.target.value)} placeholder="รหัสผ่าน" className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 focus:outline-none text-sm" />
                  <button type="submit" className="w-full bg-indigo-600 text-white rounded-xl py-3 font-semibold hover:bg-indigo-700 text-sm">ยืนยัน</button>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-xl mb-4">
                    <CheckCircle className="w-5 h-5 shrink-0" />
                    <span className="text-sm font-medium">ปลดล็อกการตั้งค่าสำเร็จ</span>
                  </div>
                  
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">ชื่อ AI</label><input type="text" value={aiSettings.name} disabled className="w-full border border-gray-200 bg-gray-100 rounded-xl p-3 text-sm text-gray-500 cursor-not-allowed" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1">URL รูปภาพ AI</label><input type="text" value={aiSettings.avatarUrl} onChange={(e) => setAiSettings({...aiSettings, avatarUrl: e.target.value})} className="w-full border border-gray-300 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none text-sm" /></div>
                  <div><label className="block text-sm font-medium text-gray-700 mb-1 mt-2">หน่วยความจำที่ AI เรียนรู้:</label><textarea readOnly value={aiMemory || "ยังไม่มีข้อมูลความทรงจำ"} className="w-full h-24 border border-gray-200 bg-gray-50 rounded-xl p-3 text-xs text-gray-600 outline-none resize-none" /></div>
                  
                  <button onClick={() => { localStorage.setItem('rapeepatAiSettings', JSON.stringify({...aiSettings, name: 'Rapeepat Ai'})); setShowSettings(false); showNotification('บันทึกการตั้งค่าเรียบร้อยแล้ว'); }} className="w-full bg-gray-800 text-white rounded-xl py-3 mt-4 font-semibold hover:bg-gray-900 text-sm">
                    บันทึกและปิด
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes fade-in-down { 0% { opacity: 0; transform: translateY(-20px); } 100% { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-down { animation: fade-in-down 0.3s ease-out forwards; }
        @keyframes fade-in { 0% { opacity: 0; } 100% { opacity: 1; } }
        .animate-fade-in { animation: fade-in 0.3s ease-out forwards; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
}

```
