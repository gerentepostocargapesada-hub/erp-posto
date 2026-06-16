import { useState } from "react";
import { Fuel, Package } from "lucide-react";
import GestaoOperacoes from "./pages/GestaoOperacoes";
import ControleEstoque from "./pages/ControleEstoque";

type Tab = "gestao" | "estoque";

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("estoque");

  return (
    <div className="min-h-screen bg-[#10131a] text-[#e1e2ec] font-['Inter',sans-serif]">
      {/* Top Bar with Tabs */}
      <header className="h-[58px] bg-[#10131a] border-b border-[#262a31] flex items-center justify-between px-6 sticky top-0 z-50">
        <div className="flex items-center gap-1">
          <span className="font-extrabold text-[16px] text-white tracking-[-0.4px]">
            FuelOps
          </span>
          <span className="font-semibold text-[16px] text-[#00a572] tracking-[-0.4px]">
            Pro
          </span>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 h-full">
          <button
            onClick={() => setActiveTab("gestao")}
            className={`flex items-center gap-2 px-5 h-full text-[12px] font-semibold tracking-[0.06em] uppercase border-b-2 transition-all duration-200 ${
              activeTab === "gestao"
                ? "border-[#00a572] text-white"
                : "border-transparent text-[#6b7280] hover:text-[#9ca3af]"
            }`}
          >
            <Fuel size={15} strokeWidth={2} />
            Gestão de Operações
          </button>
          <button
            onClick={() => setActiveTab("estoque")}
            className={`flex items-center gap-2 px-5 h-full text-[12px] font-semibold tracking-[0.06em] uppercase border-b-2 transition-all duration-200 ${
              activeTab === "estoque"
                ? "border-[#00a572] text-white"
                : "border-transparent text-[#6b7280] hover:text-[#9ca3af]"
            }`}
          >
            <Package size={15} strokeWidth={2} />
            Controle de Estoque
          </button>
        </nav>

        <div className="flex items-center gap-3">
          <span className="text-[10px] font-['JetBrains_Mono',monospace] text-[#6b7280]">
            {new Date().toLocaleDateString("pt-BR")}
          </span>
        </div>
      </header>

      {/* Tab Content */}
      <div className="w-full">
        {activeTab === "gestao" && <GestaoOperacoes />}
        {activeTab === "estoque" && <ControleEstoque />}
      </div>
    </div>
  );
}

export default App;
