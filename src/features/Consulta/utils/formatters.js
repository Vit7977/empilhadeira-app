/**
 * Formata CPF para o padrão 000.000.000-00
 */
export const formatCPF = (cpf) => {
  if (!cpf) return "-";
  const cleaned = String(cpf).replace(/\D/g, "");
  if (cleaned.length !== 11) return cpf;
  return cleaned.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

/**
 * Formata telefone para o padrão (00) 0000-0000 ou (00) 00000-0000
 */
export const formatPhone = (phone) => {
  if (!phone) return "-";
  const cleaned = String(phone).replace(/\D/g, "");
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }
  return phone;
};

/**
 * Formata data no formato DD/MM/AAAA
 */
export const formatDate = (dateString) => {
  if (!dateString) return "-";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) {
      // Tenta parse de string no formato YYYY-MM-DD
      const parts = String(dateString).split("-");
      if (parts.length === 3) {
        return `${parts[2].slice(0, 2)}/${parts[1]}/${parts[0]}`;
      }
      return dateString;
    }
    return d.toLocaleDateString("pt-BR", { timeZone: "UTC" });
  } catch {
    return dateString;
  }
};

/**
 * Formata data e hora no formato DD/MM/AAAA HH:mm:ss
 */
export const formatDateTime = (dateString) => {
  if (!dateString) return "-";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch {
    return dateString;
  }
};

