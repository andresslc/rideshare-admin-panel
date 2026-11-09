export function linkedUserType(search) {
  const type = new URLSearchParams(search).get("type");
  return ["rider", "driver"].includes(type) ? type : undefined;
}

export function linkedReportStatus(search) {
  const params = new URLSearchParams(search);
  const status = params.get("status");
  return params.has("status") && ["", "pending", "resolved"].includes(status) ? status : undefined;
}

export function linkedRevenueTab(search) {
  const tab = new URLSearchParams(search).get("tab");
  return ["subscription", "withdrawal"].includes(tab) ? tab : undefined;
}
