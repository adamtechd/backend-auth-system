import { RoutePlanRow, RouteData, Technician, Vehicle } from '../types';
import { EMPTY_WEEKLY_DATA } from '../constants';
import moment from 'moment';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';

// Tipagem para o jspdf-autotable, já que ele extende o jsPDF
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

const getTechnicianNames = (ids: string[], technicians: Technician[]): string => {
  if (!ids || ids.length === 0) return '';
  return ids.map(id => technicians.find(t => t.id === id)?.name || id).join('\n');
};

const getVehicleName = (id: string, vehicles: Vehicle[]): string => vehicles.find(v => v.id === id)?.name || '';

const getDailyAssignment = (route: RouteData, dateKey: string, technicians: Technician[]): string => {
  const assignment = route.assignments[dateKey];
  return assignment ? getTechnicianNames(assignment.technicianIds, technicians) : '';
};

export const exportToPdf = (plan: RoutePlanRow[], technicians: Technician[], vehicles: Vehicle[], currentWeek: moment.Moment, mapName: string): void => {
  const doc = new jsPDF({ orientation: 'landscape' }) as jsPDFWithAutoTable;

  doc.text(`Mapa de Rotas - ${mapName}`, 14, 16);
  doc.setFontSize(10);

  const startOfWeek = currentWeek.clone().startOf('isoWeek');
  const endOfWeek = startOfWeek.clone().add(4, 'days');
  const title = `Período: ${startOfWeek.format('DD/MM/YYYY')} a ${endOfWeek.format('DD/MM/YYYY')}`;

  doc.text(title, 14, 22);

  const tableColumn = ["ROTA", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "PADRÃO / FERRAMENTAS", "CARRO", "META", "OBSERVAÇÃO"];
  const tableRows: any[][] = [];
  const weekDates = Array.from({ length: 5 }, (_, i) => currentWeek.clone().startOf('isoWeek').add(i, 'days').format('YYYY-MM-DD'));
  const weekKey = currentWeek.format('YYYY-WW');

  plan.forEach(row => {
    if (row.type === 'group') {
      tableRows.push([{ content: row.name, colSpan: tableColumn.length, styles: { fontStyle: 'bold', fillColor: [226, 232, 240], textColor: [20, 20, 20] } }]);
    } else {
      const routeRow: RouteData = row;
      const weeklyData = routeRow.weeklyData?.[weekKey] || EMPTY_WEEKLY_DATA;
      const rowData = [
        routeRow.name,
        ...weekDates.map(dateKey => getDailyAssignment(routeRow, dateKey, technicians)),
        weeklyData.tools || '',
        getVehicleName(weeklyData.vehicleId || '', vehicles),
        weeklyData.meta || '',
        weeklyData.notes || ''
      ];
      tableRows.push(rowData);
    }
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 30,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59] },
    styles: { fontSize: 8, cellPadding: 2, halign: 'center', valign: 'middle' },
  });

  doc.save(`mapa_de_rotas_${mapName.toLowerCase().replace(' ', '_')}_${currentWeek.format('YYYY-WW')}.pdf`);
};

export const exportToXlsx = (plan: RoutePlanRow[], technicians: Technician[], vehicles: Vehicle[], currentWeek: moment.Moment, mapName: string): void => {
    const header = ["ROTA / GRUPO", "SEGUNDA", "TERÇA", "QUARTA", "QUINTA", "SEXTA", "PADRÃO / FERRAMENTAS / INSUMOS", "CARRO", "META PCE", "OBSERVAÇÃO"];
    const weekDates = Array.from({ length: 5 }, (_, i) => currentWeek.clone().startOf('isoWeek').add(i, 'days').format('YYYY-MM-DD'));
    const weekKey = currentWeek.format('YYYY-WW');
  
    const worksheetData = plan.map(row => {
      if (row.type === 'group') {
        return { "ROTA / GRUPO": row.name };
      }
      const routeRow: RouteData = row;
      const weeklyData = routeRow.weeklyData?.[weekKey] || EMPTY_WEEKLY_DATA;
      return {
        "ROTA / GRUPO": routeRow.name,
        "SEGUNDA": getDailyAssignment(routeRow, weekDates[0], technicians),
        "TERÇA": getDailyAssignment(routeRow, weekDates[1], technicians),
        "QUARTA": getDailyAssignment(routeRow, weekDates[2], technicians),
        "QUINTA": getDailyAssignment(routeRow, weekDates[3], technicians),
        "SEXTA": getDailyAssignment(routeRow, weekDates[4], technicians),
        "PADRÃO / FERRAMENTAS / INSUMOS": weeklyData.tools || '',
        "CARRO": getVehicleName(weeklyData.vehicleId || '', vehicles),
        "META PCE": weeklyData.meta || '',
        "OBSERVAÇÃO": weeklyData.notes || '',
      };
    });
  
    const worksheet = XLSX.utils.json_to_sheet(worksheetData, { header });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Mapa de Rotas');
    XLSX.writeFile(workbook, `mapa_de_rotas_${mapName.toLowerCase().replace(' ', '_')}_${currentWeek.format('YYYY-WW')}.xlsx`);
};

export const exportMonthlyAsImage = (element: HTMLElement | null): void => {
    if (!element) return;
    html2canvas(element).then(canvas => {
        const link = document.createElement('a');
        link.download = 'mapa-mensal.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    });
};