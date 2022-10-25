import * as React from 'react';
import { Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  Divider,
  IconButton,
  TextField,
  Tooltip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Button,
  Grid } from '@mui/material';
import Logout from '@mui/icons-material/Logout';
import HouseIcon from '@mui/icons-material/House';
import { ref, set } from "firebase/database";
import _ from "lodash";

export default function AccountMenu({user, auth, db, houseAdded}) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCloseAddHouse = () => {
    setOpenAddHouse(false);
  };
  
  const [openAddHouse, setOpenAddHouse] = React.useState(false);
  const [address, setAddress] = React.useState('');
  const [addressError, setAddressError] = React.useState('');
  const [city, setCity] = React.useState('Alexandria');
  const [state] = React.useState('AL');
  const [zip, setZip] = React.useState('36250');
  
  const onAddHouse = async() => {
    const addressData = _.replace(`${address}, ${city} ${state} ${zip}`, ' ', '+');
    const res = await (await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${addressData}&key=${process.env.REACT_APP_GOOGLE_MAP_API_KEY}`
    )).json();

    if (_.get(res, 'results[0].geometry.location_type', '') !== 'ROOFTOP') {
      setAddressError('Unable to find the address')
      return;
    }
    const location = _.get(res, 'results[0].geometry.location', {lat: '', lng: ''});
    set(ref(db, `places/${user.uid.toString()}`), {
      name: `${address}, ${city} ${state} ${zip}`,
      latitude: location.lat,
      longitude: location.lng,
      addedBy: user.uid,
    });
    set(ref(db, `users/${user.uid.toString()}/houseAdded`), true);
    handleCloseAddHouse();
  }

  return (
    <React.Fragment>
      <Box sx={{ display: 'flex', alignItems: 'center', textAlign: 'center' }}>
        <Tooltip title="Account settings">
          <IconButton
            onClick={handleClick}
            size="small"
            sx={{ ml: 2 }}
            aria-controls={open ? 'account-menu' : undefined}
            aria-haspopup="true"
            aria-expanded={open ? 'true' : undefined}
          >
            <Avatar sx={{ width: 32, height: 32 }} src={user.photoURL}></Avatar>
          </IconButton>
        </Tooltip>
      </Box>
      <Menu
        anchorEl={anchorEl}
        id="account-menu"
        open={open}
        onClose={handleClose}
        onClick={handleClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: 'visible',
            filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
            mt: 1.5,
            '& .MuiAvatar-root': {
              width: 32,
              height: 32,
              ml: -0.5,
              mr: 1,
            },
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          },
          // style: {backgroundColor: 'green', color: 'white'}
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={() => setOpenAddHouse(true)}
          disabled={houseAdded}
        >
          <Avatar><HouseIcon /></Avatar> Add My House
        </MenuItem>
        <Divider />
        {/* <MenuItem>
          <ListItemIcon>
            <Settings fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem> */}
        <MenuItem onClick={() => auth.signOut()}>
          <ListItemIcon>
            <Logout />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>
      <Dialog
        open={openAddHouse}
        keepMounted
        onClose={handleCloseAddHouse}
        aria-describedby="alert-dialog-slide-description"
      >
        <DialogTitle>Add Your House</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField fullWidth id="standard-basic" inputProps={{autoComplete: 'off'}} onChange={(e) => {
                setAddress(e.target.value);
                }}
                value={address} label="Address" variant="standard"
                helperText={addressError}
                error={addressError !== ''}
              />
            </Grid>
            <Grid item xs={7}>
              <TextField fullWidth id="standard-basic" inputProps={{autoComplete: 'off'}} onChange={(e) => {
                setCity(e.target.value);
              }} value={city} label="City" variant="standard" disabled />
            </Grid>
            <Grid item xs={2}>
              <TextField id="standard-basic" value={state} label="State" variant="standard" disabled />
            </Grid>
            <Grid item xs={3}>
              <TextField id="standard-basic" inputProps={{autoComplete: 'off', maxLength: 5}} onChange={(e) => {
                let raw = e.target.value;
                if (raw.length !== 0 && !/^[\d-]+$/.test(raw)) {
                  return;
                } else {
                  setZip(raw);
                }
              }} value={zip} label="Zip" variant="standard" disabled />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseAddHouse}>Cancel</Button>
          <Button disabled={_.isEmpty(address)} onClick={onAddHouse}>Add</Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
