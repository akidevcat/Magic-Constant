//##################
//REGION: TrikTaxi (Path Construction)
//##################
//This code requiers:
//-
var trikTaxi = {}

trikTaxi.getPos = function (cell, xsize, ysize) {
    return [cell % xsize, cell / xsize]
}

trikTaxi.getEuclideanDistance = function (cell1, cell2, xsize, ysize) {
    p1 = this.getPos(cell1, xsize, ysize)
    p2 = this.getPos(cell2, xsize, ysize)
    deltax2 = (p1[0] - p2[0])
    deltax2 *= deltax2
    deltay2 = (p1[1] - p2[1])
    deltay2 *= deltay2
    return Math.sqrt(deltax2 + deltay2)
}

trikTaxi.getManhattanDistance = function (cell1, cell2, xsize, ysize) {
    p1 = this.getPos(cell1, xsize, ysize)
    p2 = this.getPos(cell2, xsize, ysize)
    return Math.abs(p1[0] - p2[0]) + Math.abs(p1[1] - p2[1])
}

trikTaxi.getNeighbors = function (cell, xsize, ysize) {
    result = []
    up = cell - xsize
    if (up >= 0 && up < xsize * ysize)
        result.push(up)
    right = cell + 1
    if (right % xsize == 0) {
        right = -1
    }
    if (right >= 0 && right < xsize * ysize)
        result.push(right)
    down = cell + xsize
    if (down >= 0 && down < xsize * ysize)
        result.push(down)
    left = cell - 1
    if (left % xsize == xsize - 1) {
        left = -1
    }
    if (left >= 0 && left < xsize * ysize)
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
    open = [start]
    closed = []
    gscores = new Array(xsize * ysize)
    fscores = new Array(xsize * ysize)
    for (i = 0; i < xsize * ysize; i++) {
        gscores[i] = Infinity
        fscores[i] = Infinity
    }
    gscores[start] = 0
    fscores[start] = this.getManhattanDistance(start, end, xsize, ysize)
    tree = new Array(xsize * ysize)
    while (open.length > 0) {
        x = open[open.length - 1]
        xi = open.length - 1
        for (i = 0; i < open.length; i++) {
            if (fscores[open[i]] < fscores[x]) {
                x = open[i]
                xi = i
            }
        }

        if (x == end) {
            return trikTaxi.reconstructPath(start, end, tree)
        }
        open.splice(xi, 1)
        closed.push(x)

        neighbors = this.getNeighbors(x, xsize, ysize)
        
        for (i = 0; i < neighbors.length; i++) {
            y = neighbors[i]
            if (!maze[y] || closed.indexOf(y) > -1) {
                continue
            }
            
            tentativeg = gscores[x] + this.getEuclideanDistance(x, y, xsize, ysize)

            if (open.indexOf(y) == -1) {
                open.push(y)
            } else if (tentativeg >= gscores[y]) {
                continue
            }
            tree[y] = x
            gscores[y] = tentativeg
            fscores[y] = gscores[y] + this.getManhattanDistance(y, end, xsize, ysize)
        }
    }
    return []
}
//##################
//REGION END
//##################
