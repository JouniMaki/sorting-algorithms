/**
 * Runs several sorting algorithms simultaneously step-by-step, while drawing
 * the arrays on a canvas to show the sorting processes.
 * 
 * Note that the comparable speed of the algorithms isn't perfectly accurate,
 * but the time complexity differences should still become pretty clear when
 * running with differently sized arrays.
 * In general one "step" is equal to one comparison + possible swap, but
 * some "steps" may be more computationally heavy than others, etc.
 * 
 * To add new algorithms:
 *  - add new function for the algoritm; see existing algoritms for format
 *  - add algorithm name into the variable "algorithmNames"
 *  - add the function created into the variable "algorithmFunctions"
 * 
 * @author Jouni Mäki
 */

$(document).ready(function() {

    // Names of the used algorithms
    var algorithmNames = ['Bubble sort', 'Insertion sort', 'Quicksort'];

    // Algorithm functions, in same order as the names above
    var algorithmFunctions = [bubbleSort, insertionSort, quickSort];

    // Number of algorithms used
    var numOfAlgorithms = algorithmNames.length;

    // Size of the arrays
    var arrSize = 50;

    // Delay (in milliseconds) between two steps
    var runningSpeed = 100;

    // Number of steps since last reset
    var stepCounter = 0;

    // Canvas for drawing the visualization of the algorithms
    var canvas = document.getElementById("myCanvas");
    var ctx = canvas.getContext("2d");
    var canvasWidth = $("#myCanvas").attr('width');
    var canvasHeight = $("#myCanvas").attr('height');

    // Boolean array for recording the state of each sorting algorithm
    var sortFinished = [];

    // Call stacks
    // Normally external stacks wouldn't be needed for these sorting algorithms,
    // but they are used here for step-by-step visualization.
    var callStacks = [];

    // Arrays to be sorted by various algorithms
    var arrays = [];

    // Holds the interval function that gets called repeatedly when running
    var intervalHolder;

    /**
     * Initializes/resets the program variables
     */
    function init() {
        document.getElementById('runButton').disabled = false;
        document.getElementById('stopButton').disabled = true;
        document.getElementById('resetButton').disabled = false;

        stepCounter = 0;
        document.getElementById('stepCounter').innerHTML = 0;

        var tmp = parseInt(document.getElementById("numOfElements").value);
        if (Number.isInteger(tmp) && tmp > 0 && tmp < 1000) {
            arrSize = tmp;
        }

        // Clear all the call stacks
        callStacks = [];

        for (var i = 0; i < numOfAlgorithms; i++) {
            // None of the algorithms are finished
            sortFinished[i] = false;

            // Add empty call stacks to be filled soon
            callStacks[i] = [];

            // Clear the arrays
            arrays[i] = [];
        }

        // Initialize all arrays with same shuffled arrangement
        for (var i = 0; i < arrSize; i++) {
            arrays[0][i] = i;
        }
        shuffle(arrays[0], 0, arrSize);
        for (var i = 0; i < arrSize; i++) {
            for (var n = 1; n < numOfAlgorithms; n++) {
                arrays[n][i] = arrays[0][i];
            }
        }

        // Add the initial function call to each of the call Stacks
        for (var i = 0; i < numOfAlgorithms; i++) {
            initAlgorithm(i, algorithmFunctions[i]);
        }

        updateCanvas();
    }

    function initAlgorithm(i, func) {
        callStacks[i].push(function() {func(arrays[i], callStacks[i], 0, arrSize)});
    }


    /**
     * Bubble sort algorithm.
     *   O(n^2) worst case and average performance.
     *   O(n) best case performance.
     * 
     * @param {Array.<number>} arr Array to be sorted
     * @param {Array.<function>} callStack Call stack to push function calls for next step(s)
     * @param {number} iMin Start of the to-be-sorted range, inclusive
     * @param {number} iMax End of the to-be-sorted range, exclusive
     */
    function bubbleSort(arr, callStack, iMin, iMax) {
        var i = iMin;
        var newMax = 0;
        iMax--;
        
        function nextStep() {
            if (i == iMax) {
                iMax = newMax;
                newMax = 0;
                if (iMax <= 0) {
                    return;
                }
                i = iMin;
            }
            if (arr[i] > arr[i+1]) {
                swap(arr, i, i+1);
                newMax = i;
            }
            i++;
            callStack.push(nextStep);
        }

        callStack.push(nextStep);
    }

    /**
     * Insertion sort algorithm; somewhat faster than bubble sort in general.
     *   O(n^2) worst case and average performance.
     *   O(n) best case performance.
     * 
     * @param {Array.<number>} arr Array to be sorted
     * @param {Array.<function>} callStack Call stack to push function calls for next step(s)
     * @param {number} iMin Start of the to-be-sorted range, inclusive
     * @param {number} iMax End of the to-be-sorted range, exclusive
     */
    function insertionSort(arr, callStack, iMin, iMax) {
        var i = iMin;
        var marker = iMin;
        
        function nextStep() {
            if (i == iMax - 1) {
                return;
            }
            if (i < iMin) {
                i = marker;
            }

            if (arr[i] > arr[i+1]) {
                swap(arr, i, i+1);
                i--;
            }
            else {
                marker++;
                i = marker;
            }

            callStack.push(nextStep);
        }

        callStack.push(nextStep);
    }


    /**
     * Quick sort algorithm; by far the fastest of given algorithms in general case.
     *   O(n^2) worst case performance.
     *   O(n log n) best case and average performance.
     * 
     * @param {Array.<number>} arr Array to be sorted
     * @param {Array.<function>} callStack Call stack to push function calls for next step(s)
     * @param {number} iMin Start of the to-be-sorted range, inclusive
     * @param {number} iMax End of the to-be-sorted range, exclusive
     */
    function quickSort(arr, callStack, iMin, iMax) {
        if (iMin >= iMax-1) {
            return;
        }

        // Randomize pivot and move it to the last position.
        var pivot = Math.floor(Math.random()*(iMax-iMin) + iMin);
        swap(arr, pivot, iMax-1);
        pivot = iMax-1;

        var i = iMin;
        var marker = iMin;

        function nextStep() {
            if (i == iMax-1) {
                swap(arr, marker, pivot);

                callStack.push(function() {quickSort(arr, callStack, marker+1, iMax)});
                callStack.push(function() {quickSort(arr, callStack, iMin, marker)});

                return;
            }

            if (arr[i] < arr[pivot]) {
                swap(arr, i, marker);
                marker++;
            }
            i++;

            callStack.push(nextStep);
        };

        callStack.push(nextStep);
    }

    /**
     * Swaps two elements with each other in an array
     * 
     * @param {Array.<Object>} arr Array to modify
     * @param {number} i First element to be swapped
     * @param {number} j Second element to be swapped
     */
    function swap(arr, i, j) {
        var tmp = arr[i];
        arr[i] = arr[j];
        arr[j] = tmp;
    }

    /**
     * Updates canvas by drawing the contents of the arrays in visual form
     */
    function updateCanvas() {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        var sectionHeight = Math.floor(canvasHeight/numOfAlgorithms);

        for (var n = 0; n < numOfAlgorithms; n++) {
            for (var i = 0; i < arrSize; i++) {
                var col = Math.floor(arrays[n][i]*(255.0/arrSize));
                ctx.fillStyle = intToColorString(col);
                ctx.fillRect(Math.floor(i*canvasWidth/arrSize), n*sectionHeight,
                             Math.ceil(canvasWidth/arrSize), sectionHeight);
            }

            // Label backgrounds
            ctx.fillStyle = '#555555';
            ctx.fillRect(0, (n+1)*sectionHeight - 25, 150, 25);

            // Labels
            ctx.font = "20px Arial";
            ctx.fillStyle = sortFinished[n] ? '#00FF00' : '#FF0000';
            ctx.fillText(algorithmNames[n], 5, (n+1)*sectionHeight - 5);
        }
    }

    /**
     * Changes an integer into a grayscale color string
     * For example (200) -> '#C8C8C8'
     * 
     * @param {number} i Integer from 0 to 255
     */
    function intToColorString(i) {
        var hexString = i.toString(16);
        if (i < 16) {
            hexString = 0 + hexString;
        }
        return colorStr = '#' + hexString + hexString + hexString;
    }

    /**
     * Shuffles the elements in an array
     * 
     * @param {Array.<Object>} arr Array to be shuffled
     * @param {number} min Start of the range to be shuffled, inclusive
     * @param {number} max End of the range to be shuffled, exclusive
     */
    function shuffle(arr, min, max) {
        for (var i = max-1; i > min; i--) {
            var j = Math.floor(Math.random() * (i-min)) + min;
            swap(arr, i, j);
        }
    }

    /**
     * Runs all the sorting algorithms simultaneously or
     * continues previously stopped run
     */
    function run() {
        document.getElementById('runButton').disabled = true;
        document.getElementById('stopButton').disabled = false;

        var tmp = parseInt(document.getElementById("runningSpeed").value);
        if (Number.isInteger(tmp) && tmp > 0 && tmp < 10000) {
            runningSpeed = tmp;
        }

        intervalHolder = setInterval(function() {

            for (var i = 0; i < numOfAlgorithms; i++) {
                if (callStacks[i].length > 0) {
                    (callStacks[i].pop())();
                }
                else if (!sortFinished[i]) {
                    console.log(algorithmNames[i] + ' finished in ' + stepCounter + ' steps.');
                    sortFinished[i] = true;
                }
            }

            // Check whether all sorts have been finished; if so, then stop
            if (sortFinished.every(function(val) {return val;})) {
                stop();
            }

            stepCounter++;
            document.getElementById('stepCounter').innerHTML = stepCounter;

            updateCanvas();

        }, runningSpeed);
    }

    /**
     * Stops the algorithms, but does not reset the state
     */
    function stop() {
        clearInterval(intervalHolder);
        document.getElementById('runButton').disabled = false;
        document.getElementById('stopButton').disabled = true;
        document.getElementById('resetButton').disabled = false;
    }

    /**
     * Stops the algorithms (if not already stopped), and resets
     * the state of the program
     */
    function reset() {
        stop();
        init();
    }

    // Add button listeners
    document.getElementById('runButton').addEventListener('click', run);
    document.getElementById('stopButton').addEventListener('click', stop);
    document.getElementById('resetButton').addEventListener('click', reset);

    // And finally initialize the state of the program
    init();
});