"use strict" //displays modal on user interaction
import React, { Component } from 'react';
import { Button,Modal} from 'react-bootstrap'
import {findDOMNode} from 'react-dom';
import Masonry from 'react-masonry-component';

class PinCreate extends Component {
  constructor(props) {
    super(props)
    //initialize modal show state to false
    this.state={
      show:false,
      picPreview:'/images/NO-IMAGE.png',
      saveDisabled:true,
      picValid:false,
      descriptionValid:false
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
  picprocess(e){
    if (this.state.descriptionValid){
      this.setState({
        picPreview:e.target.value,
        picValid:true,
        saveDisabled:false
      })
    }
    else{
      this.setState({
        picPreview:e.target.value,
        picValid:true,
        saveDisabled:true
      })
    }
  }
  discprocess(e){
    if(e.target.value.length){
      if(this.state.picValid){
        this.setState({
          descriptionValid:true,
          saveDisabled:false
        })
      }
      else{
        this.setState({
          descriptionValid:true,
          saveDisabled:true
        })
      }

    }
    else{
      this.setState({
        descriptionValid:false,
        saveDisabled:true
      })
    }
  }
  invalidImage(){
    this.setState({
      picPreview:'/images/NO-IMAGE.png',
      picValid:false,
      saveDisabled:true
    })
  }
  savePic(){
    let picDescription = findDOMNode(this.refs.imgdesc).value.trim()
    let picLink = findDOMNode(this.refs.imglink).value.trim()

    let pinJSON={
      owner:this.props.userInfo.username,
      imgDescription:picDescription,
      imgLink:picLink,
      timeStamp:Date.now(),
      savedBy: []
    }
    this.props.savePin(pinJSON)
    this.close()
  }
  addpin(){
    return(
      <div id="addpin">
        <div id="picdisplay">
          <Masonry>
            <img  onError={()=>this.invalidImage()} className="pinTest" src={this.state.picPreview}/>
          </Masonry>
        </div>
        <div id="formarea">
          <p>Add a description</p>
          <textarea
          ref="imgdesc"
          id="textdesc"
          placeholder="Description..."
          maxLength="28"
          onChange={(e)=>this.discprocess(e)}
           />
           <p>Paste Link to Image</p>
           <textarea
           ref="imglink"
           id="textlink"
           placeholder="http://"
           onChange={(e)=>this.picprocess(e)}
            />

        </div>
      </div>
      )
  }
  render() {
    return (
      <Modal
        show={this.state.show}
        onHide={this.close.bind(this)}
        container={this}
        aria-labelledby="contained-modal-title"
      >
      <Modal.Header closeButton>
        <Modal.Title id="contained-modal-title">Create Pin</Modal.Title>
      </Modal.Header>
      <Modal.Body>
          {this.addpin()}
      </Modal.Body>
      <Modal.Footer>
        <Button bsStyle="danger" onClick={()=>this.savePic()} disabled={this.state.saveDisabled}>Save</Button>
      </Modal.Footer>
    </Modal>
    );
  }

}

export default PinCreate;
