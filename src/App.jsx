import React, { useState, useEffect, useRef } from 'react';
import { BookOpen, Brain, Edit2, Save, X, RotateCcw, Menu, Share, ChevronRight, ClipboardList, CheckCircle, ArrowRight, RefreshCw, User, Zap, Users, ChevronDown, ChevronUp, Search, MoreVertical, PlusSquare, MessageSquare, Sparkles, Send, Loader2 } from 'lucide-react';

// --- 硬編碼結構資料 ---

// 16型人格的功能排序
const TYPE_STACKS = {
  'ISTJ': ['si', 'te', 'fi', 'ne'], 'ISFJ': ['si', 'fe', 'ti', 'ne'],
  'INFJ': ['ni', 'fe', 'ti', 'se'], 'INTJ': ['ni', 'te', 'fi', 'se'],
  'ISTP': ['ti', 'se', 'ni', 'fe'], 'ISFP': ['fi', 'se', 'ni', 'te'],
  'INFP': ['fi', 'ne', 'si', 'te'], 'INTP': ['ti', 'ne', 'si', 'fe'],
  'ESTP': ['se', 'ti', 'fe', 'ni'], 'ESFP': ['se', 'fi', 'te', 'ni'],
  'ENFP': ['ne', 'fi', 'te', 'si'], 'ENTP': ['ne', 'ti', 'fe', 'si'],
  'ESTJ': ['te', 'si', 'ne', 'fi'], 'ESFJ': ['fe', 'si', 'ne', 'ti'],
  'ENFJ': ['fe', 'ni', 'se', 'ti'], 'ENTJ': ['te', 'ni', 'se', 'fi']
};

