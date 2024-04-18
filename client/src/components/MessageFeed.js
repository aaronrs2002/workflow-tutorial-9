import React, { useState, useEffect } from "react";
import axios from "axios";
import timestamp from "./timestamp";
import Validate from "./Validate";
import parse from "html-react-parser";

const MessageFeed = (props) => {
    let [loaded, setLoaded] = useState(false);
    let [selectedEvent, setSelectedEvent] = useState("");

    let [confirm, setConfirm] = useState("");

    let [show, setShow] = useState(0);
    let [search, setSearch] = useState("");

    function toggle(item) {
        setShow((show) => item);
    }



    //CLIENT SIDE POST MESSAGE
    const postMessage = () => {
        Validate(["messageTitle", "message"]);

        if (document.querySelector(".error")) {
            props.showAlert("Please fill out fields.", "warning");
            return false;
        }

        let newData = {
            ticketId: props.activeTitle,
            uuid: sessionStorage.getItem("uuid"),
            title: encodeURIComponent(timestamp() + ":" + props.userEmail + ":" + document.querySelector("[name='messageTitle']").value).replace(/[!'()*]/g, escape),
            message: encodeURIComponent(document.querySelector("[name='message']").value).replace(/[!'()*]/g, escape)
        }
        axios.post("api/messages/post-message/", newData, props.config).then(
            (res) => {
                if (res.data.affectedRows === 0) {
                    props.showAlert("That did not post.", "warning");
                } else {
                    props.showAlert("Your post was a success.", "success");
                    props.getMessages(props.activeTicket);
                    document.querySelector("[name='messageTitle']").value = "";
                    document.querySelector("[name='message']").value = "";
                }
            }, (error) => {
                props.showAlert("There was an error: " + error, "danger");
            }
        )
    }


    //CLIENT SIDE UPDATE MESSAGE
    const updateMessage = (whichMessage) => {

        Validate(["replyMessage"]);
        if (document.querySelector(".error")) {
            props.showAlert("What is your message?", "warning");
            return false;
        } else {



            console.log("JSON.stringify(props.feed): " + JSON.stringify(props.feed) + " - whichMessage: " + whichMessage);
            let updateData = {
                title: encodeURIComponent(props.feed[whichMessage].title).replace(/[!'()*]/g, escape),
                message: encodeURIComponent(props.feed[whichMessage].message.replace(/[!'()*]/g, escape) + "<br/> " + timestamp() + ":" + props.userEmail + ":" + document.querySelector("textarea[name='replyMessage']").value.replace(/[!'()*]/g, escape))
            }

            axios.put("/api/messages/edit-message/", updateData, props.config).then(
                (res) => {
                    if (res.data.affectedRows === 0) {
                        props.showAlert("That did not work.", "warning");
                    } else {
                        props.getMessages(props.activeTicket);
                        setSearch((search) => "");
                        document.querySelector("textarea[name='replyMessage']").value = "";
                    }
                }, (error) => {
                    props.showAlert("There was an error: " + error, "danger");
                }
            )

        }

    }
    //2023-05-24_AM-10-42%3A31%3Aaaron%40web-presence.biz%3Alet%27s%20test
    //2023-05-24_AM-10-42%3A31%3Aaaron%40web-presence.biz%3Alet%27s%20test

    //CLIENT SIDE DELETE SPECIFIC MESSAGE
    const deleteMessage = (whichMessage) => {
        axios.delete("/api/messages/delete-message/" + whichMessage, props.config).then(
            (res) => {
                if (res.data.affectedRows === 0) {
                    props.showAlert("That didn't delete.", "warning");
                } else {
                    props.showAlert("That worked.", "success");
                    props.getMessages(props.activeTicket);
                }

            }, (error) => {
                props.showAlert("There was an error: " + error, "danger");
            }
        )

    }

    function searchBuzzword() {
        toggle("");
        const searchFor = document.querySelector("[name='filterMessages']").value;
        setSearch((search) => searchFor);
    }

    return (<React.Fragment>

        {props.activeTicket !== null ?

            <div className="noPrint  row" id="messageBoard">
                <hr />


                <div className="col-md-12 my-2 ">

                    <h2 className="text-capitalize">Post to message board</h2>
                    <input type="text" name="messageTitle" className="form-control" placeholder="Post title" />
                    <textarea name="message" placeholder="Message..." className="form-control" ></textarea>
                    <button className="btn btn-success btn-block" onClick={() => postMessage()}>Post Message</button>

                </div>
                <hr />

                {(typeof props.feed) === "object" && props.feed.length > 0 ?

                    <React.Fragment>

                        <div className="col-md-12 mb-2">
                            <h2 className="text-capitalize">Message board</h2>
                            <input type="text" name="filterMessages" className="form-control" placeholder="Search messages" onChange={() => searchBuzzword()} />
                        </div>
                        <div className="col-md-12 pb-5">
                            <ul className="list-group mb-5">
                                {(typeof props.feed) === "object" && props.feed.length > 0 ?
                                    props.feed.map((post, i) => {
                                        let content = post.title + post.message;
                                        content = content.toLowerCase()

                                        return (<React.Fragment key={i} >
                                            {show === post.title ?
                                                <React.Fragment>
                                                    <li className={content.indexOf(search.toLowerCase()) !== -1 ? "list-group-item list-group-item-dark active pointer" : "hide"} key={i} onClick={() => toggle("")}>{parse(post.title)}</li>
                                                    <div className="card">
                                                        <div className="card-body">{parse(decodeURI(post.message))}</div>
                                                        <div className="card-body">
                                                            <label>{"Reply to " + parse(post.title)}</label>
                                                            <textarea className="form-control" rows="3" placeholder="Reply Message" name="replyMessage"></textarea>
                                                            <button className="btn btn-success btn-block" onClick={() => updateMessage(i)}>Submit Reply</button>

                                                            {confirm === "delete-" + post.title ?
                                                                <div className="alert alert-warning my-2" role="alert">
                                                                    <h5>Are you sure you want to delete: {parse(post.title)}</h5>
                                                                    <button className="btn btn-secondary" onClick={() => setConfirm((confirm) => "")}>No</button>
                                                                    <button className="btn btn-danger" onClick={() => deleteMessage(post.title)}>Yes</button>
                                                                </div>

                                                                : <button className="btn btn-danger btn-block my-3" onClick={() => setConfirm((confirm) => "delete-" + post.title)}>Delete message <i className="fas fa-trash"></i></button>
                                                            }


                                                        </div>
                                                    </div>
                                                </React.Fragment> :
                                                <li className={content.indexOf(search.toLowerCase()) !== -1 ? "list-group-item list-group-item-dark pointer" : "hide"} onClick={() => toggle(post.title)} key={i}>
                                                    {parse(post.title)}
                                                </li>}
                                        </React.Fragment>)
                                    }) : <div className="loader center my-5"></div>
                                }
                            </ul>
                        </div>
                    </React.Fragment> : null}
            </div> : null} </React.Fragment>)

}

export default MessageFeed;
