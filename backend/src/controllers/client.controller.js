const clientService = require("../services/client.service");

// GET /clients (Manager, CEO)
async function listClients(req, res, next) {
  try {
    const clients = await clientService.listClients(req.query);
    return res.status(200).json({ clients });
  } catch (err) {
    next(err);
  }
}

// GET /clients/:id (Manager, CEO)
async function getClient(req, res, next) {
  try {
    const client = await clientService.getClientById(req.params.id);
    if (!client) return res.status(404).json({ message: "Client not found" });
    return res.status(200).json({ client });
  } catch (err) {
    next(err);
  }
}

// POST /clients (Manager, CEO)
async function createClient(req, res, next) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: "name is required" });

    const client = await clientService.createClient(req.body, req.user.id);
    return res.status(201).json({ client });
  } catch (err) {
    next(err);
  }
}

// PATCH /clients/:id (Manager, CEO)
async function updateClient(req, res, next) {
  try {
    const client = await clientService.updateClient(req.params.id, req.body);
    if (!client) return res.status(404).json({ message: "Client not found" });
    return res.status(200).json({ client });
  } catch (err) {
    next(err);
  }
}

// DELETE /clients/:id (CEO)
async function deleteClient(req, res, next) {
  try {
    const client = await clientService.deleteClient(req.params.id);
    if (!client) return res.status(404).json({ message: "Client not found" });
    return res.status(200).json({ message: "Client deleted" });
  } catch (err) {
    next(err);
  }
}

module.exports = { listClients, getClient, createClient, updateClient, deleteClient };
