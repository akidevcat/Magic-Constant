//##################
//REGION: TrikTaxi (Path Construction)
//##################
//This code requiers:
//-
/*
Usage:
1) Create the maze matrix
2) Set trikTaxi.walls
3) Use A* (or something else but dunno why)
*/
var trikTaxi = {}

//Write walls here (between which cells walls are). PUT THEM IN ASCENDING ORDER! (x, y) where x < y
trikTaxi.walls = ["2, 3", "6, 7", "3, 11", "4, 12", "12, 13", "29, 37", "36, 37", "51, 59"]

trikTaxi.getPos = function (cell, xsize, ysize) {
    return [cell % xsize, Math.floor(cell/ysize)]
}

trikTaxi.getEuclideanDistance = function (cell1, cell2, xsize, ysize) {
    p1 = trikTaxi.getPos(cell1, xsize, ysize)
    p2 = trikTaxi.getPos(cell2, xsize, ysize)
    deltax2 = (p1[0] - p2[0])
    deltax2 *= deltax2
    deltay2 = (p1[1] - p2[1])
    deltay2 *= deltay2
    return Math.sqrt(deltax2 + deltay2)
}

trikTaxi.getManhattanDistance = function (cell1, cell2, xsize, ysize) {
    p1 = trikTaxi.getPos(cell1, xsize, ysize)
    p2 = trikTaxi.getPos(cell2, xsize, ysize)
    return Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1])
}

trikTaxi.getNeighbors = function (cell, xsize, ysize) {
    result = []
    up = cell - xsize
    if (up >= 0 && up < xsize * ysize && trikTaxi.walls.indexOf(up + ", " + cell) == -1)
        result.push(up)
    right = cell + 1
    if (right % xsize == 0) {
        right = -1
    }
    if (right >= 0 && right < xsize * ysize && trikTaxi.walls.indexOf(cell + ", " + right) == -1)
        result.push(right)
    down = cell + xsize
    if (down >= 0 && down < xsize * ysize && trikTaxi.walls.indexOf(cell + ", " + down) == -1)
        result.push(down)
    left = cell - 1
    if (left % xsize == xsize - 1) {
        left = -1
    }
    if (left >= 0 && left < xsize * ysize && trikTaxi.walls.indexOf(left + ", " + cell) == -1)
        result.push(left)
    return result
}

trikTaxi.reconstructPath = function (start, end, tree) {
    path = []
    x = end
    while (x != start) {
        path.push(x)
        x = tree[x]
        if (x === undefined)
            return []
    }    
    path.push(start)
    return path
}

/*
Breadth First Search
start is int
end is int
maze is a binary array of cells
xsize, ysize are the maze sizes
*/
trikTaxi.bfs = function (start, end, maze, xsize, ysize) {
    open = [start]
    closed = []
    tree = new Array(xsize * ysize)
    while (open.length > 0) {
        x = open.pop();

        if (x == end) {
            return trikTaxi.reconstructPath(start, end, tree)
        }

        if (closed.indexOf(x) == -1 && maze[x]) {
            closed.push(x);
            neighbors = trikTaxi.getNeighbors(x, xsize, ysize);
            for (i = 0; i < neighbors.length; i++) {
                if (closed.indexOf(neighbors[i]) == -1 && maze[neighbors[i]]) {
                    if (tree[neighbors[i]] === undefined)
                        tree[neighbors[i]] = x
                    open.push(neighbors[i])
                }
            }
        }
    }
    return []
} 

/*
Depth First Search
start is int
end is int
maze is a binary array of cells
xsize, ysize are the maze sizes
*/
trikTaxi.dfs = function (start, end, maze, xsize, ysize) {
    open = [start]
    closed = []
    tree = new Array(xsize * ysize)
    while (open.length > 0) {
        x = open.pop();

        if (x == end) {
            return trikTaxi.reconstructPath(start, end, tree)
        }

        if (closed.indexOf(x) == -1 && maze[x]) {
            closed.push(x);
            neighbors = trikTaxi.getNeighbors(x, xsize, ysize);
            for (i = 0; i < neighbors.length; i++) {
                if (closed.indexOf(neighbors[i]) == -1 && maze[neighbors[i]]) {
                    if (tree[neighbors[i]] === undefined)
                        tree[neighbors[i]] = x
                    open.push(neighbors[i])
                    break;
                }
            }
        }
    }
}

/*
A*
start is int
end is int
maze is a binary array of cells
xsize, ysize are the maze sizes
*/
trikTaxi.astar = function (start, end, maze, xsize, ysize) {
    var lvar = {}
    lvar.open = [start]
    lvar.closed = []
    lvar.gscores = new Array(xsize * ysize)
    lvar.fscores = new Array(xsize * ysize)
    for (i = 0; i < xsize * ysize; i++) {
        lvar.gscores[i] = Infinity
        lvar.fscores[i] = Infinity
    }
    lvar.gscores[start] = 0
    lvar.fscores[start] = trikTaxi.getManhattanDistance(start, end, xsize, ysize)
    lvar.tree = new Array(xsize * ysize)
    while (lvar.open.length > 0) {
        lvar.x = lvar.open[lvar.open.length - 1]
        lvar.xi = lvar.open.length - 1
        for (i = 0; i < lvar.open.length; i++) {
            if (lvar.fscores[lvar.open[i]] < lvar.fscores[lvar.x]) {
                lvar.x = lvar.open[i]
                lvar.xi = i
            }
        }

        if (lvar.x == end) {
            return trikTaxi.reconstructPath(start, end, lvar.tree)
        }
        lvar.open.splice(lvar.xi, 1)
        lvar.closed.push(lvar.x)

        lvar.neighbors = trikTaxi.getNeighbors(lvar.x, xsize, ysize)
        
        for (i = 0; i < lvar.neighbors.length; i++) {
            lvar.y = lvar.neighbors[i]
            if (!maze[lvar.y] || lvar.closed.indexOf(lvar.y) > -1) {
                continue
            }
            
            lvar.tentativeg = lvar.gscores[lvar.x] + trikTaxi.getEuclideanDistance(lvar.x, lvar.y, xsize, ysize)

            if (lvar.open.indexOf(lvar.y) == -1) {
                lvar.open.push(lvar.y)
            } else if (lvar.tentativeg >= lvar.gscores[lvar.y]) {
                continue
            }
            lvar.tree[lvar.y] = lvar.x
            lvar.gscores[lvar.y] = lvar.tentativeg
            lvar.fscores[lvar.y] = lvar.gscores[lvar.y] + trikTaxi.getManhattanDistance(lvar.y, end, xsize, ysize)
        }
    }
    return []
}
//##################
//REGION END
//##################
