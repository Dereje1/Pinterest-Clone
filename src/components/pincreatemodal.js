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
      picPreview:""
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
      picPreview:""
    },()=>this.props.reset());
  }
  picprocess(e){
    this.setState({
      picPreview:e.target.value
    })
  }
  savePic(){

    let picDescription = findDOMNode(this.refs.imgdesc).value.trim()
    let picLink = findDOMNode(this.refs.imglink).value.trim()
    if((picDescription&&picLink)===""){return}
    let storeJSON={
      owner:this.props.userInfo.username,
      imgDescription:picDescription,
      imgLink:picLink
    }
    console.log(storeJSON)
  }
  addpin(){
    let preview = this.state.picPreview.length ? this.state.picPreview : '/images/NO-IMAGE.png'
    return(
      <div id="addpin">
        <div id="picdisplay">
          <Masonry>
            <img  className="pinTest" src={preview}/>
          </Masonry>
        </div>
        <div id="formarea">
          <p>Add a description</p>
          <textarea
          ref="imgdesc"
          id="textdesc"
          placeholder="Description..."
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
        <Button bsStyle="danger" onClick={()=>this.savePic()}>Save</Button>
      </Modal.Footer>
    </Modal>
    );
  }

}

export default PinCreate;
