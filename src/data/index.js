export const USERS = {
  admin:   { password: "admin123", role: "admin", name: "Admin" },
  manager: { password: "manager123", role: "manager", name: "Manager" },
};

// Pre-generate 50 unassigned cards LM-001 to LM-050
const generateUnassignedCards = () => {
  const cards = [];
  for (let i = 1; i <= 50; i++) {
    cards.push({
      id: `LM-${String(i).padStart(3, "0")}`,
      name: null,
      phone: null,
      assigned: false,
      washes: 0,
      totalSpent: 0,
      history: [],
      createdAt: null,
    });
  }
  return cards;
};

export const INITIAL_CUSTOMERS = generateUnassignedCards();

export const today = () => new Date().toISOString().split("T")[0];

export const fmtDate = (d) =>
  new Date(d).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

export const nextId = (customers) => {
  const nums = customers
    .map((c) => parseInt(c.id.replace("LM-", "")))
    .filter(Boolean);
  return `LM-${String(Math.max(0, ...nums) + 1).padStart(3, "0")}`;
};