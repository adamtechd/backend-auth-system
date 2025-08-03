import React, { useState, useEffect, useRef } from 'react';
import { PlansData, RoutePlanRow, RouteData, Technician, Vehicle } from './types';
import { TECHNICIANS, VEHICLES, INITIAL_PLANS } from './constants';
import { loadPlans, savePlans, loadTechnicians, saveTechnicians, loadVehicles, saveVehicles } from './services/storageService';
import {
  exportToPdf,
  exportToXlsx,
  exportMonthlyAsImage,
  exportMonthlyToPdfFromImage,
  exportMonthlyToXlsx,
  exportAnnualToPdf,
  exportAnnualToXlsx
} from './services/exportService';
import RouteMapView from './components/WeeklyView';
import MonthlyCalendarView from './components/MonthlyCalendarView';
import AnnualView from './components/AnnualView';
import RouteEditModal from './components/AppointmentModal';
import SettingsModal from './components/SettingsModal';
import LoginView from './components/LoginView';
import { useAuth } from './components/AuthContext';
import { PlusIcon } from './components/icons/PlusIcon';
import { PdfIcon } from './components/icons/PdfIcon';
import { ExcelIcon } from './components/icons/ExcelIcon';
import { SettingsIcon } from './components/icons/SettingsIcon';
import { SaveIcon } from './components/icons/SaveIcon';
import { DownloadIcon } from './components/icons/DownloadIcon';
import { LogoutIcon } from './components/icons/LogoutIcon';
import moment from 'moment';
import 'moment/locale/pt-br';

// NOVOS COMPONENTES IMPORTADOS
import UserManagementModal from './components/UserManagementModal';
import ChatPanel from './components/ChatPanel';


moment.locale('pt-br');

const MAP_NAMES: { [key: string]: string } = {
  'MG': 'Minas Gerais',
  'ES': 'Espirito Santo',
};

type ViewMode = 'weekly' | 'monthly' | 'yearly';
type SaveStatus = 'idle' | 'saving' | 'saved';

interface MonthlyViewSettings {
  expandDays: boolean;
  hideEmptyWeeks: boolean;
}

