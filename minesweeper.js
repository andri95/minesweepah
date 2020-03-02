function doAjax() {
    // object created with input text as attributes
    var board = {
        rows: document.getElementById("rows").value,
        cols: document.getElementById("cols").value,
        mines: document.getElementById("mines").value,
    };

    // validates inputs, sets default values if not valid
    function validateBoard(){
        if(isNaN(board.rows) || board.rows > 40 || board.rows === '' || board.rows < 1){
            board.rows = 10;
            board.cols = 10;
            board.mines = 10;
        }
        if(isNaN(board.cols) || board.cols > 40 || board.cols === '' || board.cols < 1){
            board.rows = 10;
            board.cols = 10;
            board.mines = 10;
        }
        if(board.mines > board.rows * board.cols || board.mines === '' || board.mines < 1){
            board.rows = 10;
            board.cols = 10;
            board.mines = 10;
        }
    };
    validateBoard();

    //The URL to which we will send the request
    url = 'https://veff213-minesweeper.herokuapp.com/api/v1/minesweeper'

    //Perform an AJAX POST request to the url, and set the param 'myParam' in the request body to paramValue
    axios.post(url, { rows: board.rows, cols: board.cols, mines: board.mines })
        .then(function(response) {processAjax(response);})
        .catch(function (error) {
            //When unsuccessful, print the error.
            console.log(error);

            // default response object for when post request fails
            var response = {
                data: {
                    board: {
                        rows: 10,
                        cols: 10,
                        mines: 10,
                        minePositions: [
                            [1, 3],
                            [3, 0],
                            [4, 2],
                            [4, 5],
                            [4, 7],
                            [6, 9],
                            [7, 7],
                            [8, 9],
                            [9, 3],
                            [9, 9]
                        ]
                    }
                }
            }

            // call processAjax with default response
            processAjax(response);
        })
        .then(function () {
            // This code is always executed, independent of whether the request succeeds or fails.
        });
}

