// Watch enlarge(), getTileProps(), loadtiles() functions
// These may change between projects

// enlarge() currently unusable for animations

width = 64, height = 64
tile_size = 10
var alpha

class Tile {
	constructor(coord, props) {
    this.text = props[0]
    if (props[1]['text'] == 'primary') {
      this.primary = props[1]['color']
    } else {
      this.primary = ''
    }
    if (props[1]['text'] == 'secondary') {
      this.secondary = props[1]['color']
    } else {
      this.secondary = ''
    }
    this._rectBounds = []
    this._temp = []
    this.x = coord[0]
    this.y = coord[1]
	}

	drawButton() {
		ctx.fillStyle = "black"
		ctx.strokeStyle = "black"
		ctx.strokeRect(this.x * tile_size, this.y * tile_size, tile_size, tile_size)
		if(this.primary) {
			ctx.fillStyle = this.primary
			ctx.fillRect(this.x * tile_size, this.y * tile_size, tile_size, tile_size)
		} else if (this.secondary) {
      ctx.fillStyle = this.secondary + alpha
      ctx.fillRect(this.x * tile_size, this.y * tile_size, tile_size, tile_size)
    }
	}

	checkForPress(clickx, clicky) {
		if(clickx >= this.x * tile_size - x_range * tile_size && clickx <= (this.x + 1) * tile_size - x_range * tile_size && clicky >= this.y * tile_size - y_range * tile_size && clicky <= (this.y + 1) * tile_size - y_range * tile_size) {
			if(clickmode == 'update') {
        this.text = currentText
        this.primary = currentColor
      } else if (clickmode == 'inspect') {
        document.getElementById('input-text').value = this.text
        document.getElementById('input-color').value = this.primary
      } else if (clickmode == 'rectangle') {
        this.primary = '#34ad4a'
        return [this.x, this.y]
      }
		}
	}
  
  updateColor() {
    this.primary = currentColor
  }
  
  setColor(color) {
    this.primary = color
  }
  
  setText(text) {
    this.text = text
  }
}

function drawBoxes() {
	for(i = x_range; i < width; i++) {
		for(j = y_range; j < height; j++) {
			animation[this_frame][i][j].drawButton()
		}
	}
}

function createCanvas() {
  ctx.clearRect(0, 0, 1900, 1900)
  drawBoxes()
}

function getTileProps(frame_stuff) {
  basic_tiles = []
  for (let i = 0; i < frame_stuff.length; i++) {
    basic_tiles.push([])
    for (let j = 0; j < frame_stuff[0].length; j++) {
      basic_tiles[i].push([])
      for (let k = 0; k < frame_stuff[0][0].length; k++) {
        basic_tiles[i][j].push(0)
      }
    }
  }
  
  for (i = 0; i < frame_stuff.length; i++) {    
    for (j = 0; j < frame_stuff[0].length; j++) {      
      for (k = 0; k < frame_stuff[0][0].length; k++) {
        if (frame_stuff[i][j][k].text !== "undefined") {
          basic_tiles[i][j][k] = { 'text': frame_stuff[i][j][k].text, 'primary': frame_stuff[i][j][k].primary }
        }
      }
    }
  }
  
  return basic_tiles
}

function save() {
	var a = document.getElementById("save");
  
  basic_animation = getTileProps(animation)
  
  var file = new Blob(['map = ' + JSON.stringify(basic_animation)], {type: "text/plain"});
  a.href = URL.createObjectURL(file);
  a.download = "map.js";
}

function loadtiles(input_tiles) {
  document.getElementById("this_frame").max = input_tiles.length - 1
  width = input_tiles[0].length
  height = input_tiles[0][0].length
  
  animation = []
  for (let i = 0; i < input_tiles.length; i++) {
    animation.push([])
    for (let j = 0; j < input_tiles[0].length; j++) {
      animation[i].push([])
      for (let k = 0; k < input_tiles[0][0].length; k++) {
        animation[i][j].push(new Tile([j - x_range, k - y_range], ["", {"color": "primary", "text": ""}]))
      }
    }
  }
  
  for(i = 0; i < input_tiles.length; i++) {
    for(j = 0; j < input_tiles[i].length; j++) {
      for (k = 0; k < input_tiles[i][j].length; k++) {
        if (typeof input_tiles[i][j][k].primary !== "undefined") {
          color = input_tiles[i][j][k].primary
        } else {
          color = ""
        }
        
        animation[i][j][k].setText(input_tiles[i][j][k].text)
        animation[i][j][k].setColor(color)
      }
    }
  }
}

function readFile(e) {
  file = e.target.files[0]
  if (!file) {
    return
  }
  var reader = new FileReader()
  reader.onload = function(e) {
    var sf = e.target.result
    sf = JSON.parse(sf.substring(5))
    
    loadtiles(sf)
  }
  reader.readAsText(file)
}

function enlarge() {
  size = parseInt(document.getElementById("enlarge-size").value)
  document.getElementById('x-slider').max = document.getElementById('x-slider').max * size
  document.getElementById('y-slider').max = document.getElementById('y-slider').max * size
  
  width *= size
  height *= size
  
  for (f = 0; f < animation.length; f++) {
    enlarged_tiles = []
    for (i = 0; i < width; i++) {
      x = Math.floor(i/size)
      
      enlarged_tiles.push([])
      for (j = 0; j < height; j++) {
        y = Math.floor(j/size)
        
        my_text = animation[f][x][y].text
        if (animation[f][x][y].primary.length) {
          rgb = animation[f][x][y].primary
          color = { 'text': 'primary', 'color': rgb }
        } else if (animation[f][x][y].secondary.length) {
          sec = animation[f][x][y].secondary
          color = { 'text': 'secondary', 'color': sec }
        } else {
          color = { 'text': 'primary', 'color': '' }
        }
        enlarged_tiles[enlarged_tiles.length - 1].push(new Tile([i - x_range, j - y_range], [my_text, color]))
      }
    }
    animation[f] = enlarged_tiles
  }
}

