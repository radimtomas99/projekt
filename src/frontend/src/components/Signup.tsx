import { Alert, Box, Button, TextField } from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

const SIGNUP_TOKEN_URL = "http://localhost:8081/api/auth/register";

const Signup = () => {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
  
    const [validUsername, setValidUsername] = useState(true);
    const [validPassword, setValidPassword] = useState(true);
  
    const [signupButtonClicked, setSignupButtonClicked] = useState(false);
  
    const [responseMsg, setResponseMsg] = useState("");
  
    useEffect(() => {
      setValidUsername(username.length > 0);
      setValidPassword(password.length > 0);
    }, [username, password]);
  
    function signup(e: any) {
      e.preventDefault();
      setSignupButtonClicked(true);
      if (!validUsername || !validPassword) return;
      const registrationDTO = {
        username: username,
        password: password,
      };
      axios.post(SIGNUP_TOKEN_URL, registrationDTO)
        .then(response => {
          setResponseMsg(response.data);
        })
        .catch(error => {
          try {
            setResponseMsg(error.response.data);
          } catch(e) {
            setResponseMsg("Cannot access authentication server!");
          }
        })

      setSignupButtonClicked(false);
    }
  
    return (
      <div>
        <h2>Please Sign up</h2>
        <form onSubmit={signup}>
          <Box>
            <TextField
              label="Username"
              onChange={(e) => setUsername(e.target.value)}
            />
          </Box>
          {!validUsername && signupButtonClicked ? (
            <Alert variant="standard" severity="error">
              Username is required!
            </Alert>
          ) : (
            <></>
          )}
  
          <Box>
            <TextField
              label="Password"
              type="password"
              onChange={(e) => setPassword(e.target.value)}
            />
          </Box>
          {!validPassword && signupButtonClicked ? (
            <Alert variant="standard" severity="error">
              Password is required!
            </Alert>
          ) : (
            <></>
          )}
  
          {responseMsg ? (
              <Alert variant="standard" severity='info'>{responseMsg}</Alert>
          ) : (
              <></>
          )}
  
          <Box>
              <Button
                  type="submit"
                  variant='contained'
              >
                  Sign up
              </Button>
          </Box>
        </form>
        <h3>OR</h3>
        <Link to="/">
          <Button>
              Log in
          </Button>
        </Link>
      </div>
    );
}

export default Signup