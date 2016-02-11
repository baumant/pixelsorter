
new Uploader("html", setImage);
new Uploader("#upload", setImage);

$("#mode").change(function(){
  mode = parseInt( $("#mode").val() );
  
  $('#load').show('fast',function(){
      render();
  });
});

$("#direction").change(function(){
  direction = parseInt( $("#direction").val() );
  
  $('#load').show('fast',function(){
      render();
  });
});


var img, mode = 0, direction = 0, canvasNum = 0, counter = 0, siHeight = 100;

function setImage(uri){
  img = new Image();
  img.onload = function(){
    // params:
    // - image object
    // - mode (0 = black, 1 = brightness, 2 = white, default = 0)
    $('#load').show('fast',function(){
      render();
    });


  };
  img.src = uri;

  //When first image is sorted, move parameters to be fixed to the bottom
  counter ++;
  if(counter === 1){
    $('#params').addClass('bottom');
    $('.instructions').css('margin-bottom' , '100px');
  } 
}

function render(){
  
    if (img) {
      var sortedCanvas = sortPixels(img, direction, mode);
      $('section').last().append(sortedCanvas);
      $('canvas:last').attr('id', canvasNum);
      addDLButton();
      $("body").animate({'scrollTop': $(sortedCanvas).offset().top - 40 }, 300);
      canvasNum += 1;
      //remove loading sign
      $('#load').css('display', 'none');    
    }
}

//Add Download Button to Images
var DLButton = '',
    sharebtn = "";

function addDLButton(){
  var canvas = document.getElementById(canvasNum);
  var dataURL = canvas.toDataURL("image/jpeg");

  function dataURItoBlob(dataURI) {
    // convert base64/URLEncoded data component to raw binary data held in a string
    var byteString;
    if (dataURI.split(',')[0].indexOf('base64') >= 0)
        byteString = atob(dataURI.split(',')[1]);
    else
        byteString = unescape(dataURI.split(',')[1]);

    // separate out the mime component
    var mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];

    // write the bytes of the string to a typed array
    var ia = new Uint8Array(byteString.length);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }

    return new Blob([ia], {type:'application/octet-stream'});
  }
  var blob = dataURItoBlob(dataURL);
  var burl = (window.webkitURL || window.URL).createObjectURL(blob);
  DLButton = "<a class='DLButton' download='Image.jpeg' href="+burl+">Click to Download</a>";
  // trigger me onclick
  function share(){

      var img;
      try {
          img = canvas.toDataURL('image/jpeg', 0.9).split(',')[1];
      } catch(e) {
          img = canvas.toDataURL().split(',')[1];
      }
      var w = window.open();
      w.document.write('Uploading to imgur.com...');
      $.ajax({
          url: 'https://api.imgur.com/3/upload.json',
          type: 'POST',
          headers: {
              Authorization: 'Client-ID 779bedb86f3f675'
          },
          data: {
              type: 'base64',
              name: 'PixelSorterImage.jpg',
              title: 'SortedImage',
              description: 'Made using http://timothybauman.com/pixelsorter',
              image: img
          },
          dataType: 'json'
      }).success(function(data) {
          var url = 'http://imgur.com/' + data.data.id + '?tags';
          //_gaq.push(['_trackEvent', 'pixelsorter', 'share', url]);
          w.location.href = url;
      }).error(function() {
          alert('Could not reach api.imgur.com. Sorry :(');
          w.close();
          //_gaq.push(['_trackEvent', 'neonflames', 'share', 'fail']);
      });
  }

  sharebtn = "<a id='sharebtn"+canvasNum+"' class='DLButton'> Share </a>";
  $('#'+canvasNum).after("<div class='picbtns'>"+DLButton+sharebtn+"</div>");
  $('#sharebtn'+canvasNum).click(share);


  //Add extra height to compensate for added canvas image
  siHeight += ($('#'+canvasNum).height() + 100);
  $('.sortedImages').css('height', siHeight);
}

