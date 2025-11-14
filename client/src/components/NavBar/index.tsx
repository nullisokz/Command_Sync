import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import SideMenu from '../SideMenu/index.tsx'
import './NavBar.css'
import logo from "../../assets/logo.png";

export default function ButtonAppBar() {
  return (
    <Box className="box" sx={{ position:"absolute"}}>
      <AppBar position="static">
        <Toolbar sx={{display:"flex", justifyContent:"space-between"}}>
            <SideMenu/>
          <div style={{display: "flex", flexDirection:"row", justifyContent:"center", alignItems:"center"}}>
          <img className="logo" src={logo} />
          <h2>Command Sync</h2>
          </div>
          <Button color="inherit">Login</Button>
        </Toolbar>
      </AppBar>
    </Box>
  );
}