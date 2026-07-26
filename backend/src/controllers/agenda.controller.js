const agendaService = require("../services/agenda.service");

// GET /agenda
async function getAgenda(req, res, next) {
  try {
    const agenda = await agendaService.getAgenda(req.user);

    return res.status(200).json({
      agenda,
    });
  } catch (err) {
    next(err);
  }
}

// POST /agenda
async function createAgenda(req, res, next) {
  try {
    const { title, date, time } = req.body;

    if (!title || !date || !time) {
      return res.status(400).json({
        message: "title, date and time are required",
      });
    }

    const agenda = await agendaService.createAgenda(req.user, req.body);

    return res.status(201).json({
      agenda,
    });
  } catch (err) {
    next(err);
  }
}

// PATCH /agenda/:id
async function updateAgenda(req, res, next) {
  try {
    const agenda = await agendaService.updateAgenda(
      req.params.id,
      req.body
    );

    if (!agenda) {
      return res.status(404).json({
        message: "Agenda not found",
      });
    }

    return res.status(200).json({
      agenda,
    });
  } catch (err) {
    next(err);
  }
}

// DELETE /agenda/:id
async function deleteAgenda(req, res, next) {
  try {
    const result = await agendaService.deleteAgenda(req.params.id);

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getAgenda,
  createAgenda,
  updateAgenda,
  deleteAgenda,
};