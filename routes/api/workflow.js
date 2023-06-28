const express = require("express");
const router = express.Router();
const db = require("../../config/db");

const { checkToken } = require("../../auth/token_validation");

//SERVER SIDE POST NEW STEP
router.post("/add-workflow/", checkToken, (req, res) => {
    let sql = `INSERT INTO workflow SET ?`;
    let query = db.query(sql, {
        ticketId: req.body.ticketId
    }, (err, result) => {
        if (err) {
            console.log("error: " + err);
        } else {
            res.send(result);
        }
    });
});


//SERVER SIDE GET ALL STEPS
router.get("/get-workflow/:ticketId", checkToken, (req, res) => {

    let sql = `SELECT * FROM workflow WHERE ticketId = '${req.params.ticketId}'`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log("error: " + err);
        } else {
            res.send(result);
        }
    });
});


//SERVER SIDE PUT WORKFLOW STEPS
router.put("/update-workflow/", checkToken, (req, res) => {
    let sql = `UPDATE workflow SET stepsData = '${req.body.stepsData}' WHERE ticketId = '${req.body.ticketId}'`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log("error: " + err);
        } else {
            res.send(result);
        }
    });
});



module.exports = router;