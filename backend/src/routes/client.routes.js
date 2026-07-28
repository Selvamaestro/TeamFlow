const express = require("express");
const router = express.Router();
const { authenticate } = require("../middlewares/auth.middleware");
const { requireRole } = require("../middlewares/role.middleware");
const ctrl = require("../controllers/client.controller");

router.use(authenticate);

router.get("/", requireRole(["manager", "ceo"]), ctrl.listClients);
router.get("/:id", requireRole(["manager", "ceo"]), ctrl.getClient);
router.post("/", requireRole(["manager", "ceo"]), ctrl.createClient);
router.patch("/:id", requireRole(["manager", "ceo"]), ctrl.updateClient);
router.delete("/:id", requireRole(["manager", "ceo"]), ctrl.deleteClient);

module.exports = router;
