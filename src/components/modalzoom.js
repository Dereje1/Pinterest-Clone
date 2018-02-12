"use strict" //displays pin zoom modal
import React, { Component } from 'react';
import {Button,Modal} from 'react-bootstrap'
import {findDOMNode} from 'react-dom';
import Masonry from 'react-masonry-component';

class PinZoom extends Component {
  constructor(props) {
    super(props)
    //initialize modal show state to false
    this.state={
      show:false,
      picPreview:'/images/NO-IMAGE.png'//for error or no pics
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if((prevProps.message===false)&&(this.props.message===true)){
      this.setState({
        show:true
      })
    }
    if((prevProps.message===true)&&(this.props.message===false)){
      this.setState({
        show:false
      })
    }
  }
  open(){
  this.setState({
    show:true
  })
  }
  close(){
    //note my modified modal now sends a reset callback after closing modalstate which clears
    //the message field
    this.setState({
      show: false,
      picPreview:'/images/NO-IMAGE.png'
    },()=>this.props.reset());
  }


  invalidImage(){
    this.setState({
      picPreview:'/images/NO-IMAGE.png'
    })
  }

  render() {
    //use total pins to display how many have saved image
    //components brings in as prop zoominfo etire object containing pin information
    if(!this.props.zoomInfo.length){return null}
    let pinInformation = this.props.zoomInfo[0]
    let buttonInformation = this.props.zoomInfo[1]

    let totalPins = (pinInformation.savedBy) ? pinInformation.savedBy.length : 0
    return (
      <Modal
        show={this.state.show}
        onHide={this.close.bind(this)}
        container={this}
        aria-labelledby="contained-modal-title"
      >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-zoom">
          <div id="zoomdesc">{pinInformation.imgDescription}</div>
          <div id="zoomowner">Linked By: {pinInformation.owner}</div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
          <div id="zoomarea">
            <Masonry>
              <img className="pinZoom" src={pinInformation.imgLink}/>
            </Masonry>
          </div>
      </Modal.Body>
      <Modal.Footer id="zoomfooter">
          <span id="zoomtack"><i  className="fa fa-thumb-tack" aria-hidden="true"></i> {totalPins}</span>
          {buttonInformation}
      </Modal.Footer>
    </Modal>
    );
  }

}

export default PinZoom;
