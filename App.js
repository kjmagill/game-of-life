import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import {
  Alert,
  Button,
  Header,
  Image,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
} from 'react-native';
import Onboarding from 'react-native-onboarding-swiper';
import NumericInput from 'react-native-numeric-input';
import SplashScreen from './screens/SpashScreen.js';
import useInterval from './components/IntervalHook.js';

const App = () => {
  // sets the number of rows/columns in the square grid
  const gridCount = 50;
  // stores the array of nested arrays of objects which represent the grid
  const [grid, setGrid] = useState([]);
  // stores a count of the game's generations
  const [genCount, setGenCount] = useState(0);
  // sets the amount of milliseconds between each new generation
  const [delay, setDelay] = useState(500);
  // stores a boolean to check whether the game is currently running
  const [isRunning, setIsRunning] = useState(false);
  // stores a boolean to check whether onboarding has been completed or not
  const [onboardingComplete, setOnboardingComplete] = useState(false);

  // creates a new array containing nested arrays of objects (representing cells)
  // each cell's value is initialized at a random # between 0 and less-than-1
  // each cell's count of neighbor cells is initialized at 0
  const createGrid = () => {
    let initialGrid = new Array(gridCount);
    for (i = 0; i < gridCount; i++) {
      initialGrid[i] = new Array(gridCount);
    }
    for (x = 0; x < gridCount; x++) {
      for (y = 0; y < gridCount; y++) {
        initialGrid[x][y] = {
          cell: Math.floor(Math.random() * 2),
          neighbors: 0,
        };
      }
    }
    return initialGrid;
  };

  // traverses each cell in the grid to check its number of neighbors, then
  // then increments the cell's neighbor count by 1 for each neighbor cell
  const checkNeighbors = () => {
    let oldGrid = grid;
    for (i = 1; i < gridCount - 1; i++) {
      for (j = 1; j < gridCount - 1; j++) {
        for (k = -1; k < 2; k++) {
          for (l = -1; l < 2; l++) {
            oldGrid[i][j].neighbors += oldGrid[i + k][j + l].cell;
          }
        }
        oldGrid[i][j].neighbors -= oldGrid[i][j].cell;
      }
    }
    setGrid(oldGrid);
  };

  // traverses each cell in the grid and updates it with the next generation
  // of cells based on the rules of Conway's Game of Life
  const updateGrid = () => {
    let oldGrid = grid;
    let newGrid = createGrid();
    for (let i = 0; i < gridCount; i++) {
      for (let j = 0; j < gridCount; j++) {
        grid[i][j] = { cell: 0, neighbors: 0 };
      }
    }
    // CHECK ALL CELLS IN THE GRID AGAINST THE RULES OF THE GAME
    for (x = 1; x < gridCount - 1; x++) {
      for (y = 1; y < gridCount - 1; y++) {
        // if the current cell is alive and has less than two neighbors, kill it
        if (oldGrid[x][y].cell == 1 && oldGrid[x][y].neighbors < 2) {
          newGrid[x][y].cell = 0;
          // if the current cell is alive & has less than two neighbors, kill it
        } else if (oldGrid[x][y].cell == 1 && oldGrid[x][y].neighbors > 3) {
          newGrid[x][y].cell = 0;
          // if the current cell is dead & has three neighbors, bring it back to life
        } else if (oldGrid[x][y].cell == 0 && oldGrid[x][y].neighbors == 3) {
          newGrid[x][y].cell = 1;
          // if the current cell is alive & either has 2 or 3 neighbors, keep it alive
        } else if (
          oldGrid[x][y].cell == 1 &&
          (oldGrid[x][y].neighbors == 3 || oldGrid[x][y].neighbors == 2)
        ) {
          newGrid[x][y].cell = 1;
          // otherwise, set the current cell to the same value as its previous generation
        } else {
          newGrid[x][y].cell = oldGrid[x][y].cell;
        }
      }
    }
    setGrid(newGrid);
    setGenCount(genCount + 1);
  };

  // the runGame() function is a helper to call the previous two functions
  const runGame = () => {
    checkNeighbors();
    updateGrid();
  };

  // when a user touches a cell, update its value in state
  // which flips the cell's background color in the grid
  const cellWasTouched = (cellKey) => {
    if ([cellKey].cell == 1) {
      setGrid(([cellKey].cell = 0));
    } else {
      setGrid(([cellKey].cell = 1));
    }
  };

  // handles clicking of the Pause button which toggles the {isRunning} state
  const handlePauseButton = () => {
    if (isRunning == true) {
      setIsRunning(false);
    } else {
      Alert(
        "Conway's Game of Life is not currently running. \n \nSelect an initial state then press 'Run Game' to begin."
      );
    }
  };

  // handles clicking of the Clear button which sets the {isRunning} state
  // to false and invokes the newGrid() function to start with an empty grid
  const handleClearButton = () => {
    setIsRunning(false);
  };

  // handles clicking of the Review Rules button which opens the onboarding
  // flow at its third page, displaying the rules of the game
  const handleRulesButton = () => {
    onboardingFlow({ skipToPage: 3 });
  };

  // launches an onboarding modal with skip/next buttons and a swipe feature
  // provides an intro to Conway's Game of Life, and the game's rules
  const onboardingFlow = () => {
    <Onboarding
      onDone={setOnboardingComplete(true)}
      pages={[
        {
          backgroundColor: '#FFF',
          image: <Image source={'./assets/images/gol_icon_2.png'} />,
          title: "Welcome to my take on Conway's Game of Life",
          subtitle: 'Created with JavaScript and Expo (React Native)',
        },
        {
          backgroundColor: '#FE6E58',
          image: <Image source={'./assets/images/pawn.png'} />,
          title: 'An Introduction',
          subtitle:
            'The universe of the Game of Life is an infinite two-dimensional orthogonal grid of square cells, each of which is in one of two possible states, alive or dead. Every cell interacts with its eight neighbours, which are the cells that are horizontally, vertically, or diagonally adjacent. At each step in time, the following transitions occur:',
        },
        {
          backgroundColor: '#999',
          image: <Image source={'./assets/images/checklist.png'} />,
          title: 'Rules of the Game:',
          subtitle:
            '1) Any live cell with fewer than two live neighbours dies, as if caused by under-population. \n2) Any live cell with two or three live neighbours lives on to the next generation. \n3) Any live cell with more than three live neighbours dies, as if by overcrowding. \n4) Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.',
        },
      ]}
    />;
  };

  // runs once when mounting the app and creates the initial empty grid
  useEffect(() => {
    let initialGrid = createGrid();
    setGrid(initialGrid);
  }, []);

  // invokes the runGame() function repeatedly every {delay} milliseconds
  // if (isRunning == false), the repeated invocations will stop until true again
  useInterval(
    () => {
      runGame();
    },
    isRunning ? delay : null
  );

  // return the splash screen until {grid} is updated with floating point ints via
  // the createGrid() function, then run onboardingFlow() before rendering the game
  if (grid == []) {
    return <SplashScreen />;
  } else {
    if (onboardingComplete == false) {
      onboardingFlow();
    } else {
      return (
        <>
          <Header
            placement="left"
            leftComponent={{ icon: 'menu', color: '#FFF' }}
            centerComponent={{
              text: "Conway's Game of Life",
              style: styles.header,
            }}
            rightComponent={{ icon: 'info', color: '#FFF' }}
          />

          <FlatList
            data={grid}
            numColumns={gridCount}
            renderItem={({ item }) => (
              <TouchableOpacity
                onPress={() => cellWasTouched(item.key)}
                style={styles.cell}
              />
            )}
          />

          <Text>Generation: {generation}</Text>

          <NumericInput
            value={delay}
            initValue={delay}
            minValue={50}
            onChange={(value) => setDelay({ value })}
            totalWidth={240}
            totalHeight={50}
            iconSize={25}
            step={100}
            editable={true}
            type="up-down"
            valueType="integer"
            rounded
            textColor="#B0228C"
            iconStyle={{ color: 'white' }}
            rightButtonBackgroundColor="#EA3788"
            leftButtonBackgroundColor="#E56B70"
          />

          <TextInput
            placeholder="Change refresh delay (in milliseconds)"
            underlineColorAndroid="transparent"
            keyboardType={'numeric'}
            style={styles.textInput}
          />
          <Button onPress={handlePauseButton} title="Pause" color="blue" />
          <Button onPress={handleClearButton} title="Clear" color="red" />
          <Button
            onPress={handleRulesButton}
            title="Review Rules"
            color="black"
          />
        </>
      );
    }
  }
};

const styles = StyleSheet.create({
  header: {
    color: '#FFF',
  },
  container: {
    flex: 1,
    marginTop: 22,
  },
  cell: {
    backgroundColor: item.cell == 1 ? '#850000' : '#FFF',
    borderColor: '#000',
    margin: 0,
  },
  textInput: {
    padding: 5,
    margin: 5,
  },
});

export default App;

// REMAINING TO DO LIST:
// - add a modal when clicking Info icon to display intro and rules of game
// - utilize double buffering to calculate next state ahead of time
