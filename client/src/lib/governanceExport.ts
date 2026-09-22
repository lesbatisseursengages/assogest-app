export interface GovernanceAssemblyExport {
  title: string;
  status: string;
  scheduledAt: string | Date | null;
  minutes: string | null;
  participantCount: number;
  presentCount: number;
  voteCount: number;
  quorum: { attendancePercentage: number; requiredPercentage: number; reached: boolean };
  resolutionSummaries: Array<{ title: string; status: string; for: number; against: number; abstain: number; total: number }>;
}

function addWrappedText(document: any, text: string, x: number, y: number, maxWidth: number, lineHeight = 5) {
  const lines = document.splitTextToSize(text || "—", maxWidth) as string[];
  document.text(lines, x, y);
  return y + lines.length * lineHeight;
}

export async function createGovernanceAssemblyPdf(assembly: GovernanceAssemblyExport): Promise<Uint8Array> {
  const { jsPDF } = await import("jspdf");
  const document = new jsPDF({ orientation: "portrait", unit: "mm" });
  const margin = 16;
  const pageWidth = document.internal.pageSize.getWidth();
  const pageHeight = document.internal.pageSize.getHeight();
  let y = 18;
  const ensureSpace = (height: number) => {
    if (y + height > pageHeight - margin) {
      document.addPage();
      y = margin;
    }
  };

  document.setTextColor(26, 77, 46);
  document.setFont("helvetica", "bold");
  document.setFontSize(17);
  y = addWrappedText(document, "Procès-verbal et résultats de vote", margin, y, pageWidth - margin * 2, 7);
  y += 4;
  document.setFontSize(13);
  y = addWrappedText(document, assembly.title, margin, y, pageWidth - margin * 2, 6);
  document.setFont("helvetica", "normal");
  document.setTextColor(85, 85, 85);
  document.setFontSize(9);
  y += 2;
  y = addWrappedText(document, `Séance : ${assembly.scheduledAt ? new Date(assembly.scheduledAt).toLocaleString("fr-FR") : "Date non définie"} · Statut : ${assembly.status}`, margin, y, pageWidth - margin * 2, 4);
  y += 5;

  ensureSpace(30);
  document.setFillColor(241, 247, 243);
  document.roundedRect(margin, y, pageWidth - margin * 2, 24, 3, 3, "F");
  document.setTextColor(35, 35, 35);
  document.setFontSize(9);
  document.text(`Participants : ${assembly.presentCount}/${assembly.participantCount}`, margin + 5, y + 8);
  document.text(`Quorum : ${assembly.quorum.attendancePercentage}% / ${assembly.quorum.requiredPercentage}%`, margin + 5, y + 15);
  document.text(`Votes enregistrés : ${assembly.voteCount}`, pageWidth / 2 + 5, y + 8);
  document.text(assembly.quorum.reached ? "Quorum atteint" : "Quorum non atteint", pageWidth / 2 + 5, y + 15);
  y += 34;

  document.setTextColor(26, 77, 46);
  document.setFont("helvetica", "bold");
  document.setFontSize(11);
  document.text("Résolutions et résultats", margin, y);
  y += 7;
  for (const resolution of assembly.resolutionSummaries) {
    ensureSpace(26);
    document.setFillColor(248, 250, 249);
    document.roundedRect(margin, y, pageWidth - margin * 2, 20, 2, 2, "F");
    document.setTextColor(35, 35, 35);
    document.setFont("helvetica", "bold");
    document.setFontSize(9);
    y = addWrappedText(document, resolution.title, margin + 4, y + 6, pageWidth - margin * 2 - 8, 4);
    document.setFont("helvetica", "normal");
    document.setTextColor(85, 85, 85);
    document.setFontSize(8);
    document.text(`Pour : ${resolution.for} · Contre : ${resolution.against} · Abstention : ${resolution.abstain} · Total : ${resolution.total}`, margin + 4, y + 2);
    y += 11;
  }

  ensureSpace(35);
  y += 4;
  document.setTextColor(26, 77, 46);
  document.setFont("helvetica", "bold");
  document.setFontSize(11);
  document.text("Procès-verbal", margin, y);
  y += 7;
  document.setTextColor(55, 55, 55);
  document.setFont("helvetica", "normal");
  document.setFontSize(9);
  y = addWrappedText(document, assembly.minutes || "Aucun procès-verbal n’a encore été renseigné.", margin, y, pageWidth - margin * 2, 5);
  y += 10;
  document.setFontSize(8);
  document.setTextColor(120, 120, 120);
  document.text(`Document généré le ${new Date().toLocaleString("fr-FR")} — Les Bâtisseurs Engagés`, margin, Math.min(y, pageHeight - 10));
  return new Uint8Array(document.output("arraybuffer") as ArrayBuffer);
}

export async function exportGovernanceAssemblyPdf(assembly: GovernanceAssemblyExport): Promise<void> {
  const bytes = await createGovernanceAssemblyPdf(assembly);
  const filename = `proces-verbal-${assembly.title.toLowerCase().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "")}.pdf`;
  const url = URL.createObjectURL(new Blob([bytes.buffer as ArrayBuffer], { type: "application/pdf" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
