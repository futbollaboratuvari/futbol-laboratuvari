const { requireEnv } = require("./http");

function config() {
  return {
    url: requireEnv("SUPABASE_URL").replace(/\/$/, ""),
    serviceKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
  };
}

async function request(path, options = {}) {
  const { url, serviceKey } = config();
  const response = await fetch(`${url}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: serviceKey,
      Authorization: `Bearer ${serviceKey}`,
      "Content-Type": "application/json",
      Prefer: options.prefer || "return=representation",
      ...(options.headers || {}),
    },
  });

  const raw = await response.text();
  let data = null;
  if (raw) {
    try { data = JSON.parse(raw); } catch { data = raw; }
  }

  if (!response.ok) {
    const error = new Error(`Supabase request failed (${response.status})`);
    error.status = response.status;
    error.details = data;
    throw error;
  }
  return data;
}

function queryString(filters = {}, extra = {}) {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null) params.set(key, `eq.${value}`);
  });
  Object.entries(extra).forEach(([key, value]) => {
    if (value !== undefined && value !== null) params.set(key, String(value));
  });
  return params.toString();
}

async function insertOne(table, payload) {
  const data = await request(table, {
    method: "POST",
    body: JSON.stringify(payload),
  });
  return Array.isArray(data) ? data[0] : data;
}

async function selectOne(table, filters, select = "*") {
  const qs = queryString(filters, { select, limit: 1 });
  const data = await request(`${table}?${qs}`, { method: "GET" });
  return Array.isArray(data) && data.length ? data[0] : null;
}

async function selectMany(table, filters = {}, options = {}) {
  const extra = {
    select: options.select || "*",
    order: options.order,
    limit: options.limit,
  };
  const qs = queryString(filters, extra);
  const data = await request(`${table}?${qs}`, { method: "GET" });
  return Array.isArray(data) ? data : [];
}

async function updateMany(table, filters, patch) {
  const qs = queryString(filters);
  const data = await request(`${table}?${qs}`, {
    method: "PATCH",
    body: JSON.stringify(patch),
  });
  return Array.isArray(data) ? data : [];
}

module.exports = {
  insertOne,
  selectOne,
  selectMany,
  updateMany,
};
