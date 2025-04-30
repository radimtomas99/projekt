import { Button } from "@mui/material";
import React from "react";

const MainPage = (props: any) => {
    
  function logout() {
    props.setUserToken("");
  }

  return (
    <div>
      Hello {props.user.username}
      <Button variant="contained" type="submit" onClick={logout}>
        Log Out
      </Button>
    </div>
  );
};

export default MainPage;
