import * as React from 'react';
import { useNavigate } from "react-router-dom";
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import CloudDownloadIcon from '@mui/icons-material/CloudDownload';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import MenuIcon from '@mui/icons-material/Menu';
import IconButton from '@mui/material/IconButton';
import HomeIcon from '@mui/icons-material/Home';

export default function TemporaryDrawer() {
  const [open, setOpen] = React.useState(false);
  const navigate = useNavigate();

  const toggleDrawer = (newOpen: boolean) => () => {
    setOpen(newOpen);
  };

  const handleNavigateAddAction = () => {
    navigate("/AddActionPage");
    setOpen(false);
  };
  const handleNavigateHome = () => {
    // TODO: ändra till rätt route när du har den
    navigate("/");
    setOpen(false);
  };

  const handleNavigateLoadAction = () => {
    // TODO: ändra till rätt route när du har den
    navigate("/");
    setOpen(false);
  };

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation">
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleNavigateHome}>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Find Action" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={handleNavigateAddAction}>
            <ListItemIcon>
              <AddCircleOutlineIcon />
            </ListItemIcon>
            <ListItemText primary="Add Action" />
          </ListItemButton>
        </ListItem>

        <ListItem disablePadding>
          <ListItemButton onClick={handleNavigateLoadAction}>
            <ListItemIcon>
              <CloudDownloadIcon />
            </ListItemIcon>
            <ListItemText primary="Load Action" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <>
      <IconButton onClick={toggleDrawer(true)} color="inherit">
        <MenuIcon />
      </IconButton>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </>
  );
}
