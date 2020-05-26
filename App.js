import React, { useState, useEffect } from 'react';
import { AsyncStorage, StyleSheet, Text, View } from 'react-native';
import { Col, Row, Grid } from 'react-native-easy-grid';
import SplashScreen from './screens/SpashScreen';
import useInterval from './components/IntervalHook';
import 'react-native-gesture-handler';

const App = () => {
  const [grid, setGrid] = useState([]);
  const gridCount = 40; // update to change size of grid

  // the createGrid() function creates a new array using nested for loops
  // we will later map over this array to create a grid via react-native-easy-grid
  // the initial array sets each cell to have zero neighbor cells (n: 0)
  const createGrid = () => {
    let initialGrid = new Array(gridCount);
    for (i = 0; i < gridCount; i++) {
      initialGrid[i] = new Array(gridCount);
    }
    for (x = 0; x < gridCount; x++) {
      for (y = 0; y < gridCount; y++) {
        initialGrid[x][y] = {
          cell: Math.floor(Math.random() * 2),
          n: 0,
        };
      }
    }
    return initialGrid;
  };

  // the checkNeighbors() function traverses each cell in the grid
  // to check their number of neighbors, then increments the 'n'
  // attribute for each cell that has neighbor cells in the grid
  const checkNeighbors = () => {
    let oldGrid = grid;
    for (i = 1; i < gridCount - 1; i++) {
      for (j = 1; j < gridCount - 1; j++) {
        for (k = -1; k < 2; k++) {
          for (l = -1; l < 2; l++) {
            oldGrid[i][j].n += oldGrid[i + k][j + l].cell;
          }
        }
        oldGrid[i][j].n -= oldGrid[i][j].cell;
      }
    }
    setGrid(oldGrid);
  };

  // the updateGrid() function traverses each cell in the grid and
  // updates them with the next generation of cells in the {grid} state
  // based on the rules of Conway's Game of Life
  const updateGrid = () => {
    let oldGrid = grid;
    let newGrid = createGrid();
    for (let i = 0; i < gridCount; i++) {
      for (let j = 0; j < gridCount; j++) {
        grid[i][j] = { cell: 0, n: 0 };
      }
    }
    for (x = 1; x < gridCount - 1; x++) {
      for (y = 1; y < gridCount - 1; y++) {
        if (oldGrid[x][y].cell == 1 && oldGrid[x][y].n < 2) {
          newGrid[x][y].cell = 0;
        } else if (oldGrid[x][y].cell == 1 && oldGrid[x][y].n > 3) {
          newGrid[x][y].cell = 0;
        } else if (oldGrid[x][y].cell == 0 && oldGrid[x][y].n == 3) {
          newGrid[x][y].cell = 1;
        } else if (
          oldGrid[x][y].cell == 1 &&
          (oldGrid[x][y].n == 3 || oldGrid[x][y].n == 2)
        ) {
          newGrid[x][y].cell = 1;
        } else {
          newGrid[x][y].cell = oldGrid[x][y].cell;
        }
      }
    }
    setGrid(newGrid);
  };

  // the runGame() function traverses each cell in the grid
  // checking their neighbors and updating each cell accordingly
  const runGame = () => {
    checkNeighbors();
    updateGrid();
  };

  // this useEffect() will run one time when mounting the app
  // and will create the initial {grid} state to build a grid
  useEffect(() => {
    let initialGrid = createGrid();
    setGrid(initialGrid);
  }, []);

  // this custom hook will invoke the runGame() function
  // repeatedly every 1000ms while the app is mounted
  useInterval(() => {
    runGame();
  }, 1000);

  // load the initial grid if the {grid} state does not equal null
  // otherwise, load the splash screen from ./screens
  if (grid != null) {
    return (
      <Grid style={styles.container}>
        {grid.map((row, key) => {
          return (
            <Col key={key}>
              {row.map((cell, key) => {
                return (
                  <Row
                    style={{
                      backgroundColor: cell.cell == 1 ? '#850000' : '#FFF',
                      margin: 1,
                    }}
                    key={key}
                  ></Row>
                );
              })}
            </Col>
          );
        })}
      </Grid>
    );
  }
  return <SplashScreen />;
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    marginTop: 22,
  },
});

export default App;
