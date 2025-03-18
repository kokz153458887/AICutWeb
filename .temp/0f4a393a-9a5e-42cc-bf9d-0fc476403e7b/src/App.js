import React from "react";
import faker from "faker";
import { FixedSizeList as List } from "react-window";
import InfiniteLoader from "react-window-infinite-loader";
import AutoSizer from "react-virtualized-auto-sizer";
import { makeStyles } from "@material-ui/core/styles";
import Container from "@material-ui/core/Container";
import SimpleCard from "./components/SimpleCard";

const useStyles = makeStyles({
  container: {
    position: "relative",
  },
});

const ListContainer = (props) => {
  const classes = useStyles();
  return <Container maxWidth="sm" className={classes.container} {...props} />;
};

const App = () => {
  const [data, setData] = React.useState([]);

  if (data.length === 0) {
    setData(Array.from({ length: 30 }).map((_) => null));
  }

  const isItemLoaded = (index) => index < data.length && data[index] !== null;
  const loadMoreItems = (startIndex, stopIndex) => {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newData = [...data];
        for (let idx = startIndex; idx < stopIndex; idx++) {
          newData[idx] = faker.lorem.sentence();
        }
        setData(newData);
        resolve();
      }, 2000);
    });
  };

  return (
    <AutoSizer>
      {({ height, width }) => (
        <InfiniteLoader
          isItemLoaded={isItemLoaded}
          itemCount={data.length}
          loadMoreItems={loadMoreItems}
        >
          {({ onItemsRendered, ref }) => (
            <List
              className="List"
              height={height}
              width={width}
              itemCount={data.length}
              itemSize={300}
              itemData={data}
              innerElementType={ListContainer}
              onItemsRendered={onItemsRendered}
              ref={ref}
            >
              {SimpleCard}
            </List>
          )}
        </InfiniteLoader>
      )}
    </AutoSizer>
  );
};

export default App;
