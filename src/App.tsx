import React, { useState, useEffect } from "react";
import { 
  Book, 
  Search, 
  BookOpen, 
  Scroll, 
  Anchor, 
  Flame, 
  Landmark, 
  ChevronRight, 
  History, 
  ArrowLeftRight, 
  Sparkles, 
  Compass, 
  Info, 
  HelpCircle, 
  CheckCircle2, 
  AlertTriangle,
  RotateCcw,
  BookMarked
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { PRESET_VERSES, PresetVerse } from "./data";
import { AnalysisResult, SearchHistoryItem, PerspectiveData } from "./types";

const LOADING_STEPS = [
  "Buscando referências nos manuscritos originais...",
  "Analisando terminologias em grego, hebraico ou aramaico...",
  "Consultando comentários patrísticos católicos e escolástica medieval...",
  "Avaliando a teologia da Reforma luterana e os cinco solas...",
  "Examinando a soberania divina de Calvino e os debates de Dort...",
  "Explorando a teose ortodoxa oriental e a teologia apofática...",
  "Investigando o Talmud, Midrash e as análises clássicas de Rashi...",
  "Acessando as teses da crítica textual e historiadores contemporâneos...",
  "Compilando síntese comparativa de concordâncias e divergências..."
];

export default function App() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [activeTab, setActiveTab] = useState<"historical" | "perspectives" | "compare" | "synthesis">("perspectives");
  const [loadingStep, setLoadingStep] = useState(0);
  const [history, setHistory] = useState<SearchHistoryItem[]>([]);
  
  // S-by-S comparison selections
  const [compareLeft, setCompareLeft] = useState<keyof AnalysisResult["perspectives"]>("catolica");
  const [compareRight, setCompareRight] = useState<keyof AnalysisResult["perspectives"]>("judaica");

  // Load search history from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("hermeneutica_history");
      if (stored) {
        setHistory(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Erro ao carregar histórico:", e);
    }
  }, []);

  // Interval for shifting loading text
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (loading) {
      interval = setInterval(() => {
        setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
      }, 2500);
    } else {
      setLoadingStep(0);
    }
    return () => clearInterval(interval);
  }, [loading]);

  const saveToHistory = (searchQuery: string, actualReference: string) => {
    const newItem: SearchHistoryItem = {
      query: searchQuery,
      reference: actualReference,
      timestamp: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    };
    
    // Avoid exact duplicate consecutive queries
    setHistory((prev) => {
      const filtered = prev.filter(item => item.reference.toLowerCase() !== actualReference.toLowerCase());
      const updated = [newItem, ...filtered].slice(0, 10);
      localStorage.setItem("hermeneutica_history", JSON.stringify(updated));
      return updated;
    });
  };

  const handleSearch = async (searchQuery: string) => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Erro ao conectar com o servidor.");
      }

      const data: AnalysisResult = await response.json();
      setResult(data);
      saveToHistory(searchQuery, data.reference);
      
      // Reset selected comparison sides if they are the same
      if (data.perspectives) {
        setActiveTab("perspectives");
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Erro desconhecido ao processar sua solicitação.");
    } finally {
      setLoading(false);
    }
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("hermeneutica_history");
  };

  // Helper for rendering tradition badges and colors
  const getTraditionMeta = (key: string) => {
    switch (key) {
      case "catolica":
        return {
          title: "Católica",
          icon: Landmark,
          colorClass: "bg-red-50 text-red-800 border-red-200",
          iconColor: "text-red-700",
          gradient: "from-red-50 to-amber-50",
          accentBorder: "border-red-300"
        };
      case "reforma":
        return {
          title: "Protestante Reformada",
          icon: BookOpen,
          colorClass: "bg-blue-50 text-blue-800 border-blue-200",
          iconColor: "text-blue-700",
          gradient: "from-blue-50 to-sky-50",
          accentBorder: "border-blue-300"
        };
      case "calvinista":
        return {
          title: "Calvinista",
          icon: Anchor,
          colorClass: "bg-indigo-50 text-indigo-800 border-indigo-200",
          iconColor: "text-indigo-700",
          gradient: "from-indigo-50 to-violet-50",
          accentBorder: "border-indigo-300"
        };
      case "ortodoxa":
        return {
          title: "Ortodoxa",
          icon: Flame,
          colorClass: "bg-amber-50 text-amber-900 border-amber-200",
          iconColor: "text-amber-700",
          gradient: "from-amber-50 to-yellow-50",
          accentBorder: "border-amber-400"
        };
      case "judaica":
        return {
          title: "Judaica",
          icon: Scroll,
          colorClass: "bg-emerald-50 text-emerald-900 border-emerald-200",
          iconColor: "text-emerald-700",
          gradient: "from-emerald-50 to-teal-50",
          accentBorder: "border-emerald-300"
        };
      default:
        return {
          title: "Desconhecido",
          icon: Book,
          colorClass: "bg-gray-50 text-gray-800 border-gray-200",
          iconColor: "text-gray-700",
          gradient: "from-gray-50 to-slate-50",
          accentBorder: "border-gray-300"
        };
    }
  };

  return (
    <div className="min-h-screen flex flex-col selection:bg-amber-100 selection:text-amber-900">
      {/* Upper Scholarly Accent Ribbon */}
      <div className="h-1.5 w-full bg-gradient-to-r from-red-700 via-amber-600 to-emerald-700"></div>

      {/* Main Container */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Academic Header */}
        <header className="text-center mb-10 mt-2">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="text-xs uppercase tracking-widest text-amber-800 font-semibold bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              Estudos Hermenêuticos & Teologia Comparada
            </span>
            <h1 className="mt-4 font-display text-4xl sm:text-5xl font-extrabold tracking-tight text-stone-900">
              H E R M E N Ê U T I C A
            </h1>
            <p className="mt-3 max-w-2xl mx-auto text-base sm:text-lg font-serif italic text-stone-600">
              Buscador comparativo de versículos bíblicos sob as perspectivas Católica, Protestante Reformada, Calvinista, Ortodoxa e Judaica.
            </p>
          </motion.div>
        </header>

        {/* Input & Options Area */}
        <section className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8 max-w-4xl mx-auto mb-10">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch(query);
            }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-stone-400" />
              </div>
              <input
                id="search-input"
                type="text"
                className="block w-full pl-11 pr-4 py-3.5 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-stone-50/50 text-stone-900 placeholder-stone-400 text-base"
                placeholder="Insira um versículo ou passagem (ex: João 1:1, Gênesis 1:1, Romanos 9:15...)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                disabled={loading}
              />
            </div>
            <button
              id="search-button"
              type="submit"
              disabled={loading || !query.trim()}
              className="px-6 py-3.5 bg-stone-950 hover:bg-stone-850 disabled:bg-stone-300 text-stone-100 disabled:text-stone-500 font-medium rounded-xl transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer shadow-sm active:scale-98"
            >
              <Compass className={`h-5 w-5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? "Analisando..." : "Examinar"}
            </button>
          </form>

          {/* Preset Suggestions */}
          <div className="mt-6">
            <h2 className="text-xs uppercase font-semibold tracking-wider text-stone-400 mb-3 flex items-center gap-1">
              <Sparkles className="h-3 w-3 text-amber-600" />
              Sugestões Históricas Debatidas:
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {PRESET_VERSES.map((preset) => (
                <button
                  id={`preset-${preset.id}`}
                  key={preset.id}
                  onClick={() => {
                    setQuery(preset.query);
                    handleSearch(preset.query);
                  }}
                  disabled={loading}
                  className="p-3 text-left border border-stone-200 rounded-xl hover:border-amber-400 hover:bg-amber-50/30 transition-all duration-200 group flex flex-col justify-between h-full bg-stone-50/30 cursor-pointer"
                >
                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="font-serif font-bold text-stone-850 group-hover:text-amber-900 transition-colors">
                        {preset.reference}
                      </span>
                      <span className="text-[10px] bg-stone-200/60 text-stone-700 px-2 py-0.5 rounded font-medium">
                        {preset.category}
                      </span>
                    </div>
                    <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                      {preset.description}
                    </p>
                  </div>
                  <div className="mt-2 text-[11px] text-amber-800 font-semibold flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                    {preset.title}
                    <ChevronRight className="h-3 w-3" />
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* History Tracker */}
          {history.length > 0 && (
            <div className="mt-6 pt-5 border-t border-stone-100 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-stone-400 flex items-center gap-1 mr-2">
                <History className="h-3.5 w-3.5" /> Recentes:
              </span>
              <div className="flex flex-wrap gap-2 flex-grow">
                {history.map((hist, idx) => (
                  <button
                    id={`history-item-${idx}`}
                    key={idx}
                    onClick={() => {
                      setQuery(hist.query);
                      handleSearch(hist.query);
                    }}
                    className="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 px-2.5 py-1 rounded-lg border border-stone-200/50 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <span>{hist.reference}</span>
                    <span className="text-[10px] text-stone-400">({hist.timestamp})</span>
                  </button>
                ))}
              </div>
              <button
                id="clear-history-button"
                onClick={clearHistory}
                className="text-xs text-red-600 hover:text-red-800 underline ml-auto transition-colors cursor-pointer"
              >
                Limpar
              </button>
            </div>
          )}
        </section>

        {/* Loading State */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.section
              key="loader"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              className="max-w-3xl mx-auto p-12 text-center flex flex-col items-center"
            >
              <div className="relative mb-6">
                {/* Book spine animation */}
                <div className="h-16 w-16 text-amber-800 flex items-center justify-center">
                  <BookOpen className="h-12 w-12 animate-pulse text-amber-700" />
                </div>
                <div className="absolute inset-0 border-2 border-amber-600/20 rounded-full animate-ping h-16 w-16"></div>
              </div>
              
              <h3 className="font-display text-lg font-bold text-stone-900 tracking-wide">
                Exame Crítico-Hermenêutico
              </h3>
              
              <div className="h-8 mt-2 overflow-hidden w-full max-w-md">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={loadingStep}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -20, opacity: 0 }}
                    transition={{ duration: 0.4 }}
                    className="text-sm font-serif italic text-stone-600"
                  >
                    {LOADING_STEPS[loadingStep]}
                  </motion.p>
                </AnimatePresence>
              </div>

              {/* Fake progress bar purely for aesthetic satisfaction */}
              <div className="w-64 h-1 bg-stone-200 rounded-full overflow-hidden mt-6">
                <motion.div 
                  className="h-full bg-amber-600"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                ></motion.div>
              </div>
            </motion.section>
          )}

          {/* Error State */}
          {error && !loading && (
            <motion.section
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="max-w-2xl mx-auto p-6 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-4 mb-10"
            >
              <div className="p-2 bg-red-100 rounded-lg text-red-700">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-red-900 text-lg">Erro ao realizar análise teológica</h3>
                <p className="text-red-700 text-sm mt-1 leading-relaxed">{error}</p>
                <button
                  id="retry-button"
                  onClick={() => handleSearch(query)}
                  className="mt-3 px-4 py-1.5 bg-red-700 hover:bg-red-800 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3 w-3" /> Tentar novamente
                </button>
              </div>
            </motion.section>
          )}

          {/* Result Presentation */}
          {result && !loading && !error && (
            <motion.section
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-8"
            >
              {/* Canonical Scripture Card */}
              <div className="bg-[#fcfaf2] border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-sm max-w-4xl mx-auto relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
                  <BookMarked className="h-28 w-28 text-amber-900" />
                </div>
                
                <span className="text-[10px] tracking-widest uppercase font-semibold text-amber-800 bg-amber-100/50 px-2.5 py-1 rounded border border-amber-200/50 inline-block mb-4">
                  Texto Analisado
                </span>
                
                <h2 className="font-display text-2xl sm:text-3xl font-extrabold text-stone-900 mb-4 font-serif">
                  {result.reference}
                </h2>
                
                <blockquote className="border-l-4 border-amber-600 pl-4 sm:pl-6 my-4 italic">
                  <p className="font-serif text-lg sm:text-xl text-stone-850 leading-relaxed font-normal">
                    &ldquo;{result.literalText}&rdquo;
                  </p>
                </blockquote>
              </div>

              {/* Scholar Menu Navigation Tabs */}
              <div className="border-b border-stone-200 flex flex-wrap justify-center gap-1 sm:gap-2 max-w-4xl mx-auto">
                <button
                  id="tab-perspectives"
                  onClick={() => setActiveTab("perspectives")}
                  className={`px-4 py-2.5 font-medium text-sm transition-all relative ${
                    activeTab === "perspectives" 
                      ? "text-amber-800 font-bold" 
                      : "text-stone-500 hover:text-stone-900"
                  } cursor-pointer`}
                >
                  <span className="flex items-center gap-1.5">
                    <Book className="h-4 w-4" /> As 5 Tradições
                  </span>
                  {activeTab === "perspectives" && (
                    <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-800" />
                  )}
                </button>

                <button
                  id="tab-compare"
                  onClick={() => setActiveTab("compare")}
                  className={`px-4 py-2.5 font-medium text-sm transition-all relative ${
                    activeTab === "compare" 
                      ? "text-amber-800 font-bold" 
                      : "text-stone-500 hover:text-stone-900"
                  } cursor-pointer`}
                >
                  <span className="flex items-center gap-1.5">
                    <ArrowLeftRight className="h-4 w-4" /> Comparador Lado a Lado
                  </span>
                  {activeTab === "compare" && (
                    <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-800" />
                  )}
                </button>

                <button
                  id="tab-historical"
                  onClick={() => setActiveTab("historical")}
                  className={`px-4 py-2.5 font-medium text-sm transition-all relative ${
                    activeTab === "historical" 
                      ? "text-amber-800 font-bold" 
                      : "text-stone-500 hover:text-stone-900"
                  } cursor-pointer`}
                >
                  <span className="flex items-center gap-1.5">
                    <History className="h-4 w-4" /> Contexto Histórico-Literário
                  </span>
                  {activeTab === "historical" && (
                    <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-800" />
                  )}
                </button>

                <button
                  id="tab-synthesis"
                  onClick={() => setActiveTab("synthesis")}
                  className={`px-4 py-2.5 font-medium text-sm transition-all relative ${
                    activeTab === "synthesis" 
                      ? "text-amber-800 font-bold" 
                      : "text-stone-500 hover:text-stone-900"
                  } cursor-pointer`}
                >
                  <span className="flex items-center gap-1.5">
                    <ArrowLeftRight className="h-4 w-4" /> Convergências, Conflitos & Acadêmica
                  </span>
                  {activeTab === "synthesis" && (
                    <motion.div layoutId="activeTabUnderline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-800" />
                  )}
                </button>
              </div>

              {/* Dynamic Tab Contents */}
              <div className="mt-8">
                
                {/* 1. As 5 Perspectivas */}
                {activeTab === "perspectives" && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="space-y-6"
                  >
                    <div className="text-center max-w-2xl mx-auto mb-6">
                      <h3 className="font-display text-xl font-bold text-stone-900">
                        Hermenêutica Confessional
                      </h3>
                      <p className="text-sm text-stone-500 mt-1">
                        Cada tradição interpreta e desdobra o texto com base em seus axiomas e dogmas específicos.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {Object.entries(result.perspectives).map(([key, rawData]) => {
                        const data = rawData as PerspectiveData;
                        const meta = getTraditionMeta(key);
                        const IconComponent = meta.icon;
                        return (
                          <div 
                            key={key}
                            className={`bg-white rounded-2xl border ${meta.accentBorder} shadow-sm overflow-hidden flex flex-col justify-between`}
                          >
                            {/* Card Header */}
                            <div className={`p-4 bg-gradient-to-r ${meta.gradient} border-b border-stone-200 flex items-center justify-between`}>
                              <div className="flex items-center gap-2.5">
                                <span className={`p-1.5 rounded-lg bg-white shadow-sm border ${meta.accentBorder}`}>
                                  <IconComponent className={`h-5 w-5 ${meta.iconColor}`} />
                                </span>
                                <h4 className="font-display font-bold text-stone-900 text-base">
                                  {meta.title}
                                </h4>
                              </div>
                              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${meta.colorClass}`}>
                                {data.keyFocus}
                              </span>
                            </div>

                            {/* Card Body */}
                            <div className="p-6 space-y-4 flex-grow">
                              <div>
                                <h5 className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1 flex items-center gap-1">
                                  <span>Principais Exponentes</span>
                                </h5>
                                <div className="flex flex-wrap gap-1.5">
                                  {data.theologians.map((t, i) => (
                                    <span key={i} className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-200">
                                      {t}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              <div>
                                <h5 className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                                  Interpretação e Hermenêutica
                                </h5>
                                <p className="font-serif text-sm text-stone-850 leading-relaxed text-justify">
                                  {data.interpretation}
                                </p>
                              </div>

                              <div className="pt-3 border-t border-stone-100">
                                <h5 className="text-[11px] font-bold uppercase tracking-wider text-stone-400 mb-1">
                                  Desenvolvimento e História
                                </h5>
                                <p className="text-xs text-stone-500 leading-relaxed text-justify">
                                  {data.historicalEvolution}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* 2. Comparador Lado a Lado */}
                {activeTab === "compare" && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="max-w-6xl mx-auto space-y-6"
                  >
                    <div className="text-center max-w-2xl mx-auto mb-6">
                      <h3 className="font-display text-xl font-bold text-stone-900">
                        Comparador Inter-Hermenêutico
                      </h3>
                      <p className="text-sm text-stone-500 mt-1">
                        Selecione duas tradições para analisar as divergências, eixos e ênfases paralelas sob o mesmo texto.
                      </p>
                    </div>

                    {/* Selector Panel */}
                    <div className="bg-[#f5f2eb] rounded-xl p-4 border border-stone-200 flex flex-wrap items-center justify-center gap-4">
                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold uppercase text-stone-500">Esquerda:</label>
                        <select 
                          value={compareLeft}
                          onChange={(e) => setCompareLeft(e.target.value as any)}
                          className="bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-sm font-medium focus:ring-1 focus:ring-amber-500 text-stone-900"
                        >
                          {Object.keys(result.perspectives).map((k) => (
                            <option key={k} value={k} disabled={k === compareRight}>{getTraditionMeta(k).title}</option>
                          ))}
                        </select>
                      </div>

                      <div className="text-stone-400 font-bold">VS</div>

                      <div className="flex items-center gap-2">
                        <label className="text-xs font-semibold uppercase text-stone-500">Direita:</label>
                        <select 
                          value={compareRight}
                          onChange={(e) => setCompareRight(e.target.value as any)}
                          className="bg-white border border-stone-300 rounded-lg px-2.5 py-1 text-sm font-medium focus:ring-1 focus:ring-amber-500 text-stone-900"
                        >
                          {Object.keys(result.perspectives).map((k) => (
                            <option key={k} value={k} disabled={k === compareLeft}>{getTraditionMeta(k).title}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Compare Split Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Left Column */}
                      {[compareLeft, compareRight].map((key, index) => {
                        const meta = getTraditionMeta(key);
                        const perspective = result.perspectives[key];
                        const IconComp = meta.icon;
                        return (
                          <div key={key} className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden flex flex-col justify-between">
                            <div className={`p-4 bg-gradient-to-r ${meta.gradient} border-b border-stone-200 flex items-center justify-between`}>
                              <div className="flex items-center gap-2">
                                <IconComp className={`h-5 w-5 ${meta.iconColor}`} />
                                <span className="font-display font-bold text-stone-900">{meta.title}</span>
                              </div>
                              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900">{perspective.keyFocus}</span>
                            </div>

                            <div className="p-6 space-y-4">
                              <div>
                                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">Teólogos Referência</span>
                                <div className="flex flex-wrap gap-1">
                                  {perspective.theologians.map((t, idx) => (
                                    <span key={idx} className="text-xs bg-stone-100 text-stone-700 px-2 py-0.5 rounded border border-stone-200">{t}</span>
                                  ))}
                                </div>
                              </div>

                              <div className="space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Tese Teológica</span>
                                <p className="font-serif text-sm text-stone-850 leading-relaxed text-justify">{perspective.interpretation}</p>
                              </div>

                              <div className="pt-3 border-t border-stone-100 space-y-1">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">Inserção Histórica</span>
                                <p className="text-xs text-stone-500 leading-relaxed text-justify">{perspective.historicalEvolution}</p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}

                {/* 3. Contexto Histórico-Literário */}
                {activeTab === "historical" && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="max-w-4xl mx-auto bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8"
                  >
                    <div className="flex items-center gap-2 mb-4 border-b border-stone-100 pb-4">
                      <div className="p-1.5 bg-amber-50 rounded-lg text-amber-800 border border-amber-200">
                        <History className="h-5 w-5" />
                      </div>
                      <h3 className="font-display text-lg font-bold text-stone-900">
                        Sitz im Leben (Lugar na Vida) & Contexto Geral
                      </h3>
                    </div>

                    <p className="font-serif text-base text-stone-800 leading-relaxed text-justify whitespace-pre-wrap">
                      {result.historicalContext}
                    </p>

                    <div className="mt-6 p-4 bg-stone-50 rounded-xl border border-stone-200 flex items-start gap-3">
                      <Info className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
                      <div className="text-xs text-stone-600 leading-relaxed">
                        <strong>Dica Acadêmica:</strong> O estudo hermenêutico requer entender as intenções do autor, as condições políticas da época (como a dominação assíria, babilônica ou o Império Romano) e a tradição literária na qual o texto foi compilado.
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* 4. Convergências, Conflitos & Acadêmica */}
                {activeTab === "synthesis" && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="max-w-4xl mx-auto space-y-6"
                  >
                    {/* Agreements Card */}
                    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8">
                      <div className="flex items-center gap-2 mb-4 border-b border-emerald-100 pb-4">
                        <div className="p-1.5 bg-emerald-50 rounded-lg text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="h-5 w-5" />
                        </div>
                        <h3 className="font-display text-lg font-bold text-stone-900">
                          Pontos de Convergência Teológica ou Ética
                        </h3>
                      </div>
                      <p className="font-serif text-sm text-stone-850 leading-relaxed text-justify">
                        {result.convergence}
                      </p>
                    </div>

                    {/* Disagreements Card */}
                    <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 sm:p-8">
                      <div className="flex items-center gap-2 mb-4 border-b border-red-100 pb-4">
                        <div className="p-1.5 bg-red-50 rounded-lg text-red-800 border border-red-200">
                          <AlertTriangle className="h-5 w-5" />
                        </div>
                        <h3 className="font-display text-lg font-bold text-stone-900">
                          Divergências Teológicas Críticas
                        </h3>
                      </div>
                      <p className="font-serif text-sm text-stone-850 leading-relaxed text-justify">
                        {result.divergence}
                      </p>
                    </div>

                    {/* Secular View Card */}
                    <div className="bg-stone-950 text-stone-200 rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden border border-stone-850">
                      <div className="absolute top-0 right-0 p-3 opacity-5 pointer-events-none">
                        <Compass className="h-32 w-32 text-stone-100" />
                      </div>
                      
                      <div className="flex items-center gap-2 mb-4 border-b border-stone-800 pb-4">
                        <div className="p-1.5 bg-stone-800 rounded-lg text-stone-200 border border-stone-700">
                          <BookOpen className="h-5 w-5" />
                        </div>
                        <h3 className="font-display text-lg font-bold text-stone-100">
                          Crítica Textual & Perspectiva Histórica Secular
                        </h3>
                      </div>
                      
                      <p className="font-serif text-sm text-stone-300 leading-relaxed text-justify">
                        {result.secularHistorianView}
                      </p>
                    </div>
                  </motion.div>
                )}

              </div>
            </motion.section>
          )}
        </AnimatePresence>

      </main>

      {/* Footer */}
      <footer className="bg-stone-100 border-t border-stone-200 py-8 text-center text-xs text-stone-500 mt-12">
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <p className="font-display font-semibold text-stone-700">Hermeneutica</p>
          <p className="leading-relaxed max-w-xl mx-auto">
            Análises e exegeses históricas geradas de forma dinâmica e integrativa. Destinado ao estudo acadêmico, ecumênico, filosófico e comparativo das religiões e escrituras.
          </p>
          <p className="text-[10px] text-stone-400 pt-2">&copy; {new Date().getFullYear()} Hermeneutica Teológica Comparada.</p>
        </div>
      </footer>
    </div>
  );
}