function updateTiles() {
  for (x = 0; x < width; x++) {
    for (y = 0; y < height; y++) {
      locx = x - x_range
      locy = y - y_range

      animation[this_frame][x][y].x = locx
      animation[this_frame][x][y].y = locy
    }
  }
}

x_range = 0
function updatexrange() {
  x_range = parseInt(document.getElementById('x-slider').value)
  updateTiles()
}

y_range = 0
function updateyrange() {
  y_range = parseInt(document.getElementById('y-slider').value)
  updateTiles()
}

this_frame = 0
function updateframe() {
  this_frame = parseInt(document.getElementById('this_frame').value)
  
  if (this_frame > 0) {
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        if (animation[this_frame - 1][i][j].primary) {
          animation[this_frame][i][j].secondary = animation[this_frame - 1][i][j].primary
        }
      }
    }
  }
}

function copyFrame() {
  if (this_frame > 0) {
    for (let i = 0; i < width; i++) {
      for (let j = 0; j < height; j++) {
        if (animation[this_frame - 1][i][j].primary) {
          animation[this_frame][i][j].primary = animation[this_frame - 1][i][j].primary
        }
      }
    }
  }
}

function updateAlpha() {
  alpha = parseInt(document.getElementById('alpha').value).toString(16)
  
  if (alpha.length < 2) {
    alpha = '0' + alpha
  }
}

function addFrame() {
  tiles = []
  for(i=0; i<width; i++) {
    tiles.push([])
    for(j=0; j<height; j++) {
      tile = new Tile([i, j], ["", {"text": "primary", "color": ""}])
      
      if (animation[animation.length - 1][i][j].primary) {
        tile.secondary = animation[animation.length - 1][i][j].primary
      }
      tiles[i].push(tile)
    }
  }
  animation.push(tiles)
  
  document.getElementById("this_frame").max = parseInt(document.getElementById("this_frame").max) + 1
  document.getElementById("this_frame").value = document.getElementById("this_frame").max
  this_frame = animation.length - 1
}

his = []
function update() {
  currentText = document.getElementById("input-text").value || ''
  currentColor = document.getElementById("input-color").value ? document.getElementById("input-color").value : ''
  his.push([currentText, currentColor])
  document.getElementById('history').innerText = JSON.stringify(his)
  clickmode = 'update'
}

clickmode = 'update'
function inspect() {
  clickmode = 'inspect'
}

function rectangle() {
  clickmode = 'rectangle'
}

function drawRect(side) {
  if(Math.sign(side[0][0] - side[1][0]) < 0) {
    startx = side[0][0]
    endx = side[1][0]
  } else {
    startx = side[1][0]
    endx = side[0][0]
  }
  
  if(Math.sign(side[0][1] - side[1][1]) < 0) {
    starty = side[0][1]
    endy = side[1][1]
  } else {
    starty = side[1][1]
    endy = side[0][1]
  }
  
  for(k = Math.round(startx); k <= Math.round(endx); k++) {
    for(l = Math.round(starty); l <= Math.round(endy); l++) {
      animation[this_frame][k][l].setText(currentText)
      animation[this_frame][k][l].setColor(currentColor)
    }
  }
}

function main() {
  var then = Date.now()
  var now = Date.now(),
    delta = (now - then)/1000

  ctx = this.canvas.getContext("2d")

  createCanvas()
  //update(delta)

  then = now

  window.requestAnimationFrame(main)
}

storedClick = []
clicked = false
window.onload = function() {
  var elm = document.getElementById("input")
			elm.addEventListener("change", readFile)
      
	document.getElementById("cv").addEventListener("click", function(event) {
		var x = event.offsetX,
			y = event.offsetY
      
    i = Math.floor(x / tile_size) + Math.floor(x_range/tile_size)
    j = Math.floor(y / tile_size) + Math.floor(y_range/tile_size)
    
    rectLocs = animation[this_frame][i][j].checkForPress(x, y)
    if(typeof(rectLocs) != 'undefined') {
      if(storedClick.length) {
        storedClick.push(rectLocs)
        drawRect(storedClick)
        storedClick = []
      } else {
        storedClick.push(rectLocs)
      }
    }
	})

	document.getElementById("cv").addEventListener("mousedown", function(event) {
		clicked = true
	})
	document.getElementById("cv").addEventListener("mouseup", function(event) {
		clicked = false
	})
	document.getElementById("cv").addEventListener("mousemove", function(event) {
		if(clicked == true) {
			var domx = event.offsetX,
				domy = event.offsetY
        
      i = Math.floor(domx / tile_size) + Math.floor(x_range/tile_size)
      j = Math.floor(domy / tile_size) + Math.floor(y_range/tile_size)
      
			animation[this_frame][i][j].checkForPress(domx, domy)
		}
	})

	canvas = document.getElementById("cv")

  animation = [[]]
  tiles = []
  for(i = 0; i < width; i++) {
    tiles.push([])
    for(j = 0; j < height; j++) {
      tile = new Tile([i, j], ["", ""])
      tiles[i].push(tile)
    }
  }
  animation[this_frame] = tiles
  
  alpha = parseInt(document.getElementById('alpha').value).toString(16)
  if (alpha.length < 2) {
    alpha = '0' + alpha
  }
  
	main()
}
