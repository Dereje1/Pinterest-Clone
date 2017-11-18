"use strict" //displays modal on user interaction
import React, { Component } from 'react';
import { Button,Modal} from 'react-bootstrap'
import {findDOMNode} from 'react-dom';
import Masonry from 'react-masonry-component';

class PinZoom extends Component {
  constructor(props) {
    super(props)
    //initialize modal show state to false
    this.state={
      show:false,
      picPreview:'/images/NO-IMAGE.png'
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if((prevProps.message===false)&&(this.props.message===true)){
      this.setState({
        show:true
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

    let totalPins = (this.props.zoomInfo.savedBy) ? this.props.zoomInfo.savedBy.length : 0
    return (
      <Modal
        show={this.state.show}
        onHide={this.close.bind(this)}
        container={this}
        aria-labelledby="contained-modal-title"
      >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title-zoom">
          <div>{this.props.zoomInfo.imgDescription}</div>
          <div>Linked By: {this.props.zoomInfo.owner}</div>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
          <div id="zoomarea">
            <Masonry>
              <img className="pinZoom" src={this.props.zoomInfo.imgLink}/>
            </Masonry>
          </div>
      </Modal.Body>
      <Modal.Footer id="zoomfooter">
          <span id="zoomtack"><i  className="fa fa-thumb-tack" aria-hidden="true"></i> {totalPins}</span>
      </Modal.Footer>
    </Modal>
    );
  }

}

export default PinZoom;
