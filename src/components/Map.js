import React, {Component} from 'react'
import { ref, set, onValue} from "firebase/database";
import { Map, GoogleApiWrapper, Marker } from 'google-maps-react'
import mapStyles from '../styles/mapStyles'
import _ from 'lodash';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Slide,
  Grid
} from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

class MapContainer extends Component{
  state = {
    myMarkers: [],
    activeMarker: {},
    selectedPlace: {},
    openMarkerDialog: false,
    allowVote: true,
  }

  _mapLoaded(mapProps, map) {
    map.setOptions({
       styles: mapStyles
    })  
  }


  componentDidMount() {
    onValue(ref(this.props.db, `places`), (snapshot) => {
      this.setState({
        myMarkers: snapshot.val(),
      });
    });
  }

  displayMarkers = (user) => {
    return (_.keys(_.get(this.state, 'myMarkers', {})).map((key, index) => {
      const mark = _.get(this.state, `myMarkers[${key}]`, {});
      let votes = _.get(mark, 'votes', {});
      let voteCount = _.keys(votes).length;
      return <Marker
        google={this.props.google}
        key={`marker-key-${key}`}
        name={mark.name}
        id={key}
        label={{text: voteCount.toString(), color: 'white', fontSize: '18px', fontWeight: 'bold'}}
        position={{
          lat: mark.latitude,
          lng: mark.longitude
        }}
        photo={_.get(mark, 'photo', null)}
        onClick={(props, marker, e) => {
          if (user) {
            this.setState({
              selectedPlace: props,
              activeMarker: marker,
              openMarkerDialog: true,
            });
          }
        }}
        icon={{
          url: "/icons/green_circle.png",
          // anchor: new this.props.google.maps.Point(32,32),
          // scaledSize: new this.props.google.maps.Size(64,64)
        }}
      />
    }))
  }

  onMapClicked = (props) => {
    if (this.state.openMarkerDialog) {
      this.setState({
        openMarkerDialog: false,
        activeMarker: null,
      })
    }
  };

  handleClose = () => {
    this.setState({
      openMarkerDialog: false,
    });
  }

  voteYes = () => {
    const uid = uuidv4();
    set(ref(this.props.db, `places/${this.state.activeMarker.id}/votes/${uid}`), new Date().toISOString());
    this.handleClose();
  }

  render() {
    return (
      <div 
        style={{
          position: "relative",
          width: "100%",
          height: "100vh"
        }}
        className="map"
      >
        <Map
          google={this.props.google} 
          zoom={14}
          initialCenter={{ lat: 33.76312640224127, lng: -85.89141416280941}}
          onClick={this.onMapClicked}
          disableDefaultUI= {true}
          onReady={(mapProps, map) => {
            this._mapLoaded(mapProps, map)
          }}
        >
          {this.displayMarkers(_.get(this.props, 'user', null))}
        </Map>
        <Dialog
          open={this.state.openMarkerDialog}
          TransitionComponent={Transition}
          keepMounted
          onClose={this.handleClose}
          aria-describedby="alert-dialog-slide-description"
        >
          <DialogTitle>{_.get(this.state, 'activeMarker.name')}</DialogTitle>
          <DialogContent>
            <DialogContentText id="alert-dialog-slide-description">
              Does this location have the best Christmas display?
            </DialogContentText>
            {_.get(this.state, 'activeMarker.photo', null) && (
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <img style={{width: '100%'}} alt={`${_.get(this.state, 'activeMarker.name')}`} src={_.get(this.state, 'activeMarker.photo', null)} />
                </Grid>
              </Grid>
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleClose}>No</Button>
            <Button onClick={this.voteYes}>Yes</Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
}

export default GoogleApiWrapper({
  apiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY
})(MapContainer)