var sortPixels = (function(){

  // equivalent to rgb(103, 105, 128)
  var blackValue = -10000000;
  
  // equivalent to rgb(164, 114, 128)
  var whiteValue = -6000000;

//  var blackValue = (255 << 24) + (32<< 16) + (32 << 8) + 32;
  var brightnessValue = 30;
//  var whiteValue = (255 << 24) + (230<< 16) + (230 << 8) + 230;

  var saved = false;

  //MODE:
  //0 -> black
  //1 -> bright
  //2 -> white
  //b(16777216)

  /*
  DIRECTION:
  0 -> horizontal
  1 -> vertical
  */

  var mode, row, column, direction;
  var canvas, ctx, width, height;
  var imageData, imageDataWrapper;

  function init(img, newDirection, newMode) {
    
    direction = newDirection || 0;
    mode = newMode || 0;
    row = 0;
    column = 0;
    

    setup(img);
    draw();
    
    return canvas;
  }

  function setup(img) {
    canvas = document.createElement('canvas');
    
    width = canvas.width = img.naturalWidth;
    height = canvas.height = img.naturalHeight;

    ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // document.body.appendChild(img);
    // document.body.appendChild(canvas);
    imageDataWrapper = ctx.getImageData(0, 0, width, height);
    imageData = imageDataWrapper.data;
  }

  function draw() {
    switch(direction) {
      case 0:
        while(column < width-1) {
          sortColumn();
          column++;
        };
        while(row < height-1) {
          sortRow();
          row++;
        };
        break;
      case 1:
        while(row < height-1) {
          sortRow();
          row++;
        };
        while(column < width-1) {
          sortColumn();
          column++;
        };
        break;
    }

    
      ctx.putImageData(imageDataWrapper, 0, 0);

  }

  function sortRow() {
    var x = 0;
    var y = row;
    var xend = 0;
    
    while(xend < width-1) {
      switch(mode) {
        case 0:
          x = getFirstNotBlackX(x, y);
          xend = getNextBlackX(x, y);
          break;
        case 1:
          x = getFirstBrightX(x, y);
          xend = getNextDarkX(x, y);
          break;
        case 2:
          x = getFirstNotWhiteX(x, y);
          xend = getNextWhiteX(x, y);
          break;
        default:
          break;
      }
      
      if (x < 0) break;
      
      var sortLength = xend-x;
      
      var unsorted = new Array(sortLength);
      var sorted = new Array(sortLength);
      
      for(var i=0; i<sortLength; i++) {
        unsorted[i] = getPixelValue(x + i, y);
      }
      
      sorted = unsorted.sort();
      
      for(var i=0; i<sortLength; i++) {
        setPixelValue(x + i, y, sorted[i]);
      }
      
      x = xend+1;
    }
  }


  function sortColumn() {
    var x = column;
    var y = 0;
    var yend = 0;
    
    while(yend < height-1) {
      switch(mode) {
        case 0:
          y = getFirstNotBlackY(x, y);
          yend = getNextBlackY(x, y);
          break;
        case 1:
          y = getFirstBrightY(x, y);
          yend = getNextDarkY(x, y);
          break;
        case 2:
          y = getFirstNotWhiteY(x, y);
          yend = getNextWhiteY(x, y);
          break;
        default:
          break;
      }
      
      if (y < 0) break;
      
      var sortLength = yend-y;
      
      var unsorted = new Array(sortLength);
      var sorted = new Array(sortLength);
      
      for(var i=0; i<sortLength; i++) {
        unsorted[i] = getPixelValue(x, y+i);
      }
      
      sorted = unsorted.sort();
      
      for(var i=0; i<sortLength; i++) {
        setPixelValue(x, y+i, sorted[i]);
      }
      
      y = yend+1;
    }
  }


  function setPixelValue(x, y, val) {
    var offset = (x + y * width) * 4;
    var r = (val >> 16) & 255;
    var g = (val >> 8) & 255;
    var b = val & 255;
    imageData[offset] = r;
    imageData[offset+1] = g;
    imageData[offset+2] = b;
  }
  function getPixelValue(x, y) {
    var offset = (x + y * width) * 4;
    var r = imageData[offset];
    var g = imageData[offset + 1];
    var b = imageData[offset + 2];

    return ( ((255 << 8) | r) << 8 | g) << 8 | b;
  }
  function getPixelBrightness(x, y) {
    var offset = (x + y * width) * 4;
    var r = imageData[offset];
    var g = imageData[offset + 1];
    var b = imageData[offset + 2];
    // HSL - lightness:
    // return (Math.max(r,g,b) + Math.min(r,g,b)) / 2
    // HSV - value:
    return Math.max(r,g,b) / 255 * 100;
  }

  //BLACK
  function getFirstNotBlackX(_x, _y) {
    var x = _x;
    var y = _y;

    while(getPixelValue(x, y) < blackValue) {
      x++;
      if(x >= width) return -1;
    }
    return x;
  }

  function getNextBlackX(_x, _y) {
    var x = _x+1;
    var y = _y;
    while(getPixelValue(x, y) > blackValue) {
      x++;
      if(x >= width) return width-1;
    }
    return x-1;
  }

  //BRIGHTNESS
  function getFirstBrightX(_x, _y) {
    var x = _x;
    var y = _y;
    while(getPixelBrightness(x, y) < brightnessValue) {
      x++;
      if(x >= width) return -1;
    }
    return x;
  }

  function getNextDarkX(_x, _y) {
    var x = _x+1;
    var y = _y;
    while(getPixelBrightness(x, y) > brightnessValue) {
      x++;
      if(x >= width) return width-1;
    }
    return x-1;
  }

  //WHITE
  function getFirstNotWhiteX(_x, _y) {
    var x = _x;
    var y = _y;
    while(getPixelValue(x, y) > whiteValue) {
      x++;
      if(x >= width) return -1;
    }
    return x;
  }

  function getNextWhiteX(_x, _y) {
    var x = _x+1;
    var y = _y;
    while(getPixelValue(x, y) < whiteValue) {
      x++;
      if(x >= width) return width-1;
    }
    return x-1;
  }


  //BLACK
  function getFirstNotBlackY(_x, _y) {
    var x = _x;
    var y = _y;
    if(y < height) {
      while(getPixelValue(x, y) < blackValue) {
        y++;
        if(y >= height) return -1;
      }
    }
    return y;
  }

  function getNextBlackY(_x, _y) {
    var x = _x;
    var y = _y+1;
    if (y < height) {
      while(getPixelValue(x, y) > blackValue) {
        y++;
        if(y >= height) return height-1;
      }
    }
    return y-1;
  }

  //BRIGHTNESS
  function getFirstBrightY(_x, _y) {
    var x = _x;
    var y = _y;
    if (y < height) {
      while(getPixelBrightness(x, y) < brightnessValue) {
        y++;
        if(y >= height) return -1;
      }
    }
    return y;
  }

  function getNextDarkY(_x, _y) {
    var x = _x;
    var y = _y+1;
    if (y < height) {
      while(getPixelBrightness(x, y) > brightnessValue) {
        y++;
        if(y >= height) return height-1;
      }
    }
    return y-1;
  }

  //WHITE
  function getFirstNotWhiteY(_x, _y) {
    var x = _x;
    var y = _y;
    if (y < height) {
      while(getPixelValue(x, y) > whiteValue) {
        y++;
        if(y >= height) return -1;
      }
    }
    return y;
  }

  function getNextWhiteY(_x, _y) {
    var x = _x;
    var y = _y+1;
    if (y < height) {
      while(getPixelValue(x, y) < whiteValue) {
        y++;
        if(y >= height) return height-1;
      }
    }
    return y-1;
  }

  return init;

})();