const App: React.FC = () => {
  const { user, logout } = useAuth();
  const [plans, setPlans] = useState<PlansData>({});
  const [activeMapKey, setActiveMapKey] = useState<string>('MG');

  const [technicians, setTechnicians] = useState<Technician[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [isRouteModalOpen, setIsRouteModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');

  // --- NOVOS ESTADOS PARA AS NOVAS FUNÇÕES ---
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  // --- FIM DOS NOVOS ESTADOS ---

  const [editingRoute, setEditingRoute] = useState<RouteData | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('weekly');
  const [currentDate, setCurrentDate] = useState(moment());
  const [hideEmptyRows, setHideEmptyRows] = useState(false);

  const [monthlyViewSettings, setMonthlyViewSettings] = useState<MonthlyViewSettings>({
    expandDays: false,
    hideEmptyWeeks: false
  });
  
  const monthlyCalendarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const loadedPlans = loadPlans();
    setPlans(Object.keys(loadedPlans).length > 0 ? loadedPlans : INITIAL_PLANS);

    const loadedTechs = loadTechnicians();
    setTechnicians(loadedTechs.length > 0 ? loadedTechs : TECHNICIANS);

    const loadedVehicles = loadVehicles();
    setVehicles(loadedVehicles.length > 0 ? loadedVehicles : VEHICLES);
  }, []);

  const activePlan = plans[activeMapKey] || [];
  const activeMapName = MAP_NAMES[activeMapKey] || 'Mapa';

  const handleSaveActivePlan = (updatedPlan: RoutePlanRow[]) => {
    const updatedPlans = { ...plans, [activeMapKey]: updatedPlan };
    setPlans(updatedPlans);
    savePlans(updatedPlans);
  };
  
  // ... (O restante das suas funções handleSave, handleEdit, etc. continua aqui sem alterações)
  const handleSaveAllPlans = (updatedPlans: PlansData) => { setPlans(updatedPlans); savePlans(updatedPlans); };
  const handleSaveTechnicians = (updatedTechnicians: Technician[]) => { setTechnicians(updatedTechnicians); saveTechnicians(updatedTechnicians); };
  const handleSaveVehicles = (updatedVehicles: Vehicle[]) => { setVehicles(updatedVehicles); saveVehicles(updatedVehicles); };
  const handleSaveAllData = () => { /* ... */ };
  const handleEditRoute = (route: RouteData) => { if (user?.role !== 'admin') return; setEditingRoute(route); setIsRouteModalOpen(true); };
  const handleCloseModal = () => { setIsRouteModalOpen(false); setEditingRoute(null); };
  const handleSaveRoute = (routeData: RouteData) => { if (user?.role !== 'admin') return; const updatedPlan = activePlan.map(row => row.id === routeData.id ? routeData : row); handleSaveActivePlan(updatedPlan); handleCloseModal(); };
  const handleClearRouteInModal = (routeId: string) => { if (user?.role !== 'admin') return; handleClearRouteData(routeId); handleCloseModal(); };
  const handleAddNewRouteInGroup = (groupId: string) => { /* ... */ };
  const handleAddGroup = () => { /* ... */ };
  const handleDeleteRow = (rowId: string) => { /* ... */ };
  const handleClearRouteData = (routeId: string) => { /* ... */ };
  const handleClearDayAssignment = (routeId: string, dateKey: string) => { /* ... */ };
  const handlePrevPeriod = () => { /* ... */ };
  const handleNextPeriod = () => { /* ... */ };
  const renderPeriodText = () => { /* ... */ };
  const getFilteredPlan = () => { /* ... */ return activePlan; };
  const displayedPlan = getFilteredPlan();
  const renderActionButtons = () => { /* ... */ };

  if (!user) {
    return <LoginView />;
  }

  return (
    <div className="bg-slate-100 min-h-screen font-sans">
      <div className="max-w-full mx-auto p-4 sm:p-6 lg:p-8">
        <header className="mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center gap-4">
              <h1 className="text-3xl font-bold text-slate-900">{activeMapName}</h1>
              <span className="px-2 py-1 text-xs font-semibold text-indigo-800 bg-indigo-100 rounded-full">{user.role}</span>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {/* ... seus botões de ação ... */}
              {user.role === 'admin' &&
                <>
                  {/* --- NOVO BOTÃO DE GERENCIAR USUÁRIOS --- */}
                  <button onClick={() => setIsUserModalOpen(true)} className="flex items-center gap-2 bg-white text-slate-700 font-semibold py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors shadow border border-slate-200">
                    <span className="hidden sm:inline">Gerenciar Usuários</span>
                  </button>
                  <button onClick={() => setIsSettingsModalOpen(true)} className="flex items-center gap-2 bg-white text-slate-700 font-semibold py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors shadow border border-slate-200">
                    <SettingsIcon /> <span className="hidden sm:inline">Config.</span>
                  </button>
                </>
              }
               <button onClick={logout} className="flex items-center gap-2 bg-white text-slate-700 font-semibold py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors shadow border border-slate-200">
                  <LogoutIcon /> <span className="hidden sm:inline">Sair</span>
                </button>
            </div>
          </div>

          <div className="mt-4 border-b border-slate-300">
            {/* ... sua navegação de mapas ... */}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="flex items-center bg-white p-1 rounded-lg shadow-sm border border-slate-200">
              {/* ... seu seletor de período ... */}
            </div>

            <div className="flex items-center gap-4">
                {/* --- NOVO BOTÃO DO CHAT --- */}
                <button onClick={() => setIsChatOpen(true)} className="flex items-center gap-2 bg-blue-500 text-white font-semibold py-2 px-3 rounded-lg hover:bg-blue-600 transition-colors shadow">
                    <span className="hidden sm:inline">Chat da Semana</span>
                </button>
                {/* --- FIM DO NOVO BOTÃO DO CHAT --- */}
                <div className="flex items-center bg-white p-1 rounded-lg shadow-sm border border-slate-200">
                    {/* ... seu seletor de visualização (semanal, mensal, anual) ... */}
                </div>
            </div>
          </div>
        </header>

        <main>
          {/* ... sua lógica de visualização ... */}
          {viewMode === 'weekly' && <RouteMapView plan={displayedPlan} technicians={technicians} vehicles={vehicles} currentDate={currentDate} onEditRoute={handleEditRoute} onDeleteRow={handleDeleteRow} onAddNewRouteInGroup={handleAddNewRouteInGroup} onClearDayAssignment={handleClearDayAssignment} userRole={user.role} />}
          {viewMode === 'monthly' && <MonthlyCalendarView ref={monthlyCalendarRef} plan={activePlan} technicians={technicians} currentDate={currentDate} settings={monthlyViewSettings} mapName={activeMapName} />}
          {viewMode === 'yearly' && <AnnualView plan={activePlan} currentDate={currentDate} technicians={technicians} />}
        </main>
      </div>
      
      {/* --- RENDERIZAÇÃO DOS NOVOS MODAIS/PAINÉIS --- */}
      {user.role === 'admin' && (
        <>
            <RouteEditModal isOpen={isRouteModalOpen} onClose={handleCloseModal} onSave={handleSaveRoute} onClearRoute={handleClearRouteInModal} routeData={editingRoute} technicians={technicians} vehicles={vehicles} currentDate={currentDate} />
            <SettingsModal isOpen={isSettingsModalOpen} onClose={() => setIsSettingsModalOpen(false)} plan={activePlan} onSavePlan={handleSaveActivePlan} technicians={technicians} onSaveTechnicians={handleSaveTechnicians} vehicles={vehicles} onSaveVehicles={handleSaveVehicles} />
            
            {/* Modal de Gerenciamento de Usuários */}
            <UserManagementModal isOpen={isUserModalOpen} onClose={() => setIsUserModalOpen(false)} />
        </>
      )}

      {/* Painel de Chat */}
      <ChatPanel 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)}
        weekId={currentDate.format('YYYY-[W]WW')} // Passa o ID da semana atual para o chat
      />
      {/* --- FIM DA RENDERIZAÇÃO --- */}

    </div>
  );
};

export default App;