// all program logic is performed within processAjax
function processAjax(response){
    //When successful, print 'Success: ' and the received data
    console.log("Success: ", response.data);

    // store game div in container variable
    var container = document.getElementById("game");

    // when the game is won/lost, avoid-clicks class is added,
    // when a new board is generated the class has to be removed
    container.classList.remove('avoid-clicks');

    // response data stored in variables
    var displayRows = response.data.board.rows;
    var displayCols = response.data.board.cols;
    var placeMines = response.data.board.minePositions;

    // game div cleared before new board is generated
    document.getElementById("game").innerHTML = "";
    generateBoard();

    // generates button element for each square on desired board, appends to game div
    function generateBoard(){
        for(var i = 0; i <= displayRows - 1; i++){
            for(var j = 0; j <= displayCols - 1; j++){

                // button element created
                var currentButton = document.createElement("button");

                // each button gets individual id corresponding to place on grid
                var id = i + ',' + j;
                currentButton.setAttribute("id", id);

                // each button gets assigned box class
                currentButton.setAttribute('class', 'box');

                // each button gets event listeners for right/left clicks
                currentButton.addEventListener('click', checkClick, false);
                currentButton.addEventListener('contextmenu', checkClick, false)

                // button added to container
                container.appendChild(currentButton); 
            }

            // newline added after each run of inner loop
            var newLine = document.createElement("br");
            container.appendChild(newLine);
        }
    }

    // works out if click was right/left click, calls appropriate functions
    function checkClick(e){

        // prevents contextmenu from appearing (enabling right clicks)
        e.preventDefault();

        // currid set as id of element that was clicked
        var currid = e.target.id
        
        // check type of event, call appropriate function
        if(event.which === 1){
            processLeftClick(currid);
        }
        if(event.which === 3){
            processRightClick(currid);
        }
    }

    // processes right clicks
    function processRightClick(currid){
        var currElement = document.getElementById(currid);

        // check if current element doesn't have class nobomb
        if (!currElement.classList.contains('nobomb')){
        
            // check if current element doesn't have classes flag or number
            if(!currElement.classList.contains('flag') && !currElement.classList.contains('number')){

                // if all of the above applies, add flag class to current element
                currElement.classList.add('flag');

                // checks if user has won
                checkWin();
            } else {

                // curr element had flag class before click, remove flag class
                currElement.classList.remove('flag');
            }
        }
    }

    // processes left clicks
    function processLeftClick(currid){

        // current element id split into list
        var idList = currid.split(',');
        var intList = idList.map(Number);
        var currElement = document.getElementById(currid);

        // if current element doesn't have classes nobomb nor flag
        if(!currElement.classList.contains('nobomb') && !currElement.classList.contains('flag')){

            // check if current element is mine
            if(isBomb(intList)){

                // if so reveal all bombs
                revealBombs(placeMines);
            } else {

                // if not bom reveal square
                revealSquare(intList, currid);

                // check if user has won
                checkWin();
            }
        }
    }

    // compares current id to mine list, determines if current element is mine
    function isBomb(intList){
        for(var i = 0; i < placeMines.length; i++){
            if(intList[0] === placeMines[i][0] && intList[1] === placeMines[i][1]){
                return true;
            } 
        }
    }

    // returns element, helper function to minimize repetition
    function getElement(intList){
        return document.getElementById(intList[0] + ',' + intList[1])
    }

    // checks if current elements neighbouring squares are mines
    function checkNeighbours(intList){
        var mineCounter = 0;

        // iterates through neighbours of current element
        for(var i = intList[0] - 1; i <= intList[0] + 1; i++){
            for(var j = intList[1] - 1; j <= intList[1] + 1; j++){
                var currentElementid = [i, j];

                // checks if each element is mine, if so increment mineCounter
                if(isBomb(currentElementid)){
                    mineCounter = mineCounter + 1;
                } else {
                    continue;
                }
            }
        }
        var curr = getElement(intList);

        // if 1 or more mines were were found, add appropriate classes to current element
        if(mineCounter > 0){
            curr.classList.add('number');
            if(mineCounter  === 1){
                curr.classList.add('blue');
            } else if (mineCounter === 2){
                curr.classList.add('green');
            } else {
                curr.classList.add('red');
            }
            curr.innerHTML = mineCounter;
        } else {
            
            // if no mine was found, add class nobomb to element
            curr.classList.add('nobomb');
        }
    }

    // reveals current square
    function revealSquare(intList){

        // store all neighbouring squares in variables
        var topL = [intList[0] - 1, intList[1] - 1];
        var top = [intList[0] - 1, intList[1]];
        var topR = [intList[0] - 1, intList[1] + 1];
        var left = [intList[0], intList[1] - 1];
        var right = [intList[0], intList[1] + 1];
        var bottomL = [intList[0] + 1, intList[1] - 1];
        var bottom = [intList[0] + 1, intList[1]];
        var bottomR = [intList[0] + 1, intList[1] + 1];

        // check if current element has neighbouring mines
        checkNeighbours(intList);
        var curr = getElement(intList);

        // if clicked element had neighbouring mines, the lower half does not run,
        // if it had no neighbouring mines, each of its neighbours will be checked recursively
        // creating a chain reaction revealing few or many squares.
        if (curr.classList.contains('nobomb')){

            // each neighbouring square sent into revealSquare with appropriate conditions making sure
            // curr element stays within grid
            if(intList[0] > 0 && intList[1] > 0 && getElement(topL).classList.length === 1)
            revealSquare(topL);
            if(intList[0] > 0 && getElement(top).classList.length === 1)
            revealSquare(top);
            if(intList[0] !== 0 && intList[1] !== displayCols - 1 && getElement(topR).classList.length ===1)
            revealSquare(topR);
            if(intList[1] > 0 && getElement(left).classList.length ===1)
            revealSquare(left);
            if(intList[1] < displayCols - 1 && getElement(right).classList.length === 1)
            revealSquare(right);
            if(intList[0] < displayRows - 1 && intList[1] > 0 && getElement(bottomL).classList.length === 1)
            revealSquare(bottomL);
            if(intList[0] < displayRows - 1 && getElement(bottom).classList.length === 1)
            revealSquare(bottom);
            if(intList[0] < displayRows - 1 && intList[1] < displayCols - 1 && getElement(bottomR).classList.length === 1)
            revealSquare(bottomR);
        }
    }

    // reveals all bombs
    function revealBombs(placeMines){
        for(var i = 0; i < placeMines.length; i++){
            var currid = placeMines[i].toString();
            var currElement = document.getElementById(currid);
            currElement.classList.remove('flag');
            currElement.classList.add('bomb');
        }

        // Loss message shown, game div locked until new board is generated
        setTimeout(function(){ alert("YOU LOST"); }, 1000);
        var gameContainer = document.getElementById('game');
        gameContainer.classList.add('avoid-clicks');
    }

    // checks if user has won game
    function checkWin(){
        flag = true;

        // itarates through all button elements and checks if all elements have been clicked
        // and that no element that is not a mine is flagged
        for(var i = 0; i < displayRows; i++){
            for(var j = 0; j < displayCols; j++){
                if(getElement([i, j]).classList.length === 1){

                    // flag set as false if some element has not been clicked
                    flag = false;
                }
                if(!isBomb([i, j]) && getElement([i, j]).classList.contains('flag')){

                    // flag also set as false if some non-mine element is flagged
                    flag = false;
                }
            }
        }

        // if no element caused flag to be false, user has won
        if(flag){

            // add win class to all elements that are not flagged
            for(var i = 0; i < displayRows; i++){
                for(var j = 0; j < displayCols; j++){
                    if(!getElement([i, j]).classList.contains('flag')){
                        getElement([i, j]).classList.add('win');
                    }
                }
            }

            // Win message shown and game div locked until new board has been generated
            setTimeout(function(){ alert("YOU WON"); }, 1000);
            var gameContainer = document.getElementById('game');
            gameContainer.classList.add('avoid-clicks');
        }
    }
}
