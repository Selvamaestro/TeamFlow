const Client = require("../models/Client");

function buildListFilter({ status, search }) {
  const filter = {};
  if (status) filter.status = status;
  if (search) {
    const safe = String(search).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    filter.$or = [
      { name: new RegExp(safe, "i") },
      { company: new RegExp(safe, "i") },
      { email: new RegExp(safe, "i") },
    ];
  }
  return filter;
}

async function listClients(query) {
  return Client.find(buildListFilter(query));
}

async function getClientById(id) {
  return Client.findById(id);
}

async function createClient(data, createdBy) {
  const { name, email, company, phone, status, logoUrl, notes } = data;
  return Client.create({ name, email, company, phone, status, logoUrl, notes, createdBy });
}

const UPDATABLE_FIELDS = ["name", "email", "company", "phone", "status", "notes", "logoUrl"];

async function updateClient(id, data) {
  const updates = {};
  for (const field of UPDATABLE_FIELDS) {
    if (data[field] !== undefined) updates[field] = data[field];
  }
  return Client.findByIdAndUpdate(id, updates, { new: true, runValidators: true });
}

async function deleteClient(id) {
  return Client.findByIdAndDelete(id);
}

module.exports = { listClients, getClientById, createClient, updateClient, deleteClient };
