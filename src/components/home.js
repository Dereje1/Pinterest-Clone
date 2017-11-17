import React, { Component } from 'react';
import Masonry from 'react-masonry-component';

class Home extends Component {
  constructor(props) {
    super(props);
    this.state = {
      ready:false
    };
  }
  handleImagesLoaded(){
    console.log("yes!!")
  }
  render() {
    var masonryOptions = {
      transitionDuration: 0
    };
    let images = ["https://shorten-my-link.glitch.me/LGe0i","https://shorten-my-link.glitch.me/LV10f","https://shorten-my-link.glitch.me/JkFcl","https://shorten-my-link.glitch.me/LV10f","https://shorten-my-link.glitch.me/LGe0i","https://shorten-my-link.glitch.me/JkFcl"]
    var childElements = images.map(function(element,idx){
    return (
        <div key={idx} className="image-box">
            <div  className="image-cover"></div>
            <img  className="image-format" src={element} />
            <div className="description text-center"> And what if I write Blablabla</div>
            <button className="testbutton"><i className="fa fa-thumb-tack" aria-hidden="true"></i> Save</button>
        </div>
    );
  });

  return (
      <div id="mainframe">
        <Masonry>
          {childElements}
        </Masonry>
      </div>
      );
  }
}

export default Home;
