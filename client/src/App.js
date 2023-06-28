import React, { useState, useEffect } from "react";
import './App.css';
import axios from "axios";
import Login from "./components/Login";
import Nav from "./components/Nav";
import ChangePassword from "./components/ChangePassword";
import DeleteUser from "./components/DeleteUser";
import TicketBuilder from "./components/TicketBuilder";
import uuid from "./components/uuid";
import Validate from "./components/Validate.js";
import WorkFlow from "./components/WorkFlow";
import MessageFeed from "./components/MessageFeed";
import Timeline from "./components/Timeline";
import Invoices from "./components/Invoices";
import ClockInOut from "./components/ClockInOut";


function App() {
  let [loaded, setLoaded] = useState(false);
  let [userEmail, setUserEmail] = useState(null);
  let [isValidUser, setIsValidUser] = useState(false);
  let [token, setToken] = useState("");
  let [activeModule, setActiveModule] = useState("ticketBuilder");
  let [alert, setAlert] = useState("default");
  let [alertType, setAlertType] = useState("danger");
  let [checkedToken, setCheckedToken] = useState(false);
  let [infoMessage, setInfoMessage] = useState("");
  let [newUser, setNewUser] = useState(false);
  let [ticketInfo, setTicketInfo] = useState(null);
  let [activeTicket, setActiveTicket] = useState(null);
  let [feed, setFeed] = useState([]);

  const config = {
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${sessionStorage.getItem("token")}`
    }
  }

  const showAlert = (theMessage, theType) => {
    setAlertType((alertType) => theType);
    setAlert((alert) => theMessage);
    setTimeout(() => {
      setAlert((alert) => "default");
    }, 3000)
  }


  //CLIENT SIDE GET MESSAGES FOR SPECIFIC TICKET
  const getMessages = (whichTicket) => {
    if (whichTicket === "reset") {
      setFeed((feed) => []);
      return false;
    }
    setFeed((feed) => []);
    axios.get("/api/messages/get-messages/" + whichTicket, config).then(
      (res) => {

        for (let i = 0; i < res.data.length; i++) {
          res.data[i].title = decodeURIComponent(res.data[i].title).replaceAll("%27", "'");
          res.data[i].message = decodeURIComponent(res.data[i].message).replaceAll("%27", "'");
        }
        setFeed((feed) => res.data);
      }, (error) => {
        showAlert("We did not get your messages: " + error, "danger");
      }
    )
  }

  const getTickets = (email) => {
    //START CLIENT SIDE GET USER TICKETS
    axios.get("/api/tickets/get-ticket-info/" + email, config).then(
      (res) => {
        if (res.data === [] || res.data.length === 0) {
          showAlert("No data yet", "info");
        } else {
          setTicketInfo((ticketInfo) => res.data);
        }

      }, (error) => {
        showAlert("Something didn't work", "danger");
      }
    );
  }

  //CLIENT SIDE VALIDATE USER
  const validateUser = (success, tokenPass, email, msg) => {
    if (success === 1) {
      setIsValidUser((isValidUser) => true);
      setToken((token) => tokenPass);
      sessionStorage.setItem("token", tokenPass);
      setCheckedToken((setCheckedToken) => true);
      setUserEmail((userEmail) => email);
      sessionStorage.setItem("email", email);

    } else {
      setIsValidUser((isValidUser) => false);
      setToken((token) => tokenPass);
      sessionStorage.removeItem("token");
      setUserEmail((userEmail) => null);
      showAlert("That didn't work: " + msg, "danger");
    }
  }


  //CLIENT SIDE CREAT USER
  const createUser = () => {
    const email = localStorage.getItem("email");
    const password = localStorage.getItem("password");
    const level = document.querySelector("select[name='level']").value;

    axios.post("/newUser",
      { "email": email, "level": level, "password": password },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }).then(
        (res) => {
          if (res.data.success !== 0) {
            setNewUser((newUser) => false);
            if (document.querySelector("button.ckValidate")) {
              document.querySelector("button.ckValidate").classList.remove("hide");
            }
            showAlert(email + " has been added", "success");
            localStorage.removeItem("email");

          } else {
            showAlert("That didn't work: " + res.data.message, "danger");
          }

        }, (error) => {
          showAlert("That didn't work: " + error, "danger");
        }
      )
  }


  //CLIENT SIDE START LOGIN 
  const login = () => {
    setUserEmail((userEmail) => null);
    Validate(["email", "password"]);

    if (document.querySelector(".error")) {
      showAlert("There is an error in your form.", "danger");
      return false
    } else {
      const email = document.querySelector("input[name='email']").value.toLowerCase();
      const password = document.querySelector("input[name='password']").value;

      axios.post("/login", { email, password }, {
        headers: {
          "Content-Type": "application/json"
        }
      }).then(
        (res) => {
          if (res.data.success === 1) {

            showAlert(email + " logged in.", "success");
            validateUser(res.data.success, res.data.token, email, "logged in");
            localStorage.removeItem("password");
          } else {
            showAlert("That didn't work: " + res.data.data, "danger")
          }
        },
        (error) => {
          showAlert("That didn't work: " + error, "danger");
        }
      )

    }
  }


  //CLIENT SIDE START LOG OUT
  const logout = () => {
    setIsValidUser((isValidUser) => false);
    sessionStorage.removeItem("email");
    sessionStorage.removeItem("token");

    axios.put("/logout-uuid", {
      email: userEmail,
      uuid: "logged-out" + uuid()
    }).then(
      (res) => {
        console.log("logged out");
      }, (error) => {
        showAlert("Something happend while logging out: " + error, "danger");
      })

  }

  //START REFRESH
  useEffect(() => {
    if (localStorage.getItem("activeModule")) {
      setActiveModule((activeModule) => localStorage.getItem("activeModule"));
    }
    if (sessionStorage.getItem("token") && checkedToken === false) {
      axios.get("/check-token/" + sessionStorage.getItem("email"), config).then(
        (res) => {
          try {
            if (sessionStorage.getItem("token") === res.data[0].token) {
              validateUser(1, res.data[0].token, sessionStorage.getItem("email"), "token success");
            }
          } catch (error) {
            console.log("error: " + error);
            return false
          }
        }, (error) => {
          showAlert("That token request didn't work: " + error, "danger");
          logout();

        }

      )
    }
  });

  return (
    <React.Fragment>
      {alert !== "default" ?
        <div className={"alert alert-" + alertType + " animated fadeInDown"} role="alert">{alert}</div>
        : null}
      {isValidUser === false ?
        <Login setNewUser={setNewUser} newUser={newUser} login={login} createUser={createUser} />
        :
        <React.Fragment>
          <Nav setActiveModule={setActiveModule} activeModule={activeModule} userEmail={userEmail} />
          <div className={activeModule === "timeline" ? "container-fluid my-5" : "container my-5"}>
            {activeModule === "timeline" ? <Timeline showAlert={showAlert} config={config} ticketInfo={ticketInfo} userEmail={userEmail} getTickets={getTickets} setActiveTicket={setActiveTicket} activeTicket={activeTicket} getMessages={getMessages} /> : null}
            {activeModule === "workflow" ? <WorkFlow showAlert={showAlert} config={config} ticketInfo={ticketInfo} userEmail={userEmail} getTickets={getTickets} setActiveTicket={setActiveTicket} activeTicket={activeTicket} getMessages={getMessages} /> : null}
            {activeModule === "ticketBuilder" ? <TicketBuilder ticketInfo={ticketInfo} showAlert={showAlert} config={config} userEmail={userEmail} getTickets={getTickets} setActiveTicket={setActiveTicket} activeTicket={activeTicket} getMessages={getMessages} /> : null}
            {activeModule === "invoices" ? <Invoices ticketInfo={ticketInfo} showAlert={showAlert} config={config} userEmail={userEmail} getTickets={getTickets} setActiveTicket={setActiveTicket} activeTicket={activeTicket} getMessages={getMessages} /> : null}
            {activeModule === "clockInOut" ? <ClockInOut ticketInfo={ticketInfo} showAlert={showAlert} config={config} userEmail={userEmail} getTickets={getTickets} setActiveTicket={setActiveTicket} activeTicket={activeTicket} getMessages={getMessages} /> : null}

            {activeTicket !== null ? <MessageFeed showAlert={showAlert} config={config} userEmail={userEmail} activeTicket={activeTicket} feed={feed} getMessages={getMessages} /> : <h2>Select a ticket to post a message.</h2>}
          </div>
          <footer className="footer mt-auto py-3 px-3 bg-dark text-muted">
            <div className="row">
              <div className="col-md-3">
                {infoMessage === "account-settings" ?
                  <a href="#settingsPanel" className="btn btn-secondary  btn-block" onClick={() => setInfoMessage((infoMessage) => "")} >{userEmail} <i className="fas fa-cog"></i></a> :
                  <a href="#settingsPanel" className="btn btn-secondary  btn-block" onClick={() => setInfoMessage((infoMessage) => "account-settings")} >{userEmail} <i className="fas fa-cog"></i></a>}
                {infoMessage === "account-settings" ?
                  <div id="settingsPanel" className="py-2">
                    <label>Settings: </label>
                    <ul className="list-unstyled">
                      <li>
                        <ChangePassword showAlert={showAlert} config={config} />
                      </li>
                      <li>
                        <DeleteUser validateUser={validateUser} config={config} userEmail={userEmail} logout={logout} showAlert={showAlert} infoMessage={infoMessage} />
                      </li>
                    </ul>
                  </div>
                  : null}
              </div>

              <div className="col-md-7"></div>


              <div className="col-md-2">
                <button className="btn btn-block btn-danger" onClick={() => logout()}>Logout</button>
              </div>
            </div>
          </footer>
        </React.Fragment>
      }
    </React.Fragment>
  );

}

export default App;
