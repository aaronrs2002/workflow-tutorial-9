const express = require("express");
const router = express.Router();
const db = require("../../config/db");

const { checkToken } = require("../../auth/token_validation");


//SERVER SIDE POST NEW TICKET
router.post("/add-ticket/", checkToken, (req, res) => {
    let sql = `INSERT INTO tickets SET ?`;
    let query = db.query(sql, {
        ticketId: req.body.ticketId,
        ticketInfo: req.body.ticketInfo,
        priority: req.body.priority,
        bugNewFeature: req.body.bugNewFeature,
        assignedTo: req.body.assignedTo,
        uuid: req.body.uuid
    }, (err, result) => {
        if (err) {
            console.log("error: " + err);
        } else {
            res.send(result);
        }
    });
});



//SERVER SIDE GET ALL USER TICKET INFO
router.get("/grab-ticket/:uuid", checkToken, (req, res) => {
    console.log("req.params.ticketId: " + req.params.uuid);
    let sql = `SELECT * FROM tickets WHERE uuid = '${req.params.uuid.replace(/[&\/\\#,+()$~%'"*?<>{}“]/g, '')}'`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log("error: " + err);
        } else {
            res.send(result);
        }
    });
});


//SERVER SIDE GET ALL USER TICKET INFO
router.get("/get-ticket-info/:email", checkToken, (req, res) => {
    let emailWithColons = ":" + req.params.email.replace(/[&\/\\#,+()$~%'"*?<>{}“]/g, '') + ":";
    console.log("emailWithColons: " + emailWithColons);
    let sql = `SELECT * FROM tickets WHERE ticketId LIKE '%${emailWithColons}%'`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log("error: " + err);
        } else {
            res.send(result);
        }
    });
});


//SERVER SIDE PUT TICKET INFO
router.put("/update-ticket/", checkToken, (req, res) => {

    let sql = ` UPDATE workflowTaskmanager.tickets tickets
LEFT JOIN  workflowTaskmanager.messages 
ON tickets.ticketId = workflowTaskmanager.messages.ticketId     
LEFT JOIN   workflowTaskmanager.workflow 
ON workflowTaskmanager.messages.ticketId = workflowTaskmanager.workflow.ticketId   
SET 
tickets.ticketInfo = '${req.body.ticketInfo.replace(/[&\/\\#,+()$~%'"*?<>{}“]/g, '')}', 
tickets.priority = '${req.body.priority.replace(/[&\/\\#,+()$~%'"*?<>{}“]/g, '')}',
tickets.bugNewFeature = '${req.body.bugNewFeature.replace(/[&\/\\#,+()$~%'"*?<>{}“]/g, '')}', 
tickets.assignedTo = '${req.body.assignedTo.replace(/[&\/\\#,+()$~%'"*?<>{}“]/g, '')}', 
tickets.ticketId = '${req.body.ticketId.replace(/[&\/\\#,+()$~%'"*?<>{}“]/g, '')}',
workflowTaskmanager.messages.ticketId = tickets.ticketId,
workflowTaskmanager.workflow.ticketId = tickets.ticketId
WHERE tickets.ticketId = '${req.body.originalTitle.replace(/[&\/\\#,+()$~%'"*?<>{}“]/g, '')}'`;


    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log("error: " + err);
        } else {
            res.send(result);
        }
    });
});
//begin edit
//workflowTaskmanager.invoices.ticketId = '${req.body.ticketId}'

//SERVER SIDE DELETE TICKET
router.delete("/delete-ticket/:uuid", checkToken, (req, res) => {
    let sql = `DELETE FROM tickets WHERE uuid = '${req.params.uuid.replace(/[&\/\\#,+()$~%'"*?<>{}“]/g, '')}'`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log("error: " + err);
        } else {
            res.send(result);
        }
    });
});


//SERVER SIDE EMPLOYEE ROUTES
router.put("/add-hours", checkToken, (req, res) => {
    console.log("WHAT IS THOS? " + req.body.hours)
    if (JSON.parse(req.body.hours)) {
        let sql = `UPDATE tickets SET hours = '${req.body.hours}' WHERE uuid = '${req.body.uuid.replace(/[&\/\\#,+()$~%'"*?<>{}“]/g, '')}'`;
        let query = db.query(sql, (err, result) => {
            if (err) {
                console.log("error: " + err);
            } else {
                res.send(result);
            }
        })
    }


});



module.exports = router;
