const express = require("express");
const router = express.Router();
const db = require("../../config/db");
const { checkToken } = require("../../auth/token_validation");
const { resolve } = require("path");


//SERVER SIDE GET MESSAGES REGARDING SPECIFIC TICKET
router.get("/get-messages/:uuid", checkToken, (req, res) => {
    let sql = `SELECT * FROM messages WHERE uuid = '${req.params.uuid}'`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});


//SERVER SIDE POST NEW MESSAGE
router.post("/post-message", checkToken, (req, res) => {
    let sql = `INSERT INTO messages SET ?`;
    let query = db.query(sql,

        {
            ticketId: req.body.ticketId,
            title: req.body.title,
            message: req.body.message,
            uuid: req.body.uuid
        },

        (err, result) => {
            if (err) {
                console.log(err);
            } else {
                res.send(result);
            }
        });
});


//SERVER SIDE DELETE MESSAGE
router.delete("/delete-message/:title", checkToken, (req, res) => {
    console.log("req.params.title: " + req.params.title);
    let sql = `DELETE FROM messages WHERE title = '${encodeURIComponent(req.params.title).replace(/[!'()*]/g, escape)}'`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});


//SERVER SIDE PUT / EDIT MESSAGE
router.put("/edit-message", checkToken, (req, res) => {
    let sql = `UPDATE messages SET message = '${req.body.message}' WHERE title = '${req.body.title}'`;
    let query = db.query(sql, (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    })
})

module.exports = router;