// 色彩系統
const THEME_COLORS = {
  ei: { main: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100', icon: 'bg-indigo-100 text-indigo-600', hover: 'hover:bg-indigo-50', ring: 'focus:ring-indigo-500', btn: 'bg-indigo-600 hover:bg-indigo-700' },
  sn: { main: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-100', icon: 'bg-purple-100 text-purple-600', hover: 'hover:bg-purple-50', ring: 'focus:ring-purple-500', btn: 'bg-purple-600 hover:bg-purple-700' },
  tf: { main: 'text-pink-600', bg: 'bg-pink-50', border: 'border-pink-100', icon: 'bg-pink-100 text-pink-600', hover: 'hover:bg-pink-50', ring: 'focus:ring-pink-500', btn: 'bg-pink-600 hover:bg-pink-700' },
  jp: { main: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100', icon: 'bg-amber-100 text-amber-600', hover: 'hover:bg-amber-50', ring: 'focus:ring-amber-500', btn: 'bg-amber-600 hover:bg-amber-700' },
  default: { main: 'text-gray-600', bg: 'bg-gray-50', border: 'border-gray-100', icon: 'bg-gray-100 text-gray-600', hover: 'hover:bg-gray-50', ring: 'focus:ring-gray-500', btn: 'bg-gray-800 hover:bg-gray-900' }
};

// 預設資料
const DEFAULT_DATA = {
  letters: [
    {
      id: 'ei',
      title: '能量獲取 (E vs I)',
      colorKey: 'ei',
      left: { char: 'E', name: '外向 (Extrovert)', desc: '從與外部世界的互動、人群、活動中獲取能量。傾向於先行動後思考。' },
      right: { char: 'I', name: '內向 (Introvert)', desc: '從內在的獨處、反思、思想世界中獲取能量。傾向於先思考後行動。' }
    },
    {
      id: 'sn',
      title: '感知資訊 (S vs N)',
      colorKey: 'sn',
      left: { char: 'S', name: '實感 (Sensing)', desc: '關注當下、具體的事實、細節和五官體驗。相信過往經驗與標準程序。' },
      right: { char: 'N', name: '直覺 (Intuition)', desc: '關注未來、抽象的模式、可能性和宏觀圖景。喜歡創新與理論概念。' }
    },
    {
      id: 'tf',
      title: '判斷決策 (T vs F)',
      colorKey: 'tf',
      left: { char: 'T', name: '思考 (Thinking)', desc: '基於邏輯、客觀標準、因果關係做決定。重視真理與公平，較少涉入情緒。' },
      right: { char: 'F', name: '情感 (Feeling)', desc: '基於價值觀、人際和諧、個人感受做決定。重視同理心與他人的感受。' }
    },
    {
      id: 'jp',
      title: '生活態度 (J vs P)',
      colorKey: 'jp',
      left: { char: 'J', name: '判斷 (Judging)', desc: '喜歡井然有序、計劃好的生活。重視控制感、結果導向，希望能盡快做出結論。' },
      right: { char: 'P', name: '感知 (Perceiving)', desc: '喜歡彈性、隨遇而安的生活。重視開放性、過程導向，傾向保留更多選擇空間。' }
    }
  ],
  functions: [
    {
      id: 'dom',
      title: '主導功能 (Dominant)',
      role: '英雄 / 駕駛員',
      color: 'bg-blue-100 text-blue-800 border-blue-200',
      desc: '這是你最擅長、使用最頻繁的功能，也是你人格的核心。這就像是你人生的「駕駛員」，大約 3-5 歲開始發展，幾乎不需要耗費力氣就能運作。'
    },
    {
      id: 'aux',
      title: '輔助功能 (Auxiliary)',
      role: '父母 / 副駕駛',
      color: 'bg-green-100 text-green-800 border-green-200',
      desc: '用來支持主導功能，提供平衡。如果主導功能是向內的（I），輔助功能就是向外的（E），反之亦然。它幫助我們與外界互動或向內反思，約在青少年時期發展。'
    },
    {
      id: 'ter',
      title: '第三功能 (Tertiary)',
      role: '孩童',
      color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      desc: '與輔助功能相對。它比較不成熟，有時充滿創造力與玩心，有時則表現得幼稚或防衛。當我們在壓力下或放鬆時，容易滑入這個功能。通常在中年時期才較完善。'
    },
    {
      id: 'inf',
      title: '劣勢功能 (Inferior)',
      role: '阿尼瑪 / 陰影',
      color: 'bg-red-100 text-red-800 border-red-200',
      desc: '這是我們最不擅長、最潛意識的部分，與主導功能完全相反。平常被壓抑，但在極度壓力下會「爆發」（Grip），導致性情大變。它是人格成長與整合的終極目標。'
    }
  ],
  cognitiveFunctions: [
    { id: 'ni', code: 'Ni', type: 'Intuition', name: '內向直覺', desc: '收斂性的洞察。尋找事物背後的單一模式、核心意義與未來願景。喜歡預測與宏觀規劃，常有「靈光一閃」的時刻。' },
    { id: 'ne', code: 'Ne', type: 'Intuition', name: '外向直覺', desc: '發散性的聯想。看見外部世界的各種可能性、關聯與創意。喜歡腦力激盪、探索新概念，跳躍性思考。' },
    { id: 'si', code: 'Si', type: 'Sensing', name: '內向實感', desc: '內化的經驗庫。重視過去的經驗、傳統、細節與身體的穩定感受。喜歡維持穩定的慣例，記憶力極佳。' },
    { id: 'se', code: 'Se', type: 'Sensing', name: '外向實感', desc: '敏銳的當下感知。全神貫注於現實世界的聲光刺激與互動。喜歡即時的行動、冒險與豐富的感官體驗。' },
    { id: 'ti', code: 'Ti', type: 'Thinking', name: '內向思考', desc: '主觀的邏輯架構。追求內在原理的精確性、邏輯一致性與本質分析。喜歡拆解問題找根源，重視「為什麼」。' },
    { id: 'te', code: 'Te', type: 'Thinking', name: '外向思考', desc: '客觀的執行邏輯。重視效率、資源調度、外部系統的運作與結果。喜歡組織、管理與優化流程，重視「怎麼做」。' },
    { id: 'fi', code: 'Fi', type: 'Feeling', name: '內向情感', desc: '個人的價值信念。重視真誠、內在和諧、自我認同與深層情感。對善惡有強烈的直覺判斷，忠於自我感受。' },
    { id: 'fe', code: 'Fe', type: 'Feeling', name: '外向情感', desc: '群體的價值連結。重視人際和諧、社會規範、他人的情緒與需求。善於照顧氣氛、溝通與建立連結。' }
  ],
  personalityTypes: {
    'ISTJ': { name: '物流師', desc: '實際、注重事實，非常可靠。他們重視傳統與秩序，做事有條不紊。', fullDesc: 'ISTJ 是安靜、嚴肅，透過全面與可靠獲得成功的人。他們講求實際、實事求是、又符合現實。他們重視傳統與忠誠，並會致力於將事情安排得井井有條。' },
    'ISFJ': { name: '守衛者', desc: '非常專注而溫暖的守護者，時刻準備著保護愛著的人。', fullDesc: 'ISFJ 是安靜、友善、負責任且有良知的人。致力於履行他們的義務。他們周到、刻苦，並精確不差地完成事情。他們忠誠，體貼他人，並會記住對他們來說重要的人的細節。' },
    'INFJ': { name: '提倡者', desc: '安靜而神秘，同時鼓舞人心的理想主義者。具有深刻的洞察力。', fullDesc: 'INFJ 尋求思想、關係、物質所有物的意義和關聯。他們想了解是什麼驅動了人，對他人有深刻的洞察力。他們有良知，並致力於他們堅定的價值觀。' },
    'INTJ': { name: '建築師', desc: '富有想像力和戰略性的思想家，一切皆在計劃之中。', fullDesc: 'INTJ 擁有原創的心智與強大的動力來實現他們的想法與目標。他們能快速看到外部事件的模式，並發展長遠的解釋觀點。' },
    'ISTP': { name: '鑑賞家', desc: '大膽而實際的實驗家，擅長使用各種工具。冷靜的觀察者。', fullDesc: 'ISTP 是靈活旁觀者，安靜直到問題出現，然後會迅速行動找到解決方案。他們對原因與結果感興趣，用邏輯原理來組織事實，重視效率。' },
    'ISFP': { name: '探險家', desc: '靈活、有魅力的藝術家，時刻準備著探索和體驗新鮮事物。', fullDesc: 'ISFP 安靜、友善、敏感且仁慈。他們享受當下，喜歡在自己的時間表內工作。他們忠於自己的價值觀以及對他們重要的人。' },
    'INFP': { name: '調停者', desc: '詩意，善良的利他主義者，總是熱情地為正當理由提供幫助。', fullDesc: 'INFP 是理想主義者，忠於自己的價值觀。他們希望外在的生活能與內在的價值觀一致。他們好奇，能迅速看到可能性，並常作為催化劑來實踐想法。' },
    'INTP': { name: '邏輯學家', desc: '具有創造力的發明家，對知識有著止不住的渴望。', fullDesc: 'INTP 尋求對他們感興趣的事物發展出邏輯解釋。他們傾向於理論與抽象，對思想比對社交互動更感興趣。他們安靜、包容、有彈性。' },
    'ESTP': { name: '企業家', desc: '聰明，精力充沛，善於感知的人，享受冒險與刺激。', fullDesc: 'ESTP 靈活且包容，採取務實的方法以獲得立即的結果。他們對理論和概念解釋感到無聊，他們想要精力充沛地解決問題。' },
    'ESFP': { name: '表演者', desc: '自發性強，精力充沛且熱情的表演者，生活永遠不會無聊。', fullDesc: 'ESFP 外向、友善、包容。他們熱愛生活、人與物質享受。他們喜歡與人共事，運用常識與實際的方法來讓工作變有趣。' },
    'ENFP': { name: '競選者', desc: '熱情，有創造力，愛社交的自由精神，總能找到理由微笑。', fullDesc: 'ENFP 熱情洋溢且充滿想像力。他們視人生為充滿可能性的。他們能迅速在事件與資訊中建立連結，並依據他們所看到的模式自信地行動。' },
    'ENTP': { name: '辯論家', desc: '聰明好奇的思想者，無法抵擋智力挑戰的誘惑。', fullDesc: 'ENTP 反應快、聰明、機警。他們擅長解決新挑戰，對例行公事感到厭煩。他們善於在概念上分析，並以此進行策略規劃。' },
    'ESTJ': { name: '總經理', desc: '出色的管理者，在管理事情或人的方面無與倫比。', fullDesc: 'ESTJ 實際、現實、注重事實。他們果斷，能迅速做出決定。他們擅長組織專案與人來完成事情，並專注於以最有效率的方式得到結果。' },
    'ESFJ': { name: '執政官', desc: '極有同情心，愛社交受歡迎的人，總是熱心提供幫助。', fullDesc: 'ESFJ 熱心、盡責、合作。他們希望周遭環境和諧，並會堅定地建立這樣的環境。他們喜歡與人共事，以精確且準時地完成任務。' },
    'ENFJ': { name: '主人公', desc: '富有魅力，鼓舞人心的領導者，有能力讓聽眾著迷。', fullDesc: 'ENFJ 熱情、為他人著想、負責。他們高度關注他人的情緒、需求與動機。他們能在群體中充當催化劑，並展現鼓舞人心的領導力。' },
    'ENTJ': { name: '指揮官', desc: '大膽，富有想像力且意志強大的領導者，極具決斷力。', fullDesc: 'ENTJ 坦率、果斷，並容易成為領導者。他們能迅速看見不合邏輯與效率低下的程序，並發展全面的系統來解決組織問題。' }
  },
  roleDescriptions: {
    'ni': {
      dom: '你活在未來。你不斷地無意識處理資訊，直到「靈光一閃」看見唯一的道路。你有強烈的願景，對瑣碎細節不感興趣。',
      aux: '你用直覺來支持判斷。你幫助篩選路徑，確保行動符合長遠的目標與意義。',
      ter: '當你放鬆時，你可能會享受對未來的孩子氣幻想，或者變得過度迷信於某些徵兆。',
      inf: '你通常忽略未來後果。但在壓力下，你可能會變得偏執，突然覺得未來充滿了災難性的註定。'
    },
    'ne': {
      dom: '你活在可能性的世界。你看到一個點就能聯想到無數個面。你熱愛腦力激盪，難以忍受一成不變。',
      aux: '你用創意來輔助判斷。你為決策提供多種選項，確保不會錯過任何機會。',
      ter: '你喜歡用開玩笑的方式探索新想法，有時會顯得跳躍或不切實際，這是你放鬆的方式。',
      inf: '你平常專注於單一路徑。但在壓力下，你可能會被無數種「如果...怎麼辦」的負面可能性淹沒，無法做決定。'
    },
    'si': {
      dom: '你是傳統的守護者。你的內在資料庫儲存了所有過去的細節與經驗。你依賴慣例，追求穩定與安全感。',
      aux: '你用經驗來支持決策。你提供過去的數據與細節，確保計畫是可行且穩妥的。',
      ter: '你可能會對某些懷舊的細節或收藏特別執著，或者在放鬆時反覆回味過去的片段。',
      inf: '你平常不拘小節。但在壓力下，你可能會突然過度執著於微不足道的細節，或被過去的失敗回憶糾纏。'
    },
    'se': {
      dom: '你是當下的行動者。你極度敏銳於感官刺激，反應迅速。你追求刺激、美感與即時的滿足。',
      aux: '你用行動來落實想法。你讓抽象的計畫變得具體可行，並確保外觀與呈現是完美的。',
      ter: '你可能喜歡透過運動、美食或購物來放鬆，展現出比較享樂主義的一面。',
      inf: '你平常活在腦中。但在壓力下，你可能會過度沈溺於感官享樂（暴飲暴食、購物）或對環境細節異常敏感。'
    },
    'ti': {
      dom: '你是邏輯的建築師。你追求絕對的真理與精確。你在腦中建構複雜的框架，只有符合邏輯的事物才能說服你。',
      aux: '你用分析來輔助感知。你冷靜地拆解問題，找出核心原理，幫助你理解世界。',
      ter: '你喜歡在輕鬆的狀態下玩弄邏輯遊戲、解謎，或對別人的語病進行挑惕。',
      inf: '你平常重視人情或效率。但在壓力下，你可能會變得過度挑惕、冷漠，並試圖用扭曲的邏輯來攻擊他人。'
    },
    'te': {
      dom: '你是天生的指揮官。你追求效率與結果。你善於組織資源、制定計畫並強勢執行。',
      aux: '你用效率來落實願景。你將抽象的想法轉化為具體的步驟與流程，確保任務完成。',
      ter: '你可能會在放鬆時喜歡制定旅遊計畫，或對別人的效率變得有點愛管閒事。',
      inf: '你平常隨和或內省。但在壓力下，你可能會變得獨斷專行、暴躁，並試圖控制周遭的所有細節。'
    },
    'fi': {
      dom: '你是真誠的守護者。你有強烈的個人價值觀與情感深度。你忠於自我，不隨波逐流。',
      aux: '你用價值觀來導航。你確保行動符合你的良知與信念，並對他人展現真誠的同理心。',
      ter: '你在放鬆時可能會流露出比較孩子氣、敏感的情感，或對某些個人喜好非常堅持。',
      inf: '你平常客觀理性。但在壓力下，你可能會突然變得過度情緒化、覺得沒人愛你，或感到被世界背叛。'
    },
    'fe': {
      dom: '你是和諧的營造者。你極度敏銳於他人的情緒與社會規範。你善於溝通、照顧他人並凝聚群體。',
      aux: '你用人際關係來支持行動。你考量決策對他人的影響，並確保大家都在同一條船上。',
      ter: '你在放鬆時會展現出溫暖、愛開玩笑的一面，渴望獲得群體的認可與掌聲。',
      inf: '你平常獨立自主。但在壓力下，你可能會變得過度依賴別人的看法，或情緒爆發指責別人不關心你。'
    }
  }
};

const QUIZ_QUESTIONS = [
  {
    id: 1,
    dimension: 'EI',
    colorKey: 'ei',
    title: '當你覺得疲憊時，你會如何充電？',
    options: [
      { val: 'E', text: '找朋友聚會、聊天，與人互動讓我感覺更有活力。', label: '外向 (E)' },
      { val: 'I', text: '獨處、閱讀或做自己的事，享受安靜的時光讓我恢復能量。', label: '內向 (I)' }
    ]
  },
  {
    id: 2,
    dimension: 'SN',
    colorKey: 'sn',
    title: '在接收資訊時，你更傾向於？',
    options: [
      { val: 'S', text: '關注具體的細節、當下的事實和過往的經驗。', label: '實感 (S)' },
      { val: 'N', text: '關注抽象的概念、未來的可能性和整體的大圖景。', label: '直覺 (N)' }
    ]
  },
  {
    id: 3,
    dimension: 'TF',
    colorKey: 'tf',
    title: '在做決定的時候，你通常？',
    options: [
      { val: 'T', text: '重視邏輯分析、客觀標準和公平性，較少受情緒影響。', label: '思考 (T)' },
      { val: 'F', text: '重視個人價值觀、人際和諧和他人的感受，富有同理心。', label: '情感 (F)' }
    ]
  },
  {
    id: 4,
    dimension: 'JP',
    colorKey: 'jp',
    title: '對於日常生活與工作，你更喜歡？',
    options: [
      { val: 'J', text: '喜歡制定計劃、按部就班，希望事情能儘早定案。', label: '判斷 (J)' },
      { val: 'P', text: '喜歡保留彈性、隨遇而安，享受過程並適應變化。', label: '感知 (P)' }
    ]
  }
];

// Logo Component
const AppLogo = () => (
  <svg width="32" height="32" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg" className="shadow-sm rounded-lg">
    <rect width="512" height="512" rx="120" fill="white" />
    <path d="M106 128H181V384H106V128Z" fill="#4F46E5"/>
    <path d="M181 128L256 256V384H181V128Z" fill="#9333EA"/>
    <path d="M331 128L256 256V384H331V128Z" fill="#EC4899"/>
    <path d="M406 128H331V384H406V128Z" fill="#F59E0B"/>
  </svg>
);

const App = () => {
  const [activeTab, setActiveTab] = useState('letters'); // letters | functions | types | quiz | ai-chat
  const [data, setData] = useState(DEFAULT_DATA);
  const [expandedType, setExpandedType] = useState(null); 
  const [editingItem, setEditingItem] = useState(null); 
  const [tempEditValue, setTempEditValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [quizState, setQuizState] = useState('intro'); // intro | playing | result
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState({ EI: '', SN: '', TF: '', JP: '' });

  // AI Chat State
  const [chatHistory, setChatHistory] = useState([{ role: 'model', text: '你好！我是你的 AI MBTI 顧問。你可以問我任何關於人格類型、功能分析、或人際關係的問題！✨' }]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const chatEndRef = useRef(null);

  const apiKey = "AIzaSyAdzY70jK6g5S15cFa7TxWjEeW9_GEyFaI"; // Gemini API Key

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    if (activeTab === 'ai-chat') {
      scrollToBottom();
    }
  }, [chatHistory, activeTab]);

  // Gemini API Call with Exponential Backoff
  const callGeminiAPI = async (prompt) => {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { parts: [{ text: "你是一位精通 MBTI (Myers-Briggs Type Indicator) 與榮格八維認知功能 (Cognitive Functions) 的專家顧問。請用繁體中文回答使用者的問題。你的分析應該深入、客觀，並嘗試用功能運作 (如 Ni, Te 等) 來解釋現象。回答要具備同理心，適合用於個人成長或人際關係諮詢。請避免過於武斷的刻板印象，強調每個人的獨特性。" }] }
    };

    let retries = 0;
    const maxRetries = 5;
    const delays = [1000, 2000, 4000, 8000, 16000];

    while (retries <= maxRetries) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) {
           if (response.status === 429) {
             throw new Error('Too Many Requests');
           }
           throw new Error(`API Error: ${response.status}`);
        }

        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "抱歉，我現在無法回答，請稍後再試。";
      } catch (error) {
        if (retries === maxRetries) {
          return "連線發生錯誤，請檢查網路或稍後再試。";
        }
        await new Promise(resolve => setTimeout(resolve, delays[retries]));
        retries++;
      }
    }
  };

  const handleSendChat = async () => {
    if (!chatInput.trim() || isChatLoading) return;
    
    const userMsg = chatInput;
    setChatInput('');
    setChatHistory(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsChatLoading(true);

    try {
      const reply = await callGeminiAPI(userMsg);
      setChatHistory(prev => [...prev, { role: 'model', text: reply }]);
    } catch (e) {
      setChatHistory(prev => [...prev, { role: 'model', text: "發生未知錯誤，請重試。" }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // 初始化
  useEffect(() => {
    // 1. 讀取資料
    const savedData = localStorage.getItem('mbti_app_data');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setData({ 
          ...DEFAULT_DATA, 
          ...parsed,
          letters: parsed.letters ? parsed.letters.map((l, i) => ({ ...DEFAULT_DATA.letters[i], ...l })) : DEFAULT_DATA.letters,
          cognitiveFunctions: parsed.cognitiveFunctions || DEFAULT_DATA.cognitiveFunctions,
          personalityTypes: parsed.personalityTypes || DEFAULT_DATA.personalityTypes,
          roleDescriptions: parsed.roleDescriptions || DEFAULT_DATA.roleDescriptions
        });
      } catch (e) { console.error("資料讀取失敗"); }
    }
  }, []);

  const saveToStorage = (newData) => {
    setData(newData);
    localStorage.setItem('mbti_app_data', JSON.stringify(newData));
  };

  const resetData = () => {
    if (window.confirm('確定重置？')) saveToStorage(DEFAULT_DATA);
  };

  const openEdit = (type, id, fieldContent, section = null) => {
    setEditingItem({ type, id, section });
    setTempEditValue(fieldContent);
  };

  const handleSaveEdit = () => {
    const newData = { ...data };
    if (editingItem.type === 'letters') {
      const index = newData.letters.findIndex(l => l.id === editingItem.id);
      if (index !== -1) newData.letters[index][editingItem.section].desc = tempEditValue;
    } else if (editingItem.type === 'functions') {
      const index = newData.functions.findIndex(f => f.id === editingItem.id);
      if (index !== -1) newData.functions[index].desc = tempEditValue;
    } else if (editingItem.type === 'cognitiveFunctions') {
      const index = newData.cognitiveFunctions.findIndex(f => f.id === editingItem.id);
      if (index !== -1) newData.cognitiveFunctions[index].desc = tempEditValue;
    } else if (editingItem.type === 'personalityTypes') {
      if (newData.personalityTypes[editingItem.id]) newData.personalityTypes[editingItem.id][editingItem.section] = tempEditValue;
    } else if (editingItem.type === 'roleDescriptions') {
      if (newData.roleDescriptions[editingItem.id]) newData.roleDescriptions[editingItem.id][editingItem.section] = tempEditValue;
    }
    saveToStorage(newData);
    setEditingItem(null);
  };

  // 測驗相關
  const handleQuizAnswer = (dimension, val) => {
    const newAnswers = { ...quizAnswers, [dimension]: val };
    setQuizAnswers(newAnswers);
    if (currentQuestion < QUIZ_QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQuestion(curr => curr + 1), 250);
    } else {
      setTimeout(() => setQuizState('result'), 250);
    }
  };

  const restartQuiz = () => {
    setQuizState('intro');
    setCurrentQuestion(0);
    setQuizAnswers({ EI: '', SN: '', TF: '', JP: '' });
  };

  const getResultType = () => `${quizAnswers.EI}${quizAnswers.SN}${quizAnswers.TF}${quizAnswers.JP}`;

  // 輔助函式
  const getFuncColor = (type) => {
    switch(type) {
      case 'Intuition': return 'text-purple-600 bg-purple-50 border-purple-100';
      case 'Sensing': return 'text-amber-600 bg-amber-50 border-amber-100'; 
      case 'Thinking': return 'text-indigo-600 bg-indigo-50 border-indigo-100'; 
      case 'Feeling': return 'text-pink-600 bg-pink-50 border-pink-100'; 
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getFuncName = (code) => {
    const func = data.cognitiveFunctions.find(f => f.id === code);
    return func ? `${func.code} ${func.name}` : code;
  };
  
  const getFuncType = (code) => {
    const func = data.cognitiveFunctions.find(f => f.id === code);
    return func ? func.type : '';
  };

  const getRoleName = (roleId) => {
    const role = data.functions.find(f => f.id === roleId);
    return role ? role.title.split(' ')[0] : roleId;
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans pb-24 md:pb-0 select-none">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-20 px-4 py-3 flex justify-between items-center border-b border-gray-100">
        <div className="flex items-center gap-3">
          <AppLogo />
          <div className="flex flex-col">
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-amber-500">
              MBTI 隨身庫
            </h1>
            <span className="text-[10px] text-gray-400 font-medium">v2.0 (AI)</span>
          </div>
        </div>
        <button onClick={resetData} className="p-2 text-gray-400 hover:text-red-500 transition-colors">
          <RotateCcw size={20} />
        </button>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto p-4 md:p-8 animate-in fade-in duration-500">
        
        {/* Welcome Card (Non-Quiz & Non-Chat) */}
        {activeTab !== 'quiz' && activeTab !== 'ai-chat' && (
          <div className="mb-6 p-4 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 rounded-2xl text-white shadow-lg shadow-indigo-200">
            <h2 className="text-lg font-bold mb-1">打造你的知識體系</h2>
            <p className="text-indigo-100 text-sm opacity-90">
              點擊 <Edit2 className="inline w-3 h-3"/> 即可隨時修改內容。
            </p>
          </div>
        )}

        {/* Desktop Tabs */}
        <div className="hidden md:flex gap-4 mb-8 border-b border-gray-200 overflow-x-auto">
          {['letters', 'functions', 'types', 'quiz', 'ai-chat'].map(tab => (
            <button 
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-4 font-medium transition-all whitespace-nowrap capitalize flex items-center gap-2 ${activeTab === tab ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              {tab === 'ai-chat' && <Sparkles size={16} />}
              {{letters: '四個維度', functions: '心智功能', types: '16型人格', quiz: '快速評量', 'ai-chat': 'AI 顧問'}[tab]}
            </button>
          ))}
        </div>

        {/* Content Render */}
        <div className="space-y-6">
          
          {/* --- LETTERS --- */}
          {activeTab === 'letters' && data.letters.map((item) => {
            const theme = THEME_COLORS[item.colorKey] || THEME_COLORS.default;
            return (
              <div key={item.id} className={`bg-white rounded-2xl shadow-sm border ${theme.border} overflow-hidden`}>
                <div className={`${theme.bg} px-4 py-2 border-b ${theme.border} flex items-center justify-between`}>
                  <span className={`text-xs font-bold ${theme.main} uppercase tracking-wider`}>{item.title}</span>
                </div>
                
                <div className={`grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x ${theme.border}`}>
                  {['left', 'right'].map((side) => (
                    <div key={side} className={`p-5 ${theme.hover} transition-colors group relative`}>
                      <div className="flex items-center gap-3 mb-2">
                        <span className={`w-10 h-10 rounded-full ${theme.icon} flex items-center justify-center font-bold text-xl`}>
                          {item[side].char}
                        </span>
                        <h3 className="font-bold text-gray-800">{item[side].name}</h3>
                        <button 
                          onClick={() => openEdit('letters', item.id, item[side].desc, side)}
                          className={`ml-auto opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:${theme.main} hover:bg-white rounded-full transition-all`}
                        >
                          <Edit2 size={16} />
                        </button>
                      </div>
                      <p className="text-sm text-gray-600 leading-relaxed pl-[3.25rem]">
                        {item[side].desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* --- FUNCTIONS --- */}
          {activeTab === 'functions' && (
             <div className="grid gap-6">
               {/* Roles */}
               <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-3 px-1">功能位階</h3>
                  <div className="grid gap-4">
                    {data.functions.map((func) => (
                      <div key={func.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 relative group hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-3">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold text-lg text-gray-800">{func.title}</h3>
                              </div>
                              <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${func.color}`}>
                                {func.role}
                              </span>
                            </div>
                            <button 
                              onClick={() => openEdit('functions', func.id, func.desc)}
                              className="opacity-0 group-hover:opacity-100 p-2 text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-full transition-all"
                            >
                              <Edit2 size={18} />
                            </button>
                        </div>
                        <p className="text-gray-600 text-sm leading-relaxed">{func.desc}</p>
                      </div>
                    ))}
                  </div>
               </div>

               {/* Cognitive Functions */}
               <div className="mt-4 pt-6 border-t border-gray-200">
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4 px-1 flex items-center gap-2">
                    <Zap size={16} /> 八大認知功能詳解
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {data.cognitiveFunctions.map((func) => (
                      <div key={func.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 relative group hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-gray-800 text-white flex items-center justify-center font-bold text-sm">
                              {func.code}
                            </div>
                            <h4 className="font-bold text-gray-800">{func.name}</h4>
                          </div>
                          <button 
                            onClick={() => openEdit('cognitiveFunctions', func.id, func.desc)}
                            className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-indigo-600 bg-gray-50 hover:bg-indigo-50 rounded-full transition-all"
                          >
                            <Edit2 size={16} />
                          </button>
                        </div>
                        <div className={`text-xs inline-block px-1.5 py-0.5 rounded border mb-2 ${getFuncColor(func.type)}`}>{func.type}</div>
                        <p className="text-gray-600 text-xs leading-relaxed">{func.desc}</p>
                      </div>
                    ))}
                  </div>
               </div>
             </div>
          )}

          {/* --- 16 TYPES --- */}
          {activeTab === 'types' && (
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="搜尋 (例如: INTJ, 建築師...)"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none text-gray-700"
                />
              </div>

              <div className="grid gap-4">
                {Object.keys(data.personalityTypes)
                  .filter(code => {
                    const q = searchQuery.toLowerCase();
                    return code.toLowerCase().includes(q) || data.personalityTypes[code].name.includes(q);
                  })
                  .map((typeCode) => {
                    const typeData = data.personalityTypes[typeCode];
                    const stack = TYPE_STACKS[typeCode];
                    const isExpanded = expandedType === typeCode;

                    return (
                      <div key={typeCode} className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 ${isExpanded ? 'ring-2 ring-indigo-500/10' : ''}`}>
                        <div onClick={() => setExpandedType(isExpanded ? null : typeCode)} className="p-5 cursor-pointer hover:bg-gray-50 transition-colors">
                          <div className="flex items-start justify-between">
                            <div>
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="font-black text-2xl text-indigo-600 tracking-wide">{typeCode}</h3>
                                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded text-sm font-bold">{typeData.name}</span>
                              </div>
                              <div className="flex gap-2 mb-3">
                                {stack.map((funcCode, idx) => (
                                  <span key={idx} className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded border ${getFuncColor(getFuncType(funcCode))}`}>{funcCode}</span>
                                ))}
                              </div>
                              {!isExpanded && <p className="text-gray-500 text-sm line-clamp-2">{typeData.desc}</p>}
                            </div>
                            <div className="text-gray-300">{isExpanded ? <ChevronUp size={24} /> : <ChevronDown size={24} />}</div>
                          </div>
                        </div>

                        {isExpanded && (
                          <div className="px-5 pb-5 animate-in slide-in-from-top-2 duration-200">
                            <div className="mb-6 relative group">
                              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">整體介紹</h4>
                              <p className="text-gray-700 text-sm leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">{typeData.fullDesc}</p>
                              <button onClick={(e) => { e.stopPropagation(); openEdit('personalityTypes', typeCode, typeData.fullDesc, 'fullDesc'); }} className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-indigo-600"><Edit2 size={14} /></button>
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">功能運作</h4>
                              <div className="space-y-3">
                                {stack.map((funcCode, idx) => {
                                  const roles = ['dom', 'aux', 'ter', 'inf'];
                                  const roleDesc = data.roleDescriptions[funcCode] ? data.roleDescriptions[funcCode][roles[idx]] : '';
                                  return (
                                    <div key={idx} className="relative group border-l-2 border-gray-100 pl-3 hover:border-indigo-300">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="text-xs font-bold text-gray-400 w-16">{getRoleName(roles[idx])}</span>
                                        <span className={`text-xs font-bold px-1.5 rounded ${getFuncColor(getFuncType(funcCode))}`}>{getFuncName(funcCode)}</span>
                                      </div>
                                      <p className="text-sm text-gray-600 leading-relaxed">{roleDesc || '尚無描述'}</p>
                                      <button onClick={(e) => { e.stopPropagation(); openEdit('roleDescriptions', funcCode, roleDesc, roles[idx]); }} className="absolute top-0 right-0 opacity-0 group-hover:opacity-100 p-1 text-gray-300 hover:text-indigo-600"><Edit2 size={12} /></button>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
              </div>
              {/* No Result */}
              {Object.keys(data.personalityTypes).filter(c => c.toLowerCase().includes(searchQuery.toLowerCase()) || data.personalityTypes[c].name.includes(searchQuery)).length === 0 && <div className="text-center py-10 text-gray-400">沒有找到符合的類型</div>}
            </div>
          )}

          {/* --- QUIZ --- */}
          {activeTab === 'quiz' && (
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden min-h-[400px] flex flex-col relative">
              {quizState === 'intro' && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 mb-6"><ClipboardList size={40} /></div>
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">快速類型評量</h2>
                  <p className="text-gray-500 mb-8 max-w-xs">回答 4 個簡單的問題，快速找出你的 MBTI 傾向。</p>
                  <button onClick={() => setQuizState('playing')} className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold text-lg shadow-lg hover:bg-indigo-700 transition-all flex items-center gap-2">開始測驗 <ArrowRight size={20} /></button>
                </div>
              )}

              {quizState === 'playing' && (
                <div className="flex-1 flex flex-col p-6 animate-in slide-in-from-right duration-300">
                  <div className="w-full bg-gray-100 h-2 rounded-full mb-8">
                    <div className="bg-indigo-600 h-2 rounded-full transition-all duration-500" style={{ width: `${((currentQuestion + 1) / QUIZ_QUESTIONS.length) * 100}%` }}></div>
                  </div>
                  <div className="flex-1 flex flex-col justify-center">
                    <span className={`${THEME_COLORS[QUIZ_QUESTIONS[currentQuestion].colorKey].main} font-bold text-sm mb-2 tracking-wider`}>問題 {currentQuestion + 1} / {QUIZ_QUESTIONS.length}</span>
                    <h3 className="text-xl font-bold text-gray-800 mb-8 leading-relaxed">{QUIZ_QUESTIONS[currentQuestion].title}</h3>
                    <div className="grid gap-4">
                      {QUIZ_QUESTIONS[currentQuestion].options.map((option) => (
                        <button key={option.val} onClick={() => handleQuizAnswer(QUIZ_QUESTIONS[currentQuestion].dimension, option.val)} className={`text-left p-5 border-2 ${THEME_COLORS[QUIZ_QUESTIONS[currentQuestion].colorKey].border} rounded-xl hover:border-current ${THEME_COLORS[QUIZ_QUESTIONS[currentQuestion].colorKey].hover} transition-all group`}>
                          <div className="flex items-center justify-between">
                            <span className={`font-medium text-gray-700 group-hover:${THEME_COLORS[QUIZ_QUESTIONS[currentQuestion].colorKey].main.split(' ')[0]}`}>{option.text}</span>
                            <span className={`text-xs font-bold ${THEME_COLORS[QUIZ_QUESTIONS[currentQuestion].colorKey].icon} px-2 py-1 rounded ml-3 shrink-0`}>{option.label}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {quizState === 'result' && (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in zoom-in duration-300 bg-gradient-to-b from-white to-indigo-50/50">
                  <span className="text-gray-500 font-medium mb-4">你的評量結果是</span>
                  <div className="text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600 tracking-widest mb-2">{getResultType()}</div>
                  {data.personalityTypes[getResultType()] && (
                    <div className="mb-6 flex flex-col items-center">
                      <div className="bg-indigo-600 text-white px-3 py-1 rounded-full text-sm font-bold mb-3 shadow-md">{data.personalityTypes[getResultType()].name}</div>
                      <p className="text-gray-600 max-w-sm leading-relaxed">{data.personalityTypes[getResultType()].desc}</p>
                    </div>
                  )}
                  <button onClick={restartQuiz} className="text-gray-500 hover:text-indigo-600 font-medium flex items-center gap-2 transition-colors py-2 px-4 rounded-lg hover:bg-gray-50"><RefreshCw size={18} /> 重新測驗</button>
                </div>
              )}
            </div>
          )}

          {/* --- AI CHAT --- */}
          {activeTab === 'ai-chat' && (
            <div className="bg-white rounded-3xl shadow-lg border border-gray-100 overflow-hidden h-[600px] max-h-[80vh] flex flex-col relative">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-4 flex items-center gap-3 text-white">
                <div className="bg-white/20 p-2 rounded-lg">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h3 className="font-bold">AI MBTI 顧問</h3>
                  <p className="text-xs text-indigo-100">由 Gemini 提供即時分析 ✨</p>
                </div>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                {chatHistory.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-br-none' 
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                    }`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white p-3 rounded-2xl rounded-bl-none border border-gray-200 shadow-sm flex items-center gap-2 text-sm text-gray-500">
                      <Loader2 size={16} className="animate-spin text-indigo-600" />
                      分析中...
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white border-t border-gray-100">
                <div className="relative flex items-center gap-2">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSendChat()}
                    placeholder="問問看：我是 INFP，適合什麼工作？"
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                    disabled={isChatLoading}
                  />
                  <button 
                    onClick={handleSendChat}
                    disabled={!chatInput.trim() || isChatLoading}
                    className="bg-indigo-600 text-white p-3 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-md shadow-indigo-200"
                  >
                    <Send size={18} />
                  </button>
                </div>
                <div className="text-[10px] text-center text-gray-400 mt-2">
                  AI 生成內容可能會有誤差，請作為參考用途。
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 w-full bg-white border-t border-gray-200 flex justify-around py-2 z-10 pb-safe">
        {['letters', 'functions', 'types', 'quiz', 'ai-chat'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex flex-col items-center p-2 w-full transition-colors ${activeTab === tab ? 'text-indigo-600' : 'text-gray-400'}`}>
            {{
              letters: <BookOpen size={24} strokeWidth={activeTab === tab ? 2.5 : 2} />,
              functions: <Brain size={24} strokeWidth={activeTab === tab ? 2.5 : 2} />,
              types: <Users size={24} strokeWidth={activeTab === tab ? 2.5 : 2} />,
              quiz: <ClipboardList size={24} strokeWidth={activeTab === tab ? 2.5 : 2} />,
              'ai-chat': <Sparkles size={24} strokeWidth={activeTab === tab ? 2.5 : 2} />
            }[tab]}
            <span className="text-[10px] mt-1 font-medium">
              {{letters:'四個維度', functions:'心智功能', types:'16型人格', quiz:'快速評量', 'ai-chat': 'AI 顧問'}[tab]}
            </span>
          </button>
        ))}
      </nav>

      {/* Edit Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-gray-800 text-lg">編輯內容</h3>
              <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-600"><X size={24} /></button>
            </div>
            <textarea value={tempEditValue} onChange={(e) => setTempEditValue(e.target.value)} className="w-full h-40 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none resize-none text-gray-700 bg-gray-50 leading-relaxed" placeholder="輸入新的描述..." autoFocus />
            <div className="flex gap-3 mt-6">
              <button onClick={() => setEditingItem(null)} className="flex-1 py-3 text-gray-600 font-medium hover:bg-gray-100 rounded-xl">取消</button>
              <button onClick={handleSaveEdit} className="flex-1 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 shadow-lg flex items-center justify-center gap-2"><Save size={18} /> 儲存</button>
            </div>
          </div>
        </div>
      )}
      <div className="h-6 md:hidden"></div>
    </div>
  );
};

export default App;