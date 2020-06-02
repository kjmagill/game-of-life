import 'react-native-gesture-handler';
import React, { useState, useEffect } from 'react';
import {
  Button,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Header } from 'react-native-elements';
import Onboarding from 'react-native-onboarding-swiper';
import NumericInput from 'react-native-numeric-input';
import useInterval from './components/IntervalHook.js';
import rulesImg from './assets/images/checklist.png';
import pawnImg from './assets/images/pawn.png';
import gameLogo from './assets/images/gol_logo_2_white.png';

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
  const createGridArr = () => {
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

  // runs once when mounting the app and creates the initial empty grid
  useEffect(() => {
    let initialGrid = createGridArr();
    setGrid(initialGrid);
  }, [onboardingComplete]);

  // traverses each cell in the grid to check its number of neighbors, then
  // then increments the cell's neighbor count by 1 for each neighbor cell
  const checkNeighbors = () => {
    let oldGrid = grid;
    console.log('oldGrid: ', oldGrid);
    for (i = 1; i < gridCount - 1; i++) {
      for (j = 1; j < gridCount - 1; j++) {
        for (k = -1; k < 2; k++) {
          for (l = -1; l < 2; l++) {
            if (oldGrid[i + k][j + l]) {
              oldGrid[i][j].neighbors += oldGrid[i + k][j + l].cell;
            }
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
    let newGrid = createGridArr();
    // CHECK ALL CELLS IN THE GRID AGAINST THE RULES OF THE GAME
    for (x = 1; x < gridCount - 1; x++) {
      for (y = 1; y < gridCount - 1; y++) {
        // if the current cell is alive and has less than two neighbors, kill it
        if (oldGrid[x][y].cell == 1 && oldGrid[x][y].neighbors < 2) {
          newGrid[x][y].cell = 0;
          // if the current cell is alive & has more than three neighbors, kill it
        } else if (oldGrid[x][y].cell == 1 && oldGrid[x][y].neighbors > 3) {
          newGrid[x][y].cell = 0;
          // if the current cell is dead & has exactly three neighbors, birth it
        } else if (oldGrid[x][y].cell == 0 && oldGrid[x][y].neighbors == 3) {
          newGrid[x][y].cell = 1;
          // if the current cell is alive & has either 2 or 3 neighbors, keep it alive
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
    setGenCount(Number(genCount) + 1);
  };

  // the runGame() function is a helper to call the previous two functions
  const runGame = () => {
    checkNeighbors();
    updateGrid();
    console.log('next generation of {grid} state: ', grid);
  };

  // invokes the runGame() function repeatedly every {delay} milliseconds
  // if (isRunning == false), the repeated invocations will stop until true again
  useInterval(
    () => {
      runGame();
    },
    isRunning ? delay : null
  );

  // when a user touches a cell, update its value in state
  // which flips the cell's background color in the grid
  const cellWasTouched = (cell) => {
    if ([cell].cell == 1) {
      setGrid(([cell].cell = 0));
    } else {
      setGrid(([cell].cell = 1));
    }
  };

  // handles clicking of the Pause button which toggles the {isRunning} state
  const handlePauseButton = () => {
    if (isRunning == true) {
      setIsRunning(false);
    } else {
      setIsRunning(true);
    }
  };

  // handles clicking of the Clear button to clear the grid, set isRunning
  // to false, set the delay back to default, and set genCount to zero
  const handleClearButton = () => {
    let emptyGrid = createGridArr();
    setIsRunning(false);
    setGenCount(0);
    setDelay(500);
    setGrid(emptyGrid);
  };

  // handles clicking of the Review Rules button which opens the onboarding
  // flow at its third page, displaying the rules of the game
  const handleRulesButton = () => {
    setOnboardingComplete(false);
    OnboardingFlow({ skipToPage: 3 });
  };

  const handleDelayInput = (newDelay) => {
    console.log('delay before input change: ', delay);
    setDelay(parseInt(newDelay));
    console.log('delay after input change: ', delay);
  };

  // launches an onboarding modal with skip/next buttons and a swipe feature
  // provides an intro to Conway's Game of Life, and the game's rules
  const OnboardingFlow = () => {
    return (
      <Onboarding
        onSkip={() => setOnboardingComplete(true)}
        onDone={() => setOnboardingComplete(true)}
        subTitleStyles={{
          fontSize: 19,
          paddingBottom: 20,
          width: 365,
          textAlign: 'justify',
        }}
        titleStyles={{ paddingBottom: 15 }}
        imageContainerStyles={{ paddingBottom: 40 }}
        pages={[
          {
            backgroundColor: '#114084',
            image: (
              <Image
                source={gameLogo}
                style={{ aspectRatio: 2.3, resizeMode: 'contain' }}
              />
            ),
            title: 'Created with Expo (React Native)',
            subtitle: '                    By KJ Magill | 2020',
          },
          {
            backgroundColor: '#3769B0',
            image: (
              <Image
                source={pawnImg}
                style={{ aspectRatio: 0.8, resizeMode: 'contain' }}
              />
            ),
            title: 'An Introduction',
            subtitle:
              'The universe of the Game of Life is an infinite two-dimensional orthogonal grid of square cells, each of which is in one of two possible states, alive or dead. \n\nEvery cell interacts with its eight neighbours, which are the cells that are horizontally, vertically, or diagonally adjacent. At each step in time, the following transitions occur:',
          },
          {
            backgroundColor: '#82B7DC',
            image: (
              <Image
                source={rulesImg}
                style={{ aspectRatio: 2.2, resizeMode: 'contain' }}
              />
            ),
            title: 'Rules of the Game:',
            subtitle:
              '1) Any live cell with fewer than two live neighbours dies, as if caused by under-population. \n\n2) Any live cell with two or three live neighbours lives on to the next generation. \n\n3) Any live cell with more than three live neighbours dies, as if by overcrowding. \n\n4) Any dead cell with exactly three live neighbours becomes a live cell, as if by reproduction.',
          },
        ]}
      />
    );
  };

  const Cell = (props) => {
    return (
      <TouchableOpacity
        onPress={cellWasTouched()}
        style={(styles.cell, props.value == 1 ? styles.alive : null)}
      />
    );
  };

  const BuildRow = (row, x) => {
    row.map((cell, y) => <Cell key={`c${x}${y}`} value={cell.cell} />);
  };

  const BuildFullGrid = () => {
    grid.map((row, x) => {
      return <View key={`r${x}`}>{BuildRow(row, x)}</View>;
    });
  };

  // ignores certain warning messages during testing, which are being
  // thrown due to a compatibility issue between Expo and react-devtools
  console.ignoredYellowBox = [
    'react-devtools agent got no connection',
    'Warning: Each',
    'Warning: Failed',
  ];

  // return the splash screen until {grid} is updated with floating point ints via
  // the createGridArr() function, then run OnboardingFlow() before rendering the game
  if (grid == []) {
    return 'Loading...';
  } else if (grid != [] && onboardingComplete == false) {
    return OnboardingFlow();
  } else {
    return (
      <View style={styles.screenContainer}>
        <Header
          placement="center"
          leftComponent={{ icon: 'menu', color: '#FFF' }}
          centerComponent={{
            text: "Conway's Game of Life",
            style: styles.headerText,
          }}
          rightComponent={{ icon: 'info', color: '#FFF' }}
          containerStyle={{
            backgroundColor: '#114084',
          }}
        />

        <Text style={styles.genText}>Generation: {genCount}</Text>

        <View style={styles.gridContainer}>{BuildFullGrid()}</View>

        <Text style={styles.delayText}>
          Change delay between generations (in milliseconds)
        </Text>

        <NumericInput
          value={delay}
          initValue={parseInt(delay)}
          minValue={100}
          onChange={(newDelay) => handleDelayInput(newDelay)}
          totalWidth={240}
          totalHeight={50}
          iconSize={25}
          step={100}
          editable={true}
          rounded
          textColor="black"
          iconStyle={{ color: 'white' }}
          rightButtonBackgroundColor="#114084"
          leftButtonBackgroundColor="#114084"
          totalHeight={45}
          totalWidth={432}
          style={styles.numericInput}
        />

        <TouchableOpacity style={styles.buttonsContainer}>
          <Button
            style={styles.buttons}
            onPress={handlePauseButton}
            title={isRunning ? 'STOP GAME' : 'START GAME'}
            overrides={true}
            color="#114084"
          />
          <Button
            style={styles.buttons}
            onPress={handleClearButton}
            title="CLEAR GRID"
            overrides={true}
            color="#3769B0"
          />
          <Button
            style={styles.buttons}
            onPress={handleRulesButton}
            title="REVIEW THE RULES"
            overrides={true}
            color="#82B7DC"
          />
        </TouchableOpacity>
      </View>
    );
  }
};

const styles = StyleSheet.create({
  screenContainer: {
    flex: 1,
    alignItems: 'stretch',
  },
  headerText: {
    color: '#FFF',
    fontSize: 20,
  },
  genText: {
    fontSize: 28,
    marginTop: 5,
    marginLeft: 130,
  },
  gridContainer: {
    minHeight: 430,
    minWidth: 430,
    marginTop: 30,
    marginBottom: 30,
  },
  cell: {
    minHeight: 1,
    minWidth: 1,
    borderWidth: 0.3,
    backgroundColor: 'red',
    borderColor: '#000',
    color: 'blue',
  },
  alive: {
    backgroundColor: 'black',
  },
  delayText: {
    fontSize: 16,
    paddingLeft: 30,
    paddingBottom: 3,
  },
  numericInput: {
    alignItems: 'stretch',
  },
  textInput: {
    padding: 12,
    paddingTop: 22,
    fontSize: 17,
    textAlign: 'center',
    shadowColor: 'grey',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2.84,
    elevation: 5,
  },
  buttonsContainer: {
    bottom: 0,
  },
  buttons: {
    padding: 30,
  },
});

export default App;
