import React, { useState, useRef } from "react";
import Radio from "@mui/material/Radio";
import TextField from "@mui/material/TextField";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormControl from "@mui/material/FormControl";
import ContactlessIcon from "@mui/icons-material/Contactless";
import QuestionAnswerIcon from "@mui/icons-material/QuestionAnswer";
import Textarea from "@mui/joy/Textarea";
import LoadingButton from "@mui/lab/LoadingButton";
import { ReactTyped } from "react-typed";
import "./home.css";
const Home = () => {

  const [queryMode, setQueryMode] = useState(false);
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [isAnswer, setIsAnswer] = useState(false);
  const [fieldState, setFieldState] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [fieldState2, setFieldState2] = useState(true);
  const [sqlLink, setSqlLink] = useState("");
  const [value, setValue] = useState("0");
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    hostname: "",
    db_name: "",
  });
  const handleConnect = () => {
    if (
      sqlLink == "" &&
      (formData.username == "" ||
        formData.password == "" ||
        formData.hostname == "" ||
        formData.db_name == "")
    ) {
      alert("Please fill all the fields");
    } else {
      setConnecting(true);
      const data = {
        form_data: formData,
        sql_link: sqlLink,
      };
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      };
      fetch("http://127.0.0.1:5000/connect", requestOptions)
        .then((response) => response.status)
        .then((data) => {
          setConnecting(false);
          if (data == 400) {
            alert("Invalid credentials!\nSQL server is not available on these credentials.");
          } else if (data == 200) {
            setQueryMode(true);
          }
        });
    }
  };
  const handleChange = (event) => {
    setValue(event.target.value);
    if (event.target.value == "0") {
      setSqlLink("");

      setFieldState(false);
      setFieldState2(true);
    } else if (event.target.value == "1") {
      setFormData({
        username: "",
        password: "",
        hostname: "",
        db_name: "",
      });
      setFieldState(true);
      setFieldState2(false);
    }
  };

  const handleSubmit = () => {
    if (query == "") {
      alert("Please type a question.");
    } else {
      setIsAnswer(false)
    const data = {
        query: query,
      };
      setConnecting(true);
      const requestOptions = {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      };
      fetch("http://127.0.0.1:5000/ask", requestOptions)
        .then((response) => response.json())
        .then((data) => {
          setConnecting(false);
          console.log(data)
          if (data.status == 400) {
            alert("Something went wrong! please try again later.");
          } else if (data.status == 200) {
            setAnswer(data.answer);
            setIsAnswer(true);
          }
        });
    }
  };
  return (
    <>
      <div className="container">
        <div className="center-box">
          <h1 className="heading">Ask Your Database</h1>
          {queryMode ? (
            <>
            <div className="query-area">
              <Textarea
              sx={{
                width: "80%",
                marginTop: "15px",
              }}
                minRows={2}
                placeholder="Type your question here..."
                size="md"
                variant="soft"
                onChange={(e) => {
                  setQuery(e.target.value);
                }}
              />
              <LoadingButton
                sx={{
                    position:'relative',
                  width: "15%",
                  height: '20%',
                  margin: '3.5% 5% 0% 5%',
                }}
                loadingPosition="end"
                loading={connecting}
                variant="contained"
                endIcon={<QuestionAnswerIcon />}
                onClick={handleSubmit}
              >
                Ask
              </LoadingButton>
              
            </div>
            {isAnswer ? (
                <>
            {/* <h1 className="query-heading">Result: </h1> */}
                <div className="answer-box">
                  <h1 className="answer-line"> 
                  <ReactTyped strings={[answer]} typeSpeed={10} />
                  </h1>
                </div>
                </>
              ) : (
                connecting?(
                  <div className="answer-box">
                  <img src="working.gif" alt="" />
                </div>
                 ):(
                  <br />
                )
              )}
              </>
          ) : (
            <div className="form-area">
              <FormControl>
                <RadioGroup
                  aria-labelledby="demo-controlled-radio-buttons-group"
                  name="controlled-radio-buttons-group"
                  value={value}
                  onChange={(event) => {
                    handleChange(event);
                  }}
                >
                  <FormControlLabel
                    value="0"
                    sx={{ color: "white" }}
                    control={<Radio sx={{ color: "white" }} />}
                    label="Enter credentials of your SQL server:"
                  />
                  <div className="credential-area">
                    <TextField
                      sx={{
                        width: "30%",
                        marginLeft: "10%",
                        marginRight: "10%",
                        background: "white",
                        borderRadius: "5px",
                      }}
                      disabled={fieldState}
                      required
                      className="credential"
                      id="outlined-required"
                      label="Username"
                      variant="filled"
                      value={formData.username}
                      onChange={(e) => {
                        setFormData({ ...formData, username: e.target.value });
                      }}
                    />
                    <TextField
                      sx={{
                        width: "30%",
                        marginLeft: "10%",
                        marginRight: "10%",
                        background: "white",
                        borderRadius: "5px",
                      }}
                      required
                      disabled={fieldState}
                      className="credential"
                      id="outlined-required"
                      label="Password"
                       type="password"
                      variant="filled"
                      value={formData.password}
                      onChange={(e) => {
                        setFormData({ ...formData, password: e.target.value });
                      }}
                    />
                    <TextField
                      sx={{
                        width: "30%",
                        marginLeft: "10%",
                        marginRight: "10%",
                        marginTop: "3%",
                        background: "white",
                        borderRadius: "5px",
                      }}
                      disabled={fieldState}
                      required
                      className="credential"
                      id="filled-basic"
                      label="Host"
                      variant="filled"
                      value={formData.hostname}
                      onChange={(e) => {
                        setFormData({ ...formData, hostname: e.target.value });
                      }}
                    />
                    <TextField
                      sx={{
                        width: "30%",
                        marginLeft: "10%",
                        marginRight: "10%",
                        marginTop: "3%",
                        background: "white",
                        borderRadius: "5px",
                      }}
                      required
                      disabled={fieldState}
                      className="credential"
                      id="outlined-required"
                      label="Database Name"
                      variant="filled"
                      value={formData.db_name}
                      onChange={(e) => {
                        setFormData({ ...formData, db_name: e.target.value });
                      }}
                    />
                  </div>
                  <h1 className="or">OR</h1>
                  <FormControlLabel
                    sx={{ color: "white" }}
                    value="1"
                    control={<Radio sx={{ color: "white" }} />}
                    label="Connect using SQL server link: "
                  />
                  <TextField
                    sx={{
                      width: "50%",
                      margin: "auto",
                      background: "white",
                      borderRadius: "5px",
                    }}
                    required
                    disabled={fieldState2}
                    id="filled-disabled"
                    label="SQL Server Link"
                    value={sqlLink}
                    variant="filled"
                    onChange={(e) => {
                      setSqlLink(e.target.value);
                    }}
                  />
                </RadioGroup>
                <LoadingButton
                  sx={{
                    width: "20%",
                    opacity: "1",
                    margin: "auto",
                    marginTop: "15px",
                  }}
                  loadingPosition="end"
                  loading={connecting}
                  variant="contained"
                  endIcon={<ContactlessIcon />}
                  onClick={handleConnect}
                >
                  Connect
                </LoadingButton>
              </FormControl>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Home;
