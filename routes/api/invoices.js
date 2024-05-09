const express = require("express");
const router = express.Router();
const db = require("../../config/db");
const { checkToken } = require("../../auth/token_validation");





//SERVER SIDE POST NEW INVOICE
router.post("/add-invoice", checkToken, (req, res) => {
    let sql = `INSERT INTO invoices SET ?`;
    let query = db.query(sql, {
        invoiceId: req.body.invoiceId,
        itemizedList: req.body.itemizedList,
        preTaxTotal: req.body.preTaxTotal,
        invoiceRecipient: req.body.invoiceRecipient,
        invoiceDueDate: req.body.invoiceDueDate,
        ticketId: req.body.ticketId,
        uuid: req.body.uuid

    }, (err, result) => {
        if (err) {
            console.log("Error: " + err);
        } else {
            res.send(result);
        }
    });
});



//SERVER SIDE GET ALL INVOICES BY ticketId//
router.get("/get-invoices/:uuid", checkToken, (req, res) => {

    let sql = `SELECT * FROM invoices WHERE uuid = '${req.params.uuid.replace(/[&\/\\#,+()$~%'"*?<>{}“]/g, '')}'`;
    //'${encodeURIComponent(req.params.title).replace(/[!'()*]/g, escape)}'`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log("Error :" + err);
        } else {
            res.send(result);
        }
    })
});


//SERVER SIDE UPDATE INVOICE NAME
router.put("/update-invoices-ticketId/", checkToken, (req, res) => {
    //  let sql = `UPDATE invoices SET ticketId = '${req.body.ticketId.replace(/[&\/\\#,+()$~%'"*?<>{}“]/g, '')}' WHERE ticketId = '${req.body.originalId.replace(/[&\/\\#,+()$~%'"*?<>{}“]/g, '')}'`
    let query = db.query(
        `UPDATE invoices SET ticketId = ? WHERE ticketId = ?`
        [req.body.ticketId, req.body.originalId],
        (err, result) => {
            if (err) {
                console.log("Error :" + err);
            } else {
                res.send(result);
            }
        })
});



module.exports = router;
