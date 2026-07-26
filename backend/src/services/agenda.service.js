const Agenda = require("../models/agenda.model");
async function getAgenda(user) {
  return Agenda.find({ createdBy: user.id }).sort({
    date: 1,
    time: 1,
  });
}

async function createAgenda(user, data) {
  return Agenda.create({
    title: data.title,
    description: data.description,
    date: data.date,
    time: data.time,
    type: data.type,
    createdBy: user.id,
  });
}

async function updateAgenda(id, data) {
  return Agenda.findByIdAndUpdate(id, data, {
    new: true,
  });
}

async function deleteAgenda(id) {
  await Agenda.findByIdAndDelete(id);

  return {
    message: "Agenda deleted successfully",
  };
}

module.exports = {
  getAgenda,
  createAgenda,
  updateAgenda,
  deleteAgenda,
};